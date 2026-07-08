import { NextResponse, type NextRequest } from "next/server";

import { passwordFingerprint } from "@/lib/auth/password";
import { signResetToken } from "@/lib/auth/reset-token";
import { prisma } from "@/lib/prisma";
import { sendEmail } from "@/lib/resend/client";
import { rateLimit } from "@/lib/upstash/rate-limit";
import { forgotPasswordSchema } from "@/schemas/auth";

/**
 * POST /api/auth/forgot — inicia recuperação de senha.
 *
 * Pipeline:
 *   1. Rate-limit por IP e por e-mail.
 *   2. Validação Zod.
 *   3. Busca usuário. Se não existir, devolve 200 (sucesso falso)
 *      para evitar enumeração de e-mails.
 *   4. Gera token JWT assinado (TTL 1h).
 *   5. Dispara e-mail via Resend.
 */
export async function POST(req: NextRequest) {
  const ip =
    req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ??
    req.headers.get("x-real-ip") ??
    "unknown";

  const rlIp = await rateLimit({
    prefix: "auth:forgot:ip",
    max: 10,
    window: "10 m",
    key: ip,
  });
  if (!rlIp.success) {
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
      { ok: false, error: "Payload inválido." },
      { status: 400 },
    );
  }

  const parsed = forgotPasswordSchema.safeParse(raw);
  if (!parsed.success) {
    return NextResponse.json(
      { ok: false, error: "E-mail inválido." },
      { status: 422 },
    );
  }

  const { email } = parsed.data;

  const rlEmail = await rateLimit({
    prefix: "auth:forgot:email",
    max: 3,
    window: "1 h",
    key: email,
  });
  if (!rlEmail.success) {
    return NextResponse.json(
      {
        ok: false,
        error: "Muitas tentativas para este e-mail. Aguarde 1 hora.",
      },
      { status: 429 },
    );
  }

  const user = await prisma.user.findUnique({
    where: { email },
    select: { id: true, email: true, name: true, passwordHash: true },
  });

  // Se o usuário não existe, retornamos sucesso mas não fazemos nada.
  // Isso evita que atacantes descubram quais e-mails estão cadastrados.
  if (!user) {
    return NextResponse.json({ ok: true });
  }

  const token = await signResetToken({
    sub: user.id,
    email: user.email,
    pv: passwordFingerprint(user.passwordHash),
  });
  const resetUrl = `${new URL(req.url).origin}/recuperar-senha?token=${token}`;

  await sendEmail({
    to: user.email,
    subject: "Recuperação de senha — Escola Flávio Milhomem",
    html: `
      <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <h1 style="color: #1a2a44;">Recuperação de Senha</h1>
        <p>Olá, ${user.name || "aluno"}.</p>
        <p>Recebemos um pedido para trocar a sua senha na Escola Flávio Milhomem.</p>
        <p>Clique no botão abaixo para escolher uma nova senha. Este link expira em 1 hora.</p>
        <div style="margin: 30px 0;">
          <a href="${resetUrl}" style="background-color: #d4af37; color: #111; padding: 12px 24px; text-decoration: none; font-weight: bold; font-family: monospace; text-transform: uppercase;">Recuperar Senha</a>
        </div>
        <p style="font-size: 12px; color: #666;">Se você não solicitou essa troca, pode ignorar este e-mail com segurança.</p>
        <hr style="border: 0; border-top: 1px solid #eee; margin-top: 30px;">
        <p style="font-size: 10px; color: #999;">Escola Flávio Milhomem</p>
      </div>
    `,
    text: `Olá, ${user.name || "aluno"}. Clique no link para recuperar sua senha: ${resetUrl}`,
  });

  return NextResponse.json({ ok: true });
}
