"use client";

import { useEffect } from "react";

/**
 * IntersectionObserver global que adiciona `.is-visible` a qualquer
 * elemento com atributo `[data-reveal]` quando ele entra no viewport.
 *
 * Estratégia progressive enhancement:
 *  1. Sem JS, [data-reveal] fica visível por padrão (CSS condicional).
 *  2. Adicionamos `html.fm-reveal-ready` antes de pintar para esconder.
 *  3. IntersectionObserver revela. Falhas têm fallback de 1.2s.
 */
export function RevealOnScroll() {
  useEffect(() => {
    if (typeof window === "undefined") return;

    const html = document.documentElement;
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)")
      .matches;

    if (reduced) {
      // Em motion reduzido nem ativa o esconder — tudo já visível.
      return;
    }

    html.classList.add("fm-reveal-ready");

    const els = document.querySelectorAll<HTMLElement>("[data-reveal]");
    if (els.length === 0) return;

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-visible");
            observer.unobserve(entry.target);
          }
        }
      },
      { threshold: 0.1, rootMargin: "0px 0px -8% 0px" },
    );

    els.forEach((el) => observer.observe(el));

    // Failsafe: depois de 1.2s, qualquer elemento ainda escondido vira visível.
    const fallback = window.setTimeout(() => {
      document
        .querySelectorAll<HTMLElement>("[data-reveal]:not(.is-visible)")
        .forEach((el) => el.classList.add("is-visible"));
    }, 1200);

    return () => {
      observer.disconnect();
      window.clearTimeout(fallback);
    };
  }, []);

  return null;
}
