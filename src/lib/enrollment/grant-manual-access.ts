import {
  ORDER_STATUSES_WITH_ACCESS,
  productGrantsAccessInMvp,
  productUsesOrderAccess,
  productUsesSubscriptionAccess,
  SUBSCRIPTION_STATUS_WITH_ACCESS,
} from "@/lib/business/commercial-rules";
import {
  buildManualAccessPayload,
  isManualPagarmeSubId,
} from "@/lib/enrollment/manual-access-payload";
import { userHasAccess } from "@/lib/enrollment";
import { prisma } from "@/lib/prisma";

export type GrantManualAccessInput = {
  grantedByUserId: string;
  studentEmail: string;
  productSlug: string;
  note?: string;
};

export type GrantManualAccessResult =
  | {
      ok: true;
      alreadyHadAccess: false;
      kind: "order" | "subscription";
      id: string;
      studentEmail: string;
      productSlug: string;
    }
  | { ok: true; alreadyHadAccess: true; message: string }
  | { ok: false; code: string; message: string; status: number };

function normalizeEmail(email: string) {
  return email.trim().toLowerCase();
}

export async function grantManualAccess(
  input: GrantManualAccessInput,
): Promise<GrantManualAccessResult> {
  const studentEmail = normalizeEmail(input.studentEmail);
  const productSlug = input.productSlug.trim();

  const [student, product] = await Promise.all([
    prisma.user.findUnique({
      where: { email: studentEmail },
      select: { id: true, email: true, role: true },
    }),
    prisma.product.findUnique({
      where: { slug: productSlug },
      select: {
        id: true,
        slug: true,
        name: true,
        type: true,
        priceCents: true,
        active: true,
      },
    }),
  ]);

  if (!student) {
    return {
      ok: false,
      code: "USER_NOT_FOUND",
      message: "Nenhuma conta encontrada com este e-mail.",
      status: 404,
    };
  }

  if (!product) {
    return {
      ok: false,
      code: "PRODUCT_NOT_FOUND",
      message: "Produto não encontrado.",
      status: 404,
    };
  }

  if (!product.active) {
    return {
      ok: false,
      code: "PRODUCT_INACTIVE",
      message: "Este produto está inativo.",
      status: 422,
    };
  }

  if (!productGrantsAccessInMvp(product.type)) {
    return {
      ok: false,
      code: "PRODUCT_NOT_GRANTABLE",
      message:
        "Este tipo de produto não libera acesso automático no MVP (ex.: e-book).",
      status: 422,
    };
  }

  const hasAccess = await userHasAccess(student.id, product.slug);
  if (hasAccess) {
    return {
      ok: true,
      alreadyHadAccess: true,
      message: "Este aluno já tem acesso a este produto.",
    };
  }

  const payload = buildManualAccessPayload(input.grantedByUserId, input.note);

  if (productUsesOrderAccess(product.type)) {
    const existingOrder = await prisma.order.findFirst({
      where: { userId: student.id, productId: product.id },
      orderBy: { createdAt: "desc" },
      select: { id: true, status: true },
    });

    if (
      existingOrder &&
      ORDER_STATUSES_WITH_ACCESS.includes(existingOrder.status)
    ) {
      return {
        ok: true,
        alreadyHadAccess: true,
        message: "Este aluno já tem acesso a este produto.",
      };
    }

    const order =
      existingOrder != null
        ? await prisma.order.update({
            where: { id: existingOrder.id },
            data: {
              status: "PAID",
              amountCents: product.priceCents,
              paymentMethod: "MANUAL",
              paymentPayload: payload,
              pagarmeChargeId: null,
              pagarmeOrderId: null,
            },
          })
        : await prisma.order.create({
            data: {
              userId: student.id,
              productId: product.id,
              status: "PAID",
              amountCents: product.priceCents,
              paymentMethod: "MANUAL",
              paymentPayload: payload,
            },
          });

    return {
      ok: true,
      alreadyHadAccess: false,
      kind: "order",
      id: order.id,
      studentEmail: student.email,
      productSlug: product.slug,
    };
  }

  if (productUsesSubscriptionAccess(product.type)) {
    const existingSub = await prisma.subscription.findFirst({
      where: { userId: student.id, productId: product.id },
      orderBy: { startedAt: "desc" },
      select: { id: true, status: true, pagarmeSubId: true },
    });

    if (existingSub?.status === SUBSCRIPTION_STATUS_WITH_ACCESS) {
      return {
        ok: true,
        alreadyHadAccess: true,
        message: "Este aluno já tem acesso a este produto.",
      };
    }

    const manualSubId = `manual_${crypto.randomUUID()}`;

    const subscription =
      existingSub != null && isManualPagarmeSubId(existingSub.pagarmeSubId)
        ? await prisma.subscription.update({
            where: { id: existingSub.id },
            data: {
              status: SUBSCRIPTION_STATUS_WITH_ACCESS,
              canceledAt: null,
              pagarmeSubId: manualSubId,
            },
          })
        : await prisma.subscription.create({
            data: {
              userId: student.id,
              productId: product.id,
              status: SUBSCRIPTION_STATUS_WITH_ACCESS,
              pagarmeSubId: manualSubId,
            },
          });

    return {
      ok: true,
      alreadyHadAccess: false,
      kind: "subscription",
      id: subscription.id,
      studentEmail: student.email,
      productSlug: product.slug,
    };
  }

  return {
    ok: false,
    code: "UNSUPPORTED_PRODUCT",
    message: "Tipo de produto não suportado para matrícula manual.",
    status: 422,
  };
}
