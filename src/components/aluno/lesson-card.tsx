import Link from "next/link";

import { Progress } from "@/components/ui/progress";
import { formatDuration, type MockLesson } from "@/data/mock-aluno";
import { progressPercentFromRatio } from "@/lib/utils";

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
        data-fm-media-surface
        className="border-paper-100 relative aspect-video overflow-hidden border transition-all duration-300 group-hover:border-amber group-hover:shadow-[0_8px_30px_rgba(241, 187, 65,0.15)]"
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
          <Progress
            value={
              isDone ? 100 : progressPercentFromRatio(progress)
            }
            className="h-[3px] bg-paper-200"
          />
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
