import Link from "next/link";

import { ProgressBar } from "@/components/aluno/progress-bar";
import type { MockLesson } from "@/data/mock-aluno";
import { formatDuration } from "@/data/mock-aluno";

type Props = {
  lesson: MockLesson;
  /** Largura do card em pixels (controlado pelo container) */
  width?: "sm" | "md" | "lg";
  /** Se true, exibe o título do módulo como eyebrow no topo */
  showModule?: boolean;
};

const widthClass: Record<NonNullable<Props["width"]>, string> = {
  sm: "w-[220px]",
  md: "w-[280px]",
  lg: "w-[340px]",
};

/**
 * Card de aula no padrão streaming — thumbnail 16:9 com gradient,
 * overlays de status, hover de elevação + brilho amber, barra de
 * progresso quando há watchedSec.
 */
export function LessonCard({ lesson, width = "md", showModule }: Props) {
  const progress = lesson.durationSec > 0 ? lesson.watchedSec / lesson.durationSec : 0;
  const isDone = lesson.status === "concluida";
  const inProgress = lesson.status === "em-andamento";

  return (
    <Link
      href={`/aluno/aulas/${lesson.slug}`}
      className={`group relative block flex-shrink-0 ${widthClass[width]} no-underline`}
    >
      {/* Thumbnail */}
      <div
        className="border-paper-100 relative aspect-video overflow-hidden border transition-all duration-300 group-hover:border-amber group-hover:shadow-[0_8px_30px_rgba(221,173,12,0.15)]"
        style={{
          backgroundImage: `linear-gradient(${lesson.cover.angle ?? 135}deg, ${lesson.cover.from}, ${lesson.cover.to})`,
        }}
      >
        {/* Vinheta sutil para legibilidade do título */}
        <div className="absolute inset-0 bg-gradient-to-t from-carbon via-carbon/30 to-transparent" />

        {/* Status badge */}
        {isDone && (
          <div className="bg-amber text-carbon absolute right-2 top-2 flex h-7 w-7 items-center justify-center rounded-full">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="14"
              height="14"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="3"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M20 6 9 17l-5-5" />
            </svg>
          </div>
        )}

        {/* Duração */}
        <span className="bg-carbon/80 text-paper fm-mono absolute left-2 top-2 px-2 py-1 backdrop-blur-sm">
          {formatDuration(lesson.durationSec)}
        </span>

        {/* Play button (revelado no hover) */}
        <div className="absolute inset-0 flex items-center justify-center opacity-0 transition-opacity duration-300 group-hover:opacity-100">
          <span className="bg-amber text-carbon grid h-12 w-12 place-items-center rounded-full shadow-xl">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="20"
              height="20"
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
        </div>

        {/* Título sobreposto */}
        <div className="absolute inset-x-0 bottom-0 p-3">
          {showModule && (
            <p className="text-amber fm-mono mb-1 line-clamp-1">
              {lesson.moduleTitle}
            </p>
          )}
          <h3 className="text-paper line-clamp-2 font-serif text-base leading-tight drop-shadow">
            {lesson.title}
          </h3>
        </div>
      </div>

      {/* Progress bar fora da thumbnail (mais legível) */}
      {(inProgress || isDone) && (
        <div className="mt-2">
          <ProgressBar value={isDone ? 1 : progress} size="sm" />
        </div>
      )}

      {/* Posição + estado em texto secundário */}
      <p className="text-paper-600 fm-mono mt-2 line-clamp-1">
        Aula {lesson.position.toString().padStart(2, "0")}
        {inProgress && " · em andamento"}
        {isDone && " · concluída"}
      </p>
    </Link>
  );
}
