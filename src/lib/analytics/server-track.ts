import { recordUtmEvent } from "@/lib/analytics/utm-event";
import type { AnalyticsEvent } from "@/lib/analytics/events";

/**
 * Tracking server-side (webhooks, emissões, moderação) — taxonomia do
 * Livro-Guia 8.5. Dois sinks, ambos best-effort:
 *
 * 1. UTMEvent (Prisma) — funil por campanha, mesmo padrão do utm-event.ts.
 *    `destination` recebe `event:<nome>` para distinguir de destinos de URL.
 * 2. PostHog (HTTP capture API) — só quando `POSTHOG_API_KEY` (chave
 *    server-side, opcional) estiver configurada.
 *
 * NUNCA lança: telemetria não pode derrubar webhook nem fluxo de negócio.
 */

export type ServerTrackProps = {
  /** distinct_id no PostHog e userId no UTMEvent. */
  userId?: string | null;
  utmSource?: string | null;
  utmMedium?: string | null;
  utmCampaign?: string | null;
  utmContent?: string | null;
  utmTerm?: string | null;
} & Record<string, string | number | boolean | null | undefined>;

const UTM_KEYS = [
  "userId",
  "utmSource",
  "utmMedium",
  "utmCampaign",
  "utmContent",
  "utmTerm",
] as const;

/** Dimensões extras (tudo que não é userId/UTM) — vão para o PostHog. */
function extraProps(props: ServerTrackProps): Record<string, unknown> {
  const out: Record<string, unknown> = {};
  for (const [k, v] of Object.entries(props)) {
    if ((UTM_KEYS as readonly string[]).includes(k)) continue;
    if (v !== undefined) out[k] = v;
  }
  return out;
}

async function sendToPostHog(
  event: AnalyticsEvent,
  props: ServerTrackProps,
): Promise<void> {
  const apiKey = process.env.POSTHOG_API_KEY;
  if (!apiKey) return;

  const host = (
    process.env.NEXT_PUBLIC_POSTHOG_HOST ?? "https://us.i.posthog.com"
  ).replace(/\/$/, "");

  try {
    await fetch(`${host}/capture/`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        api_key: apiKey,
        event,
        distinct_id: props.userId ?? "server",
        properties: {
          ...extraProps(props),
          utm_source: props.utmSource ?? undefined,
          utm_medium: props.utmMedium ?? undefined,
          utm_campaign: props.utmCampaign ?? undefined,
          utm_content: props.utmContent ?? undefined,
          utm_term: props.utmTerm ?? undefined,
          source: "server",
        },
        timestamp: new Date().toISOString(),
      }),
    });
  } catch {
    // Silencioso: fire-and-forget.
  }
}

/**
 * Registra um evento da taxonomia no server. Best-effort nos dois sinks;
 * aceita qualquer evento do Cap. 8.5 (inclusive os de e-mail, fase futura).
 */
export async function trackServerEvent(
  event: AnalyticsEvent,
  props: ServerTrackProps = {},
): Promise<void> {
  try {
    await Promise.all([
      recordUtmEvent({
        userId: props.userId ?? null,
        destination: `event:${event}`,
        utmSource: props.utmSource ?? null,
        utmMedium: props.utmMedium ?? null,
        utmCampaign: props.utmCampaign ?? null,
        utmContent: props.utmContent ?? null,
        utmTerm: props.utmTerm ?? null,
      }),
      sendToPostHog(event, props),
    ]);
  } catch {
    // Telemetria nunca derruba o caller.
  }
}
