/**
 * Security headers da borda.
 *
 * Aplicados no `proxy.ts`, em toda resposta. Três dos quatro headers antigos
 * (`X-Content-Type-Options`, `Referrer-Policy`, `X-Frame-Options`) já estavam
 * lá desde julho; o que faltava — e este módulo acrescenta — é HSTS,
 * Permissions-Policy e uma Content-Security-Policy.
 *
 * ## Por que a CSP entra em Report-Only
 *
 * CSP mal calibrada não degrada: quebra. Uma diretiva a menos e o site perde
 * fonte, imagem ou o próprio script de hidratação — em produção, para todo
 * mundo, de uma vez. A lista de origens abaixo foi levantada do código
 * (26/08/2026), mas levantamento estático não vê o que só aparece em runtime:
 * um redirect de CDN, um pixel que troca de host, um `<script>` que a Vercel
 * injeta no preview.
 *
 * Então a política entra em `Content-Security-Policy-Report-Only`, com
 * `report-uri` apontando para `/api/csp-report`. Ela não bloqueia nada e
 * registra tudo o que **teria** bloqueado. Depois de uma janela de tráfego
 * real, a lista de violações é a evidência para promover a enforcing —
 * trocando `reportOnly: true` por `false` aqui, sem mais nada.
 *
 * Promover antes disso seria adivinhar, e adivinhação em produção de cliente
 * é o tipo de coisa que só aparece quando alguém liga para reclamar.
 */

/** Origens de script observadas no código em 26/08/2026. */
const SCRIPT_SRC = [
  "'self'",
  // Next.js injeta scripts inline de bootstrap e hidratação. Sair de
  // 'unsafe-inline' exige nonce por requisição com `strict-dynamic`, que é a
  // evolução natural depois que o Report-Only estiver limpo.
  "'unsafe-inline'",
  "https://connect.facebook.net",
  "https://snap.licdn.com",
  "https://us.i.posthog.com",
  "https://us-assets.i.posthog.com",
  "https://www.googletagmanager.com",
  "https://www.youtube.com",
  "https://www.youtube-nocookie.com",
  "https://embed.cloudflarestream.com",
];

const STYLE_SRC = ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"];

const FONT_SRC = ["'self'", "data:", "https://fonts.gstatic.com"];

const IMG_SRC = [
  "'self'",
  "data:",
  "blob:",
  "https://images.unsplash.com",
  "https://martinsfontespaulista.vteximg.com.br",
  // Vercel Blob: capas do blog (store pública). O material pago NÃO sai por
  // aqui — sai transmitido pela rota autenticada, mesma origem.
  "https://*.public.blob.vercel-storage.com",
  "https://i.ytimg.com",
  "https://www.facebook.com",
  "https://px.ads.linkedin.com",
];

const CONNECT_SRC = [
  "'self'",
  "https://us.i.posthog.com",
  "https://us-assets.i.posthog.com",
  "https://graph.facebook.com",
  "https://www.google-analytics.com",
  "https://vitals.vercel-insights.com",
];

/** Players embutidos. O Cloudflare Stream entra agora para não travar o dia do upload. */
const FRAME_SRC = [
  "'self'",
  "https://www.youtube.com",
  "https://www.youtube-nocookie.com",
  "https://embed.cloudflarestream.com",
  "https://iframe.videodelivery.net",
];

const MEDIA_SRC = [
  "'self'",
  "blob:",
  "https://videodelivery.net",
  "https://*.videodelivery.net",
];

export const CSP_REPORT_PATH = "/api/csp-report";

/**
 * @param enforcing quando `false`, `upgrade-insecure-requests` fica de fora.
 *
 * O browser **ignora** essa diretiva em política report-only — e registra a
 * recusa como *erro de console*. Isso não é cosmético aqui: `area-logada.spec`
 * afirma "sem erro de console" em 15 rotas logadas, e as 15 quebraram quando a
 * diretiva entrou. Foi o teste antigo pegando o defeito novo.
 */
export function buildContentSecurityPolicy(enforcing = false): string {
  return [
    "default-src 'self'",
    `script-src ${SCRIPT_SRC.join(" ")}`,
    `style-src ${STYLE_SRC.join(" ")}`,
    `font-src ${FONT_SRC.join(" ")}`,
    `img-src ${IMG_SRC.join(" ")}`,
    `connect-src ${CONNECT_SRC.join(" ")}`,
    `frame-src ${FRAME_SRC.join(" ")}`,
    `media-src ${MEDIA_SRC.join(" ")}`,
    "object-src 'none'",
    "base-uri 'self'",
    "form-action 'self'",
    "frame-ancestors 'self'",
    ...(enforcing ? ["upgrade-insecure-requests"] : []),
    `report-uri ${CSP_REPORT_PATH}`,
  ]
    .filter(Boolean)
    .join("; ");
}

/**
 * Permissions-Policy: desliga o que o site não usa. Câmera e microfone nunca
 * são pedidos; geolocalização também não. `interest-cohort` desliga FLoC.
 */
const PERMISSIONS_POLICY = [
  "accelerometer=()",
  "autoplay=(self)",
  "camera=()",
  "display-capture=()",
  "encrypted-media=(self)",
  "fullscreen=(self)",
  "geolocation=()",
  "gyroscope=(self)",
  "interest-cohort=()",
  "microphone=()",
  "payment=()",
  "usb=()",
].join(", ");

export type SecurityHeaderOptions = {
  /** Em `false`, a CSP passa a bloquear de verdade. Ver a nota no topo. */
  reportOnly?: boolean;
  /** HSTS só faz sentido sobre HTTPS; em dev local o header é omitido. */
  isSecure?: boolean;
};

/**
 * Monta o conjunto completo de headers. Função pura para poder ser testada
 * sem subir o proxy.
 */
export function buildSecurityHeaders(
  opts: SecurityHeaderOptions = {},
): Record<string, string> {
  const { reportOnly = true, isSecure = true } = opts;

  const headers: Record<string, string> = {
    "X-Content-Type-Options": "nosniff",
    "Referrer-Policy": "strict-origin-when-cross-origin",
    "X-Frame-Options": "SAMEORIGIN",
    "X-DNS-Prefetch-Control": "on",
    "Permissions-Policy": PERMISSIONS_POLICY,
  };

  if (isSecure) {
    // 2 anos, subdomínios incluídos. Sem `preload`: entrar na lista de preload
    // dos browsers é praticamente irreversível, e o domínio ainda vai migrar
    // do WordPress — não é hora de tomar decisão sem volta.
    headers["Strict-Transport-Security"] =
      "max-age=63072000; includeSubDomains";
  }

  const csp = buildContentSecurityPolicy(!reportOnly);
  headers[
    reportOnly
      ? "Content-Security-Policy-Report-Only"
      : "Content-Security-Policy"
  ] = csp;

  return headers;
}
