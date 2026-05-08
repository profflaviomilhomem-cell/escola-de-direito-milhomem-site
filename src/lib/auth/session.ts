import { cookies } from "next/headers";

import { verifySession, type SessionPayload } from "./jwt";

const SESSION_COOKIE = "escola_session";

/**
 * TTL do cookie precisa bater com o TTL do JWT.
 * Mantido aqui (em segundos) para evitar drift entre os dois lados.
 */
const SESSION_TTL_SECONDS = 60 * 60 * 24 * 7; // 7 dias

/**
 * Sessões fake usadas APENAS em desenvolvimento, controladas pela env
 * `NEXT_PUBLIC_DEV_FAKE_SESSION`:
 *   - "aluno" ou "1" → mock do Rafael (role: aluno)
 *   - "professor" ou "admin" → mock do Flávio (role: admin)
 *   - qualquer outro valor / vazio → desabilitado, fluxo real
 *
 * Triplo guard:
 *   1. `NODE_ENV !== "production"` (fail-safe)
 *   2. flag explícita com valor reconhecido
 *   3. nome do cookie inalterado para não vazar token real
 */
const ALUNO_FAKE_SESSION: SessionPayload = {
  sub: "user_rafael_mock",
  email: "rafael@advogados-rj.com",
  name: "Rafael Andrade",
  role: "aluno",
};

const PROFESSOR_FAKE_SESSION: SessionPayload = {
  sub: "user_flavio_mock",
  email: "flavio@escolaflaviomilhomem.com.br",
  name: "Flávio Milhomem",
  role: "admin",
};

export function getDevFakeSession(): SessionPayload | null {
  if (process.env.NODE_ENV === "production") return null;
  const flag = process.env.NEXT_PUBLIC_DEV_FAKE_SESSION;
  if (flag === "professor" || flag === "admin") return PROFESSOR_FAKE_SESSION;
  if (flag === "aluno" || flag === "1") return ALUNO_FAKE_SESSION;
  return null;
}

export function isDevFakeSessionEnabled(): boolean {
  return getDevFakeSession() !== null;
}

export async function getSessionFromCookies(): Promise<SessionPayload | null> {
  const dev = getDevFakeSession();
  if (dev) return dev;
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
