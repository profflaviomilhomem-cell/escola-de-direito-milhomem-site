import { NextResponse, type NextRequest } from "next/server";
import { z } from "zod";

import { siteConfig } from "@/config/site";
import { sendEmail } from "@/lib/resend/client";
import { rateLimit } from "@/lib/upstash/rate-limit";
import { contactSchema } from "@/schemas/contact";

/**
 * POST /api/contact — formulário institucional (sem persistência obrigatória).
 */
export async function POST(req: NextRequest) {
  const ip =
    req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ??
    req.headers.get("x-real-ip") ??
    "unknown";

  const rl = await rateLimit({
    prefix: "contact:form",
    max: 5,
    window: "10 m",
    key: ip,
  });
  if (!rl.success) {
    return NextResponse.json(
      {
        ok: false,
        error: "Muitas tentativas. Tente novamente em alguns minutos.",
      },
      { status: 429 },
    );
  }

  let raw: unknown;
  try {
    raw = await req.json();
  } catch {
    return NextResponse.json(
      { ok: false, error: "Payload inválido" },
      { status: 400 },
    );
  }

  const parsed = contactSchema.safeParse(raw);
  if (!parsed.success) {
    return NextResponse.json(
      { ok: false, errors: z.flattenError(parsed.error) },
      { status: 422 },
    );
  }

  const data = parsed.data;
  if (data.website) {
    return NextResponse.json({ ok: true });
  }

  const html = `
    <p><strong>Nome:</strong> ${escapeHtml(data.name)}</p>
    <p><strong>E-mail:</strong> ${escapeHtml(data.email)}</p>
    <p><strong>Mensagem:</strong></p>
    <p>${escapeHtml(data.message).replace(/\n/g, "<br>")}</p>
  `;

  const result = await sendEmail({
    to: siteConfig.contact.email,
    subject: `[Contato] ${data.name}`,
    html,
    replyTo: data.email,
    text: `${data.name} <${data.email}>\n\n${data.message}`,
  });

  if (!result.ok) {
    return NextResponse.json(
      {
        ok: false,
        error: "Não foi possível enviar agora. Tente por e-mail direto.",
      },
      { status: 503 },
    );
  }

  return NextResponse.json({ ok: true });
}

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}
