import Link from "next/link";

import { ProgressBar } from "@/components/aluno/progress-bar";
import type { MockLesson } from "@/data/mock-aluno";
import { formatDuration } from "@/data/mock-aluno";

type Props = {
  lesson: MockLesson;
  /** Eyebrow contextual (ex.: "Aula vinculada à discussão"). Default: módulo. */
  eyebrow?: string;
};

/**
 * Variante horizontal do `LessonCard` — usada em contextos onde o card
 * 16:9 padrão seria volumoso demais (linha de fórum expandida, listas
 * laterais). Thumbnail mini à esquerda + meta editorial à direita.
 */
export function LessonCardCompact({ lesson, eyebrow }: Props) {
  const progress =
    lesson.durationSec > 0 ? lesson.watchedSec / lesson.durationSec : 0;
  const isDone = lesson.status === "concluida";
  const inProgress = lesson.status === "em-andamento";

  return (
    <Link
      href={`/aluno/aulas/${lesson.slug}`}
      className="group border-paper-100 hover:border-amber bg-carbon-elevated relative grid grid-cols-[120px_1fr] gap-4 overflow-hidden border no-underline transition-colors md:grid-cols-[180px_1fr] md:gap-5"
    >
      {/* Thumbnail */}
      <div
        className="relative aspect-video"
        style={{
          backgroundImage: `linear-gradient(${lesson.cover.angle ?? 135}deg, ${lesson.cover.from}, ${lesson.cover.to})`,
        }}
      >
        {/* Vinheta para profundidade */}
        <div className="absolute inset-0 bg-gradient-to-tr from-carbon/60 via-transparent to-transparent" />

        {/* Status badge */}
        {isDone && (
          <span
            className="bg-amber text-carbon absolute right-1.5 top-1.5 grid h-6 w-6 place-items-center rounded-full"
            aria-label="Aula concluída"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="12"
              height="12"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="3"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M20 6 9 17l-5-5" />
            </svg>
          </span>
        )}

        {/* Play overlay no hover */}
        <span className="absolute inset-0 flex items-center justify-center opacity-0 transition-opacity duration-300 group-hover:opacity-100">
          <span className="bg-amber text-carbon grid h-9 w-9 place-items-center rounded-full shadow-lg">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="14"
              height="14"
              viewBox="0 0 24 24"
              fill="currentColor"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <polygon points="6 3 20 12 6 21 6 3" />
            </svg>
          </span>
        </span>
      </div>

      {/* Conteúdo textual */}
      <div className="flex min-w-0 flex-col justify-center gap-1.5 py-3 pr-4">
        <p className="text-amber fm-mono line-clamp-1">
          {eyebrow ?? lesson.moduleTitle}
        </p>
        <h3 className="text-paper group-hover:text-amber line-clamp-2 font-serif text-base leading-tight transition-colors md:text-lg">
          {lesson.title}
        </h3>
        <p className="text-paper-700 fm-mono mt-1 line-clamp-1">
          Aula {lesson.position.toString().padStart(2, "0")} ·{" "}
          {formatDuration(lesson.durationSec)}
          {isDone && " · concluída"}
          {inProgress && " · em andamento"}
        </p>
        {inProgress && (
          <div className="mt-2 max-w-[200px]">
            <ProgressBar value={progress} size="sm" />
          </div>
        )}
      </div>

      {/* Seta indicativa */}
      <span
        aria-hidden
        className="text-paper-600 group-hover:text-amber pointer-events-none absolute right-3 top-1/2 hidden -translate-y-1/2 transition-colors md:block"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="16"
          height="16"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.6"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M5 12h14" />
          <path d="m12 5 7 7-7 7" />
        </svg>
      </span>
    </Link>
  );
}
