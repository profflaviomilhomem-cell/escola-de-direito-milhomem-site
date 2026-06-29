import type { SubscriptionStatus } from "@prisma/client";

/** Mapeia status da API Pagar.me → `SubscriptionStatus` do Prisma. */
export function mapPagarmeSubscriptionStatus(
  value: unknown,
): SubscriptionStatus | null {
  switch (String(value ?? "").toLowerCase()) {
    case "active":
    case "paid":
      return "ACTIVE";
    case "past_due":
    case "unpaid":
    case "failed":
      return "PAST_DUE";
    case "paused":
      return "PAUSED";
    case "canceled":
    case "cancelled":
      return "CANCELED";
    default:
      return null;
  }
}

/** Deriva status a partir do tipo de evento + payload. */
export function mapSubscriptionEventType(
  eventType: string,
  data: Record<string, unknown>,
): SubscriptionStatus | null {
  if (eventType === "subscription.canceled") return "CANCELED";

  const fromPayload = mapPagarmeSubscriptionStatus(data.status);
  if (fromPayload) return fromPayload;

  if (eventType === "subscription.created") {
    const raw = String(data.status ?? "").toLowerCase();
    if (raw === "future" || raw === "pending" || raw === "trialing") {
      return "PAUSED";
    }
  }

  return null;
}

export function extractPagarmeSubscriptionId(
  data: Record<string, unknown>,
): string | null {
  const candidates = [
    data.subscription_id,
    (data.subscription as Record<string, unknown> | undefined)?.id,
    typeof data.id === "string" && data.id.startsWith("sub_") ? data.id : null,
  ];

  for (const candidate of candidates) {
    const id = typeof candidate === "string" ? candidate.trim() : "";
    if (id.startsWith("sub_")) return id;
  }

  return null;
}

export function parsePagarmeDate(value: unknown): Date | null {
  if (typeof value !== "string" || !value.trim()) return null;
  const d = new Date(value);
  return Number.isNaN(d.getTime()) ? null : d;
}

export function readPagarmeMetadata(
  data: Record<string, unknown>,
): Record<string, string> {
  const raw = data.metadata;
  if (!raw || typeof raw !== "object") return {};
  const out: Record<string, string> = {};
  for (const [key, val] of Object.entries(raw as Record<string, unknown>)) {
    if (typeof val === "string" && val.trim()) out[key] = val.trim();
  }
  return out;
}
