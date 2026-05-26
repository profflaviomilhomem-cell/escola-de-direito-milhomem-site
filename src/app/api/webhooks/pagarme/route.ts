import crypto from "node:crypto";
import { NextResponse, type NextRequest } from "next/server";

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

function paymentMethodFromPagarme(value: unknown) {
  const s = String(value ?? "").toLowerCase();
  if (s.includes("pix")) return "PIX";
  if (s.includes("boleto") || s.includes("bank_slip") || s.includes("bank")) {
    return "BOLETO";
  }
  return "CARD";
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

async function handleOrderEvent(type: string, data: Record<string, unknown>) {
  const externalId = normalizeExternalId(data.id);
  if (!externalId) return;

  const desiredStatus =
    type === "order.paid"
      ? "PAID"
      : type === "order.payment_failed" || type === "order.canceled"
        ? "REFUSED"
        : type.includes("refund")
          ? "REFUNDED"
          : null;

  if (!desiredStatus) return;

  const charges = Array.isArray(data.charges) ? data.charges : [];
  const firstCharge = charges[0] as Record<string, unknown> | undefined;
  const paymentMethod = paymentMethodFromPagarme(firstCharge?.payment_method);

  await prisma.order.updateMany({
    where: {
      OR: [{ pagarmeOrderId: externalId }, { pagarmeChargeId: externalId }],
    },
    data: { status: desiredStatus, paymentMethod },
  });
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
          : null;

  if (!desiredStatus) return;

  const charges = Array.isArray(data.charges) ? data.charges : [];
  const paymentMethod = paymentMethodFromPagarme(
    (charges[0] as Record<string, unknown> | undefined)?.payment_method ??
      data.payment_method,
  );

  await prisma.order.updateMany({
    where: { pagarmeChargeId: externalId },
    data: { status: desiredStatus, paymentMethod },
  });
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

  const eventId = payload.id ?? req.headers.get("x-event-id") ?? "unknown";
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
      "sha1=" +
      crypto.createHmac("sha1", secret).update(rawBody).digest("hex");
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
