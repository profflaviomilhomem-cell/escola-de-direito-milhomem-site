import { Resend } from "resend";

import { siteConfig } from "@/config/site";

/**
 * Cliente Resend tolerante a ambiente vazio — mas só fora de produção.
 *
 * Em dev/CI sem `RESEND_API_KEY`, o cliente vira no-op: as chamadas
 * retornam `{ ok: true, skipped: true }` e logam o destinatário no
 * console — assim o fluxo da newsletter pode ser exercitado de ponta
 * a ponta sem credenciais reais.
 *
 * Em produção, ausência de chave é FALHA e nunca sucesso. Antes, o no-op
 * valia em qualquer ambiente: o site respondia "e-mail enviado" sem enviar
 * nada e sem deixar rastro, porque o log estava condicionado a dev. Isca,
 * confirmação de cadastro e recuperação de senha sumiam em silêncio.
 * Nenhuma rota muda de resposta com isso — `api/leads` já ignorava o
 * resultado e `api/auth/forgot` responde `ok` por decisão anti-enumeração.
 * O que muda é existir registro do problema.
 */

let cached: Resend | null = null;

function getClient(): Resend | null {
  if (cached) return cached;
  const key = process.env.RESEND_API_KEY;
  if (!key) return null;
  cached = new Resend(key);
  return cached;
}

export type SendOptions = {
  to: string;
  subject: string;
  html: string;
  text?: string;
  replyTo?: string;
};

export async function sendEmail(
  opts: SendOptions,
): Promise<
  { ok: true; id?: string; skipped?: true } | { ok: false; error: string }
> {
  const client = getClient();
  // Fallback no domínio que EXISTE. O anterior era
  // `contato@escolaflaviomilhomem.com.br`, e esse domínio não está registrado
  // (verificado no registro.br em 01/08/2026) — remetente ali é entrega
  // garantidamente falha. O domínio real é professorflaviomilhomem.com.br,
  // de FLÁVIO AUGUSTO MILHOMEM, e é ele que precisa ser verificado no Resend.
  const from =
    process.env.RESEND_FROM_EMAIL ?? "contato@professorflaviomilhomem.com.br";

  if (!client) {
    if (process.env.NODE_ENV === "production") {
      console.error(
        `[resend] RESEND_API_KEY ausente em produção — e-mail NÃO enviado. ` +
          `subject="${opts.subject}"`,
      );
      return { ok: false, error: "RESEND_API_KEY ausente em produção" };
    }
    console.info(
      `[resend:stub] would send to=${opts.to} subject="${opts.subject}"`,
    );
    return { ok: true, skipped: true };
  }

  try {
    const result = await client.emails.send({
      from,
      to: opts.to,
      subject: opts.subject,
      html: opts.html,
      text: opts.text,
      // Sem `replyTo` explícito, a resposta do aluno iria para o remetente
      // técnico (`@professorflaviomilhomem.com.br`), que é um domínio sem
      // caixa configurada — a mensagem se perderia. O padrão é o e-mail
      // oficial do professor. `api/contact` sobrescreve com o endereço do
      // visitante, que é o comportamento certo lá.
      replyTo: opts.replyTo ?? siteConfig.contact.email,
    });
    if (result.error) {
      return { ok: false, error: result.error.message };
    }
    return { ok: true, id: result.data?.id };
  } catch (err) {
    const message = err instanceof Error ? err.message : "unknown";
    return { ok: false, error: message };
  }
}
