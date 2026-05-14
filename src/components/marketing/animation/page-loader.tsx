"use client";

import { useEffect, useRef, useState } from "react";
import gsap from "gsap";

/**
 * Loader institucional. Sai com clip-path circular vindo de baixo,
 * revelando a home. Self-destrói após a animação para não ficar no DOM.
 */
export function PageLoader() {
  const ref = useRef<HTMLDivElement>(null);
  const [mounted, setMounted] = useState(true);

  useEffect(() => {
    if (typeof window === "undefined") return;

    let cancelled = false;
    const safeUnmount = () => {
      if (!cancelled) {
        queueMicrotask(() => {
          if (!cancelled) setMounted(false);
        });
      }
    };

    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      safeUnmount();
      return () => {
        cancelled = true;
      };
    }

    const el = ref.current;
    if (!el) return;

    const tl = gsap.to(el, {
      clipPath: "circle(0% at 50% 100%)",
      duration: 1.2,
      ease: "power4.inOut",
      delay: 0.4,
      onComplete: safeUnmount,
    });

    return () => {
      cancelled = true;
      tl.kill();
    };
  }, []);

  if (!mounted) return null;

  return (
    <div
      ref={ref}
      className="bg-carbon fixed inset-0 z-[10001] grid place-items-center"
      style={{ clipPath: "circle(150% at 50% 100%)" }}
      aria-hidden="true"
    >
      <div className="text-center">
        <div className="text-amber font-serif text-[8rem] italic leading-none">
          FM
        </div>
        <p className="text-paper-400 mt-5 font-mono text-[10px] tracking-[0.5em]">
          ESCOLA FLÁVIO MILHOMEM
        </p>
      </div>
    </div>
  );
}
