"use client";

import { useRef, useState } from "react";

import { LabeledProgress } from "@/components/aluno/labeled-progress";
import type { MockLesson } from "@/data/mock-aluno";
import { formatDuration } from "@/data/mock-aluno";
import { mockCourse } from "@/lib/course/aluno-courses";
import { patchLessonProgress } from "@/lib/lessons/progress-client";
import { ANALYTICS_EVENTS } from "@/lib/analytics/events";
import { track } from "@/lib/analytics/track";
import { progressPercentFromRatio } from "@/lib/utils";

type Props = {
  lesson: MockLesson;
};

/**
 * Player mock 16:9 — Cloudflare Stream entra aqui depois.
 * Agora: gradient cover do mock + overlay de controles ativados pelo
 * estado `playing`. Nada toca de verdade; só simula a UI.
 */
export function PlayerVideoMock({ lesson }: Props) {
  const [playing, setPlaying] = useState(false);
  const [muted, setMuted] = useState(false);
  const [markedComplete, setMarkedComplete] = useState(
    lesson.status === "concluida",
  );
  const startedTracked = useRef(false);
  const completedTracked = useRef(lesson.status === "concluida");
  const initialProgress = lesson.watchedSec / Math.max(1, lesson.durationSec);

  const lessonProps = {
    lesson_slug: lesson.slug,
    lesson_id: lesson.id,
    course_slug: mockCourse.slug,
    module_title: lesson.moduleTitle,
    player: "mock" as const,
  };

  const handlePlay = () => {
    setPlaying(true);
    if (startedTracked.current) return;
    startedTracked.current = true;
    track(ANALYTICS_EVENTS.LESSON_STARTED, lessonProps);
  };

  const handleMarkComplete = () => {
    if (completedTracked.current) return;
    completedTracked.current = true;
    setMarkedComplete(true);
    track(ANALYTICS_EVENTS.LESSON_COMPLETED, {
      ...lessonProps,
      completion_source: "manual_mock",
    });
    void patchLessonProgress({
      productSlug: mockCourse.slug,
      lessonSlug: lesson.slug,
      watchedSec: lesson.durationSec,
      completed: true,
    });
  };

  return (
    <div
      data-fm-media-surface
      className="border-paper-100 relative aspect-video w-full overflow-hidden border"
      style={{
        backgroundImage: `linear-gradient(${lesson.cover.angle ?? 135}deg, ${lesson.cover.from}, ${lesson.cover.to})`,
      }}
    >
      {/* Vinheta para profundidade */}
      <div className="from-carbon via-carbon/30 absolute inset-0 bg-gradient-to-t to-transparent" />

      {/* Estado ocioso: título + duração */}
      {!playing && (
        <div className="absolute inset-0 flex flex-col items-center justify-center gap-6">
          <button
            type="button"
            onClick={handlePlay}
            aria-label={`Reproduzir aula: ${lesson.title}`}
            className="group bg-paper text-carbon hover:bg-amber relative grid h-20 w-20 place-items-center rounded-full transition-all hover:scale-110"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="32"
              height="32"
              viewBox="0 0 24 24"
              fill="currentColor"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <polygon points="6 3 20 12 6 21 6 3" />
            </svg>
            <span
              aria-hidden
              className="bg-amber/40 absolute inset-0 -z-10 rounded-full opacity-0 blur-xl group-hover:opacity-100"
            />
          </button>
          <div className="text-center">
            <p className="text-amber fm-mono">{lesson.moduleTitle}</p>
            <p className="text-paper mt-2 font-serif text-2xl">
              {lesson.title}
            </p>
            <p className="text-paper-600 fm-mono mt-3">
              {formatDuration(lesson.durationSec)} · vídeo HD
            </p>
          </div>
        </div>
      )}

      {/* Estado tocando: barra inferior */}
      {playing && (
        <>
          <div className="bg-carbon/30 absolute inset-0" />
          <div className="absolute inset-x-0 bottom-0 p-4">
            <LabeledProgress
              value={Math.max(1, progressPercentFromRatio(initialProgress))}
              barClassName="h-1"
            />
            <div className="mt-3 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => setPlaying(false)}
                  aria-label="Pausar"
                  className="text-paper hover:text-amber"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="22"
                    height="22"
                    viewBox="0 0 24 24"
                    fill="currentColor"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <rect x="6" y="4" width="4" height="16" />
                    <rect x="14" y="4" width="4" height="16" />
                  </svg>
                </button>
                <button
                  type="button"
                  onClick={() => setMuted((v) => !v)}
                  aria-label={muted ? "Ativar som" : "Silenciar"}
                  className="text-paper hover:text-amber"
                >
                  {muted ? (
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="20"
                      height="20"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="1.6"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" />
                      <line x1="22" y1="9" x2="16" y2="15" />
                      <line x1="16" y1="9" x2="22" y2="15" />
                    </svg>
                  ) : (
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="20"
                      height="20"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="1.6"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" />
                      <path d="M19.07 4.93a10 10 0 0 1 0 14.14" />
                      <path d="M15.54 8.46a5 5 0 0 1 0 7.07" />
                    </svg>
                  )}
                </button>
                <span className="text-paper-700 fm-mono">
                  {formatDuration(lesson.watchedSec)} ·{" "}
                  {formatDuration(lesson.durationSec)}
                </span>
              </div>
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  className="text-paper-700 hover:text-amber fm-mono"
                  aria-label="Velocidade de reprodução"
                >
                  1×
                </button>
                <button
                  type="button"
                  className="text-paper-700 hover:text-amber fm-mono"
                  aria-label="Legendas"
                >
                  CC
                </button>
                <button
                  type="button"
                  className="text-paper hover:text-amber"
                  aria-label="Tela cheia"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="20"
                    height="20"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.6"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M8 3H5a2 2 0 0 0-2 2v3" />
                    <path d="M21 8V5a2 2 0 0 0-2-2h-3" />
                    <path d="M3 16v3a2 2 0 0 0 2 2h3" />
                    <path d="M16 21h3a2 2 0 0 0 2-2v-3" />
                  </svg>
                </button>
              </div>
            </div>
            {!markedComplete && (
              <button
                type="button"
                onClick={handleMarkComplete}
                className="bg-amber/90 text-carbon hover:bg-amber fm-mono mt-3 w-full rounded px-3 py-2 text-[10px] tracking-[0.14em] uppercase transition-colors"
              >
                Marcar aula como concluída
              </button>
            )}
            {markedComplete && (
              <p className="text-amber fm-mono mt-3 text-center text-[10px] tracking-[0.14em] uppercase">
                Aula concluída
              </p>
            )}
          </div>
        </>
      )}
    </div>
  );
}
