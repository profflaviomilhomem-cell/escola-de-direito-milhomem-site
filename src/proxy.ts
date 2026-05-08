import { NextResponse, type NextRequest } from "next/server";

import { verifySession } from "@/lib/auth/jwt";
import { isDevFakeSessionEnabled, sessionCookieName } from "@/lib/auth/session";

/**
 * Proxy Next.js — defesa em profundidade.
 *
 * No Next.js 16, `middleware.ts` virou `proxy.ts` e a função exportada
 * passou a se chamar `proxy`. Funcionalidade idêntica.
 *
 * - Bloqueia acesso à área do aluno sem sessão válida.
 * - Aplica security headers básicos.
 *
 * NOTA: Next.js 16.0.7+ corrige o CVE-2025-29927 (bypass de
 * autenticação via header). Mantenha 16.2.x mínimo.
 */

const PROTECTED_PREFIXES = ["/aluno"];

export const config = {
  matcher: [
    "/((?!api|_next/static|_next/image|favicon.ico|robots.txt|llms.txt|sitemap.xml|manifest.webmanifest|.*\\..*).*)",
  ],
};

export async function proxy(req: NextRequest) {
  const { pathname } = req.nextUrl;

  const isProtected = PROTECTED_PREFIXES.some((prefix) =>
    pathname === prefix || pathname.startsWith(`${prefix}/`),
  );

  if (isProtected && !isDevFakeSessionEnabled()) {
    const token = req.cookies.get(sessionCookieName)?.value;
    const session = token ? await verifySession(token) : null;
    if (!session) {
      const loginUrl = new URL("/entrar", req.url);
      loginUrl.searchParams.set("unauthorized", "1");
      loginUrl.searchParams.set("from", pathname);
      return NextResponse.redirect(loginUrl);
    }
  }

  const res = NextResponse.next();
  res.headers.set("X-Content-Type-Options", "nosniff");
  res.headers.set("Referrer-Policy", "strict-origin-when-cross-origin");
  res.headers.set("X-Frame-Options", "SAMEORIGIN");
  return res;
}
