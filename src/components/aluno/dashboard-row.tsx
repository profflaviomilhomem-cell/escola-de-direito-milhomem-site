"use client";

import { useRef, useState, useEffect, type ReactNode } from "react";

type Props = {
  title: string;
  eyebrow?: string;
  cta?: { label: string; href: string };
  children: ReactNode;
};

/**
 * Row horizontal estilo streaming — título à esquerda, CTA à direita,
 * conteúdo em scroll-x com snap. Setas de paginação aparecem só quando
 * há overflow real. Scrollbar é ocultada globalmente (regra em
 * `globals.css`); a scrollabilidade real (wheel, trackpad, touch,
 * teclado) permanece e as setas suprem o caso de mouse-only.
 */
export function DashboardRow({ title, eyebrow, cta, children }: Props) {
  const ref = useRef<HTMLDivElement>(null);
  const [canPrev, setCanPrev] = useState(false);
  const [canNext, setCanNext] = useState(false);

  const update = () => {
    const el = ref.current;
    if (!el) return;
    setCanPrev(el.scrollLeft > 4);
    setCanNext(el.scrollLeft + el.clientWidth < el.scrollWidth - 4);
  };

  useEffect(() => {
    update();
    const el = ref.current;
    if (!el) return;
    el.addEventListener("scroll", update, { passive: true });
    window.addEventListener("resize", update);
    return () => {
      el.removeEventListener("scroll", update);
      window.removeEventListener("resize", update);
    };
  }, []);

  const scrollBy = (dir: 1 | -1) => {
    const el = ref.current;
    if (!el) return;
    el.scrollBy({ left: dir * el.clientWidth * 0.8, behavior: "smooth" });
  };

  return (
    <section className="relative">
      <div className="px-gutter mx-auto flex max-w-(--container-narrow) items-end justify-between lg:px-12">
        <div>
          {eyebrow && (
            <p className="text-amber fm-mono">{eyebrow}</p>
          )}
          <h2 className="text-paper mt-1 font-serif text-2xl leading-tight md:text-3xl">
            {title}
          </h2>
        </div>
        {cta && (
          <a
            href={cta.href}
            className="text-paper-700 hover:text-amber fm-mono whitespace-nowrap transition-colors"
          >
            {cta.label} →
          </a>
        )}
      </div>

      {/* Wrapper das setas e do scroll respeita o max-width do container,
          então as setas ficam coladas nas bordas dos cards (não na borda
          da viewport). Setas sempre visíveis; a inativa fica em estado
          disabled (opacidade reduzida + cursor-not-allowed). */}
      <div className="relative mx-auto mt-6 max-w-(--container-narrow)">
        <button
          type="button"
          aria-label="Rolar para a esquerda"
          onClick={() => scrollBy(-1)}
          disabled={!canPrev}
          className="border-paper-200 bg-carbon-elevated/85 text-paper enabled:hover:bg-amber enabled:hover:text-carbon enabled:hover:border-amber enabled:hover:scale-110 disabled:cursor-not-allowed disabled:opacity-30 absolute left-3 top-1/2 z-20 hidden h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full border shadow-lg backdrop-blur-md transition-all duration-200 lg:left-10 md:flex"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="m15 18-6-6 6-6" />
          </svg>
        </button>
        <button
          type="button"
          aria-label="Rolar para a direita"
          onClick={() => scrollBy(1)}
          disabled={!canNext}
          className="border-paper-200 bg-carbon-elevated/85 text-paper enabled:hover:bg-amber enabled:hover:text-carbon enabled:hover:border-amber enabled:hover:scale-110 disabled:cursor-not-allowed disabled:opacity-30 absolute right-3 top-1/2 z-20 hidden h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full border shadow-lg backdrop-blur-md transition-all duration-200 lg:right-10 md:flex"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="m9 18 6-6-6-6" />
          </svg>
        </button>

        {/* Fade decorativo nas bordas — sugere "tem mais conteúdo" só
            quando há de fato. Sumiu nos extremos para não conflitar
            com o botão disabled. */}
        {canPrev && (
          <div
            aria-hidden
            className="from-carbon pointer-events-none absolute left-0 top-0 z-10 hidden h-full w-20 bg-gradient-to-r to-transparent md:block"
          />
        )}
        {canNext && (
          <div
            aria-hidden
            className="from-carbon pointer-events-none absolute right-0 top-0 z-10 hidden h-full w-20 bg-gradient-to-l to-transparent md:block"
          />
        )}

        <div
          ref={ref}
          className="px-gutter flex gap-4 overflow-x-auto scroll-smooth pb-4 lg:px-12"
          style={{ scrollSnapType: "x proximity" }}
        >
          {children}
        </div>
      </div>
    </section>
  );
}
