import { redirect } from "next/navigation";

import { getSessionFromCookies } from "@/lib/auth/session";
import type { SessionPayload } from "@/lib/auth/jwt";

/**
 * Gate de página para área admin. Diferente do gate no layout, este roda
 * dentro do componente de página e impede o streaming do conteúdo quando
 * não há sessão admin (layout + page renderizam em paralelo no App Router,
 * então o redirect do layout sozinho não bloqueia o corpo da página).
 */
export async function requireAdminSession(): Promise<SessionPayload> {
  const session = await getSessionFromCookies();
  if (!session) redirect("/entrar?unauthorized=1");
  if (session.role !== "admin") redirect("/aluno/dashboard");
  return session;
}
