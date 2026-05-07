"use client";

import { useEffect, useRef } from "react";
import gsap from "gsap";

/**
 * Dossiê 3D — capa institucional com parallax acompanhando o mouse.
 *
 * Stacking em contexto 3D (`preserve-3d`) ignora z-index — a ordem é
 * por translateZ. Por isso a capa usa translateZ positivo, ficando na
 * frente das folhas. As folhas ficam atrás (translateZ:0). O selo
 * fica ainda mais à frente (translateZ maior).
 */
export function Dossie3D() {
  const stageRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (typeof window === "undefined") return;
    if (window.matchMedia("(hover: none), (pointer: coarse)").matches) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const stage = stageRef.current;
    if (!stage) return;

    let listening = true;
    const onMouseMove = (e: MouseEvent) => {
      if (!listening) return;
      const x = (e.clientX / window.innerWidth - 0.5) * 30;
      const y = (e.clientY / window.innerHeight - 0.5) * 30;
      gsap.to(stage, { rotateY: x, rotateX: -y, duration: 1 });
    };

    const io = new IntersectionObserver((entries) => {
      for (const entry of entries) {
        listening = entry.isIntersecting;
        if (!listening) {
          gsap.to(stage, { rotateY: 0, rotateX: 0, duration: 0.6 });
        }
      }
    });
    io.observe(stage);

    window.addEventListener("mousemove", onMouseMove);
    return () => {
      window.removeEventListener("mousemove", onMouseMove);
      io.disconnect();
    };
  }, []);

  return (
    <div
      className="relative aspect-[4/5] w-full"
      style={{ perspective: "2000px" }}
    >
      <div
        ref={stageRef}
        className="relative h-full w-full"
        style={{ transformStyle: "preserve-3d", willChange: "transform" }}
      >
        {/* Papéis SOBRE a capa — translateZ maior que o cover (20px),
            papéis ficam à frente, espalhados como folhas soltas. */}
        <div
          className="absolute -left-[10%] top-[65%] h-[34%] w-[78%] border border-black/10 bg-[#EDE6D8] shadow-[0_22px_40px_rgba(0,0,0,0.55)]"
          style={{ transform: "translateZ(30px) rotate(-7deg)" }}
          aria-hidden="true"
        />
        <div
          className="absolute -right-[8%] top-[73%] h-[30%] w-[68%] border border-black/10 bg-[#EDE6D8] shadow-[0_22px_40px_rgba(0,0,0,0.55)]"
          style={{ transform: "translateZ(35px) rotate(6deg)" }}
          aria-hidden="true"
        />

        {/* Capa — papel kraft institucional (manila folder) com textura
            de fibra. Acabamento dourado discreto na borda. */}
        <div
          className="fm-paper-kraft absolute inset-0 flex flex-col justify-between border border-[#3a2614]/30 p-10 shadow-[0_30px_60px_rgba(0,0,0,0.55)]"
          style={{ transform: "translateZ(20px)" }}
        >
          <div className="flex justify-between font-mono text-[10px] tracking-[0.2em] text-[#1a0f05]/65">
            <div>
              DOSSIÊ <strong className="text-[#1a0f05]">Nº 001</strong>
            </div>
            <div className="text-right">
              CLASSIFICAÇÃO <strong className="text-[#1a0f05]">COHORT I</strong>
            </div>
          </div>

          <div className="my-10">
            <h2 className="font-serif text-4xl italic leading-none text-[#1a0f05]">
              A Escola do
              <br />
              <em className="text-amber not-italic">Promotor</em>
            </h2>
            <div className="bg-amber my-6 h-px w-10" />
            <p className="text-sm italic text-[#1a0f05]/70">
              Programa inaugural · Brasília · 2026
            </p>
          </div>

          <div className="flex justify-between font-mono text-[10px] tracking-[0.2em] text-[#1a0f05]/65">
            <div>
              ACESSO <strong className="text-[#1a0f05]">RESTRITO</strong>
            </div>
            <div className="text-right">
              INÍCIO <strong className="text-[#1a0f05]">11 AGO</strong>
            </div>
          </div>
        </div>

        {/* Labels overlay — uma por folha, centralizadas e seguindo a
            inclinação de cada papel (mesma bounding box e mesmo rotate
            do paper, com translateZ acima das folhas). */}
        <div
          className="text-carbon absolute left-[5%] top-[65%] flex h-[34%] w-[42%] items-center justify-center font-mono text-[10px] font-semibold tracking-[0.18em]"
          style={{ transform: "translateZ(45px) rotate(-7deg)" }}
        >
          <span className="whitespace-nowrap">
            ACESSO <strong className="font-bold">RESTRITO</strong>
          </span>
        </div>
        <div
          className="text-carbon absolute -right-[8%] top-[73%] flex h-[30%] w-[68%] items-center justify-center font-mono text-[11px] font-semibold tracking-[0.2em]"
          style={{ transform: "translateZ(45px) rotate(6deg)" }}
        >
          <span className="whitespace-nowrap">
            INÍCIO <strong className="font-bold">11 AGO</strong>
          </span>
        </div>

        {/* Selo MPDFT — mais à frente ainda */}
        <div
          className="bg-amber text-paper absolute -bottom-4 -right-4 flex h-16 w-16 items-center justify-center rounded-full font-serif text-xs italic shadow-xl"
          style={{ transform: "translateZ(50px)" }}
        >
          MPDFT
        </div>
      </div>
    </div>
  );
}
