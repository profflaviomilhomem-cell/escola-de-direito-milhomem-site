import type { RefundStatus } from "@prisma/client";

import { getContentConsumedPct } from "@/lib/lessons/progress";
import { refundableAmountCents } from "@/lib/pagarme/refund";
import { prisma } from "@/lib/prisma";

const DAY = 86_400_000;

/** Status de uma solicitação ainda "em aberto" (bloqueia duplicata). */
export const OPEN_REFUND_STATUSES: RefundStatus[] = ["REQUESTED", "APPROVED"];

export type CreateRefundInput = {
  userId: string;
  orderId: string;
  reason?: string;
  /** Relógio injetado — nunca Date.now() em código testável. */
  now: Date;
};

export type CreateRefundResult =
  | {
      ok: true;
      requestId: string;
      status: RefundStatus;
      eligibleAmountCents: number;
    }
  | {
      ok: false;
      code: "ORDER_NOT_FOUND" | "NOT_PAID" | "DUPLICATE_OPEN";
      message: string;
    };

/**
 * Solicitação de reembolso pelo aluno (livro-guia 4.7). Valida posse do
 * pedido e status PAID, recusa duplicata em aberto, calcula o valor elegível
 * pela Política de Reembolso (/reembolso) — dias desde a compra + % de
 * conteúdo consumido — e registra a solicitação como REQUESTED.
 *
 * O valor elegível é registrado em `amountCents` (pode ser 0 quando a política
 * não prevê reembolso automático); a decisão final é do admin.
 */
export async function createRefundRequest(
  input: CreateRefundInput,
): Promise<CreateRefundResult> {
  const { userId, orderId, reason, now } = input;

  const order = await prisma.order.findFirst({
    where: { id: orderId, userId },
    select: {
      id: true,
      status: true,
      amountCents: true,
      createdAt: true,
      product: { select: { slug: true } },
    },
  });

  if (!order) {
    return {
      ok: false,
      code: "ORDER_NOT_FOUND",
      message: "Pedido não encontrado.",
    };
  }

  if (order.status !== "PAID") {
    return {
      ok: false,
      code: "NOT_PAID",
      message: `Só é possível pedir reembolso de um pedido pago (status ${order.status}).`,
    };
  }

  const existing = await prisma.refundRequest.findFirst({
    where: { orderId: order.id, status: { in: OPEN_REFUND_STATUSES } },
    select: { id: true },
  });
  if (existing) {
    return {
      ok: false,
      code: "DUPLICATE_OPEN",
      message:
        "Já existe uma solicitação de reembolso em aberto para este pedido.",
    };
  }

  const daysSincePurchase = Math.floor(
    (now.getTime() - order.createdAt.getTime()) / DAY,
  );
  const contentConsumedPct = await getContentConsumedPct(
    userId,
    order.product.slug,
  );

  const eligibleAmountCents = refundableAmountCents({
    amountCents: order.amountCents,
    daysSincePurchase,
    contentConsumedPct,
  });

  const created = await prisma.refundRequest.create({
    data: {
      orderId: order.id,
      userId,
      reason: reason?.trim() || null,
      amountCents: eligibleAmountCents,
      status: "REQUESTED",
    },
    select: { id: true, status: true },
  });

  return {
    ok: true,
    requestId: created.id,
    status: created.status,
    eligibleAmountCents,
  };
}
