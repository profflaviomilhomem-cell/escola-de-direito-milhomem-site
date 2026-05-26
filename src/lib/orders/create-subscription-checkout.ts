import type { PaymentMethod, Product } from "@prisma/client";

import { userHasAccess } from "@/lib/enrollment";
import {
  buildPagarmeCustomer,
} from "@/lib/pagarme/build-payment";
import { buildPagarmeSubscriptionInput } from "@/lib/pagarme/build-subscription";
import {
  createPagarmeSubscription,
  PagarmeApiError,
} from "@/lib/pagarme/client";
import {
  extractPaymentPayload,
  mapChargeStatusToOrderStatus,
  primaryCharge,
} from "@/lib/pagarme/map-status";
import {
  mapPagarmeSubscriptionStatus,
  parsePagarmeDate,
} from "@/lib/pagarme/map-subscription";
import { isPagarmeConfigured } from "@/lib/pagarme/config";
import type { CreateCheckoutResult } from "@/lib/orders/checkout-types";
import type { UtmFields } from "@/lib/orders/utm";
import { prisma } from "@/lib/prisma";
import type { CreateOrderInput } from "@/schemas/order";

type CheckoutUser = {
  id: string;
  email: string;
  name: string | null;
};

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

function subscriptionResultPath(
  subscriptionId: string,
  status: string,
): string {
  if (status === "ACTIVE") {
    return `/checkout/resultado/${subscriptionId}?kind=subscription&status=sucesso`;
  }
  if (status === "CANCELED" || status === "REFUSED") {
    return `/checkout/resultado/${subscriptionId}?kind=subscription&status=recusado`;
  }
  return `/checkout/resultado/${subscriptionId}?kind=subscription&status=pendente`;
}

export async function createSubscriptionCheckout(
  user: CheckoutUser,
  product: Product,
  input: CreateOrderInput,
  _utm: UtmFields,
): Promise<CreateCheckoutResult> {
  if (input.paymentMethod === "PIX") {
    return {
      ok: false,
      code: "SUBSCRIPTION_PIX_UNSUPPORTED",
      message:
        "Assinatura mensal disponível com boleto ou cartão. PIX não é suportado neste produto.",
      status: 422,
    };
  }

  const paymentMethod = input.paymentMethod as PaymentMethod;

  const pendingSub = await prisma.subscription.findFirst({
    where: {
      userId: user.id,
      productId: product.id,
      status: { in: ["PAUSED", "PAST_DUE"] },
    },
    select: { id: true },
  });

  if (pendingSub) {
    return {
      ok: false,
      code: "PENDING_SUBSCRIPTION",
      message:
        "Você já tem uma assinatura pendente deste produto. Conclua o pagamento ou aguarde.",
      status: 409,
    };
  }

  const subscription = await prisma.subscription.create({
    data: {
      userId: user.id,
      productId: product.id,
      status: "PAUSED",
    },
  });

  try {
    const customer = buildPagarmeCustomer({
      name: user.name ?? "Aluno",
      email: user.email,
      document: input.document,
      phone: input.phone,
    });

    const pagarmeBody = buildPagarmeSubscriptionInput({
      code: subscription.id,
      product,
      customer,
      paymentMethod,
      cardToken: input.cardToken,
      installments: input.installments,
      billingAddress: billingFromInput(input),
      metadata: {
        subscriptionId: subscription.id,
        productId: product.id,
        productSlug: product.slug,
        userId: user.id,
      },
    });

    const pagarmeSub = await createPagarmeSubscription(pagarmeBody);
    const charge = primaryCharge(pagarmeSub);
    const chargeStatus = mapChargeStatusToOrderStatus(charge?.status);
    const mappedSubStatus =
      mapPagarmeSubscriptionStatus(pagarmeSub.status) ??
      (chargeStatus === "PAID" ? "ACTIVE" : "PAUSED");

    const payment = extractPaymentPayload(paymentMethod, charge);

    await prisma.subscription.update({
      where: { id: subscription.id },
      data: {
        status: mappedSubStatus,
        pagarmeSubId: pagarmeSub.id ?? null,
        nextBillingAt: parsePagarmeDate(pagarmeSub.next_billing_at),
      },
    });

    return {
      ok: true,
      orderId: subscription.id,
      status: mappedSubStatus,
      payment,
      redirectTo: subscriptionResultPath(subscription.id, mappedSubStatus),
    };
  } catch (error) {
    await prisma.subscription.update({
      where: { id: subscription.id },
      data: { status: "CANCELED", canceledAt: new Date() },
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
      message: "Não foi possível iniciar a assinatura.",
      status: 500,
    };
  }
}
