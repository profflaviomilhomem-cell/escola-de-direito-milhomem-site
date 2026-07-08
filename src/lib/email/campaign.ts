/**
 * Envio em lote de EmailCampaign — o boletim quinzenal "Bastidor da Acusação"
 * (guia 6.13). Renderiza `bodyMarkdown` → HTML seguro, envolve no layout
 * institucional (assinatura + endereço + descadastro) e envia a todos os
 * leads com duplo opt-in e sem descadastro, em lotes, tolerando falha parcial.
 *
 * O model EmailCampaign já existia sem nenhum uso — este é o consumidor.
 */

import { prisma } from "@/lib/prisma";
import { sendEmail } from "@/lib/resend/client";
import {
  escapeHtml,
  renderEmailLayout,
  type EmailTrackContext,
} from "@/lib/resend/templates/layout";
import { buildUnsubscribeUrl } from "@/lib/email/sequences";
import { siteConfig } from "@/config/site";

/**
 * Renderizador de Markdown mínimo e seguro. Escapa o HTML PRIMEIRO (nenhuma
 * tag do autor sobrevive) e só então aplica um subconjunto de Markdown:
 * títulos, negrito, itálico, links (apenas http/https/mailto) e listas.
 */
export function renderCampaignMarkdown(md: string): string {
  const inline = (text: string): string =>
    text
      .replace(
        /\[([^\]]+)\]\((https?:\/\/[^\s)]+|mailto:[^\s)]+)\)/g,
        (_m, label: string, href: string) =>
          `<a href="${href}" style="color:#f1bb41;text-decoration:underline;">${label}</a>`,
      )
      .replace(/\*\*([^*]+)\*\*/g, "<strong>$1</strong>")
      .replace(/\*([^*]+)\*/g, "<em>$1</em>");

  const escaped = escapeHtml(md).replace(/\r\n?/g, "\n");
  const blocks = escaped.split(/\n{2,}/);
  const out: string[] = [];

  for (const raw of blocks) {
    const block = raw.trim();
    if (!block) continue;
    const lines = block.split("\n");

    const isList = lines.every((l) => /^[-*]\s+/.test(l.trim()));
    if (isList) {
      const items = lines
        .map(
          (l) =>
            `<li style="margin:0 0 6px 0;">${inline(l.trim().replace(/^[-*]\s+/, ""))}</li>`,
        )
        .join("");
      out.push(`<ul style="margin:0 0 16px 20px;padding:0;">${items}</ul>`);
      continue;
    }

    const heading = block.match(/^(#{1,3})\s+(.*)$/);
    if (heading && lines.length === 1) {
      const level = heading[1].length;
      const size = level === 1 ? 22 : level === 2 ? 19 : 16;
      out.push(
        `<h${level} style="margin:24px 0 8px 0;font-size:${size}px;color:#f1bb41;">${inline(heading[2])}</h${level}>`,
      );
      continue;
    }

    out.push(
      `<p style="margin:0 0 16px 0;">${inline(lines.join("<br/>"))}</p>`,
    );
  }

  return out.join("\n");
}

export type CampaignSendSummary = {
  ok: boolean;
  slug: string;
  recipients: number;
  sent: number;
  failed: number;
  skipped?: string;
};

/**
 * Envia a campanha `slug` a toda a lista elegível.
 * Elegível = `doubleOptInAt` setado E `unsubscribedAt` nulo.
 */
export async function sendCampaign(
  slug: string,
  opts: { now?: Date; chunkSize?: number } = {},
): Promise<CampaignSendSummary> {
  const now = opts.now ?? new Date();
  const chunkSize = opts.chunkSize ?? 50;
  const baseUrl = (process.env.NEXT_PUBLIC_SITE_URL ?? siteConfig.url).replace(
    /\/$/,
    "",
  );

  const campaign = await prisma.emailCampaign.findUnique({ where: { slug } });
  if (!campaign) {
    return {
      ok: false,
      slug,
      recipients: 0,
      sent: 0,
      failed: 0,
      skipped: "not-found",
    };
  }
  if (campaign.status === "SENT") {
    return {
      ok: false,
      slug,
      recipients: 0,
      sent: 0,
      failed: 0,
      skipped: "already-sent",
    };
  }

  const leads = await prisma.lead.findMany({
    where: { doubleOptInAt: { not: null }, unsubscribedAt: null },
    select: { email: true, name: true },
  });

  // Descadastro é GLOBAL por e-mail, mas cada e-mail tem N linhas de Lead
  // (uma por isca). Filtrar unsubscribedAt:null por LINHA deixaria passar um
  // e-mail que tem outra linha descadastrada. Excluir qualquer e-mail com ao
  // menos uma linha descadastrada (mesma regra agregada das sequências).
  const unsubscribed = new Set(
    (
      await prisma.lead.findMany({
        where: { unsubscribedAt: { not: null } },
        select: { email: true },
      })
    ).map((l) => l.email),
  );

  // Dedup por e-mail (um lead pode ter várias linhas, uma por isca).
  const byEmail = new Map<string, string | undefined>();
  for (const lead of leads) {
    if (unsubscribed.has(lead.email)) continue;
    if (!byEmail.has(lead.email))
      byEmail.set(lead.email, lead.name ?? undefined);
  }
  const recipients = [...byEmail.keys()];

  const bodyHtml = renderCampaignMarkdown(campaign.bodyMarkdown);

  let sent = 0;
  let failed = 0;

  for (let i = 0; i < recipients.length; i += chunkSize) {
    const chunk = recipients.slice(i, i + chunkSize);
    const results = await Promise.allSettled(
      chunk.map(async (email) => {
        const ctx: EmailTrackContext = {
          baseUrl,
          email,
          sequence: `campaign:${slug}`,
          step: 0,
        };
        const unsubscribeUrl = await buildUnsubscribeUrl(baseUrl, email);
        const html = renderEmailLayout({
          ctx,
          unsubscribeUrl,
          eyebrow: "Bastidor da Acusação",
          title: escapeHtml(campaign.name),
          bodyHtml,
        });
        const res = await sendEmail({
          to: email,
          subject: campaign.subject,
          html,
          text: `${campaign.name}\n\n${campaign.bodyMarkdown}\n\nDescadastrar: ${unsubscribeUrl}`,
        });
        if (!res.ok) throw new Error(res.error);
      }),
    );
    for (const r of results) {
      if (r.status === "fulfilled") sent += 1;
      else failed += 1;
    }
  }

  // Só marca SENT se ao menos um envio saiu. Se TUDO falhou (ex.: Resend fora
  // do ar / mal configurado), manter o status atual permite reenvio — caso
  // contrário a campanha ficaria "queimada" como enviada sem ter enviado nada.
  if (sent > 0) {
    await prisma.emailCampaign.update({
      where: { id: campaign.id },
      data: { status: "SENT", sentAt: now },
    });
  }

  return {
    ok: sent > 0,
    slug,
    recipients: recipients.length,
    sent,
    failed,
    ...(sent === 0 ? { skipped: "all-failed" as const } : {}),
  };
}
