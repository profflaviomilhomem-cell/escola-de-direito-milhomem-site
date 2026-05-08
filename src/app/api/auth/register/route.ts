import { NextResponse, type NextRequest } from "next/server";
import { z } from "zod";

import { signSession } from "@/lib/auth/jwt";
import { hashPassword, PasswordTooLongError } from "@/lib/auth/password";
import { setSessionCookie, sessionTtlSeconds } from "@/lib/auth/session";
import { prisma } from "@/lib/prisma";
import { rateLimit } from "@/lib/upstash/rate-limit";
import { registerSchema } from "@/schemas/auth";

/**
 * POST /api/auth/register — cria conta e abre sessão.
 *
 * Pipeline:
 *   1. Rate-limit por IP (defesa contra enumeração / scraping).
 *   2. Zod no servidor (cinto + suspensório do form).
 *   3. Verifica e-mail único; 409 se já existir.
 *   4. bcrypt(12) — `hashPassword` reforça o teto de 72 bytes.
 *   5. Cria User com role ALUNO.
 *   6. Assina JWT (TTL 7d) e seta cookie HttpOnly+SameSite=Lax+Secure.
 */
export async function POST(req: NextRequest) {
  const ip =
    req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ??
    req.headers.get("x-real-ip") ??
    "unknown";

  const rl = await rateLimit({
    prefix: "auth:register",
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
      { ok: false, error: "Payload inválido." },
      { status: 400 },
    );
  }

  const parsed = registerSchema.safeParse(raw);
  if (!parsed.success) {
    return NextResponse.json(
      { ok: false, errors: z.flattenError(parsed.error) },
      { status: 422 },
    );
  }

  const { email, name, password } = parsed.data;

  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) {
    return NextResponse.json(
      {
        ok: false,
        error:
          "Este e-mail já está cadastrado. Faça login ou recupere a senha.",
      },
      { status: 409 },
    );
  }

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

  const user = await prisma.user.create({
    data: { email, name, passwordHash },
    select: { id: true, email: true, name: true, role: true },
  });

  const token = await signSession(
    {
      sub: user.id,
      email: user.email,
      name: user.name ?? undefined,
      role: user.role === "ADMIN" ? "admin" : "aluno",
    },
    sessionTtlSeconds,
  );
  await setSessionCookie(token);

  return NextResponse.json(
    {
      ok: true,
      user: { id: user.id, email: user.email, name: user.name },
    },
    { status: 201 },
  );
}
