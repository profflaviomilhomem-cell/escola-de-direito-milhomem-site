import { PagarmeApiError } from "@/lib/pagarme/client";
import { refundPagarmeCharge } from "@/lib/pagarme/refund";
import { prisma } from "@/lib/prisma";
import { OPEN_REFUND_STATUSES } from "@/lib/refunds/request";

export type DecideRefundResult =
  | { ok: true; status: "PROCESSED" | "REJECTED"; chargeId?: string }
  | {
      ok: false;
      code:
        | "NOT_FOUND"
        | "NOT_OPEN"
        | "ORDER_NOT_REFUNDABLE"
        | "NO_CHARGE"
        | "AMOUNT_TOO_HIGH"
        | "PAGARME_ERROR"
        | "FAILURE";
      message: string;
      httpStatus: number;
    };

/**
 * Aprovação de reembolso (admin): executa o estorno no Pagar.me (reusa
 * refundPagarmeCharge) e transiciona RefundRequest→PROCESSED + Order→REFUNDED.
 *
 * Valor: `amountCentsOverride` (se o admin ajustar) tem prioridade; senão usa
 * o valor elegível gravado na solicitação (estorno parcial); 0/nulo → estorno
 * integral. O webhook `charge.refunded` confirma o Order de novo (idempotente).
 */
export async function approveRefundRequest(input: {
  refundRequestId: string;
  decidedByUserId: string;
  now: Date;
  amountCentsOverride?: number;
}): Promise<DecideRefundResult> {
  const { refundRequestId, decidedByUserId, now, amountCentsOverride } = input;

  const request = await prisma.refundRequest.findUnique({
    where: { id: refundRequestId },
    select: {
      id: true,
      status: true,
      amountCents: true,
      order: {
        select: {
          id: true,
          status: true,
          amountCents: true,
          pagarmeChargeId: true,
        },
      },
    },
  });

  if (!request) {
    return {
      ok: false,
      code: "NOT_FOUND",
      message: "Solicitação não encontrada.",
      httpStatus: 404,
    };
  }
  if (!OPEN_REFUND_STATUSES.includes(request.status)) {
    return {
      ok: false,
      code: "NOT_OPEN",
      message: `Solicitação não está aberta (status ${request.status}).`,
      httpStatus: 409,
    };
  }
  if (request.order.status !== "PAID") {
    return {
      ok: false,
      code: "ORDER_NOT_REFUNDABLE",
      message: `Pedido não é reembolsável (status ${request.order.status}).`,
      httpStatus: 409,
    };
  }
  if (!request.order.pagarmeChargeId) {
    return {
      ok: false,
      code: "NO_CHARGE",
      message: "Pedido sem cobrança Pagar.me associada.",
      httpStatus: 409,
    };
  }

  const orderAmount = request.order.amountCents;
  const preferred =
    amountCentsOverride != null ? amountCentsOverride : request.amountCents;

  if (preferred != null && preferred > orderAmount) {
    return {
      ok: false,
      code: "AMOUNT_TOO_HIGH",
      message: "Valor de estorno maior que o valor do pedido.",
      httpStatus: 422,
    };
  }

  // Estorno parcial só quando 0 < valor < total; senão integral (undefined).
  const estornoAmount =
    preferred != null && preferred > 0 && preferred < orderAmount
      ? preferred
      : undefined;

  try {
    const charge = await refundPagarmeCharge(
      request.order.pagarmeChargeId,
      estornoAmount,
    );

    await prisma.refundRequest.update({
      where: { id: request.id },
      data: {
        status: "PROCESSED",
        amountCents: estornoAmount ?? orderAmount,
        decidedByUserId,
        decidedAt: now,
      },
    });
    await prisma.order.update({
      where: { id: request.order.id },
      data: { status: "REFUNDED" },
    });

    return {
      ok: true,
      status: "PROCESSED",
      chargeId: charge.id ?? request.order.pagarmeChargeId,
    };
  } catch (err) {
    if (err instanceof PagarmeApiError) {
      return {
        ok: false,
        code: "PAGARME_ERROR",
        message: `Pagar.me recusou o estorno: ${err.message}`,
        httpStatus: 502,
      };
    }
    return {
      ok: false,
      code: "FAILURE",
      message: "Falha ao processar o estorno.",
      httpStatus: 500,
    };
  }
}

/** Rejeição de reembolso (admin): RefundRequest→REJECTED, sem estorno. */
export async function rejectRefundRequest(input: {
  refundRequestId: string;
  decidedByUserId: string;
  now: Date;
}): Promise<DecideRefundResult> {
  const { refundRequestId, decidedByUserId, now } = input;

  const request = await prisma.refundRequest.findUnique({
    where: { id: refundRequestId },
    select: { id: true, status: true },
  });

  if (!request) {
    return {
      ok: false,
      code: "NOT_FOUND",
      message: "Solicitação não encontrada.",
      httpStatus: 404,
    };
  }
  if (!OPEN_REFUND_STATUSES.includes(request.status)) {
    return {
      ok: false,
      code: "NOT_OPEN",
      message: `Solicitação não está aberta (status ${request.status}).`,
      httpStatus: 409,
    };
  }

  await prisma.refundRequest.update({
    where: { id: request.id },
    data: { status: "REJECTED", decidedByUserId, decidedAt: now },
  });

  return { ok: true, status: "REJECTED" };
}
