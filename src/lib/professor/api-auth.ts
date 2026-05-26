import { NextResponse } from "next/server";

import { getSessionFromCookies } from "@/lib/auth/session";

export async function requireProfessorApi() {
  const session = await getSessionFromCookies();
  if (!session || session.role !== "admin") {
    return {
      session: null,
      error: NextResponse.json({ error: "Não autorizado." }, { status: 401 }),
    };
  }
  return { session, error: null };
}
