import { NextResponse, type NextRequest } from "next/server";

/**
 * Webhook Pagar.me — POST /api/webhooks/pagarme
 *
 * Implementação plena na Sprint 5 do roadmap (sprint dedicada Pagar.me).
 *
 * Responsabilidades futuras:
 *  - validar assinatura do webhook (header `X-Hub-Signature` HMAC)
 *  - mapear evento → atualização de Order/Subscription no Prisma
 *  - encaminhar evento ao Meta CAPI server-side
 *  - reconciliação diária via cron
 */
export async function POST(req: NextRequest) {
  // TODO: validar assinatura HMAC com PAGARME_WEBHOOK_SECRET
  // TODO: persistir evento em tabela de auditoria antes de processar
  // TODO: tratar idempotência (mesmo evento pode chegar 2x)

  const eventId = req.headers.get("x-event-id") ?? "unknown";
  console.warn(
    `[pagarme webhook] não implementado — evento ${eventId} ignorado`,
  );

  return NextResponse.json(
    { ok: true, message: "webhook stub — implementação na sprint 5" },
    { status: 200 },
  );
}
