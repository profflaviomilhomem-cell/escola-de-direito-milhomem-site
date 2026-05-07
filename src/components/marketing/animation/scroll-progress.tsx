"use client";

import { useEffect, useRef } from "react";

/**
 * Barra de progresso de scroll (top, 2px, âmbar). Atualiza via rAF.
 * Respeita prefers-reduced-motion — em motion reduzido, fica oculta.
 */
export function ScrollProgress() {
  const barRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (typeof window === "undefined") return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const bar = barRef.current;
    if (!bar) return;

    let rafId = 0;
    const update = () => {
      const scrolled =
        document.documentElement.scrollTop || document.body.scrollTop;
      const height =
        document.documentElement.scrollHeight -
        document.documentElement.clientHeight;
      const pct = height > 0 ? (scrolled / height) * 100 : 0;
      bar.style.width = `${pct}%`;
      rafId = 0;
    };

    const onScroll = () => {
      if (rafId) return;
      rafId = requestAnimationFrame(update);
    };

    update();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", onScroll);
      if (rafId) cancelAnimationFrame(rafId);
    };
  }, []);

  return (
    <div
      ref={barRef}
      aria-hidden="true"
      className="bg-amber pointer-events-none fixed left-0 top-0 z-[10000] h-[2px] w-0 motion-reduce:hidden"
    />
  );
}
