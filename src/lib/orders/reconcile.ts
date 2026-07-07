import type { Prisma } from "@prisma/client";

import { ordersBecomingPaid, settleOrdersPaid } from "@/lib/orders/settle";
import { getPagarmeCharge, getPagarmeOrder } from "@/lib/pagarme/client";
import {
  mapChargeStatusToOrderStatus,
  primaryCharge,
} from "@/lib/pagarme/map-status";
import { prisma } from "@/lib/prisma";

const MINUTE = 60_000;
const DAY = 86_400_000;

const DEFAULT_OLDER_THAN_MINUTES = 15;
const DEFAULT_MAX_BATCH = 50;
const DEFAULT_EXPIRE_AFTER_DAYS = 3;

export type ReconcileOptions = {
  /** Relógio injetado — nunca usar Date.now() em código testável. */
  now: Date;
  /** Ignora pedidos criados há menos disto (evita corrida com o checkout). */
  olderThanMinutes?: number;
  /** Teto de pedidos processados por execução. */
  maxBatch?: number;
  /** PENDING ainda não pago mais velho que isto → REFUSED (expiração). */
  expireAfterDays?: number;
};

export type ReconcileSummary = {
  scanned: number;
  updated: number;
  paid: number;
  refused: number;
  errors: number;
};

type ReconcileCandidate = {
  id: string;
  createdAt: Date;
  pagarmeChargeId: string | null;
  pagarmeOrderId: string | null;
  paymentPayload: Prisma.JsonValue;
};

/** Status real da cobrança no Pagar.me (via charge id ou, senão, order id). */
async function fetchRealChargeStatus(
  order: ReconcileCandidate,
): Promise<string | undefined> {
  if (order.pagarmeChargeId) {
    const charge = await getPagarmeCharge(order.pagarmeChargeId);
    return charge.status;
  }
  if (order.pagarmeOrderId) {
    const pagarmeOrder = await getPagarmeOrder(order.pagarmeOrderId);
    return primaryCharge(pagarmeOrder)?.status;
  }
  return undefined;
}

/** Lê `expiresAt` do paymentPayload (PIX/boleto) de forma defensiva. */
function expiresAtFromPayload(payload: Prisma.JsonValue): Date | null {
  if (!payload || typeof payload !== "object" || Array.isArray(payload)) {
    return null;
  }
  const raw = (payload as Record<string, unknown>).expiresAt;
  if (typeof raw !== "string" || !raw) return null;
  const d = new Date(raw);
  return Number.isNaN(d.getTime()) ? null : d;
}

/**
 * Reconciliação Pagar.me (livro-guia 4.7 / 8.10 Risco 1) — corrige pedidos
 * PENDING que ficaram fora de sincronia com o gateway (webhook perdido).
 *
 * Roda exatamente o MESMO caminho pós-PAID do webhook (`settleOrdersPaid`),
 * então não há drift entre os dois. Idempotente e seguro a cada hora:
 *  - PENDING que já foi pago no Pagar.me → PAID + liquidação (libera acesso);
 *  - PENDING recusado/estornado no Pagar.me → REFUSED/REFUNDED (sem acesso);
 *  - PENDING morto (expirado ou velho demais) → REFUSED.
 *
 * Robusto: falha por pedido (rede/Pagar.me) não derruba o lote — loga e segue.
 * GATED pelo caller: `getPagarmeCharge/Order` lançam sem PAGARME_SECRET_KEY;
 * o cron checa `isPagarmeConfigured()` antes de chamar.
 */
export async function reconcilePendingOrders(
  options: ReconcileOptions,
): Promise<ReconcileSummary> {
  const {
    now,
    olderThanMinutes = DEFAULT_OLDER_THAN_MINUTES,
    maxBatch = DEFAULT_MAX_BATCH,
    expireAfterDays = DEFAULT_EXPIRE_AFTER_DAYS,
  } = options;

  const summary: ReconcileSummary = {
    scanned: 0,
    updated: 0,
    paid: 0,
    refused: 0,
    errors: 0,
  };

  const cutoff = new Date(now.getTime() - olderThanMinutes * MINUTE);

  let candidates: ReconcileCandidate[];
  try {
    candidates = await prisma.order.findMany({
      where: {
        status: "PENDING",
        createdAt: { lt: cutoff },
        OR: [
          { pagarmeChargeId: { not: null } },
          { pagarmeOrderId: { not: null } },
        ],
      },
      orderBy: { createdAt: "asc" },
      take: maxBatch,
      select: {
        id: true,
        createdAt: true,
        pagarmeChargeId: true,
        pagarmeOrderId: true,
        paymentPayload: true,
      },
    });
  } catch (err) {
    console.error("[orders/reconcile] falha ao listar pendentes:", err);
    return summary;
  }

  for (const order of candidates) {
    summary.scanned += 1;
    try {
      const realStatus = await fetchRealChargeStatus(order);
      const mapped = mapChargeStatusToOrderStatus(realStatus);

      if (mapped === "PAID") {
        // Mesmo caminho do webhook: seleciona antes, atualiza idempotente,
        // liquida. becomingPaid vazio (já PAID por corrida) = não dispara.
        const becomingPaid = await ordersBecomingPaid({ id: order.id });
        const res = await prisma.order.updateMany({
          where: { id: order.id, status: { not: "PAID" } },
          data: { status: "PAID" },
        });
        if (res.count > 0) {
          summary.updated += 1;
          summary.paid += 1;
        }
        settleOrdersPaid(becomingPaid);
        continue;
      }

      if (mapped === "REFUSED" || mapped === "REFUNDED") {
        const res = await prisma.order.updateMany({
          where: { id: order.id, status: { not: mapped } },
          data: { status: mapped },
        });
        if (res.count > 0) {
          summary.updated += 1;
          if (mapped === "REFUSED") summary.refused += 1;
        }
        continue;
      }

      // Ainda PENDING no Pagar.me: expira o pedido morto.
      const expiresAt = expiresAtFromPayload(order.paymentPayload);
      const ageDays = (now.getTime() - order.createdAt.getTime()) / DAY;
      const expired =
        ageDays > expireAfterDays || (expiresAt !== null && expiresAt < now);

      if (expired) {
        const res = await prisma.order.updateMany({
          where: { id: order.id, status: "PENDING" },
          data: { status: "REFUSED" },
        });
        if (res.count > 0) {
          summary.updated += 1;
          summary.refused += 1;
        }
      }
    } catch (err) {
      summary.errors += 1;
      console.error(
        `[orders/reconcile] falha no pedido ${order.id}:`,
        err instanceof Error ? err.message : err,
      );
    }
  }

  return summary;
}
