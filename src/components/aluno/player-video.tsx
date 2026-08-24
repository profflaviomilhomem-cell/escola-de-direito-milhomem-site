"use client";

import { useEffect, useRef, useState } from "react";

import type { MockLesson } from "@/lib/course/types";
import type { MockCourse } from "@/lib/course/types";
import { primaryCourse } from "@/lib/course/aluno-courses";
import {
  carregarStreamSdk,
  type StreamPlayer,
} from "@/lib/lessons/cloudflare-stream";
import { patchLessonProgress } from "@/lib/lessons/progress-client";
import {
  concluiAoTerminar,
  devePersistir,
} from "@/lib/lessons/progresso-regras";
import { ANALYTICS_EVENTS } from "@/lib/analytics/events";
import { track } from "@/lib/analytics/track";

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
  return <PlayerVideoIndisponivel lesson={lesson} />;
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

  const handleMarkComplete = (source: "manual" | "auto" = "manual") => {
    if (completedTracked.current) return;
    completedTracked.current = true;
    setMarkedComplete(true);
    track(ANALYTICS_EVENTS.LESSON_COMPLETED, {
      ...lessonProps,
      completion_source: source,
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

  const iframeRef = useRef<HTMLIFrameElement>(null);
  const lastPersistedSec = useRef(Math.floor(lesson.watchedSec));

  // Progresso no Stream. Um <iframe> não emite onTimeUpdate: quem abre essa
  // porta é o SDK oficial do player. Sem isto, subir os vídeos para o Stream
  // faria o progresso parar de ser gravado — e, como o certificado exige 100%
  // das aulas concluídas, ninguém receberia certificado.
  useEffect(() => {
    let vivo = true;
    let player: StreamPlayer | null = null;

    const aoTempo = () => {
      if (!player || completedTracked.current) return;
      const assistido = player.currentTime;
      if (!devePersistir(assistido, lastPersistedSec.current)) return;
      lastPersistedSec.current = Math.floor(assistido);
      void patchLessonProgress({
        productSlug: course.slug,
        lessonSlug: lesson.slug,
        watchedSec: Math.floor(assistido),
      });
    };

    const aoTocar = () => {
      if (startedTracked.current) return;
      startedTracked.current = true;
      track(ANALYTICS_EVENTS.LESSON_STARTED, lessonProps);
    };

    const aoTerminar = () => {
      if (!player) return;
      if (concluiAoTerminar(player.currentTime, player.duration)) {
        handleMarkComplete("auto");
      }
    };

    void carregarStreamSdk().then((Stream) => {
      if (!vivo || !Stream || !iframeRef.current) return;
      try {
        player = Stream(iframeRef.current);
        player.addEventListener("play", aoTocar);
        player.addEventListener("timeupdate", aoTempo);
        player.addEventListener("ended", aoTerminar);
      } catch {
        // SDK presente mas incompatível: o vídeo segue tocando, sem telemetria.
      }
    });

    return () => {
      vivo = false;
      player?.removeEventListener?.("play", aoTocar);
      player?.removeEventListener?.("timeupdate", aoTempo);
      player?.removeEventListener?.("ended", aoTerminar);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [lesson.slug, lesson.videoId]);

  return (
    <div
      data-fm-media-surface
      className="border-paper-100 bg-carbon relative aspect-video w-full overflow-hidden border"
    >
      <iframe
        ref={iframeRef}
        src={src}
        title={lesson.title}
        className="h-full w-full"
        allow="accelerometer; gyroscope; autoplay; encrypted-media; picture-in-picture;"
        allowFullScreen
        onLoad={() => {
          // Rede de segurança: se o SDK não carregar, ao menos o início da aula
          // fica registrado.
          if (startedTracked.current) return;
          startedTracked.current = true;
          track(ANALYTICS_EVENTS.LESSON_STARTED, lessonProps);
        }}
      />
      {!markedComplete && (
        <div className="absolute right-3 bottom-3 left-3 sm:left-auto">
          <button
            type="button"
            onClick={() => handleMarkComplete("manual")}
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
  // Fonte que não carrega. Não é hipótese: em 24/08/2026 as 10 aulas tinham
  // `videoSrc` apontando para arquivos que respondiam 404 em produção (os MP4
  // estão no .gitignore e nunca subiram), então o aluno via um player quebrado.
  // Sem isto, "o vídeo não existe" fica indistinguível de "o vídeo travou".
  const [fonteQuebrada, setFonteQuebrada] = useState(false);
  const [markedComplete, setMarkedComplete] = useState(
    lesson.status === "concluida",
  );
  const completedTracked = useRef(lesson.status === "concluida");
  const startedTracked = useRef(false);
  // Maior watchedSec já persistido — evita gravar em cada onTimeUpdate (~4/s).
  const lastPersistedSec = useRef(Math.floor(lesson.watchedSec));

  const lessonProps = {
    lesson_slug: lesson.slug,
    lesson_id: lesson.id,
    course_slug: course.slug,
    module_title: lesson.moduleTitle,
    player: "html5" as const,
  };

  const handleMarkComplete = (source: "manual" | "auto" = "manual") => {
    if (completedTracked.current) return;
    completedTracked.current = true;
    setMarkedComplete(true);
    track(ANALYTICS_EVENTS.LESSON_COMPLETED, {
      ...lessonProps,
      completion_source: source,
    });
    void patchLessonProgress({
      productSlug: course.slug,
      lessonSlug: lesson.slug,
      watchedSec: lesson.durationSec,
      completed: true,
    });
    lastPersistedSec.current = lesson.durationSec;
  };

  // Persiste o ponto assistido a cada NATIVE_PROGRESS_SAVE_STEP_SEC de avanço.
  const handleTimeUpdate = () => {
    if (completedTracked.current) return;
    const el = videoRef.current;
    if (!el) return;
    const watchedSec = Math.floor(el.currentTime);
    if (!devePersistir(watchedSec, lastPersistedSec.current)) return;
    lastPersistedSec.current = watchedSec;
    void patchLessonProgress({
      productSlug: course.slug,
      lessonSlug: lesson.slug,
      watchedSec,
    });
  };

  const handleEnded = () => {
    const el = videoRef.current;
    const duration = el?.duration;
    const watched = el?.currentTime ?? 0;
    // Só auto-conclui se o aluno realmente chegou ao fim (não em seek/replay).
    if (concluiAoTerminar(watched, duration)) handleMarkComplete("auto");
  };

  if (fonteQuebrada) return <PlayerVideoIndisponivel lesson={lesson} />;

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
        onError={() => setFonteQuebrada(true)}
        onPlay={() => {
          if (startedTracked.current) return;
          startedTracked.current = true;
          track(ANALYTICS_EVENTS.LESSON_STARTED, lessonProps);
        }}
        onTimeUpdate={handleTimeUpdate}
        onEnded={handleEnded}
      >
        <track kind="captions" />
      </video>
      {!markedComplete && (
        <div className="absolute right-3 bottom-3 left-3 sm:left-auto">
          <button
            type="button"
            onClick={() => handleMarkComplete("manual")}
            className="bg-amber/95 text-carbon hover:bg-amber fm-mono w-full rounded px-3 py-2 text-[10px] tracking-[0.14em] uppercase transition-colors sm:w-auto"
          >
            Marcar aula como concluída
          </button>
        </div>
      )}
    </div>
  );
}

/**
 * Aula sem vídeo disponível.
 *
 * SUBSTITUIU, em 24/08/2026, um "player mock" herdado do protótipo: um degradê
 * com botão de play grande que não tocava nada, apenas marcava a aula como
 * iniciada — e um botão de concluir que CONTAVA PARA O CERTIFICADO
 * (`completion_source: "manual_mock"`). Num curso pago, isso é um play que
 * finge e um certificado por aula não assistida.
 *
 * Aqui não há botão de play nem de conclusão: se não há vídeo, não há o que
 * concluir. O aluno lê o que está acontecendo, e os materiais da aula continuam
 * acessíveis logo abaixo do player.
 */
function PlayerVideoIndisponivel({ lesson }: { lesson: MockLesson }) {
  return (
    <div
      data-fm-media-surface
      role="status"
      className="border-paper-100 bg-carbon-elevated/40 flex aspect-video w-full flex-col items-center justify-center gap-3 border px-6 text-center"
    >
      <p className="text-amber fm-mono text-[10px] tracking-[0.18em] uppercase">
        Vídeo em preparação
      </p>
      <p className="text-paper max-w-md font-serif text-xl leading-snug">
        {lesson.title}
      </p>
      <p className="text-paper-600 max-w-md text-sm leading-relaxed">
        Esta aula ainda não está disponível para assistir. Você será avisado por
        e-mail assim que ela entrar no ar. Os materiais de apoio, quando houver,
        continuam disponíveis abaixo.
      </p>
    </div>
  );
}
