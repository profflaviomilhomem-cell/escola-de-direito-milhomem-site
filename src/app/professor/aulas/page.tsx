import type { Metadata } from "next";
import Link from "next/link";

import { activeCourse } from "@/data/mock-professor";
import { formatDuration } from "@/data/mock-aluno";
import { fmTitleClamp } from "@/lib/ui/fm-title-clamp";

export const metadata: Metadata = {
  title: "Aulas — Painel do professor",
  robots: { index: false, follow: false },
};

/**
 * Gerenciamento de aulas — esqueleto navegável.
 * Próxima iteração: editor de transcrição, upload de PDF anexo,
 * publicação programada, troca de cover, métricas por aula
 * (% conclusão, tempo médio, drop-offs).
 */
export default function ProfessorAulasPage() {
  return (
    <section className="fm-site-page py-12">
      <header className="mb-10 flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-amber font-mono text-[10px] uppercase tracking-[0.2em]">
            Estrutura curricular · {activeCourse.shortTitle}
          </p>
          <h1
            className="fm-title-fluid mt-3 font-serif leading-[1.05]"
            style={fmTitleClamp("36px", "4.5vw", "56px")}
          >
            <em className="text-amber italic">Módulos</em> e aulas.
          </h1>
        </div>
        <button
          type="button"
          className="bg-amber text-carbon hover:bg-amber-soft inline-flex items-center gap-2 px-5 py-3 font-mono text-[11px] uppercase tracking-[0.2em] transition-colors"
        >
          + Nova aula
        </button>
      </header>

      <div className="space-y-6">
        {activeCourse.modules.map((mod, i) => (
          <details
            key={mod.slug}
            open={i === 0}
            className="border-paper-100 bg-carbon-elevated group border"
          >
            <summary className="hover:bg-paper-50 flex cursor-pointer items-center justify-between gap-3 p-5">
              <div className="flex items-center gap-4">
                <span className="bg-amber/10 text-amber border-amber/40 grid h-10 w-10 place-items-center rounded-full border-2 font-serif italic">
                  {i + 1}
                </span>
                <div>
                  <p className="text-amber font-mono text-[10px] uppercase tracking-[0.2em]">
                    Módulo {i + 1}
                  </p>
                  <h2 className="text-paper mt-1 font-serif text-xl leading-tight">
                    {mod.title}
                  </h2>
                </div>
              </div>
              <span className="text-paper-700 font-mono text-[10px] uppercase tracking-[0.15em]">
                {mod.lessons.length} aulas
              </span>
            </summary>

            <ul className="border-paper-100 divide-paper-100 divide-y border-t">
              {mod.lessons.map((l) => (
                <li
                  key={l.id}
                  className="flex items-center justify-between gap-4 p-5"
                >
                  <div className="flex min-w-0 flex-1 items-center gap-4">
                    <span className="text-paper-600 font-mono text-[11px] uppercase tracking-[0.15em] shrink-0">
                      Aula {l.position.toString().padStart(2, "0")}
                    </span>
                    <div className="min-w-0 flex-1">
                      <p className="text-paper truncate font-serif text-base leading-tight">
                        {l.title}
                      </p>
                      <p className="text-paper-600 mt-1 font-mono text-[10px] uppercase tracking-[0.15em]">
                        {formatDuration(l.durationSec)} ·{" "}
                        {l.materials.length} PDF
                        {l.materials.length === 1 ? "" : "s"} anexo
                        {l.materials.length === 1 ? "" : "s"}
                      </p>
                    </div>
                  </div>
                  <div className="flex flex-shrink-0 gap-2">
                    <Link
                      href={`/aluno/aulas/${l.slug}`}
                      className="border-paper-200 text-paper-700 hover:border-amber hover:text-amber border px-3 py-1.5 font-mono text-[10px] uppercase tracking-[0.15em] transition-colors"
                    >
                      Pré-visualizar
                    </Link>
                    <button
                      type="button"
                      className="border-paper-200 text-paper-700 hover:border-amber hover:text-amber border px-3 py-1.5 font-mono text-[10px] uppercase tracking-[0.15em] transition-colors"
                    >
                      Editar
                    </button>
                  </div>
                </li>
              ))}
            </ul>
          </details>
        ))}
      </div>
    </section>
  );
}
