import type { Metadata } from "next";
import Link from "next/link";

import { AreaEmptyState } from "@/components/shared/area-empty-state";
import { professorUi } from "@/config/professor-ui";
import { getProfessorCourses } from "@/lib/professor/products";
import { fmTitleClamp } from "@/lib/ui/fm-title-clamp";

export const metadata: Metadata = {
  title: "Painel do professor",
  robots: { index: false, follow: false },
};

export default async function ProfessorDashboardPage() {
  const courses = await getProfessorCourses();
  const firstName = professorUi.defaultName.split(/\s+/)[0];

  return (
    <section className="fm-site-page py-12">
      <p className="text-amber font-mono text-[10px] uppercase tracking-[0.2em]">
        {professorUi.title}
      </p>
      <h1
        className="fm-title-fluid mt-3 font-serif leading-[1.05]"
        style={fmTitleClamp("36px", "4.5vw", "56px")}
      >
        Bom dia, <em className="text-amber italic">{firstName}</em>.
      </h1>
      <p className="text-paper-700 mt-4 max-w-2xl text-base leading-relaxed md:text-lg">
        Painel administrativo da Escola. Métricas, fórum e atividade recente
        serão exibidos quando conectados ao banco de dados.
      </p>

      <div className="mt-8 flex flex-wrap gap-3">
        <Link
          href="/professor/cursos"
          className="bg-amber text-carbon hover:bg-amber-soft inline-flex px-5 py-3 font-mono text-[11px] uppercase tracking-[0.2em] transition-colors"
        >
          Gerenciar cursos
        </Link>
        <Link
          href="/professor/aulas"
          className="border-paper-200 text-paper hover:border-amber inline-flex border px-5 py-3 font-mono text-[11px] uppercase tracking-[0.2em] transition-colors"
        >
          Ver aulas importadas
        </Link>
      </div>

      <div className="mt-12 grid gap-6 md:grid-cols-2">
        <AreaEmptyState
          title="Métricas em breve"
          description="Alunos ativos, conclusão e NPS aparecerão aqui com dados reais da plataforma."
        />
        <AreaEmptyState
          title="Fórum em breve"
          description="Perguntas aguardando sua resposta serão listadas quando o fórum estiver ativo."
        />
      </div>

      {courses.length > 0 ? (
        <div className="mt-12">
          <h2 className="text-paper fm-mono text-[11px] uppercase tracking-[0.2em]">
            Cursos no catálogo
          </h2>
          <ul className="border-paper-100 mt-4 divide-y border">
            {courses.map((c) => (
              <li key={c.id} className="flex items-center justify-between py-4">
                <div>
                  <p className="text-paper font-serif">{c.name}</p>
                  <p className="text-paper-600 fm-mono text-[11px]">/{c.slug}</p>
                </div>
                <Link
                  href={`/professor/cursos/${c.slug}/editar`}
                  className="text-amber hover:underline font-mono text-[10px] uppercase tracking-widest"
                >
                  Editar
                </Link>
              </li>
            ))}
          </ul>
        </div>
      ) : null}
    </section>
  );
}
