/**
 * Taxonomia de eventos rastreados — Livro-Guia, Cap. 8.5.
 *
 * Fonte única de verdade para os nomes de evento enviados a
 * GA4 (via GTM/dataLayer), PostHog e UTMEvent (server-side).
 * Nunca use string solta em call site: importe daqui.
 *
 * Decisões de implementação:
 * - `lead_capture_source` está na taxonomia, mas a origem da isca/landing
 *   viaja como DIMENSÃO do `lead_capture` (props `source` + `lead_magnet`)
 *   — evita duplicar o evento e mantém o funil contável num nome só.
 *   O nome permanece reservado aqui para relatórios que o citem.
 * - `sequence_opened` / `sequence_clicked` só disparam na fase de e-mail
 *   (ESP/webhooks Resend) — reservados, sem call site ainda.
 * - `sign_up` é evento de autenticação, fora da taxonomia do guia.
 */

export const ANALYTICS_EVENTS = {
  PAGE_VIEW: "page_view",
  CONTENT_VIEWED: "content_viewed",
  LEAD_CAPTURE: "lead_capture",
  LEAD_CAPTURE_SOURCE: "lead_capture_source",
  SEQUENCE_OPENED: "sequence_opened",
  SEQUENCE_CLICKED: "sequence_clicked",
  CART_VIEWED: "cart_viewed",
  CART_INITIATED: "cart_initiated",
  PURCHASE_COMPLETED: "purchase_completed",
  LESSON_STARTED: "lesson_started",
  LESSON_COMPLETED: "lesson_completed",
  FORUM_COMMENT_POSTED: "forum_comment_posted",
  FORUM_REPLY_RECEIVED: "forum_reply_received",
  CERTIFICATE_ISSUED: "certificate_issued",
  SUBSCRIPTION_CANCELED: "subscription_canceled",
} as const;

export type AnalyticsEvent =
  (typeof ANALYTICS_EVENTS)[keyof typeof ANALYTICS_EVENTS];

/** Evento de autenticação (fora da taxonomia do guia, mantido por não conflitar). */
export const AUTH_SIGN_UP_EVENT = "sign_up";
