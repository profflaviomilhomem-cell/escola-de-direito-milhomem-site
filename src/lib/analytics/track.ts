/**
 * Helper único de tracking — fan-out para GTM/dataLayer e PostHog.
 *
 * Onde estiver disponível, eventos vão para os dois. Quando o usuário
 * recusar cookies analíticos, o consent gate (a montar na Fase 7)
 * impedirá a chamada antes mesmo de chegar aqui.
 *
 * Convenção de nomes (snake_case, mesmas chaves nos dois sinks):
 * taxonomia oficial em `@/lib/analytics/events` (Livro-Guia 8.5) —
 * importe as constantes de lá em vez de digitar o nome do evento.
 */

export type TrackProps = Record<
  string,
  string | number | boolean | null | undefined
>;

declare global {
  interface Window {
    dataLayer?: unknown[];
  }
}

export function track(event: string, props: TrackProps = {}): void {
  if (typeof window === "undefined") return;

  void import("@/lib/analytics/consent").then(({ hasAnalyticsConsent }) => {
    if (!hasAnalyticsConsent()) return;
    pushTrack(event, props);
  });
}

function pushTrack(event: string, props: TrackProps): void {
  // Macrotask: evita `dataLayer.push` / captura PostHog no mesmo stack que
  // ainda pode estar dentro de um render ou de hidratação (tags GTM e o
  // próprio PostHog podem disparar actualizações de estado noutros widgets).
  window.setTimeout(() => {
    window.dataLayer = window.dataLayer ?? [];
    window.dataLayer.push({ event, ...props });

    void import("posthog-js").then((mod) => {
      const ph = mod.default;
      if (typeof ph?.capture === "function" && ph.__loaded) {
        ph.capture(event, props);
      }
    });
  }, 0);
}
