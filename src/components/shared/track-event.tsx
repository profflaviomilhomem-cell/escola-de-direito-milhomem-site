"use client";

import { useEffect } from "react";

import { track, type TrackProps } from "@/lib/analytics/track";

/**
 * Dispara um evento de analytics ao montar (uso em Server Components que
 * precisam emitir conversão no client). `once` deduplica por sessionStorage
 * — evita recontar a mesma conversão em refresh (ex.: purchase:{orderId}).
 */
export function TrackEvent({
  event,
  props,
  once,
}: {
  event: string;
  props?: TrackProps;
  once?: string;
}) {
  useEffect(() => {
    if (once) {
      const key = `fm:tracked:${once}`;
      try {
        if (sessionStorage.getItem(key)) return;
        sessionStorage.setItem(key, "1");
      } catch {
        // sessionStorage indisponível: segue e dispara mesmo assim.
      }
    }
    track(event, props);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  return null;
}
