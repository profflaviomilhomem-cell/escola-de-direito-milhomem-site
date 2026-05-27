import type { ReactNode } from "react";
import { redirect } from "next/navigation";

import { AlunoTopNav } from "@/components/aluno/top-nav";
import { BackgroundLayers } from "@/components/marketing/animation/background-layers";
import { initialsFromName } from "@/lib/course/format";
import { getSessionFromCookies } from "@/lib/auth/session";

export const dynamic = "force-dynamic";

export default async function AlunoLayout({
  children,
}: Readonly<{ children: ReactNode }>) {
  const session = await getSessionFromCookies();
  if (!session) redirect("/entrar?unauthorized=1");
  if (session.role === "admin") redirect("/professor/dashboard");

  const displayName = session.name ?? session.email;
  const initials = initialsFromName(displayName);

  return (
    <div className="text-paper relative min-h-screen">
      <BackgroundLayers />
      <AlunoTopNav
        userName={displayName}
        userEmail={session.email}
        initials={initials}
      />
      <main id="conteudo" className="relative z-10">
        {children}
      </main>
    </div>
  );
}
