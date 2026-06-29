import { NextResponse } from "next/server";

import { clearSessionCookie } from "@/lib/auth/session";

/**
 * POST /api/auth/logout — encerra a sessão limpando o cookie.
 *
 * Aceita só POST por padrão de segurança: GET seria executável via
 * navegação ou pré-fetch de link, abrindo flanco para CSRF de logout.
 */
export async function POST() {
  await clearSessionCookie();
  return NextResponse.json({ ok: true }, { status: 200 });
}
