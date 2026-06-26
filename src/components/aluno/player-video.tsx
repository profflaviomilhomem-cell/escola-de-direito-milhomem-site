"use client";

import { useRef, useState } from "react";

import { LabeledProgress } from "@/components/aluno/labeled-progress";
import type { MockLesson } from "@/data/mock-aluno";
import { formatDuration } from "@/data/mock-aluno";
import type { MockCourse } from "@/data/mock-aluno";
import { primaryCourse } from "@/lib/course/aluno-courses";
import { patchLessonProgress } from "@/lib/lessons/progress-client";
import { track } from "@/lib/analytics/track";
import { progressPercentFromRatio } from "@/lib/utils";

type Props = {
  lesson: MockLesson;
  course?: MockCourse;
};

/**
 * Player da aula — HTML5 quando há `videoSrc` (acervo local);
 * fallback para UI mock com gradiente.
 */
export function PlayerVideo({ lesson, course = primaryCourse }: Props) {
  if (lesson.videoId) {
    return <PlayerVideoStream lesson={lesson} course={course} />;
  }
  if (lesson.videoSrc) {
    return <PlayerVideoNative lesson={lesson} course={course} />;
  }
  return <PlayerVideoMockFallback lesson={lesson} course={course} />;
}

/** Player Cloudflare Stream — embed por `videoId` (Stream UID). */
function PlayerVideoStream({ lesson, course = primaryCourse }: Props) {
  const [markedComplete, setMarkedComplete] = useState(
    lesson.status === "concluida",
  );
  const completedTracked = useRef(lesson.status === "concluida");
  const startedTracked = useRef(lesson.status === "concluida");

  const lessonProps = {
    lesson_slug: lesson.slug,
    lesson_id: lesson.id,
    course_slug: course.slug,
    module_title: lesson.moduleTitle,
    player: "cloudflare-stream" as const,
  };

  const handleMarkComplete = () => {
    if (completedTracked.current) return;
    completedTracked.current = true;
    setMarkedComplete(true);
    track("lesson_completed", {
      ...lessonProps,
      completion_source: "manual",
    });
    void patchLessonProgress({
      productSlug: course.slug,
      lessonSlug: lesson.slug,
      watchedSec: lesson.durationSec,
      completed: true,
    });
  };

  const domain =
    process.env.NEXT_PUBLIC_CLOUDFLARE_STREAM_DOMAIN ??
    "iframe.cloudflarestream.com";
  const src = `https://${domain}/${lesson.videoId}`;

  return (
    <div
      data-fm-media-surface
      className="border-paper-100 bg-carbon relative aspect-video w-full overflow-hidden border"
    >
      <iframe
        src={src}
        title={lesson.title}
        className="h-full w-full"
        allow="accelerometer; gyroscope; autoplay; encrypted-media; picture-in-picture;"
        allowFullScreen
        onLoad={() => {
          if (startedTracked.current) return;
          startedTracked.current = true;
          track("lesson_started", lessonProps);
        }}
      />
      {!markedComplete && (
        <div className="absolute right-3 bottom-3 left-3 sm:left-auto">
          <button
            type="button"
            onClick={handleMarkComplete}
            className="bg-amber/95 text-carbon hover:bg-amber fm-mono w-full rounded px-3 py-2 text-[10px] tracking-[0.14em] uppercase transition-colors sm:w-auto"
          >
            Marcar aula como concluída
          </button>
        </div>
      )}
    </div>
  );
}

function PlayerVideoNative({ lesson, course = primaryCourse }: Props) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [markedComplete, setMarkedComplete] = useState(
    lesson.status === "concluida",
  );
  const completedTracked = useRef(lesson.status === "concluida");

  const lessonProps = {
    lesson_slug: lesson.slug,
    lesson_id: lesson.id,
    course_slug: course.slug,
    module_title: lesson.moduleTitle,
    player: "html5" as const,
  };

  const handleMarkComplete = () => {
    if (completedTracked.current) return;
    completedTracked.current = true;
    setMarkedComplete(true);
    track("lesson_completed", {
      ...lessonProps,
      completion_source: "manual",
    });
    void patchLessonProgress({
      productSlug: course.slug,
      lessonSlug: lesson.slug,
      watchedSec: lesson.durationSec,
      completed: true,
    });
  };

  return (
    <div
      data-fm-media-surface
      className="border-paper-100 bg-carbon relative aspect-video w-full overflow-hidden border"
    >
      <video
        ref={videoRef}
        className="h-full w-full object-contain"
        controls
        playsInline
        preload="metadata"
        src={lesson.videoSrc}
        onPlay={() => track("lesson_started", lessonProps)}
      >
        <track kind="captions" />
      </video>
      {!markedComplete && (
        <div className="absolute right-3 bottom-3 left-3 sm:left-auto">
          <button
            type="button"
            onClick={handleMarkComplete}
            className="bg-amber/95 text-carbon hover:bg-amber fm-mono w-full rounded px-3 py-2 text-[10px] tracking-[0.14em] uppercase transition-colors sm:w-auto"
          >
            Marcar aula como concluída
          </button>
        </div>
      )}
    </div>
  );
}

function PlayerVideoMockFallback({ lesson, course = primaryCourse }: Props) {
  const [playing, setPlaying] = useState(false);
  const [markedComplete, setMarkedComplete] = useState(
    lesson.status === "concluida",
  );
  const startedTracked = useRef(false);
  const completedTracked = useRef(lesson.status === "concluida");
  const initialProgress = lesson.watchedSec / Math.max(1, lesson.durationSec);

  const lessonProps = {
    lesson_slug: lesson.slug,
    lesson_id: lesson.id,
    course_slug: course.slug,
    module_title: lesson.moduleTitle,
    player: "mock" as const,
  };

  const handlePlay = () => {
    setPlaying(true);
    if (startedTracked.current) return;
    startedTracked.current = true;
    track("lesson_started", lessonProps);
  };

  const handleMarkComplete = () => {
    if (completedTracked.current) return;
    completedTracked.current = true;
    setMarkedComplete(true);
    track("lesson_completed", {
      ...lessonProps,
      completion_source: "manual_mock",
    });
    void patchLessonProgress({
      productSlug: course.slug,
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
      <div className="from-carbon via-carbon/30 absolute inset-0 bg-gradient-to-t to-transparent" />

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
            >
              <polygon points="6 3 20 12 6 21 6 3" />
            </svg>
          </button>
          <div className="text-center">
            <p className="text-amber fm-mono">{lesson.moduleTitle}</p>
            <p className="text-paper mt-2 font-serif text-2xl">
              {lesson.title}
            </p>
            <p className="text-paper-600 fm-mono mt-3">
              Vídeo em preparação · {formatDuration(lesson.durationSec)}
            </p>
          </div>
        </div>
      )}

      {playing && (
        <>
          <div className="bg-carbon/30 absolute inset-0" />
          <div className="absolute inset-x-0 bottom-0 p-4">
            <LabeledProgress
              value={Math.max(1, progressPercentFromRatio(initialProgress))}
              barClassName="h-1"
            />
            {!markedComplete && (
              <button
                type="button"
                onClick={handleMarkComplete}
                className="bg-amber/90 text-carbon hover:bg-amber fm-mono mt-3 w-full rounded px-3 py-2 text-[10px] tracking-[0.14em] uppercase"
              >
                Marcar aula como concluída
              </button>
            )}
          </div>
        </>
      )}
    </div>
  );
}
