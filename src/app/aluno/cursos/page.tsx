import type { Metadata } from "next";
import Link from "next/link";

import { LabeledProgress } from "@/components/aluno/labeled-progress";
import { formatDuration, mockCourse } from "@/data/mock-aluno";
import { progressPercentFromRatio } from "@/lib/utils";

export const metadata: Metadata = {
  title: "Meus cursos — Escola Flávio Milhomem",
  robots: { index: false, follow: false },
};

/**
 * Listagem dos cursos matriculados pelo aluno.
 * Por enquanto temos só um curso ativo no mock; o layout já segura
 * múltiplos quando o cohort 2 (sem fundador) for liberado.
 */
export default function MeusCursosPage() {
  const totalSec = mockCourse.modules
    .flatMap((m) => m.lessons)
    .reduce((acc, l) => acc + l.durationSec, 0);
  const overall =
    mockCourse.completedLessonCount / mockCourse.lessonCount;

  return (
    <section className="fm-site-page py-20">
      <p className="text-amber fm-mono">Sua biblioteca</p>
      <h1
        className="mt-3 font-serif leading-[1.05]"
        style={{ fontSize: "clamp(2.25rem, 4.5vw, 3.5rem)" }}
      >
        Cursos em andamento.
      </h1>
      <p className="text-paper-700 mt-4 max-w-2xl text-base leading-relaxed md:text-lg">
        Aqui ficam os cohorts e masterclasses que você está cursando ou
        concluiu. Materiais, fórum e certificado seguem disponíveis
        depois do término — o acesso é vitalício.
      </p>

      <div className="mt-12 grid gap-6 md:grid-cols-2">
        <Link
          href={`/aluno/cursos/${mockCourse.slug}`}
          className="group border-paper-100 hover:border-amber relative block overflow-hidden border no-underline transition-colors"
        >
          <div
            className="relative aspect-[16/9]"
            style={{
              backgroundImage: `linear-gradient(${mockCourse.cover.angle ?? 135}deg, ${mockCourse.cover.from}, ${mockCourse.cover.via ?? mockCourse.cover.from}, ${mockCourse.cover.to})`,
            }}
          >
            <div className="absolute inset-0 bg-gradient-to-t from-carbon via-carbon/40 to-transparent" />
            <div
              aria-hidden
              className="absolute -right-12 top-1/3 h-48 w-48 rounded-full opacity-25 blur-3xl"
              style={{ background: "var(--color-amber)" }}
            />
            <div className="absolute inset-x-0 bottom-0 p-5">
              <p className="text-amber fm-mono">Cohort 2026 · Em andamento</p>
              <h2 className="text-paper mt-2 font-serif text-2xl leading-tight">
                {mockCourse.title}
              </h2>
            </div>
          </div>
          <div className="bg-carbon-elevated p-5">
            <LabeledProgress
              label={`${mockCourse.completedLessonCount} de ${mockCourse.lessonCount} aulas`}
              value={progressPercentFromRatio(overall)}
            />
            <p className="text-paper-700 fm-mono mt-3">
              {mockCourse.modules.length} módulos · {formatDuration(totalSec)}
            </p>
          </div>
        </Link>

        {/* Slot vazio reservado para o cohort 2 */}
        <div className="border-paper-100 bg-carbon-elevated/40 flex aspect-auto flex-col items-center justify-center gap-3 border border-dashed p-10 text-center md:aspect-[16/9]">
          <p className="text-amber fm-mono">Em breve</p>
          <p className="text-paper-700 max-w-xs text-sm leading-relaxed">
            Próximo cohort (sem o fundador) abre em janeiro de 2027. Ele
            aparecerá aqui quando você for matriculado.
          </p>
        </div>
      </div>
    </section>
  );
}
