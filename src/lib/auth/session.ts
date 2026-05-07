import { cookies } from "next/headers";

import { verifySession, type SessionPayload } from "./jwt";

const SESSION_COOKIE = "escola_session";

export async function getSessionFromCookies(): Promise<SessionPayload | null> {
  const store = await cookies();
  const token = store.get(SESSION_COOKIE)?.value;
  if (!token) return null;
  return verifySession(token);
}

export const sessionCookieName = SESSION_COOKIE;
