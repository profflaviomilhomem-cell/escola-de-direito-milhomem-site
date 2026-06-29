import Link from "next/link";

import { HeroBridgeDrawAnimation } from "@/components/aluno/hero-bridge-draw";
import { LabeledProgress } from "@/components/aluno/labeled-progress";
import type { MockCourse, MockLesson } from "@/data/mock-aluno";
import { formatDuration } from "@/data/mock-aluno";
import { fmTitleClamp } from "@/lib/ui/fm-title-clamp";

type Props = {
  course: MockCourse;
  nextLesson: MockLesson | null;
  studentName: string;
};

/**
 * Billboard hero estilo streaming — banner institucional full-bleed
 * com overlays para legibilidade do texto e CTAs.
 */
export function HeroBillboard({ course, nextLesson, studentName }: Props) {
  const firstName = studentName.split(/\s+/)[0];
  const progress =
    course.completedLessonCount / Math.max(1, course.lessonCount);

  return (
    <section
      aria-label={`Continue assistindo — ${course.title}`}
      className="fm-hero-under-header relative overflow-hidden"
    >
      <div className="bg-carbon relative h-[78vh] min-h-[560px] w-full">
        <HeroBridgeDrawAnimation className="fm-hero-bridge-draw" />
        <div
          aria-hidden
          className="border-amber/40 absolute top-0 right-12 z-[1] hidden h-full border-r lg:block"
        />
        <div className="from-carbon via-carbon/80 to-carbon/25 absolute inset-0 z-[1] bg-gradient-to-t" />
        <div className="from-carbon/95 via-carbon/55 absolute inset-0 z-[1] bg-gradient-to-r to-transparent" />

        <div className="relative z-10 flex h-full items-end pb-20">
          <div className="fm-site-container w-full">
            <p className="text-amber fm-mono mb-3">
              Bem-vindo de volta, {firstName} · Continue assistindo
            </p>
            <h1
              className="fm-title-fluid font-serif leading-[1.02]"
              style={fmTitleClamp("2.5rem", "5vw", "4.25rem")}
            >
              {course.title}
            </h1>
            <p className="text-paper-700 mt-5 max-w-xl text-base leading-relaxed md:text-lg">
              {course.description}
            </p>

            <div className="mt-7 max-w-md">
              <LabeledProgress
                label={`${course.completedLessonCount} de ${course.lessonCount} aulas`}
                labelClassName="text-base tracking-normal normal-case"
                value={Math.round(progress * 100)}
              />
            </div>

            <div className="mt-8 flex flex-wrap items-center gap-3">
              {nextLesson && (
                <Link
                  href={`/aluno/aulas/${nextLesson.slug}`}
                  className="bg-paper text-carbon hover:bg-amber inline-flex items-center gap-3 px-7 py-3 font-mono text-[12px] font-semibold tracking-[0.2em] uppercase no-underline transition-colors"
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
                className="border-paper-400 text-paper hover:border-amber hover:text-amber bg-carbon/40 inline-flex items-center gap-2 border px-7 py-3 font-mono text-[12px] font-semibold tracking-[0.2em] uppercase no-underline backdrop-blur-sm transition-colors"
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
