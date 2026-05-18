import Link from "next/link";

import type { MockLesson } from "@/data/mock-aluno";
import { formatDuration } from "@/data/mock-aluno";
import { fmTitleClamp } from "@/lib/ui/fm-title-clamp";

type Props = {
  lesson: MockLesson;
};

/**
 * Variante "Top 10" — 2:3 vertical poster com o número da aula em
 * outline gigantesco atrás/ao lado. Ideal para rows que sugerem ordem
 * sequencial (próximas aulas, roteiro, ranking).
 *
 * O numeral usa `WebkitTextStroke` (paper-400 a 40%) com fill carbon —
 * só o contorno fica visível. O card vem por cima via `z-index` e
 * margem esquerda, deixando ~40% do número escapar pela esquerda.
 */
export function LessonCardRanked({ lesson }: Props) {
  const isDone = lesson.status === "concluida";
  const inProgress = lesson.status === "em-andamento";

  return (
    <Link
      href={`/aluno/aulas/${lesson.slug}`}
      className="group relative block w-[260px] flex-shrink-0 no-underline md:w-[300px]"
    >
      {/* Numeral outline gigante — atrás do card */}
      <span
        aria-hidden
        className="fm-title-fluid font-display pointer-events-none absolute bottom-0 left-0 z-0 select-none leading-[0.78]"
        style={{
          ...fmTitleClamp("8rem", "14vw", "12rem"),
          fontWeight: 700,
          color: "var(--color-carbon)",
          WebkitTextStroke:
            "2px var(--color-paper-400)",
          textShadow:
            "3px 0 0 var(--color-carbon), 0 0 0 var(--color-carbon)",
          letterSpacing: "-0.04em",
        }}
      >
        {lesson.position}
      </span>

      {/* Card poster 2:3 */}
      <div
        className="border-paper-100 group-hover:border-amber group-hover:shadow-[0_8px_30px_rgba(241, 187, 65,0.18)] relative ml-14 aspect-[2/3] overflow-hidden border transition-all duration-300 md:ml-20"
        style={{
          backgroundImage: `linear-gradient(${lesson.cover.angle ?? 135}deg, ${lesson.cover.from}, ${lesson.cover.to})`,
        }}
      >
        {/* Camada radial pra dar profundidade ao gradient */}
        <div
          aria-hidden
          className="absolute inset-0"
          style={{
            background:
              "radial-gradient(ellipse at top right, rgba(241, 187, 65,0.12), transparent 60%)",
          }}
        />

        {/* Vinheta para legibilidade do título */}
        <div
          aria-hidden
          className="absolute inset-0 bg-gradient-to-t from-carbon via-carbon/40 to-transparent"
        />

        {/* ✓ amber se concluída */}
        {isDone && (
          <span
            className="bg-amber text-carbon absolute right-2 top-2 grid h-7 w-7 place-items-center rounded-full"
            aria-label="Aula concluída"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="13"
              height="13"
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

        {/* Em-andamento: pill mostarda */}
        {inProgress && (
          <span className="bg-amber/90 text-carbon fm-mono absolute right-2 top-2 px-2 py-1">
            Em andamento
          </span>
        )}

        {/* Título sobreposto */}
        <div className="absolute inset-x-0 bottom-0 space-y-2 p-4">
          <p className="text-amber fm-mono line-clamp-1">
            {lesson.moduleTitle}
          </p>
          <h3 className="font-display text-paper line-clamp-3 text-base font-bold uppercase leading-tight tracking-[0.04em] drop-shadow-lg md:text-lg">
            {lesson.title}
          </h3>
          <p className="text-paper-700 fm-mono">
            {formatDuration(lesson.durationSec)}
          </p>
        </div>
      </div>
    </Link>
  );
}
