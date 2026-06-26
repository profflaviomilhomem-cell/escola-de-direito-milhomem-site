import { Resend } from "resend";

/**
 * Cliente Resend tolerante a ambiente vazio.
 *
 * Em dev/CI sem `RESEND_API_KEY`, o cliente vira no-op: as chamadas
 * retornam `{ ok: true, skipped: true }` e logam o destinatário no
 * console — assim o fluxo da newsletter pode ser exercitado de ponta
 * a ponta sem credenciais reais.
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
  const from =
    process.env.RESEND_FROM_EMAIL ?? "contato@escolaflaviomilhomem.com.br";

  if (!client) {
    if (process.env.NODE_ENV !== "production") {
      console.info(
        `[resend:stub] would send to=${opts.to} subject="${opts.subject}"`,
      );
    }
    return { ok: true, skipped: true };
  }

  try {
    const result = await client.emails.send({
      from,
      to: opts.to,
      subject: opts.subject,
      html: opts.html,
      text: opts.text,
      replyTo: opts.replyTo,
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
