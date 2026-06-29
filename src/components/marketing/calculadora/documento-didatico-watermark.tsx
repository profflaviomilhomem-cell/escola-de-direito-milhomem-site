"use client";

import { useLayoutEffect, useRef, useState } from "react";

/** Margem interna da folha (fração de cada lado) */
const INSET = 0.03;

function diagonalAngleDeg(width: number, height: number): number {
  /* Canto inferior esquerdo → superior direito (eixo da folha) */
  return -(Math.atan2(height, width) * 180) / Math.PI;
}

function fitsBox(text: HTMLSpanElement, maxW: number, maxH: number): boolean {
  const { width, height } = text.getBoundingClientRect();
  return width <= maxW + 0.5 && height <= maxH + 0.5;
}

/** Marca d'água diagonal — alinhada à diagonal da folha, tamanho máximo sem cortar */
export function DocumentoDidaticoWatermark() {
  const containerRef = useRef<HTMLDivElement>(null);
  const textRef = useRef<HTMLSpanElement>(null);
  const [layout, setLayout] = useState<{
    fontSize: number;
    angleDeg: number;
  } | null>(null);

  useLayoutEffect(() => {
    const container = containerRef.current;
    const text = textRef.current;
    if (!container || !text) return;

    const fit = () => {
      const w = container.clientWidth;
      const h = container.clientHeight;
      const maxW = w * (1 - INSET * 2);
      const maxH = h * (1 - INSET * 2);
      if (maxW < 20 || maxH < 20) return;

      const angleDeg = diagonalAngleDeg(w, h);
      text.style.transform = `rotate(${angleDeg}deg)`;

      let lo = 10;
      let hi = Math.hypot(maxW, maxH);

      while (hi - lo > 0.25) {
        const mid = (lo + hi) / 2;
        text.style.fontSize = `${mid}px`;
        if (fitsBox(text, maxW, maxH)) lo = mid;
        else hi = mid;
      }

      text.style.fontSize = `${lo}px`;
      setLayout({ fontSize: lo, angleDeg });
    };

    fit();
    const ro = new ResizeObserver(fit);
    ro.observe(container);
    return () => ro.disconnect();
  }, []);

  return (
    <div ref={containerRef} className="fm-calc-paper-watermark" aria-hidden>
      <span
        ref={textRef}
        className="fm-calc-paper-watermark__text"
        data-ready={layout != null ? "" : undefined}
        style={
          layout
            ? {
                fontSize: `${layout.fontSize}px`,
                transform: `rotate(${layout.angleDeg}deg)`,
              }
            : undefined
        }
      >
        DOCUMENTO DIDÁTICO
      </span>
    </div>
  );
}
