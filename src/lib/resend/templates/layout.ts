/**
 * Layout compartilhado dos e-mails transacionais e de sequência.
 *
 * Mantém a mesma linguagem visual do confirm-newsletter (tabela + CSS inline,
 * paleta navy/mostarda, tipografia sóbria) e centraliza o que todo e-mail
 * precisa carregar por lei e por marca:
 *   - assinatura com a tagline institucional (guia 1.11);
 *   - endereço institucional (guia 6.14);
 *   - link de descadastro no rodapé (LGPD);
 *   - pixel de abertura (sequence_opened) e wrapper de clique (sequence_clicked).
 *
 * Os templates montam apenas o CORPO; o header e o rodapé vêm daqui.
 */

import { siteConfig } from "@/config/site";

/** Contexto de rastreamento por destinatário/passo — alimenta os wrappers. */
export type EmailTrackContext = {
  /** URL absoluta do site (sem barra final). */
  baseUrl: string;
  /** E-mail do destinatário. */
  email: string;
  /** Slug curto da sequência (ex.: "welcome", "launch"). */
  sequence: string;
  /** Passo atual (0-based). */
  step: number;
};

export function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

/**
 * Envolve um destino de clique no rastreador `sequence_clicked`. O destino
 * viaja como `u` (URL-encoded) e é validado do lado do servidor antes do
 * redirect (allowlist), então nunca vira open redirect.
 */
export function trackedHref(
  ctx: EmailTrackContext,
  destination: string,
): string {
  const u = encodeURIComponent(destination);
  const e = encodeURIComponent(ctx.email);
  const s = encodeURIComponent(ctx.sequence);
  return `${ctx.baseUrl}/api/email/track/click?u=${u}&e=${e}&s=${s}&step=${ctx.step}`;
}

/** `<img>` 1x1 que dispara `sequence_opened` ao carregar. */
export function openPixelHtml(ctx: EmailTrackContext): string {
  const e = encodeURIComponent(ctx.email);
  const s = encodeURIComponent(ctx.sequence);
  const src = `${ctx.baseUrl}/api/email/track/open?e=${e}&s=${s}&step=${ctx.step}`;
  return `<img src="${src}" width="1" height="1" alt="" style="display:block;width:1px;height:1px;border:0;" />`;
}

/** Parágrafo padrão do corpo. `inner` já deve vir escapado/seguro. */
export function p(inner: string): string {
  return `<p style="margin:0 0 16px 0;">${inner}</p>`;
}

/** Botão-CTA em mostarda. `href` deve já estar embrulhado por `trackedHref`. */
export function cta(href: string, label: string): string {
  return `<table role="presentation" cellpadding="0" cellspacing="0" border="0" style="margin:8px 0 8px 0;">
    <tr><td style="border-radius:2px;background:#f1bb41;">
      <a href="${href}" style="display:inline-block;background:#f1bb41;color:#030024;text-decoration:none;font-weight:600;font-size:14px;letter-spacing:0.06em;text-transform:uppercase;padding:14px 22px;border-radius:2px;">${escapeHtml(label)}</a>
    </td></tr>
  </table>`;
}

export type EmailLayoutOptions = {
  ctx: EmailTrackContext;
  /** URL de descadastro assinada (LGPD) — obrigatória. */
  unsubscribeUrl: string;
  eyebrow: string;
  /** Título do e-mail. Pode conter `<em>` para ênfase em mostarda. */
  title: string;
  /** Corpo já montado (use `p`, `cta`, `trackedHref`). */
  bodyHtml: string;
};

/** Monta o HTML completo do e-mail (header + corpo + rodapé + pixel). */
export function renderEmailLayout(opts: EmailLayoutOptions): string {
  const { ctx, unsubscribeUrl, eyebrow, title, bodyHtml } = opts;
  const address = siteConfig.contact.email;
  const tagline = siteConfig.taglineInstitucional;

  return `<!doctype html>
<html lang="pt-BR">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width,initial-scale=1" />
    <title>${escapeHtml(eyebrow)}</title>
  </head>
  <body style="margin:0;padding:0;background:#030024;color:#e0e0e0;font-family:Helvetica,Arial,sans-serif;">
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="background:#030024;padding:40px 16px;">
      <tr>
        <td align="center">
          <table role="presentation" width="560" cellpadding="0" cellspacing="0" border="0" style="max-width:560px;width:100%;background:#0b1f3d;border:1px solid rgba(241, 187, 65,0.25);">
            <tr>
              <td style="padding:32px 40px 8px 40px;font-family:Georgia,'Times New Roman',serif;color:#e0e0e0;">
                <p style="margin:0 0 4px 0;font-size:11px;letter-spacing:0.2em;text-transform:uppercase;color:#f1bb41;">${escapeHtml(eyebrow)}</p>
                <h1 style="margin:0;font-size:26px;line-height:1.2;color:#e0e0e0;">${title}</h1>
              </td>
            </tr>
            <tr>
              <td style="padding:16px 40px 8px 40px;font-size:16px;line-height:1.7;color:rgba(224, 224, 224,0.88);font-family:Georgia,'Times New Roman',serif;">
                ${bodyHtml}
              </td>
            </tr>
            <tr>
              <td style="padding:24px 40px 8px 40px;border-top:1px solid rgba(241, 187, 65,0.18);font-size:13px;line-height:1.6;color:rgba(224, 224, 224,0.7);font-family:Georgia,'Times New Roman',serif;">
                <p style="margin:16px 0 2px 0;">— Flávio Milhomem</p>
                <p style="margin:0;color:rgba(224, 224, 224,0.55);">Escola Flávio Milhomem · <em style="color:#f1bb41;font-style:italic;">${escapeHtml(tagline)}</em></p>
              </td>
            </tr>
            <tr>
              <td style="padding:8px 40px 32px 40px;font-size:11px;line-height:1.6;color:rgba(224, 224, 224,0.45);">
                <p style="margin:12px 0 0 0;">Escola Flávio Milhomem · Brasília, DF · ${escapeHtml(address)}</p>
                <p style="margin:8px 0 0 0;">
                  Você recebe este e-mail porque se inscreveu na nossa lista.
                  <a href="${unsubscribeUrl}" style="color:rgba(224, 224, 224,0.7);text-decoration:underline;">Descadastrar</a>.
                </p>
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
    ${openPixelHtml(ctx)}
  </body>
</html>`;
}

/** Rodapé em texto puro (assinatura + endereço + descadastro). */
export function textFooter(unsubscribeUrl: string): string {
  return [
    ``,
    `— Flávio Milhomem`,
    `Escola Flávio Milhomem · ${siteConfig.taglineInstitucional}`,
    `Brasília, DF · ${siteConfig.contact.email}`,
    ``,
    `Descadastrar: ${unsubscribeUrl}`,
  ].join("\n");
}

/** Rotas conhecidas usadas nos CTAs dos e-mails (destinos brutos). */
export function emailRoutes(baseUrl: string) {
  return {
    home: `${baseUrl}/`,
    curso: `${baseUrl}/cursos/prova-digital-no-processo-penal`,
    cursos: `${baseUrl}/cursos`,
    checkout: `${baseUrl}/checkout/prova-digital-no-processo-penal`,
    blog: `${baseUrl}/blog`,
    sobre: `${baseUrl}/sobre`,
    materiais: `${baseUrl}/materiais/mapa-da-acusacao`,
    reembolso: `${baseUrl}/reembolso`,
    alunoDashboard: `${baseUrl}/aluno/dashboard`,
    youtube: `https://www.youtube.com/watch?v=${siteConfig.social.edicaoLancamentoVideoId}`,
  } as const;
}

/**
 * Monta {subject, html, text} a partir de blocos estruturados — evita
 * repetir o esqueleto em cada um dos 18 templates. Cada CTA é embrulhado
 * pelo rastreador de clique; parágrafos são texto puro (escapados no HTML).
 */
export function composeEmail(args: {
  input: { ctx: EmailTrackContext; name?: string; unsubscribeUrl: string };
  subject: string;
  eyebrow: string;
  /** Título em HTML (pode conter `<em>` já escapado à mão). */
  title: string;
  /** Título em texto puro para o corpo plaintext. */
  titleText: string;
  paragraphs: string[];
  ctas?: Array<{ label: string; href: string }>;
  /** Parágrafos após os CTAs. */
  outro?: string[];
}): { subject: string; html: string; text: string } {
  const { input } = args;
  const greeting = args.input.name?.trim()
    ? `${escapeHtml(args.input.name.trim())},`
    : "Olá,";

  const htmlParts: string[] = [p(greeting)];
  for (const para of args.paragraphs) htmlParts.push(p(escapeHtml(para)));
  for (const c of args.ctas ?? []) {
    htmlParts.push(cta(trackedHref(input.ctx, c.href), c.label));
  }
  for (const para of args.outro ?? []) htmlParts.push(p(escapeHtml(para)));

  const html = renderEmailLayout({
    ctx: input.ctx,
    unsubscribeUrl: input.unsubscribeUrl,
    eyebrow: args.eyebrow,
    title: args.title,
    bodyHtml: htmlParts.join("\n                "),
  });

  const textParts: string[] = [
    args.titleText,
    "",
    args.input.name?.trim() ? `${args.input.name.trim()},` : "Olá,",
    "",
    ...args.paragraphs,
  ];
  for (const c of args.ctas ?? []) {
    textParts.push("", `${c.label}: ${trackedHref(input.ctx, c.href)}`);
  }
  if (args.outro?.length) textParts.push("", ...args.outro);
  textParts.push(textFooter(input.unsubscribeUrl));

  return { subject: args.subject, html, text: textParts.join("\n") };
}
