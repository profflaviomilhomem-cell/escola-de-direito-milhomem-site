"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";

type Props = {
  /** Preço já formatado (mesma fonte do bloco de investimento). */
  priceLabel: string;
  /** Destino do checkout — o MESMO do CTA da seção de investimento. */
  href: string;
  /** Texto do botão — repetido do bloco de investimento, de propósito. */
  cta: string;
  /** Linha curta de contexto (ex.: data de início da turma). */
  note: string;
};

/**
 * Barra de oferta fixa no rodapé da viewport.
 *
 * Por que existe: as três landings longas medidas em 13/08/2026 (Insper, Maven,
 * Academia de Forense Digital) mantêm preço e botão na tela o tempo todo — a
 * nossa tinha `grep -c sticky` = 0, e numa página de ~13 telas o preço some no
 * primeiro scroll. Ver `01-Estrategia/Anatomia de landing page — benchmark…`.
 *
 * Regras que ela respeita:
 * - **Um destino só.** O `href` é o mesmo do CTA da seção de investimento; o
 *   benchmark é unânime em nunca ter dois destinos concorrentes na página.
 * - **Não duplica o CTA visível.** Some enquanto a seção de investimento está
 *   na tela, senão o leitor vê o mesmo botão duas vezes ao mesmo tempo.
 * - **Não aparece no topo.** Só depois que o herói sai, para não competir com o
 *   CTA principal na primeira tela.
 * - **Sem animação.** Aparecer/sumir é `hidden`, não transição — não há nada
 *   para `prefers-reduced-motion` desligar, e nada roda na main thread durante
 *   o LCP.
 */
export function StickyOfertaBar({ priceLabel, href, cta, note }: Props) {
  const [visivel, setVisivel] = useState(false);
  const sentinela = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const heroPassou = sentinela.current;
    const oferta = document.getElementById("investimento");
    if (!heroPassou) return;

    // Dois observadores independentes: um diz "já passamos do herói", o outro
    // diz "a seção de investimento está na tela". A barra só aparece quando o
    // primeiro é verdadeiro e o segundo é falso.
    let passouDoHero = false;
    let ofertaNaTela = false;
    const sincronizar = () => setVisivel(passouDoHero && !ofertaNaTela);

    const obsHero = new IntersectionObserver(
      ([entrada]) => {
        passouDoHero = !entrada.isIntersecting;
        sincronizar();
      },
      { rootMargin: "0px" },
    );
    obsHero.observe(heroPassou);

    const obsOferta = oferta
      ? new IntersectionObserver(
          ([entrada]) => {
            ofertaNaTela = entrada.isIntersecting;
            sincronizar();
          },
          { rootMargin: "0px 0px -20% 0px" },
        )
      : null;
    if (oferta && obsOferta) obsOferta.observe(oferta);

    return () => {
      obsHero.disconnect();
      obsOferta?.disconnect();
    };
  }, []);

  return (
    <>
      {/* Sentinela: fim do herói. Sem altura, não afeta layout. */}
      <div ref={sentinela} aria-hidden className="h-px w-full" />
      <div
        hidden={!visivel}
        className="border-paper-200 bg-carbon/95 fixed inset-x-0 bottom-0 z-40 border-t backdrop-blur-sm"
        style={{ paddingBottom: "env(safe-area-inset-bottom)" }}
      >
        <div className="fm-site-page flex flex-wrap items-center justify-between gap-3 py-3">
          <div className="min-w-0">
            <p className="text-paper font-serif text-xl leading-none">
              {priceLabel}
            </p>
            <p className="text-paper-600 mt-1 font-mono text-[10px] tracking-[0.14em] uppercase">
              {note}
            </p>
          </div>
          <Link
            href={href}
            className="bg-amber text-carbon focus-visible:outline-paper shrink-0 px-5 py-2.5 font-mono text-[12px] tracking-[0.16em] uppercase focus-visible:outline-2 focus-visible:outline-offset-2"
          >
            {cta}
          </Link>
        </div>
      </div>
    </>
  );
}
