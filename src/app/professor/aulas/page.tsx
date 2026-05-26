import type { Metadata } from "next";
import Link from "next/link";

import { formatDuration } from "@/lib/course/format";
import { provasDigitaisCourse } from "@/data/provas-digitais-course";
import { fmTitleClamp } from "@/lib/ui/fm-title-clamp";

export const metadata: Metadata = {
  title: "Aulas — Painel do professor",
  robots: { index: false, follow: false },
};

export default function ProfessorAulasPage() {
  const course = provasDigitaisCourse;

  return (
    <section className="fm-site-page py-12">
      <header className="mb-10 flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-amber font-mono text-[10px] uppercase tracking-[0.2em]">
            Conteúdo importado · {course.shortTitle}
          </p>
          <h1
            className="fm-title-fluid mt-3 font-serif leading-[1.05]"
            style={fmTitleClamp("36px", "4.5vw", "56px")}
          >
            <em className="text-amber italic">Módulos</em> e aulas.
          </h1>
          <p className="text-paper-600 mt-3 max-w-xl text-sm">
            Estrutura do acervo em{" "}
            <code className="text-paper">public/curso/provas-digitais</code>.
            Edição no catálogo em{" "}
            <Link href="/professor/cursos" className="text-amber hover:underline">
              Cursos
            </Link>
            .
          </p>
        </div>
      </header>

      <div className="space-y-6">
        {course.modules.map((mod, i) => (
          <details
            key={mod.slug}
            open={i === 0}
            className="border-paper-100 bg-carbon-elevated group border"
          >
            <summary className="hover:bg-paper-50 flex cursor-pointer items-center justify-between gap-3 p-5">
              <div>
                <p className="text-amber font-mono text-[10px] uppercase tracking-[0.2em]">
                  Módulo {i + 1}
                </p>
                <h2 className="text-paper mt-1 font-serif text-xl leading-tight">
                  {mod.title}
                </h2>
              </div>
            </summary>
            <ul className="border-paper-100 divide-paper-100 divide-y border-t">
              {mod.lessons.map((lesson) => (
                <li
                  key={lesson.id}
                  className="flex flex-wrap items-center justify-between gap-3 px-5 py-4"
                >
                  <div>
                    <p className="text-paper font-serif">{lesson.title}</p>
                    <p className="text-paper-600 fm-mono mt-1 text-[11px]">
                      /{lesson.slug} · {formatDuration(lesson.durationSec)}
                      {lesson.videoSrc ? " · vídeo" : ""}
                      {lesson.slidesSrc ? " · slides" : ""}
                    </p>
                  </div>
                  <Link
                    href={`/aluno/aulas/${lesson.slug}`}
                    className="text-amber hover:underline font-mono text-[10px] uppercase tracking-widest"
                  >
                    Ver como aluno
                  </Link>
                </li>
              ))}
            </ul>
          </details>
        ))}
      </div>
    </section>
  );
}
