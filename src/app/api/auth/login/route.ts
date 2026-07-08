import { NextResponse, type NextRequest } from "next/server";
import { z } from "zod";

import { signSession } from "@/lib/auth/jwt";
import { TIMING_DUMMY_HASH, verifyPassword } from "@/lib/auth/password";
import { setSessionCookie, sessionTtlSeconds } from "@/lib/auth/session";
import { prisma } from "@/lib/prisma";
import { rateLimit } from "@/lib/upstash/rate-limit";
import { loginSchema } from "@/schemas/auth";

/**
 * POST /api/auth/login — autentica e abre sessão.
 *
 * Pipeline:
 *   1. Rate-limit por IP (defesa volumétrica) + por e-mail
 *      (limita brute force focado num alvo).
 *   2. Zod no servidor.
 *   3. Busca usuário; se não existir OU se bcrypt verify falhar,
 *      devolve 401 genérico — não vaza existência de e-mail.
 *   4. Sucesso: assina JWT e seta cookie de sessão.
 */
export async function POST(req: NextRequest) {
  const ip =
    req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ??
    req.headers.get("x-real-ip") ??
    "unknown";

  const rlIp = await rateLimit({
    prefix: "auth:login:ip",
    max: 20,
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

  const parsed = loginSchema.safeParse(raw);
  if (!parsed.success) {
    return NextResponse.json(
      { ok: false, errors: z.flattenError(parsed.error) },
      { status: 422 },
    );
  }

  const { email, password } = parsed.data;

  const rlEmail = await rateLimit({
    prefix: "auth:login:email",
    max: 8,
    window: "15 m",
    key: email,
  });
  if (!rlEmail.success) {
    return NextResponse.json(
      {
        ok: false,
        error: "Muitas tentativas para este e-mail. Aguarde alguns minutos.",
      },
      { status: 429 },
    );
  }

  const user = await prisma.user.findUnique({
    where: { email },
    select: {
      id: true,
      email: true,
      name: true,
      role: true,
      passwordHash: true,
    },
  });

  // 401 idêntico para "usuário não existe" e "senha errada". Para não vazar
  // enumeração por TIMING, sempre pagamos o custo do bcrypt: quando não há
  // hash real (usuário inexistente), comparamos contra um hash descartável —
  // o ~250ms é o mesmo do caso real. O resultado desse caso nunca é aceito.
  const valid = await verifyPassword(
    password,
    user?.passwordHash ?? TIMING_DUMMY_HASH,
  );

  if (!user || !user.passwordHash || !valid) {
    return NextResponse.json(
      { ok: false, error: "E-mail ou senha incorretos." },
      { status: 401 },
    );
  }

  const role = user.role === "ADMIN" ? "admin" : "aluno";

  const token = await signSession(
    {
      sub: user.id,
      email: user.email,
      name: user.name ?? undefined,
      role,
    },
    sessionTtlSeconds,
  );
  await setSessionCookie(token);

  return NextResponse.json(
    {
      ok: true,
      user: { id: user.id, email: user.email, name: user.name, role },
      redirectTo:
        role === "admin" ? "/professor/dashboard" : "/aluno/dashboard",
    },
    { status: 200 },
  );
}
