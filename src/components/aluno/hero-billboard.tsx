import Link from "next/link";

import { ProgressBar } from "@/components/aluno/progress-bar";
import type { MockCourse, MockLesson } from "@/data/mock-aluno";
import { formatDuration } from "@/data/mock-aluno";

type Props = {
  course: MockCourse;
  nextLesson: MockLesson | null;
  studentName: string;
};

/**
 * Billboard hero estilo streaming — full-bleed, gradient layers para
 * garantir contraste do texto sobre o cover. Mostra "Bom dia, X" em
 * eyebrow, título do curso, descrição truncada, CTAs primário (Play
 * próxima aula) + secundário (ver curso) + barra de progresso geral.
 */
export function HeroBillboard({ course, nextLesson, studentName }: Props) {
  const firstName = studentName.split(/\s+/)[0];
  const progress = course.completedLessonCount / Math.max(1, course.lessonCount);

  return (
    <section
      aria-label={`Continue assistindo — ${course.title}`}
      className="relative -mt-24 overflow-hidden"
    >
      {/* Cover full-bleed */}
      <div
        className="relative h-[78vh] min-h-[560px] w-full"
        style={{
          backgroundImage: `linear-gradient(${course.cover.angle ?? 135}deg, ${course.cover.from}, ${course.cover.via ?? course.cover.from}, ${course.cover.to})`,
        }}
      >
        {/* Detalhe dourado ornamental — círculo desfocado */}
        <div
          aria-hidden
          className="absolute -right-24 top-1/4 h-[420px] w-[420px] rounded-full opacity-20 blur-3xl"
          style={{ background: "var(--color-amber)" }}
        />
        {/* Linha vertical institucional à direita (eco do site) */}
        <div
          aria-hidden
          className="border-amber/40 absolute right-12 top-0 hidden h-full border-r lg:block"
        />

        {/* Gradient legibilidade — debaixo + esquerda */}
        <div className="absolute inset-0 bg-gradient-to-t from-carbon via-carbon/70 to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-r from-carbon/85 via-carbon/40 to-transparent" />

        {/* Conteúdo */}
        <div className="relative z-10 flex h-full items-end pb-20">
          <div className="px-gutter mx-auto w-full max-w-(--container-narrow) lg:px-12">
            <p className="text-amber fm-mono mb-3">
              Bem-vindo de volta, {firstName} · Continue assistindo
            </p>
            <h1
              className="font-serif leading-[1.02]"
              style={{ fontSize: "clamp(2.5rem, 5vw, 4.25rem)" }}
            >
              {course.title}
            </h1>
            <p className="text-paper-700 mt-5 max-w-xl text-base leading-relaxed md:text-lg">
              {course.description}
            </p>

            {/* Progresso geral */}
            <div className="mt-7 max-w-md">
              <ProgressBar
                value={progress}
                label={`${course.completedLessonCount} de ${course.lessonCount} aulas`}
              />
            </div>

            {/* CTAs */}
            <div className="mt-8 flex flex-wrap items-center gap-3">
              {nextLesson && (
                <Link
                  href={`/aluno/aulas/${nextLesson.slug}`}
                  className="bg-paper text-carbon hover:bg-amber inline-flex items-center gap-3 px-7 py-3 font-mono text-[12px] font-semibold uppercase tracking-[0.2em] no-underline transition-colors"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="18"
                    height="18"
                    viewBox="0 0 24 24"
                    fill="currentColor"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <polygon points="6 3 20 12 6 21 6 3" />
                  </svg>
                  {nextLesson.status === "em-andamento"
                    ? "Continuar aula"
                    : "Próxima aula"}
                </Link>
              )}
              <Link
                href={`/aluno/cursos/${course.slug}`}
                className="border-paper-400 text-paper hover:border-amber hover:text-amber inline-flex items-center gap-2 border bg-carbon/40 px-7 py-3 font-mono text-[12px] font-semibold uppercase tracking-[0.2em] no-underline backdrop-blur-sm transition-colors"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="18"
                  height="18"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.6"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <circle cx="12" cy="12" r="10" />
                  <path d="M12 16v-4" />
                  <path d="M12 8h.01" />
                </svg>
                Sobre o curso
              </Link>
            </div>

            {nextLesson && (
              <p className="text-paper-600 fm-mono mt-5">
                Próxima · {nextLesson.moduleTitle} ·{" "}
                {formatDuration(nextLesson.durationSec)} · Aula{" "}
                {nextLesson.position.toString().padStart(2, "0")}
              </p>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
