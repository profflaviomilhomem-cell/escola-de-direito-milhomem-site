"use client";

import { useEffect, useRef } from "react";
import gsap from "gsap";

/**
 * Cursor custom (dot 8px + outline 40px), só desktop e quando o usuário
 * não pediu reduced motion. Em touch devices ou em campos de input,
 * o cursor nativo é preservado (a11y).
 */
export function CustomCursor() {
  const dotRef = useRef<HTMLDivElement>(null);
  const outlineRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (typeof window === "undefined") return;

    const isTouch = window.matchMedia("(hover: none), (pointer: coarse)")
      .matches;
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)")
      .matches;
    if (isTouch || reduced) return;

    const html = document.documentElement;
    html.classList.add("fm-cursor-active");

    const dot = dotRef.current;
    const outline = outlineRef.current;
    if (!dot || !outline) return;

    const onMouseMove = (e: MouseEvent) => {
      gsap.to(dot, { x: e.clientX, y: e.clientY, duration: 0.1 });
      gsap.to(outline, {
        x: e.clientX - 20,
        y: e.clientY - 20,
        duration: 0.25,
      });
    };

    const onMouseLeave = () => {
      gsap.to([dot, outline], { opacity: 0, duration: 0.2 });
    };
    const onMouseEnter = () => {
      gsap.to([dot, outline], { opacity: 1, duration: 0.2 });
    };

    window.addEventListener("mousemove", onMouseMove);
    document.addEventListener("mouseleave", onMouseLeave);
    document.addEventListener("mouseenter", onMouseEnter);

    return () => {
      window.removeEventListener("mousemove", onMouseMove);
      document.removeEventListener("mouseleave", onMouseLeave);
      document.removeEventListener("mouseenter", onMouseEnter);
      html.classList.remove("fm-cursor-active");
    };
  }, []);

  return (
    <>
      <div
        ref={dotRef}
        aria-hidden="true"
        className="pointer-events-none fixed left-0 top-0 z-[99999] h-2 w-2 rounded-full bg-amber"
        style={{ transform: "translate(-50%, -50%)" }}
      />
      <div
        ref={outlineRef}
        aria-hidden="true"
        className="border-amber pointer-events-none fixed left-0 top-0 z-[99998] h-10 w-10 rounded-full border"
      />
    </>
  );
}
