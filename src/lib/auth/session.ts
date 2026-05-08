import { cookies } from "next/headers";

import { verifySession, type SessionPayload } from "./jwt";

const SESSION_COOKIE = "escola_session";

/**
 * TTL do cookie precisa bater com o TTL do JWT.
 * Mantido aqui (em segundos) para evitar drift entre os dois lados.
 */
const SESSION_TTL_SECONDS = 60 * 60 * 24 * 7; // 7 dias

/**
 * Sessão fake usada APENAS quando `NEXT_PUBLIC_DEV_FAKE_SESSION=1` em
 * desenvolvimento. Permite navegar `/aluno/*` sem DB / login real
 * enquanto a UI está sendo construída. Triplo guard:
 *   1. `NODE_ENV !== "production"` (fail-safe)
 *   2. flag explícita
 *   3. nome do cookie inalterado para não vazar token real
 */
const DEV_FAKE_SESSION: SessionPayload = {
  sub: "user_rafael_mock",
  email: "rafael@advogados-rj.com",
  name: "Rafael Andrade",
  role: "aluno",
};

export function isDevFakeSessionEnabled(): boolean {
  return (
    process.env.NODE_ENV !== "production" &&
    process.env.NEXT_PUBLIC_DEV_FAKE_SESSION === "1"
  );
}

export function getDevFakeSession(): SessionPayload {
  return DEV_FAKE_SESSION;
}

export async function getSessionFromCookies(): Promise<SessionPayload | null> {
  if (isDevFakeSessionEnabled()) return DEV_FAKE_SESSION;
  const store = await cookies();
  const token = store.get(SESSION_COOKIE)?.value;
  if (!token) return null;
  return verifySession(token);
}

/**
 * Seta o cookie de sessão com flags defensivas.
 * - HttpOnly: bloqueia leitura via JS (XSS).
 * - SameSite=Lax: bloqueia o grosso de CSRF mas mantém UX de links externos.
 * - Secure em produção: exige HTTPS.
 * - Path=/: vale para todo o app (proxy + SSR + APIs).
 */
export async function setSessionCookie(token: string): Promise<void> {
  const store = await cookies();
  store.set(SESSION_COOKIE, token, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: SESSION_TTL_SECONDS,
  });
}

export async function clearSessionCookie(): Promise<void> {
  const store = await cookies();
  store.set(SESSION_COOKIE, "", {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 0,
  });
}

export const sessionCookieName = SESSION_COOKIE;
export const sessionTtlSeconds = SESSION_TTL_SECONDS;
