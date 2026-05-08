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
 * há overflow real.
 *
 * Design choice: NÃO ocultamos a scrollbar com `.no-scrollbar` por
 * acessibilidade — usuários de teclado e mouse trackball precisam dela.
 * Usamos uma scrollbar fininha customizada via CSS.
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

      <div className="relative mt-6">
        {canPrev && (
          <button
            type="button"
            aria-label="Rolar para a esquerda"
            onClick={() => scrollBy(-1)}
            className="bg-carbon/80 text-paper hover:bg-amber hover:text-carbon absolute left-0 top-1/2 z-10 hidden -translate-y-1/2 p-3 backdrop-blur-md transition-colors md:block"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="22"
              height="22"
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
        )}
        {canNext && (
          <button
            type="button"
            aria-label="Rolar para a direita"
            onClick={() => scrollBy(1)}
            className="bg-carbon/80 text-paper hover:bg-amber hover:text-carbon absolute right-0 top-1/2 z-10 hidden -translate-y-1/2 p-3 backdrop-blur-md transition-colors md:block"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="22"
              height="22"
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
        )}

        <div
          ref={ref}
          className="px-gutter mx-auto flex max-w-(--container-narrow) gap-4 overflow-x-auto scroll-smooth pb-4 lg:px-12"
          style={{ scrollSnapType: "x proximity" }}
        >
          {children}
        </div>
      </div>
    </section>
  );
}
