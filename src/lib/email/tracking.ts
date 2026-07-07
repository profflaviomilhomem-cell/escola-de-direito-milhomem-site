/**
 * Validação do destino de clique dos e-mails (anti open-redirect).
 *
 * O wrapper de clique (/api/email/track/click) recebe o destino em `u` e só
 * redireciona se ele for http/https E o host estiver na allowlist: o próprio
 * site ou um punhado de domínios externos que os templates de fato linkam.
 * Qualquer outro destino é recusado — assim o rastreador nunca vira um
 * redirecionador aberto para phishing.
 */

import { siteConfig } from "@/config/site";

/** Hosts externos que os templates podem linkar (vídeo, redes, checkout). */
const EXTERNAL_ALLOWLIST = [
  "youtube.com",
  "www.youtube.com",
  "youtu.be",
  "instagram.com",
  "www.instagram.com",
  "linkedin.com",
  "www.linkedin.com",
  "eduzz.com",
  "sun.eduzz.com",
];

/**
 * Retorna a URL de destino normalizada se for segura; senão `null`.
 * `reqOrigin` (origin da requisição atual) entra na allowlist para cobrir
 * previews da Vercel, onde o host difere do domínio de produção.
 */
export function safeClickDestination(
  raw: string | null | undefined,
  reqOrigin?: string,
): string | null {
  if (!raw) return null;

  let url: URL;
  try {
    url = new URL(raw);
  } catch {
    return null;
  }

  if (url.protocol !== "http:" && url.protocol !== "https:") return null;

  const allowed = new Set<string>(EXTERNAL_ALLOWLIST);
  try {
    allowed.add(new URL(siteConfig.url).host);
  } catch {
    /* ignore */
  }
  if (reqOrigin) {
    try {
      allowed.add(new URL(reqOrigin).host);
    } catch {
      /* ignore */
    }
  }

  if (!allowed.has(url.host)) return null;
  return url.toString();
}
