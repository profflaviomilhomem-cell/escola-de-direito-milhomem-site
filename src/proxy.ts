import { NextResponse, type NextRequest } from "next/server";

import { verifySession } from "@/lib/auth/jwt";
import { DEV_ROLE_COOKIE, resolveDevFakeSession } from "@/lib/auth/dev-session";
import { sessionCookieName } from "@/lib/auth/session";

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

/**
 * `/admin` entrou aqui em 03/08/2026. O matcher já o alcançava, mas o prefixo
 * não constava destas listas: `/admin/dashboard` respondia **200 sem sessão**,
 * enquanto `/aluno` e `/professor` devolviam 307 (verificado em produção).
 *
 * Não havia vazamento — a resposta era o shell da aplicação, sem dado
 * renderizado, e a página tem guarda própria. Mas a defesa em profundidade
 * estava furada justamente na rota de maior privilégio, e a assimetria entre
 * três áreas logadas era convite a erro futuro.
 */
const PROTECTED_PREFIXES = ["/aluno", "/professor", "/admin"];
const ADMIN_PREFIXES = ["/professor", "/admin"];

export const config = {
  matcher: [
    "/((?!api|_next/static|_next/image|favicon.ico|robots.txt|llms.txt|sitemap.xml|manifest.webmanifest|.*\\..*).*)",
  ],
};

export async function proxy(req: NextRequest) {
  const { pathname } = req.nextUrl;

  const isProtected = PROTECTED_PREFIXES.some(
    (prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`),
  );
  const isAdminOnly = ADMIN_PREFIXES.some(
    (prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`),
  );

  if (isProtected) {
    // Em dev, a flag `NEXT_PUBLIC_DEV_FAKE_SESSION` injeta sessão mock —
    // a role da sessão fake decide quem entra em /professor.
    const devRole = req.cookies.get(DEV_ROLE_COOKIE)?.value;
    const fake = resolveDevFakeSession(devRole);
    let session = fake;
    if (!session) {
      const token = req.cookies.get(sessionCookieName)?.value;
      session = token ? await verifySession(token) : null;
    }

    if (!session) {
      const loginUrl = new URL("/entrar", req.url);
      loginUrl.searchParams.set("unauthorized", "1");
      loginUrl.searchParams.set("from", pathname);
      return NextResponse.redirect(loginUrl);
    }

    if (isAdminOnly && session.role !== "admin") {
      // Aluno tentando entrar na área do professor — devolve para o painel
      // do aluno em vez de cair em /entrar (que confundiria UX).
      const fallback = new URL("/aluno/dashboard", req.url);
      return NextResponse.redirect(fallback);
    }
  }

  const res = NextResponse.next();
  res.headers.set("X-Content-Type-Options", "nosniff");
  res.headers.set("Referrer-Policy", "strict-origin-when-cross-origin");
  res.headers.set("X-Frame-Options", "SAMEORIGIN");
  return res;
}
