import type { ReactNode } from "react";
import { redirect } from "next/navigation";

import { ProfessorTopNav } from "@/components/professor/top-nav";
import { BackgroundLayers } from "@/components/marketing/animation/background-layers";
import { professorUi } from "@/config/professor-ui";
import { getSessionFromCookies } from "@/lib/auth/session";

/** Área autenticada + Prisma — não pré-renderizar no build. */
export const dynamic = "force-dynamic";

export default async function AdminLayout({
  children,
}: Readonly<{ children: ReactNode }>) {
  const session = await getSessionFromCookies();
  if (!session) redirect("/entrar?unauthorized=1");
  if (session.role !== "admin") redirect("/aluno/dashboard");

  const displayName = session.name ?? professorUi.defaultName;

  return (
    <div className="text-paper relative min-h-screen">
      <BackgroundLayers />
      <ProfessorTopNav
        userName={displayName}
        userEmail={session.email}
        avatarSrc={professorUi.avatarSrc}
      />
      <main id="conteudo" className="relative z-10">
        {children}
      </main>
    </div>
  );
}
