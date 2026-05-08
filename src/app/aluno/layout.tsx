import type { ReactNode } from "react";
import { redirect } from "next/navigation";

import { AlunoTopNav } from "@/components/aluno/top-nav";
import { getSessionFromCookies } from "@/lib/auth/session";
import { mockUser } from "@/data/mock-aluno";

/**
 * Layout da área logada (route group `aluno`).
 *
 * - SSR exige sessão válida (defesa em profundidade — o proxy já bloqueia).
 * - Em dev, `NEXT_PUBLIC_DEV_FAKE_SESSION=1` injeta uma sessão mock
 *   (Rafael) para a UI ser navegável sem DB.
 * - Top nav fixa, fundo carbon. As páginas controlam seu próprio
 *   container (algumas full-bleed pro billboard, outras com max-width).
 */
export default async function AlunoLayout({
  children,
}: Readonly<{ children: ReactNode }>) {
  const session = await getSessionFromCookies();
  if (!session) redirect("/entrar?unauthorized=1");

  const initials =
    session.name === mockUser.name
      ? mockUser.initials
      : (session.name ?? session.email)
          .split(/\s+/)
          .map((p) => p[0])
          .filter(Boolean)
          .slice(0, 2)
          .join("")
          .toUpperCase();

  return (
    <div className="bg-carbon text-paper min-h-screen">
      <AlunoTopNav
        userName={session.name ?? session.email}
        userEmail={session.email}
        initials={initials}
      />
      <main className="pt-16">{children}</main>
    </div>
  );
}
