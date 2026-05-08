import type { ReactNode } from "react";
import { redirect } from "next/navigation";

import { getSessionFromCookies } from "@/lib/auth/session";

/**
 * Layout da área logada do aluno (route group `(aluno)`).
 *
 * Toda página deste grupo exige sessão válida. O middleware Next.js
 * já bloqueia acesso a `/dashboard`, `/aulas/*`, `/forum`, etc.,
 * mas reforçamos aqui no SSR como defesa em profundidade.
 */
export default async function AlunoLayout({
  children,
}: Readonly<{ children: ReactNode }>) {
  const session = await getSessionFromCookies();
  if (!session) {
    redirect("/entrar?unauthorized=1");
  }

  return (
    <div className="bg-slate-50 flex min-h-full flex-col">
      <header className="border-border bg-tinta-800 text-slate-50 border-b">
        <div className="mx-auto flex max-w-(--container-narrow) items-center justify-between px-gutter py-3">
          <span className="font-serif text-lg font-bold">Área do aluno</span>
          <span className="text-slate-300 text-sm">
            Olá, {session.name ?? "aluno(a)"}
          </span>
        </div>
      </header>
      <main className="flex-1">{children}</main>
    </div>
  );
}
