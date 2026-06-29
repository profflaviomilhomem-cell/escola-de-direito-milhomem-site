import { NextResponse, type NextRequest } from "next/server";

import { DEV_ROLE_COOKIE } from "@/lib/auth/dev-session";

const ALLOWED = new Set(["aluno", "professor"]);

/**
 * GET /dev/sessao?role=aluno|professor&redirect=/aluno/dashboard
 * Define cookie de papel em dev e redireciona (só desenvolvimento).
 */
export async function GET(req: NextRequest) {
  if (process.env.NODE_ENV === "production") {
    return NextResponse.redirect(new URL("/", req.url));
  }

  const role = req.nextUrl.searchParams.get("role")?.trim().toLowerCase();
  const redirectParam = req.nextUrl.searchParams.get("redirect")?.trim();

  if (!role || !ALLOWED.has(role)) {
    return NextResponse.redirect(new URL("/dev", req.url));
  }

  const fallback =
    role === "professor" ? "/professor/dashboard" : "/aluno/dashboard";
  const target = redirectParam?.startsWith("/") ? redirectParam : fallback;

  const res = NextResponse.redirect(new URL(target, req.url));
  res.cookies.set(DEV_ROLE_COOKIE, role, {
    httpOnly: true,
    sameSite: "lax",
    secure: false,
    path: "/",
    maxAge: 60 * 60 * 24,
  });
  return res;
}
