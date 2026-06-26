import type { Metadata } from "next";
import Link from "next/link";

import { professorUi } from "@/config/professor-ui";
import { getModerationQueue } from "@/lib/forum/comments";
import { getProfessorMetrics, formatBRL } from "@/lib/professor/metrics";
import { getProfessorCourses } from "@/lib/professor/products";
import { fmTitleClamp } from "@/lib/ui/fm-title-clamp";

export const metadata: Metadata = {
  title: "Painel do professor",
  robots: { index: false, follow: false },
};

export default async function ProfessorDashboardPage() {
  const [courses, metrics, moderation] = await Promise.all([
    getProfessorCourses(),
    getProfessorMetrics(),
    getModerationQueue(5),
  ]);
  const pendentes = moderation.filter((c) => c.status === "PENDING");
  const firstName = professorUi.defaultName.split(/\s+/)[0];

  return (
    <section className="fm-site-page py-12">
      <p className="text-amber font-mono text-[10px] tracking-[0.2em] uppercase">
        {professorUi.title}
      </p>
      <h1
        className="fm-title-fluid mt-3 font-serif leading-[1.05]"
        style={fmTitleClamp("36px", "4.5vw", "56px")}
      >
        Bom dia, <em className="text-amber italic">{firstName}</em>.
      </h1>
      <p className="text-paper-700 mt-4 max-w-2xl text-base leading-relaxed md:text-lg">
        Painel administrativo da Escola, com números reais da plataforma.
      </p>

      <div className="mt-8 flex flex-wrap gap-3">
        <Link
          href="/professor/cursos"
          className="bg-amber text-carbon hover:bg-amber-soft inline-flex px-5 py-3 font-mono text-[11px] tracking-[0.2em] uppercase transition-colors"
        >
          Gerenciar cursos
        </Link>
        <Link
          href="/professor/aulas"
          className="border-paper-200 text-paper hover:border-amber inline-flex border px-5 py-3 font-mono text-[11px] tracking-[0.2em] uppercase transition-colors"
        >
          Ver aulas importadas
        </Link>
      </div>

      <div className="mt-12 grid gap-6 md:grid-cols-2">
        <div className="border-paper-100 border p-6">
          <div className="flex items-baseline justify-between">
            <h2 className="text-paper font-mono text-[11px] tracking-[0.2em] uppercase">
              Métricas
            </h2>
            <Link
              href="/professor/metricas"
              className="text-amber font-mono text-[10px] tracking-widest uppercase hover:underline"
            >
              Ver tudo
            </Link>
          </div>
          <dl className="mt-5 grid grid-cols-2 gap-5">
            <div>
              <dt className="text-paper-600 font-mono text-[10px] tracking-[0.16em] uppercase">
                Alunos
              </dt>
              <dd className="text-paper mt-1 font-serif text-3xl leading-none">
                {metrics.alunos}
              </dd>
            </div>
            <div>
              <dt className="text-paper-600 font-mono text-[10px] tracking-[0.16em] uppercase">
                Conclusão
              </dt>
              <dd className="text-paper mt-1 font-serif text-3xl leading-none">
                {metrics.conclusaoMediaPct}%
              </dd>
            </div>
            <div>
              <dt className="text-paper-600 font-mono text-[10px] tracking-[0.16em] uppercase">
                Receita
              </dt>
              <dd className="text-paper mt-1 font-serif text-2xl leading-none">
                {formatBRL(metrics.receitaCents)}
              </dd>
            </div>
            <div>
              <dt className="text-paper-600 font-mono text-[10px] tracking-[0.16em] uppercase">
                Certificados
              </dt>
              <dd className="text-paper mt-1 font-serif text-3xl leading-none">
                {metrics.certificados}
              </dd>
            </div>
          </dl>
        </div>

        <div className="border-paper-100 border p-6">
          <div className="flex items-baseline justify-between">
            <h2 className="text-paper font-mono text-[11px] tracking-[0.2em] uppercase">
              Fórum
            </h2>
            <Link
              href="/professor/forum"
              className="text-amber font-mono text-[10px] tracking-widest uppercase hover:underline"
            >
              Moderar
            </Link>
          </div>
          <p className="text-paper mt-5 font-serif text-3xl leading-none">
            {pendentes.length}{" "}
            <span className="text-paper-600 font-sans text-base">
              {pendentes.length === 1
                ? "comentário aguardando"
                : "comentários aguardando"}
            </span>
          </p>
          {pendentes.length > 0 ? (
            <ul className="mt-5 space-y-3">
              {pendentes.map((c) => (
                <li key={c.id} className="border-paper-100 border-l-2 pl-3">
                  <p className="text-paper-800 line-clamp-2 text-[13px] leading-relaxed">
                    {c.content}
                  </p>
                  <p className="text-paper-600 fm-mono mt-1 text-[10px]">
                    {c.author.name} · {c.lesson.title}
                  </p>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-paper-600 mt-3 text-[13px]">
              Nada na fila de moderação.
            </p>
          )}
        </div>
      </div>

      {courses.length > 0 ? (
        <div className="mt-12">
          <h2 className="text-paper fm-mono text-[11px] tracking-[0.2em] uppercase">
            Cursos no catálogo
          </h2>
          <ul className="border-paper-100 mt-4 divide-y border">
            {courses.map((c) => (
              <li key={c.id} className="flex items-center justify-between py-4">
                <div>
                  <p className="text-paper font-serif">{c.name}</p>
                  <p className="text-paper-600 fm-mono text-[11px]">
                    /{c.slug}
                  </p>
                </div>
                <Link
                  href={`/professor/cursos/${c.slug}/editar`}
                  className="text-amber font-mono text-[10px] tracking-widest uppercase hover:underline"
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
