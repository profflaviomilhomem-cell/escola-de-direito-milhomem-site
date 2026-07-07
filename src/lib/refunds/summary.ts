import type { RefundStatus } from "@prisma/client";

import { getContentConsumedPct } from "@/lib/lessons/progress";
import { refundableAmountCents } from "@/lib/pagarme/refund";
import { prisma } from "@/lib/prisma";
import { OPEN_REFUND_STATUSES } from "@/lib/refunds/request";

const DAY = 86_400_000;

/**
 * Fila de reembolsos em aberto (REQUESTED/APPROVED) para a revisão do admin —
 * usada pela página /professor/reembolsos e pela rota GET /api/admin/refunds.
 */
export async function listOpenRefundRequests() {
  return prisma.refundRequest.findMany({
    where: { status: { in: OPEN_REFUND_STATUSES } },
    orderBy: { createdAt: "asc" },
    select: {
      id: true,
      status: true,
      reason: true,
      amountCents: true,
      createdAt: true,
      order: {
        select: {
          id: true,
          status: true,
          amountCents: true,
          createdAt: true,
          pagarmeChargeId: true,
          product: { select: { name: true, slug: true } },
          user: { select: { email: true, name: true } },
        },
      },
    },
  });
}

export type OpenRefundRequest = Awaited<
  ReturnType<typeof listOpenRefundRequests>
>[number];

export type OrderRefundState = {
  status: RefundStatus;
  amountCents: number | null;
};

/**
 * Última solicitação de reembolso por pedido do aluno — para a área do aluno
 * exibir o estado (Solicitado / Reembolsado) e bloquear novo pedido.
 * Chave do mapa: orderId. Banco indisponível → mapa vazio.
 */
export async function getRefundStatusByOrder(
  userId: string,
): Promise<Map<string, OrderRefundState>> {
  const map = new Map<string, OrderRefundState>();
  try {
    const rows = await prisma.refundRequest.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
      select: { orderId: true, status: true, amountCents: true },
    });
    for (const r of rows) {
      if (!map.has(r.orderId)) {
        map.set(r.orderId, { status: r.status, amountCents: r.amountCents });
      }
    }
  } catch {
    // Banco indisponível: sem estados de reembolso.
  }
  return map;
}

/**
 * Valor elegível estimado para um pedido PAID, pela Política de Reembolso.
 * Puro no cálculo (refundableAmountCents); só o % consumido vem do banco.
 */
export async function estimateEligibleForOrder(input: {
  userId: string;
  productSlug: string;
  amountCents: number;
  createdAt: Date;
  now: Date;
}): Promise<number> {
  const daysSincePurchase = Math.floor(
    (input.now.getTime() - input.createdAt.getTime()) / DAY,
  );
  const contentConsumedPct = await getContentConsumedPct(
    input.userId,
    input.productSlug,
  );
  return refundableAmountCents({
    amountCents: input.amountCents,
    daysSincePurchase,
    contentConsumedPct,
  });
}
