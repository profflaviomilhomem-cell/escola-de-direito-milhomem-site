import crypto from "node:crypto";
import type { PaymentMethod } from "@prisma/client";
import { NextResponse, type NextRequest } from "next/server";

import { ordersBecomingPaid, settleOrdersPaid } from "@/lib/orders/settle";
import {
  extractPagarmeSubscriptionId,
  mapSubscriptionEventType,
} from "@/lib/pagarme/map-subscription";
import {
  activateSubscriptionFromCharge,
  upsertSubscriptionFromWebhook,
} from "@/lib/pagarme/subscription-sync";
import { prisma } from "@/lib/prisma";

type WebhookPayload = {
  id?: string;
  type?: string;
  data?: unknown;
};

function parsePayload(raw: Buffer): WebhookPayload {
  try {
    return JSON.parse(raw.toString("utf8")) as WebhookPayload;
  } catch {
    return {};
  }
}

function safeEquals(a: string, b: string) {
  const ab = Buffer.from(a);
  const bb = Buffer.from(b);
  if (ab.length !== bb.length) return false;
  return crypto.timingSafeEqual(ab, bb);
}

function getSignature(req: NextRequest) {
  return {
    sig256: req.headers.get("x-hub-signature-256"),
    sigSha1: req.headers.get("x-hub-signature"),
  };
}

/**
 * Traduz o método de pagamento do Pagar.me para o enum do banco.
 *
 * 26/08/2026 — antes o `default` era `"CARD"`, então **ausência de informação
 * virava afirmação**: um `order.refunded` sem array de `charges` sobrescrevia o
 * método de um pedido PIX para CARD. Ninguém perde acesso com isso, mas o
 * relatório de receita por método passa a mentir — e é dele que sai a decisão
 * sobre continuar oferecendo boleto.
 *
 * Devolve `null` quando não dá para saber; quem chama decide não gravar.
 */
function paymentMethodFromPagarme(value: unknown): PaymentMethod | null {
  const s = String(value ?? "").toLowerCase();
  if (!s) return null;
  if (s.includes("pix")) return "PIX";
  if (s.includes("boleto") || s.includes("bank_slip") || s.includes("bank")) {
    return "BOLETO";
  }
  if (s.includes("credit") || s.includes("card")) return "CARD";
  return null;
}

function normalizeExternalId(v: unknown) {
  const s = typeof v === "string" ? v : "";
  return s.trim();
}

function asRecord(value: unknown): Record<string, unknown> {
  return value !== null && typeof value === "object"
    ? (value as Record<string, unknown>)
    : {};
}

/**
 * Estados a partir dos quais um pedido pode virar PAID.
 *
 * 26/08/2026 — antes, os dois `updateMany` de status eram cegos: um evento
 * `charge.paid`/`order.paid` sobrescrevia QUALQUER estado, inclusive REFUNDED e
 * CHARGEDBACK. Como `ordersBecomingPaid` só filtra `status != PAID`, um pedido
 * estornado voltaria a PAID **e o acesso ao curso seria reconcedido**.
 *
 * Não havia caminho realista para isso hoje — todo evento exige assinatura
 * válida, e o Pagar.me não manda "pago" depois de um estorno da mesma cobrança.
 * Mas a defesa não deve depender do comportamento educado do adquirente: um
 * reenvio fora de ordem, um teste no painel ou uma mudança futura na API
 * bastariam. O `reconcile.ts` já fazia certo desde sempre (`status: { not:
 * "PAID" }`); o webhook é que estava fora do padrão.
 *
 * PENDING e AUTHORIZED são os únicos estados de onde "pagou" faz sentido.
 * Boleto pago depois do sweep de 3 dias entra por REFUSED, que segue permitido
 * de propósito: pagou, recebe.
 */
const ESTADOS_QUE_PODEM_VIRAR_PAGO = [
  "PENDING",
  "AUTHORIZED",
  "REFUSED",
] as const;

/** `where` extra do update, para não ressuscitar pedido estornado. */
function guardaDeTransicao(desiredStatus: string) {
  return desiredStatus === "PAID"
    ? { status: { in: [...ESTADOS_QUE_PODEM_VIRAR_PAGO] } }
    : {};
}

async function handleOrderEvent(type: string, data: Record<string, unknown>) {
  const externalId = normalizeExternalId(data.id);
  if (!externalId) return;

  const desiredStatus =
    type === "order.paid"
      ? "PAID"
      : type === "order.payment_failed" || type === "order.canceled"
        ? "REFUSED"
        : type.includes("chargeback") || type.includes("chargedback")
          ? "CHARGEDBACK"
          : type.includes("refund")
            ? "REFUNDED"
            : null;

  if (!desiredStatus) return;

  const charges = Array.isArray(data.charges) ? data.charges : [];
  const firstCharge = charges[0] as Record<string, unknown> | undefined;
  const paymentMethod = paymentMethodFromPagarme(firstCharge?.payment_method);

  const matchOrder = {
    OR: [{ pagarmeOrderId: externalId }, { pagarmeChargeId: externalId }],
  };
  const becomingPaid =
    desiredStatus === "PAID" ? await ordersBecomingPaid(matchOrder) : [];

  const res = await prisma.order.updateMany({
    where: { ...matchOrder, ...guardaDeTransicao(desiredStatus) },
    // `paymentMethod` só entra no update quando o evento realmente disse qual
    // é — ver a nota em `paymentMethodFromPagarme`.
    data: {
      status: desiredStatus,
      ...(paymentMethod ? { paymentMethod } : {}),
    },
  });

  // Só liquida se ESTE evento transicionou o pedido — mesmo raciocínio do
  // `reconcile.ts`. Sem isso, um replay duplicaria e-mail e tracking.
  if (res.count > 0) settleOrdersPaid(becomingPaid);
}

async function handleChargeEvent(type: string, data: Record<string, unknown>) {
  const externalId = normalizeExternalId(data.id);
  if (!externalId) return;

  if (type === "charge.paid") {
    const subId = extractPagarmeSubscriptionId(data);
    if (subId || data.subscription_id || data.subscription) {
      await activateSubscriptionFromCharge(data);
    }
  }

  const desiredStatus =
    type === "charge.paid"
      ? "PAID"
      : type === "charge.payment_failed"
        ? "REFUSED"
        : type === "charge.refunded"
          ? "REFUNDED"
          : type === "charge.chargedback" || type === "charge.chargeback"
            ? "CHARGEDBACK"
            : null;

  if (!desiredStatus) return;

  const charges = Array.isArray(data.charges) ? data.charges : [];
  const paymentMethod = paymentMethodFromPagarme(
    (charges[0] as Record<string, unknown> | undefined)?.payment_method ??
      data.payment_method,
  );

  const matchCharge = { pagarmeChargeId: externalId };
  const becomingPaid =
    desiredStatus === "PAID" ? await ordersBecomingPaid(matchCharge) : [];

  const res = await prisma.order.updateMany({
    where: { ...matchCharge, ...guardaDeTransicao(desiredStatus) },
    // `paymentMethod` só entra no update quando o evento realmente disse qual
    // é — ver a nota em `paymentMethodFromPagarme`.
    data: {
      status: desiredStatus,
      ...(paymentMethod ? { paymentMethod } : {}),
    },
  });

  if (res.count > 0) settleOrdersPaid(becomingPaid);
}

async function handleSubscriptionEvent(
  type: string,
  data: Record<string, unknown>,
) {
  const pagarmeSubId = extractPagarmeSubscriptionId(data);
  if (!pagarmeSubId) return;

  const mappedStatus = mapSubscriptionEventType(type, data);
  if (!mappedStatus) return;

  await upsertSubscriptionFromWebhook({
    data,
    pagarmeSubId,
    status: mappedStatus,
  });
}

async function handleInvoiceEvent(type: string, data: Record<string, unknown>) {
  if (type !== "invoice.paid" && type !== "invoice.payment_failed") return;

  const subscriptionPayload = asRecord(data.subscription);
  const merged = {
    ...data,
    id: data.subscription_id ?? subscriptionPayload.id ?? data.id,
    subscription_id: data.subscription_id ?? subscriptionPayload.id,
  };

  if (type === "invoice.paid") {
    await activateSubscriptionFromCharge(merged);
    return;
  }

  const pagarmeSubId = extractPagarmeSubscriptionId(merged);
  if (!pagarmeSubId) return;

  await upsertSubscriptionFromWebhook({
    data: merged,
    pagarmeSubId,
    status: "PAST_DUE",
  });
}

/**
 * Webhook Pagar.me — POST /api/webhooks/pagarme
 */
export async function POST(req: NextRequest) {
  const secret = process.env.PAGARME_WEBHOOK_SECRET;
  if (!secret) {
    return NextResponse.json(
      { ok: false, error: "PAGARME_WEBHOOK_SECRET ausente." },
      { status: 500 },
    );
  }

  const rawBody = Buffer.from(await req.arrayBuffer());
  const payload = parsePayload(rawBody);

  // 26/08/2026 — antes caía no literal `"unknown"`. O primeiro evento sem id
  // gravava a linha `id="unknown"` na tabela de deduplicação, e **todos os
  // seguintes sem id viravam "duplicate" para sempre** — deixando de conceder
  // acesso, em silêncio, sem erro em lugar nenhum. Falha fechada, mas fechada
  // do lado errado: o comprador paga e não recebe.
  //
  // Sem id, o fallback passa a ser o hash do corpo cru: dois eventos idênticos
  // continuam deduplicados (que é o objetivo), dois eventos diferentes não
  // colidem mais.
  const eventId =
    payload.id ??
    req.headers.get("x-event-id") ??
    `sha256:${crypto.createHash("sha256").update(rawBody).digest("hex")}`;
  const type = payload.type ?? "unknown";

  const { sig256, sigSha1 } = getSignature(req);

  let verified = false;
  if (sig256) {
    const header = String(sig256);
    const expected =
      "sha256=" +
      crypto.createHmac("sha256", secret).update(rawBody).digest("hex");
    verified = safeEquals(header, expected);
  } else if (sigSha1) {
    const header = String(sigSha1);
    const expected =
      "sha1=" + crypto.createHmac("sha1", secret).update(rawBody).digest("hex");
    verified = safeEquals(header, expected);
  }

  if (!verified) {
    return NextResponse.json(
      { ok: false, error: "Assinatura webhook inválida." },
      { status: 401 },
    );
  }

  const existingEvent = await prisma.pagarmeWebhookEvent.findUnique({
    where: { id: eventId },
  });
  if (existingEvent) {
    return NextResponse.json({ ok: true, duplicate: true }, { status: 200 });
  }

  const data = asRecord(payload.data);

  try {
    if (type.startsWith("order.")) {
      await handleOrderEvent(type, data);
    } else if (type.startsWith("charge.")) {
      await handleChargeEvent(type, data);
    } else if (type.startsWith("subscription.")) {
      await handleSubscriptionEvent(type, data);
    } else if (type.startsWith("invoice.")) {
      await handleInvoiceEvent(type, data);
    } else {
      console.info(`[pagarme webhook] evento ignorado: ${type} (${eventId})`);
    }

    await prisma.pagarmeWebhookEvent.create({
      data: { id: eventId, type },
    });
  } catch (e) {
    console.error(`[pagarme webhook] erro ${type} (${eventId})`, e);
    return NextResponse.json(
      { ok: false, error: "Falha ao processar webhook." },
      { status: 500 },
    );
  }

  return NextResponse.json({ ok: true }, { status: 200 });
}
