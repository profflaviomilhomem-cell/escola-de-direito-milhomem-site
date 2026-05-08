import type { ReactNode } from "react";
import { redirect } from "next/navigation";

import { ProfessorTopNav } from "@/components/professor/top-nav";
import { BackgroundLayers } from "@/components/marketing/animation/background-layers";
import { mockProfessor } from "@/data/mock-professor";
import { getSessionFromCookies } from "@/lib/auth/session";

/**
 * Layout da área administrativa (route group `professor`).
 *
 * - Defesa em profundidade: o `proxy.ts` já redireciona acessos sem
 *   role admin para /aluno/dashboard, mas reforçamos aqui no SSR.
 * - Em dev, `NEXT_PUBLIC_DEV_FAKE_SESSION=professor` injeta uma sessão
 *   mock como Flávio (role admin) para a UI ser navegável sem DB.
 */
export default async function ProfessorLayout({
  children,
}: Readonly<{ children: ReactNode }>) {
  const session = await getSessionFromCookies();
  if (!session) redirect("/entrar?unauthorized=1&from=/professor/dashboard");
  if (session.role !== "admin") redirect("/aluno/dashboard");

  return (
    <div className="text-paper relative min-h-screen">
      <BackgroundLayers />
      <ProfessorTopNav
        userName={session.name ?? mockProfessor.name}
        userEmail={session.email}
        avatarSrc={mockProfessor.avatarSrc}
      />
      <main className="relative z-10 pt-24">{children}</main>
    </div>
  );
}
