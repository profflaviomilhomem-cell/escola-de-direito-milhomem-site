import { Prisma, type PaymentMethod, type Product } from "@prisma/client";

import { productUsesSubscriptionAccess } from "@/lib/business/commercial-rules";
import { userHasAccess } from "@/lib/enrollment";
import { createPagarmeOrder, PagarmeApiError } from "@/lib/pagarme/client";
import {
  buildPagarmeCustomer,
  buildPagarmePayments,
} from "@/lib/pagarme/build-payment";
import {
  extractPaymentPayload,
  mapChargeStatusToOrderStatus,
  primaryCharge,
} from "@/lib/pagarme/map-status";
import { isPagarmeConfigured } from "@/lib/pagarme/config";
import type { CreateCheckoutResult } from "@/lib/orders/checkout-types";
import { createSubscriptionCheckout } from "@/lib/orders/create-subscription-checkout";
import type { UtmFields } from "@/lib/orders/utm";
import { prisma } from "@/lib/prisma";
import type { CreateOrderInput } from "@/schemas/order";

type CheckoutUser = {
  id: string;
  email: string;
  name: string | null;
};

export type { CreateCheckoutResult } from "@/lib/orders/checkout-types";

function billingFromInput(input: CreateOrderInput) {
  if (!input.billingLine1 || !input.billingZipCode || !input.billingCity) {
    return undefined;
  }
  return {
    line1: input.billingLine1,
    zipCode: input.billingZipCode,
    city: input.billingCity,
    state: input.billingState ?? "DF",
  };
}

function resultPath(orderId: string, status: string): string {
  if (status === "PAID") return `/checkout/resultado/${orderId}?status=sucesso`;
  if (status === "REFUSED")
    return `/checkout/resultado/${orderId}?status=recusado`;
  return `/checkout/resultado/${orderId}?status=pendente`;
}

export async function createCheckoutOrder(
  user: CheckoutUser,
  product: Product,
  input: CreateOrderInput,
  utm: UtmFields,
): Promise<CreateCheckoutResult> {
  if (product.publishStatus !== "PUBLISHED" || !product.active) {
    return {
      ok: false,
      code: "PRODUCT_UNAVAILABLE",
      message: "Este produto não está disponível para compra.",
      status: 404,
    };
  }

  if (product.priceCents <= 0) {
    return {
      ok: false,
      code: "PRODUCT_FREE",
      message: "Produto sem preço configurado.",
      status: 422,
    };
  }

  const alreadyHasAccess = await userHasAccess(user.id, product.slug);
  if (alreadyHasAccess) {
    return {
      ok: false,
      code: "ALREADY_ENROLLED",
      message: "Você já tem acesso a este curso.",
      status: 409,
    };
  }

  if (!isPagarmeConfigured()) {
    return {
      ok: false,
      code: "PAGARME_NOT_CONFIGURED",
      message:
        "Pagamento online indisponível no momento. Configure PAGARME_SECRET_KEY.",
      status: 503,
    };
  }

  if (productUsesSubscriptionAccess(product.type)) {
    return createSubscriptionCheckout(user, product, input, utm);
  }

  const pendingDuplicate = await prisma.order.findFirst({
    where: {
      userId: user.id,
      productId: product.id,
      status: "PENDING",
      createdAt: { gte: new Date(Date.now() - 30 * 60 * 1000) },
    },
    select: { id: true },
  });

  if (pendingDuplicate) {
    return {
      ok: false,
      code: "PENDING_ORDER",
      message:
        "Você já tem um pedido pendente deste curso. Conclua o pagamento ou aguarde expirar.",
      status: 409,
    };
  }

  const paymentMethod = input.paymentMethod as PaymentMethod;

  // O findFirst acima é um pré-check amigável, mas NÃO é atômico. O índice
  // único parcial (1 PENDING por usuário+produto) é o backstop: se duas
  // requisições concorrentes chegarem aqui juntas, só uma cria o pedido; a
  // outra recebe P2002 e vira PENDING_ORDER — impede a cobrança dupla.
  let order;
  try {
    order = await prisma.order.create({
      data: {
        userId: user.id,
        productId: product.id,
        status: "PENDING",
        amountCents: product.priceCents,
        paymentMethod,
        utmSource: utm.utmSource,
        utmMedium: utm.utmMedium,
        utmCampaign: utm.utmCampaign,
      },
    });
  } catch (err) {
    if (
      err instanceof Prisma.PrismaClientKnownRequestError &&
      err.code === "P2002"
    ) {
      return {
        ok: false,
        code: "PENDING_ORDER",
        message:
          "Você já tem um pedido pendente deste curso. Conclua o pagamento ou aguarde expirar.",
        status: 409,
      };
    }
    throw err;
  }

  try {
    const customer = buildPagarmeCustomer({
      name: user.name ?? "Aluno",
      email: user.email,
      document: input.document,
      phone: input.phone,
    });

    const payments = buildPagarmePayments({
      method: paymentMethod,
      amountCents: product.priceCents,
      cardToken: input.cardToken,
      installments: input.installments,
      billingAddress: billingFromInput(input),
    });

    const pagarmeOrder = await createPagarmeOrder({
      code: order.id,
      customer,
      items: [
        {
          amount: product.priceCents,
          description: product.name.slice(0, 256),
          quantity: 1,
          code: product.slug,
        },
      ],
      payments,
      metadata: {
        orderId: order.id,
        productSlug: product.slug,
        userId: user.id,
      },
    });

    const charge = primaryCharge(pagarmeOrder);
    const mappedStatus = mapChargeStatusToOrderStatus(charge?.status);
    const payment = extractPaymentPayload(paymentMethod, charge);

    await prisma.order.update({
      where: { id: order.id },
      data: {
        status: mappedStatus,
        pagarmeOrderId: pagarmeOrder.id ?? null,
        pagarmeChargeId: charge?.id ?? null,
        paymentPayload: payment,
      },
    });

    return {
      ok: true,
      orderId: order.id,
      status: mappedStatus,
      payment,
      redirectTo: resultPath(order.id, mappedStatus),
    };
  } catch (error) {
    await prisma.order.update({
      where: { id: order.id },
      data: { status: "REFUSED" },
    });

    if (error instanceof PagarmeApiError) {
      return {
        ok: false,
        code: "PAGARME_ERROR",
        message: error.message,
        status: 502,
      };
    }

    if (error instanceof Error) {
      return {
        ok: false,
        code: "CHECKOUT_ERROR",
        message: error.message,
        status: 422,
      };
    }

    return {
      ok: false,
      code: "CHECKOUT_ERROR",
      message: "Não foi possível processar o pagamento.",
      status: 500,
    };
  }
}

export async function getOrderForUser(orderId: string, userId: string) {
  return prisma.order.findFirst({
    where: { id: orderId, userId },
    include: {
      product: { select: { slug: true, name: true } },
    },
  });
}
