import { NextResponse, type NextRequest } from "next/server";
import { z } from "zod";

import {
  hashPassword,
  passwordFingerprint,
  PasswordTooLongError,
} from "@/lib/auth/password";
import { verifyResetToken } from "@/lib/auth/reset-token";
import { prisma } from "@/lib/prisma";
import { rateLimit } from "@/lib/upstash/rate-limit";
import { resetPasswordSchema } from "@/schemas/auth";

/**
 * POST /api/auth/reset — redefine a senha usando token.
 *
 * Pipeline:
 *   1. Rate-limit por IP.
 *   2. Validação Zod.
 *   3. Verificação do Token JWT (valida expiração e issuer).
 *   4. bcrypt(12) da nova senha.
 *   5. Update no banco.
 */
export async function POST(req: NextRequest) {
  const ip =
    req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ??
    req.headers.get("x-real-ip") ??
    "unknown";

  const rlIp = await rateLimit({
    prefix: "auth:reset:ip",
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

  const parsed = resetPasswordSchema.safeParse(raw);
  if (!parsed.success) {
    return NextResponse.json(
      { ok: false, errors: z.flattenError(parsed.error) },
      { status: 422 },
    );
  }

  const { token, password } = parsed.data;

  // Verifica validade do token
  const payload = await verifyResetToken(token);
  if (!payload) {
    return NextResponse.json(
      {
        ok: false,
        error: "Link expirado ou inválido. Peça um novo link de recuperação.",
      },
      { status: 401 },
    );
  }

  // Single-use: o token carrega o fingerprint do hash de senha vigente na
  // emissão. Se a senha já foi trocada (o próprio reset, ou outro), o
  // fingerprint atual não bate e o link é recusado — impede replay.
  const user = await prisma.user.findUnique({
    where: { id: payload.sub },
    select: { passwordHash: true },
  });
  if (!user) {
    return NextResponse.json(
      { ok: false, error: "Usuário não encontrado." },
      { status: 404 },
    );
  }
  if (passwordFingerprint(user.passwordHash) !== payload.pv) {
    return NextResponse.json(
      {
        ok: false,
        error: "Link já utilizado ou expirado. Peça um novo link.",
      },
      { status: 401 },
    );
  }

  // Hash da nova senha
  let passwordHash: string;
  try {
    passwordHash = await hashPassword(password);
  } catch (err) {
    if (err instanceof PasswordTooLongError) {
      return NextResponse.json(
        { ok: false, error: err.message },
        { status: 422 },
      );
    }
    throw err;
  }

  // Update no banco
  try {
    await prisma.user.update({
      where: { id: payload.sub },
      data: { passwordHash },
    });
  } catch {
    return NextResponse.json(
      { ok: false, error: "Usuário não encontrado." },
      { status: 404 },
    );
  }

  return NextResponse.json({ ok: true });
}
