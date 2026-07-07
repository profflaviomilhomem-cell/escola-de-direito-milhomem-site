import { createHash } from "node:crypto";

/**
 * Meta Conversions API (server-side) — espelho do Pixel para eventos
 * críticos (Purchase no webhook Pagar.me, Lead no confirm do duplo opt-in).
 *
 * Gate: só envia com `META_CAPI_ACCESS_TOKEN` + pixel id
 * (`META_CAPI_PIXEL_ID`, fallback `NEXT_PUBLIC_META_PIXEL_ID`).
 * `event_id` determinístico (ex.: orderId) deduplica com o Pixel client.
 * Sempre fire-and-forget: NUNCA lança nem derruba o caller.
 *
 * Spec de user_data (hash SHA-256, minúsculas, sem espaços):
 * https://developers.facebook.com/docs/marketing-api/conversions-api/parameters/customer-information-parameters
 */

const META_GRAPH_VERSION = "v21.0";

export type MetaCapiEventName = "Purchase" | "Lead" | (string & {});

export type MetaCapiData = {
  /** Determinístico (orderId, lead:email:isca) — dedup com o Pixel client. */
  eventId: string;
  email?: string | null;
  phone?: string | null;
  eventSourceUrl?: string | null;
  clientIp?: string | null;
  userAgent?: string | null;
  value?: number | null;
  currency?: string | null;
  contentIds?: string[];
  contentName?: string | null;
  /** Epoch em segundos — default: agora (injetável em teste). */
  eventTime?: number;
};

/** SHA-256 hex do valor normalizado (trim + minúsculas), conforme spec Meta. */
export function hashSha256(value: string): string {
  return createHash("sha256").update(value.trim().toLowerCase()).digest("hex");
}

/**
 * Telefone na spec Meta: só dígitos, com código do país.
 * Números BR de 10-11 dígitos ganham prefixo 55.
 */
export function normalizePhone(phone: string): string | null {
  const digits = phone.replace(/\D/g, "");
  if (digits.length < 8) return null;
  if (digits.length === 10 || digits.length === 11) return `55${digits}`;
  return digits;
}

type MetaCapiPayload = {
  data: Array<{
    event_name: string;
    event_time: number;
    event_id: string;
    action_source: "website";
    event_source_url?: string;
    user_data: Record<string, string[] | string>;
    custom_data?: Record<string, unknown>;
  }>;
};

/** Monta o payload da CAPI (puro — testável sem rede). */
export function buildMetaCapiPayload(
  event: MetaCapiEventName,
  data: MetaCapiData,
): MetaCapiPayload | null {
  const userData: Record<string, string[] | string> = {};

  if (data.email) userData.em = [hashSha256(data.email)];
  if (data.phone) {
    const phone = normalizePhone(data.phone);
    if (phone) userData.ph = [hashSha256(phone)];
  }
  if (data.clientIp) userData.client_ip_address = data.clientIp;
  if (data.userAgent) userData.client_user_agent = data.userAgent;

  // A Meta exige ao menos um parâmetro de user_data — sem match, não envia.
  if (Object.keys(userData).length === 0) return null;

  const customData: Record<string, unknown> = {};
  if (typeof data.value === "number") customData.value = data.value;
  if (data.currency) customData.currency = data.currency;
  if (data.contentIds?.length) customData.content_ids = data.contentIds;
  if (data.contentName) customData.content_name = data.contentName;

  return {
    data: [
      {
        event_name: event,
        event_time: data.eventTime ?? Math.floor(Date.now() / 1000),
        event_id: data.eventId,
        action_source: "website",
        ...(data.eventSourceUrl
          ? { event_source_url: data.eventSourceUrl }
          : {}),
        user_data: userData,
        ...(Object.keys(customData).length > 0
          ? { custom_data: customData }
          : {}),
      },
    ],
  };
}

/**
 * Envia o evento à Conversions API. No-op sem credenciais; erros de rede
 * ou da Graph API viram log — o webhook/rota que chamou nunca quebra.
 */
export async function sendMetaCapi(
  event: MetaCapiEventName,
  data: MetaCapiData,
): Promise<void> {
  const pixelId =
    process.env.META_CAPI_PIXEL_ID || process.env.NEXT_PUBLIC_META_PIXEL_ID;
  const accessToken = process.env.META_CAPI_ACCESS_TOKEN;
  if (!pixelId || !accessToken) return;

  const payload = buildMetaCapiPayload(event, data);
  if (!payload) return;

  try {
    const res = await fetch(
      `https://graph.facebook.com/${META_GRAPH_VERSION}/${pixelId}/events?access_token=${encodeURIComponent(accessToken)}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      },
    );
    if (!res.ok) {
      const body = await res.text().catch(() => "");
      console.error(`[meta-capi] ${event} falhou (${res.status}): ${body}`);
    }
  } catch (err) {
    console.error(`[meta-capi] ${event} erro de rede:`, err);
  }
}
