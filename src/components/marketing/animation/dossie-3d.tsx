"use client";

import { useEffect, useRef } from "react";
import gsap from "gsap";

import { copy } from "@/config/copy";

/**
 * Dossiê 3D — capa institucional com parallax acompanhando o mouse.
 *
 * Stacking em contexto 3D (`preserve-3d`) ignora z-index — a ordem é
 * por translateZ. Por isso a capa usa translateZ positivo, ficando na
 * frente das folhas. As folhas ficam atrás (translateZ:0). O selo
 * fica ainda mais à frente (translateZ maior).
 */
export function Dossie3D() {
  const containerRef = useRef<HTMLDivElement>(null);
  const stageRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (typeof window === "undefined") return;
    if (window.matchMedia("(hover: none), (pointer: coarse)").matches) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const container = containerRef.current;
    const stage = stageRef.current;
    if (!container || !stage) return;

    const ctx = gsap.context(() => {
      let listening = true;

      const onMouseMove = (e: MouseEvent) => {
        if (!listening) return;
        const x = (e.clientX / window.innerWidth - 0.5) * 30;
        const y = (e.clientY / window.innerHeight - 0.5) * 30;
        gsap.to(stage, { rotateY: x, rotateX: -y, duration: 1 });
      };

      const onMouseEnter = () => {
        gsap.to(".escaping-paper", {
          x: (i) => 60 + i * 20,
          rotation: (i) => 4 + i * 3,
          opacity: 1,
          stagger: 0.04,
          duration: 0.7,
          ease: "back.out(1.4)",
        });
      };

      const onMouseLeave = () => {
        gsap.to(".escaping-paper", {
          x: 0,
          rotation: 0,
          opacity: 0,
          stagger: 0.02,
          duration: 0.5,
          ease: "power2.inOut",
        });
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
      container.addEventListener("mouseenter", onMouseEnter);
      container.addEventListener("mouseleave", onMouseLeave);

      return () => {
        window.removeEventListener("mousemove", onMouseMove);
        container.removeEventListener("mouseenter", onMouseEnter);
        container.removeEventListener("mouseleave", onMouseLeave);
        io.disconnect();
      };
    }, container);

    return () => ctx.revert();
  }, []);

  return (
    <div
      ref={containerRef}
      className="relative aspect-[4/5] w-full"
      style={{ perspective: "2000px" }}
    >
      <div
        ref={stageRef}
        className="relative h-full w-full"
        style={{ transformStyle: "preserve-3d", willChange: "transform" }}
      >
        {/* Documentos internos que "escapolem" pela lateral (hover) */}
        {[...Array(3)].map((_, i) => {
          const isClipping = i === 1; // O do meio será um recorte de jornal
          return (
            <div
              key={i}
              className="escaping-paper absolute right-0 top-[15%] h-[50%] w-[70%] border border-black/10 shadow-md"
              style={{
                backgroundColor: isClipping ? "#f3ece0" : "#FDFBF7",
                backgroundImage: isClipping
                  ? `url("https://bibdig.biblioteca.unesp.br/server/api/core/bitstreams/a588e871-dfbf-4260-9e4e-109e5ae42beb/content")`
                  : "none",
                backgroundSize: "cover",
                backgroundPosition: "center",
                transform: `translateZ(${10 + i}px)`,
                top: `${15 + i * 15}%`,
                opacity: 0,
                padding: isClipping ? "0" : "1.5rem",
                overflow: "hidden",
                filter: isClipping ? "grayscale(1) contrast(1.1)" : "none",
              }}
              aria-hidden="true"
            >
              {/* Clip de papel (apenas no primeiro e no terceiro) */}
              {i !== 1 && (
                <div className="absolute -top-2 left-8 z-10 h-8 w-3 rounded-full border-2 border-slate-400 bg-slate-300/50 shadow-sm" />
              )}

              {isClipping ? null : i === 0 ? (
                /* Documento com Foto 3x4 clipada */
                <div className="relative h-full w-full">
                  <div className="absolute -right-2 top-0 h-16 w-12 border border-black/20 bg-white p-1 shadow-sm grayscale contrast-125">
                    <img
                      src="/images/professor/flavio-avatar-64.jpg"
                      alt=""
                      className="h-full w-full object-cover opacity-80"
                    />
                  </div>
                  <div className="space-y-3 pt-2 opacity-[0.08]">
                    <div className="h-1.5 w-[60%] bg-black" />
                    <div className="h-1.5 w-[55%] bg-black" />
                    <div className="h-1.5 w-[40%] bg-black" />
                    <div className="pt-8">
                      <div className="h-1.5 w-full bg-black" />
                      <div className="h-1.5 w-[85%] bg-black" />
                    </div>
                  </div>
                </div>
              ) : (
                /* Documento com foto de "evidência" maior */
                <div className="flex h-full flex-col gap-3">
                  <div className="h-24 w-full border border-black/10 bg-black/5 p-1 grayscale contrast-150">
                    <img
                      src="/images/professor/flavio-hero.png"
                      alt=""
                      className="h-full w-full object-cover opacity-70 mix-blend-multiply"
                    />
                  </div>
                  <div className="space-y-2 opacity-[0.08]">
                    <div className="h-1.5 w-full bg-black" />
                    <div className="h-1.5 w-[70%] bg-black" />
                  </div>
                </div>
              )}
            </div>
          );
        })}

        {/* Papéis SOBRE a capa — translateZ maior que o cover (20px) */}
        <div
          className="absolute -left-[10%] top-[74%] h-[34%] w-[78%] border border-black/10 bg-[#EDE6D8] shadow-[0_22px_40px_rgba(0,0,0,0.55)]"
          style={{ transform: "translateZ(30px) rotate(-7deg)" }}
          aria-hidden="true"
        >
          {/* Clip de papel */}
          <div className="absolute -top-3 left-[15%] h-12 w-4 rounded-full border-2 border-slate-400/80 bg-slate-300/40 shadow-sm" />
        </div>
        <div
          className="absolute -right-[8%] top-[80%] h-[30%] w-[68%] border border-black/10 bg-[#EDE6D8] shadow-[0_22px_40px_rgba(0,0,0,0.55)]"
          style={{ transform: "translateZ(35px) rotate(6deg)" }}
          aria-hidden="true"
        >
          {/* Clip de papel */}
          <div className="absolute -top-3 right-[15%] h-12 w-4 rounded-full border-2 border-slate-400/80 bg-slate-300/40 shadow-sm" />
        </div>

        {/* Capa — papel kraft institucional (manila folder) com textura
            de fibra. Acabamento dourado discreto na borda. */}
        <div
          className="fm-paper-kraft absolute inset-0 flex flex-col justify-between border border-[#3a2614]/30 p-10 shadow-[0_30px_60px_rgba(0,0,0,0.55)]"
          style={{ transform: "translateZ(20px)" }}
        >
          <div
            className="flex justify-between gap-4 font-mono text-[15px] font-medium tracking-[0.2em] text-[#1a0f05]/80"
            style={{ WebkitTextStroke: "0.5px #1a0f05" }}
          >
            <div>
              DOSSIÊ <strong className="text-[#1a0f05]">Nº 001</strong>
            </div>
            <div className="text-right">
              CLASSIFICAÇÃO <strong className="text-[#1a0f05]">COHORT I</strong>
            </div>
          </div>

          <div className="my-6 text-center">
            <h2
              className="font-serif text-6xl italic leading-none text-[#1a0f05]"
              style={{ WebkitTextStroke: "0.7px #1a0f05" }}
            >
              {copy.dossie.coverTitle1}
              <br />
              <em
                className="text-amber not-italic"
                style={{ WebkitTextStroke: "0.7px var(--color-amber)" }}
              >
                {copy.dossie.coverTitleEmphasis}
              </em>
            </h2>
            <div className="bg-amber mx-auto my-6 h-px w-10" />
            <p
              className="text-lg italic text-[#1a0f05]/85"
              style={{ WebkitTextStroke: "0.35px #1a0f05" }}
            >
              {copy.dossie.coverSubtitle}
            </p>
          </div>

          <div
            className="flex justify-between gap-4 font-mono text-[15px] font-medium tracking-[0.2em] text-[#1a0f05]/80"
            style={{ WebkitTextStroke: "0.5px #1a0f05" }}
          >
            <div>
              <strong className="text-[#1a0f05]">CONFIDENCIAL</strong>
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
          className="text-alerta-600 absolute left-[5%] top-[74%] flex h-[34%] w-[42%] items-center justify-center"
          style={{
            transform: "translateZ(45px) rotate(-7deg)",
          }}
        >
          <div
            className="border-[2.5px] border-alerta-600/70 px-2.5 py-0.5 font-mono text-[15px] font-black tracking-[0.05em] uppercase opacity-90 rotate-[-3deg] shadow-[0_0_10px_rgba(184,50,58,0.1)]"
            style={{ WebkitTextStroke: "0.5px currentColor" }}
          >
            CONFIDENCIAL
          </div>
        </div>
        <div
          className="text-carbon absolute -right-[8%] top-[80%] flex h-[30%] w-[68%] items-center justify-center font-mono text-[14px] font-bold tracking-[0.2em]"
          style={{
            transform: "translateZ(45px) rotate(6deg)",
            WebkitTextStroke: "0.5px currentColor",
          }}
        >
          <span className="whitespace-nowrap">
            INÍCIO <strong className="font-extrabold">11 AGO</strong>
          </span>
        </div>

        {/* Selo editorial — mais à frente ainda */}
        <div
          className="bg-amber text-paper absolute -bottom-4 -right-4 flex h-16 w-16 items-center justify-center rounded-full font-serif text-xs italic shadow-xl"
          style={{ transform: "translateZ(50px)" }}
        >
          {copy.dossie.sealLabel}
        </div>
      </div>
    </div>
  );
}
