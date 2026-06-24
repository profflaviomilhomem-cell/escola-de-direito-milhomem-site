import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";

import { AreaEmptyState } from "@/components/shared/area-empty-state";
import { getSessionFromCookies } from "@/lib/auth/session";
import { getEnrolledCourseSlugs } from "@/lib/enrollment";
import { listRecentCommentsForProducts } from "@/lib/forum/comments";

export const metadata: Metadata = {
  title: "Fórum",
  robots: { index: false, follow: false },
};

function ago(iso: string) {
  return new Date(iso).toLocaleString("pt-BR", {
    day: "2-digit",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export default async function AlunoForumPage() {
  const session = await getSessionFromCookies();
  if (!session) redirect("/entrar");

  const slugs = await getEnrolledCourseSlugs(session.sub);
  const recent = await listRecentCommentsForProducts(slugs);

  return (
    <section className="fm-site-page py-20">
      <p className="text-amber fm-mono">Comunidade</p>
      <h1 className="text-paper mt-3 font-serif text-3xl md:text-4xl">
        Fórum do curso
      </h1>
      <p className="text-paper-700 mt-4 max-w-2xl text-base leading-relaxed">
        Discussões recentes nas aulas dos seus cursos. Abra uma aula para
        comentar e responder na própria página.
      </p>

      <div className="mt-12">
        {recent.length === 0 ? (
          <AreaEmptyState
            title="Nenhuma discussão ainda"
            description="Seja o primeiro a comentar: abra uma aula e use a aba “Fórum desta aula”. O professor responde em até 72 horas úteis."
          />
        ) : (
          <ul className="border-paper-100 bg-carbon-elevated divide-paper-100 divide-y border">
            {recent.map((c) => (
              <li key={c.id}>
                <Link
                  href={`/aluno/aulas/${c.lesson.slug}`}
                  className="hover:bg-paper-100 block px-5 py-5 transition-colors"
                >
                  <div className="text-paper-600 fm-mono mb-2 flex flex-wrap items-center gap-2">
                    <span className="text-paper">{c.author.name}</span>
                    {c.author.role === "professor" && (
                      <span className="border-amber/40 text-amber border px-1.5 py-[1px]">
                        professor
                      </span>
                    )}
                    <span aria-hidden>·</span>
                    <span>{ago(c.createdAt)}</span>
                    <span aria-hidden>·</span>
                    <span className="text-amber">{c.lesson.title}</span>
                  </div>
                  <p className="text-paper-800 line-clamp-2 text-sm leading-relaxed">
                    {c.content}
                  </p>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </div>
    </section>
  );
}
