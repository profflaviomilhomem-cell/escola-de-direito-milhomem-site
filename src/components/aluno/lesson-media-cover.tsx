"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";

import { cn } from "@/lib/utils";

export type LessonCoverGradient = {
  from: string;
  via?: string;
  to: string;
  angle?: number;
};

type Props = {
  cover: LessonCoverGradient;
  posterSrc?: string;
  videoSrc?: string;
  alt?: string;
  className?: string;
  /** Prioriza frame do vídeo quando não há poster (carrossel com muitos itens). */
  preferVideoFrame?: boolean;
};

function coverGradientStyle(cover: LessonCoverGradient): React.CSSProperties {
  return {
    backgroundImage: `linear-gradient(${cover.angle ?? 135}deg, ${cover.from}, ${cover.via ?? cover.from}, ${cover.to})`,
  };
}

/**
 * Superfície visual de cards/miniaturas — poster JPEG, frame do vídeo ou gradiente.
 */
export function LessonMediaCover({
  cover,
  posterSrc,
  videoSrc,
  alt = "",
  className,
  preferVideoFrame = false,
}: Props) {
  const base = cn("bg-carbon relative overflow-hidden", className);

  if (posterSrc && !preferVideoFrame) {
    return (
      <div className={base}>
        <Image
          src={posterSrc}
          alt={alt}
          fill
          className="object-cover"
          sizes="(max-width: 768px) 45vw, 320px"
        />
      </div>
    );
  }

  if (videoSrc) {
    return (
      <VideoFramePreview
        videoSrc={videoSrc}
        cover={cover}
        alt={alt}
        className={base}
      />
    );
  }

  return (
    <div
      className={base}
      style={coverGradientStyle(cover)}
      aria-hidden={!alt}
    />
  );
}

function VideoFramePreview({
  videoSrc,
  cover,
  alt,
  className,
}: {
  videoSrc: string;
  cover: LessonCoverGradient;
  alt: string;
  className?: string;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const [ready, setReady] = useState(false);
  const [inView, setInView] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry?.isIntersecting) setInView(true);
      },
      { rootMargin: "120px" },
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  useEffect(() => {
    if (!inView) return;
    const video = videoRef.current;
    if (!video) return;

    const onMeta = () => {
      try {
        const t = Math.min(8, Math.max(0, (video.duration || 10) * 0.05));
        video.currentTime = Number.isFinite(t) ? t : 5;
      } catch {
        video.currentTime = 5;
      }
    };

    const onSeeked = () => setReady(true);

    video.addEventListener("loadedmetadata", onMeta);
    video.addEventListener("seeked", onSeeked);
    video.load();

    return () => {
      video.removeEventListener("loadedmetadata", onMeta);
      video.removeEventListener("seeked", onSeeked);
    };
  }, [inView, videoSrc]);

  return (
    <div
      ref={ref}
      className={className}
      style={!ready ? coverGradientStyle(cover) : undefined}
    >
      {inView ? (
        <video
          ref={videoRef}
          src={videoSrc}
          muted
          playsInline
          preload="metadata"
          aria-hidden
          className={cn(
            "absolute inset-0 h-full w-full object-cover transition-opacity duration-300",
            ready ? "opacity-100" : "opacity-0",
          )}
        />
      ) : null}
      {alt ? <span className="sr-only">{alt}</span> : null}
    </div>
  );
}
