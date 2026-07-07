"use client";

import { useEffect, useRef } from "react";

import { ANALYTICS_EVENTS } from "@/lib/analytics/events";
import { track } from "@/lib/analytics/track";

type YoutubeEmbedProps = {
  videoId: string;
  title: string;
  className?: string;
};

const YT_ORIGIN = "https://www.youtube-nocookie.com";

/**
 * Player YouTube (nocookie) para landings de marketing.
 *
 * Tracking (guia 8.5): `content_viewed` com content_type "video" no primeiro
 * play — via postMessage do iframe (`enablejsapi=1`), sem carregar o script
 * da IFrame API. O consentimento é checado dentro de track().
 */
export function YoutubeEmbed({
  videoId,
  title,
  className = "",
}: YoutubeEmbedProps) {
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const playTracked = useRef(false);

  useEffect(() => {
    const iframe = iframeRef.current;
    if (!iframe) return;

    // Handshake da IFrame API: pede ao player que passe a emitir eventos.
    const subscribe = () => {
      iframe.contentWindow?.postMessage(
        JSON.stringify({ event: "listening", id: videoId }),
        YT_ORIGIN,
      );
    };
    iframe.addEventListener("load", subscribe);
    subscribe(); // caso o iframe já tenha carregado antes do effect

    const onMessage = (e: MessageEvent) => {
      if (e.origin !== YT_ORIGIN || e.source !== iframe.contentWindow) return;
      if (playTracked.current || typeof e.data !== "string") return;
      try {
        const data = JSON.parse(e.data) as {
          event?: string;
          info?: number | { playerState?: number };
        };
        const state =
          data.event === "onStateChange" && typeof data.info === "number"
            ? data.info
            : data.event === "infoDelivery" &&
                typeof data.info === "object" &&
                data.info !== null
              ? data.info.playerState
              : undefined;
        if (state === 1) {
          // 1 = playing
          playTracked.current = true;
          track(ANALYTICS_EVENTS.CONTENT_VIEWED, {
            content_type: "video",
            video_id: videoId,
            video_title: title,
          });
        }
      } catch {
        // mensagem de outro widget — ignora
      }
    };
    window.addEventListener("message", onMessage);

    return () => {
      iframe.removeEventListener("load", subscribe);
      window.removeEventListener("message", onMessage);
    };
  }, [videoId, title]);

  return (
    <div
      className={`border-paper-100 bg-carbon-elevated/40 aspect-video overflow-hidden rounded-lg border ${className}`.trim()}
    >
      <iframe
        ref={iframeRef}
        src={`${YT_ORIGIN}/embed/${videoId}?rel=0&modestbranding=1&enablejsapi=1`}
        title={title}
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
        allowFullScreen
        className="h-full w-full"
        loading="lazy"
      />
    </div>
  );
}
