import type { Prisma } from "@prisma/client";

import { ANALYTICS_EVENTS } from "@/lib/analytics/events";
import { sendMetaCapi } from "@/lib/analytics/meta-capi";
import { trackServerEvent } from "@/lib/analytics/server-track";
import { cancelSequence, enrollLead } from "@/lib/email/sequences";
import { prisma } from "@/lib/prisma";

/**
 * Efeitos pós-PAID de um pedido — caminho ÚNICO compartilhado pelo webhook
 * Pagar.me (src/app/api/webhooks/pagarme/route.ts) e pela reconciliação por
 * cron (src/lib/orders/reconcile.ts). Manter a liquidação num só módulo evita
 * drift: um pedido que vira PAID pelo webhook OU pela reconciliação dispara
 * exatamente os mesmos efeitos de tracking, CAPI e sequências de e-mail.
 */

export const PAID_ORDER_SELECT = {
  id: true,
  amountCents: true,
  utmSource: true,
  utmMedium: true,
  utmCampaign: true,
  product: { select: { slug: true, name: true, type: true } },
  user: { select: { id: true, email: true } },
} satisfies Prisma.OrderSelect;

export type PaidOrder = Prisma.OrderGetPayload<{
  select: typeof PAID_ORDER_SELECT;
}>;

/**
 * Pedidos que VÃO transicionar para PAID neste evento — status≠PAID hoje.
 * Selecionados ANTES do updateMany para dedup determinística (evita disparar
 * os efeitos duas vezes quando webhook e reconciliação correm no mesmo pedido).
 */
export async function ordersBecomingPaid(where: Prisma.OrderWhereInput) {
  try {
    return await prisma.order.findMany({
      where: { ...where, status: { not: "PAID" } },
      select: PAID_ORDER_SELECT,
    });
  } catch {
    return [];
  }
}

/**
 * purchase_completed server-side (guia 8.5) + Purchase na Meta CAPI +
 * sequência pós-compra (guia 6.13) + encerramento de carrinho abandonado.
 *
 * Fire-and-forget: nunca derruba o caller. event_id = orderId (dedup
 * determinístico com o Pixel client).
 */
export function settleOrdersPaid(orders: PaidOrder[]) {
  for (const order of orders) {
    void trackServerEvent(ANALYTICS_EVENTS.PURCHASE_COMPLETED, {
      userId: order.user.id,
      utmSource: order.utmSource,
      utmMedium: order.utmMedium,
      utmCampaign: order.utmCampaign,
      order_id: order.id,
      product_slug: order.product.slug,
      product_type: order.product.type,
      value: order.amountCents / 100,
      currency: "BRL",
    });
    void sendMetaCapi("Purchase", {
      eventId: order.id,
      email: order.user.email,
      value: order.amountCents / 100,
      currency: "BRL",
      contentIds: [order.product.slug],
      contentName: order.product.name,
    });

    // Sequência pós-compra (guia 6.13) — idempotente por (email, POST_PURCHASE).
    void enrollLead("POST_PURCHASE", order.user.email, {
      orderId: order.id,
    }).catch((err) => {
      console.error(
        "[orders/settle] falha ao inscrever em POST_PURCHASE:",
        err,
      );
    });

    // Compra concluída encerra qualquer sequência de carrinho abandonado.
    void cancelSequence(order.user.email, "ABANDONED_CART").catch(() => {});
  }
}
