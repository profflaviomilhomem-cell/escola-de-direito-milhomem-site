import { cookies } from "next/headers";

import {
  DEV_ROLE_COOKIE,
  isDevFakeSessionEnabled,
  resolveDevFakeSession,
} from "./dev-session";
import { verifySession, type SessionPayload } from "./jwt";

const SESSION_COOKIE = "escola_session";

/**
 * TTL do cookie precisa bater com o TTL do JWT.
 * Mantido aqui (em segundos) para evitar drift entre os dois lados.
 */
const SESSION_TTL_SECONDS = 60 * 60 * 24 * 7; // 7 dias

export { isDevFakeSessionEnabled };

export async function getSessionFromCookies(): Promise<SessionPayload | null> {
  const store = await cookies();
  const devRole = store.get(DEV_ROLE_COOKIE)?.value;
  const dev = resolveDevFakeSession(devRole);
  if (dev) return dev;
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
