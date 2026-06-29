"use client";

import { useEffect, useRef, useState } from "react";
import gsap from "gsap";

import { copy } from "@/config/copy";

/** Recorte da capa do Correio (manchete + layout) para textura da folha */
const DOSSIE_NEWSPAPER_TEXTURE = "/images/dossie/newspaper-correio-folha.jpg";

/**
 * Dossiê 3D — capa institucional com parallax no desktop (mouse).
 * No mobile: inclinação do aparelho via giroscópio (`deviceorientation`)
 * quando disponível; senão, animação automática de fallback.
 */
type Dossie3DProps = {
  /** Hero mobile — escala e tipografia reduzidas, animação touch. */
  compact?: boolean;
};

export function Dossie3D({ compact = false }: Dossie3DProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const stageRef = useRef<HTMLDivElement>(null);
  const [gyroHint, setGyroHint] = useState(() => {
    if (typeof window === "undefined") return false;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      return false;
    }
    const isTouch = window.matchMedia(
      "(hover: none), (pointer: coarse)",
    ).matches;
    const DOE = DeviceOrientationEvent as typeof DeviceOrientationEvent & {
      requestPermission?: () => Promise<PermissionState>;
    };
    return isTouch && typeof DOE.requestPermission === "function";
  });

  useEffect(() => {
    if (typeof window === "undefined") return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      gsap.set(".escaping-paper", { opacity: 1, x: 18, rotation: 2 });
      return;
    }

    const container = containerRef.current;
    const stage = stageRef.current;
    if (!container || !stage) return;

    const isTouch = window.matchMedia(
      "(hover: none), (pointer: coarse)",
    ).matches;

    const clamp = (v: number, min: number, max: number) =>
      Math.min(max, Math.max(min, v));

    const ctx = gsap.context(() => {
      if (isTouch) {
        const spreadX = compact ? 26 : 28;
        const spreadStep = compact ? 12 : 14;
        const maxTilt = compact ? 16 : 20;

        const paperCycle = gsap.timeline({ repeat: -1, repeatDelay: 1.8 });
        paperCycle
          .to(".escaping-paper", {
            opacity: 1,
            x: (i) => spreadX + i * spreadStep,
            rotation: (i) => 2 + i * 1.5,
            stagger: 0.07,
            duration: 0.85,
            ease: "back.out(1.25)",
          })
          .to(
            ".escaping-paper",
            {
              opacity: 0,
              x: 0,
              rotation: 0,
              stagger: 0.05,
              duration: 0.55,
              ease: "power2.inOut",
            },
            "+=1.6",
          );

        let gyroActive = false;
        let swayTween: gsap.core.Tween | null = null;
        let baseBeta: number | null = null;
        let baseGamma: number | null = null;
        let inView = true;

        const startSwayFallback = () => {
          if (gyroActive || swayTween) return;
          swayTween = gsap.to(stage, {
            rotateY: compact ? 5 : 10,
            rotateX: compact ? -2 : -5,
            duration: 3.4,
            ease: "sine.inOut",
            yoyo: true,
            repeat: -1,
          });
        };

        const onOrientation = (e: DeviceOrientationEvent) => {
          if (!inView || e.beta == null || e.gamma == null) return;

          if (baseBeta === null || baseGamma === null) {
            baseBeta = e.beta;
            baseGamma = e.gamma;
          }

          gyroActive = true;
          setGyroHint(false);
          swayTween?.kill();
          swayTween = null;

          const rotY = clamp((e.gamma - baseGamma) * 0.95, -maxTilt, maxTilt);
          const rotX = clamp(
            -(e.beta - baseBeta) * 0.72,
            -maxTilt * 0.75,
            maxTilt * 0.75,
          );

          gsap.to(stage, {
            rotateY: rotY,
            rotateX: rotX,
            duration: 0.35,
            ease: "power2.out",
            overwrite: true,
          });
        };

        const attachGyro = () => {
          if (typeof window === "undefined") return;
          window.addEventListener("deviceorientation", onOrientation, true);
          window.setTimeout(() => {
            if (!gyroActive) startSwayFallback();
          }, 1200);
        };

        const detachGyro = () => {
          window.removeEventListener("deviceorientation", onOrientation, true);
        };

        const requestGyroAccess = async () => {
          const DOE =
            DeviceOrientationEvent as typeof DeviceOrientationEvent & {
              requestPermission?: () => Promise<PermissionState>;
            };

          if (typeof DOE.requestPermission === "function") {
            setGyroHint(false);
            try {
              const state = await DOE.requestPermission();
              if (state === "granted") attachGyro();
              else startSwayFallback();
            } catch {
              startSwayFallback();
            }
            return;
          }

          setGyroHint(false);
          attachGyro();
        };

        const io = new IntersectionObserver((entries) => {
          inView = entries.some((entry) => entry.isIntersecting);
          if (!inView) {
            gsap.to(stage, { rotateY: 0, rotateX: 0, duration: 0.5 });
          }
        });
        io.observe(stage);

        const onRequestGyro = () => {
          void requestGyroAccess();
        };

        container.addEventListener("touchstart", onRequestGyro, {
          once: true,
          passive: true,
        });
        container.addEventListener("click", onRequestGyro, { once: true });
        void requestGyroAccess();

        return () => {
          paperCycle.kill();
          swayTween?.kill();
          detachGyro();
          io.disconnect();
          container.removeEventListener("touchstart", onRequestGyro);
          container.removeEventListener("click", onRequestGyro);
        };
      }

      let listening = true;

      const onMouseMove = (e: MouseEvent) => {
        if (!listening) return;
        const x = (e.clientX / window.innerWidth - 0.5) * 30;
        const y = (e.clientY / window.innerHeight - 0.5) * 30;
        gsap.to(stage, { rotateY: x, rotateX: -y, duration: 1 });
      };

      const onMouseEnter = () => {
        gsap.to(".escaping-paper", {
          x: (i) => {
            if (i === 0) return 48;
            if (i === 1) return 92;
            return 134;
          },
          y: (i) => {
            if (i === 0) return -16;
            if (i === 1) return 12;
            return 0;
          },
          rotation: (i) => {
            if (i === 0) return -11;
            if (i === 1) return 15;
            return 9;
          },
          opacity: 1,
          stagger: (i) => (i < 2 ? i * 0.07 : 0.14),
          duration: 0.8,
          ease: "back.out(1.55)",
        });
      };

      const onMouseLeave = () => {
        gsap.to(".escaping-paper", {
          x: 0,
          y: 0,
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
  }, [compact]);

  const paperPad = compact ? "0.75rem" : "1.5rem";
  const paperTop = (index: number) => {
    if (compact) return 15 + index * 15;
    if (index === 0) return 0;
    if (index === 1) return 18;
    return 30;
  };

  const paperRightClass = (index: number) => {
    if (compact) return "right-[-6%]";
    if (index === 0) return "right-[-2%]";
    if (index === 1) return "right-[-18%]";
    return "right-[-10%]";
  };

  return (
    <div
      ref={containerRef}
      className={
        compact
          ? "fm-a11y-no-scale relative mx-auto aspect-[4/5] w-full max-w-[280px] overflow-visible"
          : "fm-a11y-no-scale relative aspect-[4/5] w-full overflow-visible"
      }
      style={{ perspective: compact ? "1400px" : "2000px" }}
    >
      {gyroHint ? (
        <p
          className="pointer-events-none absolute inset-x-0 -bottom-7 z-20 text-center text-[10px] font-medium tracking-wide text-white/45"
          aria-live="polite"
        >
          {copy.dossie.gyroHint}
        </p>
      ) : null}
      <div
        ref={stageRef}
        className={`relative h-full w-full ${compact ? "origin-top scale-[0.96]" : ""}`}
        style={{ transformStyle: "preserve-3d", willChange: "transform" }}
      >
        {[...Array(3)].map((_, i) => {
          const isClipping = i === 1;
          const isNewspaper = i === 2;
          const isTexturePaper = isClipping || isNewspaper;
          return (
            <div
              key={i}
              className={`escaping-paper absolute h-[50%] w-[82%] border border-black/10 bg-[#FDFBF7] shadow-md ${paperRightClass(i)}`}
              style={{
                backgroundColor: isTexturePaper ? "#f3ece0" : "#FDFBF7",
                backgroundImage: isClipping
                  ? `url("https://bibdig.biblioteca.unesp.br/server/api/core/bitstreams/a588e871-dfbf-4260-9e4e-109e5ae42beb/content")`
                  : isNewspaper
                    ? `url("${DOSSIE_NEWSPAPER_TEXTURE}")`
                    : "none",
                backgroundSize: "cover",
                backgroundPosition:
                  isNewspaper && !compact ? "52% 48%" : "center",
                transform: `translateZ(${10 + i}px)`,
                transformOrigin:
                  !compact && i === 0
                    ? "18% 12%"
                    : !compact && i === 1
                      ? "28% 88%"
                      : "center center",
                top: `${paperTop(i)}%`,
                opacity: 0,
                padding: isTexturePaper ? "0" : paperPad,
                overflow: "hidden",
                filter: isTexturePaper ? "grayscale(1) contrast(1.1)" : "none",
              }}
              aria-hidden="true"
            >
              {i !== 1 && (
                <div
                  className={`absolute -top-2 left-6 z-10 rounded-full border-2 border-slate-400 bg-slate-300/80 shadow-sm ${compact ? "h-6 w-2" : "h-8 w-3"}`}
                />
              )}

              {isTexturePaper ? null : i === 0 ? (
                <div className="relative h-full w-full">
                  <div
                    className={`absolute top-0 -right-2 border border-black/20 bg-white p-1 shadow-sm contrast-125 grayscale ${compact ? "h-12 w-9" : "h-16 w-12"}`}
                  >
                    <img
                      src="/images/professor/flavio-avatar-64.jpg"
                      alt=""
                      className="h-full w-full object-cover"
                    />
                  </div>
                  <div className="space-y-3 pt-2 opacity-[0.08]">
                    <div className="h-1.5 w-[60%] bg-black" />
                    <div className="h-1.5 w-[55%] bg-black" />
                    <div className="h-1.5 w-[40%] bg-black" />
                  </div>
                </div>
              ) : null}
            </div>
          );
        })}

        <div
          className={`absolute overflow-hidden border border-black/10 bg-[#EDE6D8] shadow-[0_22px_40px_rgba(0,0,0,0.55)] ${
            compact
              ? "top-[70%] -left-[6%] h-[30%] w-[72%]"
              : "top-[74%] -left-[10%] h-[34%] w-[78%]"
          }`}
          style={{ transform: "translateZ(30px) rotate(-7deg)" }}
          aria-hidden="true"
        >
          <div
            className={`absolute -top-2 rounded-full border-2 border-slate-400 bg-slate-300/80 shadow-sm ${compact ? "left-[12%] h-8 w-2.5" : "left-[15%] h-12 w-4"}`}
          />
          {compact ? (
            <div className="absolute inset-0 flex items-center justify-center p-2">
              <div
                className="border-alerta-600 text-alerta-600 max-w-full rotate-[-6deg] border-[2px] px-1.5 py-0.5 text-center font-mono text-[8px] leading-tight font-black tracking-[0.04em] uppercase"
                style={{ WebkitTextStroke: "0.4px currentColor" }}
              >
                CONFIDENCIAL
              </div>
            </div>
          ) : null}
        </div>

        <div
          className={`absolute overflow-hidden border border-black/10 bg-[#EDE6D8] shadow-[0_22px_40px_rgba(0,0,0,0.55)] ${
            compact
              ? "top-[72%] -right-[4%] h-[34%] w-[74%]"
              : "top-[80%] -right-[8%] h-[30%] w-[68%]"
          }`}
          style={{ transform: "translateZ(35px) rotate(6deg)" }}
          aria-hidden="true"
        >
          <div
            className={`absolute -top-2 rounded-full border-2 border-slate-400 bg-slate-300/80 shadow-sm ${compact ? "right-[14%] h-8 w-2.5" : "right-[15%] h-12 w-4"}`}
          />
          {compact ? (
            <>
              <div className="absolute inset-0 flex flex-col items-center justify-center gap-0.5 px-2 pb-5 text-center font-mono font-bold text-[#1a0f05]">
                <span className="text-[8px] leading-none tracking-[0.12em]">
                  INÍCIO
                </span>
                <span className="text-[10px] leading-none font-extrabold tracking-[0.08em]">
                  11 AGOSTO
                </span>
              </div>
              <div
                className="bg-amber text-paper absolute bottom-1 left-1/2 flex h-7 w-7 -translate-x-1/2 items-center justify-center rounded-full font-serif text-[8px] italic shadow-md"
                style={{ transform: "translateZ(2px)" }}
              >
                {copy.dossie.sealLabel}
              </div>
            </>
          ) : null}
        </div>

        <div
          className={`fm-paper-kraft absolute inset-0 flex flex-col justify-between border border-[#3a2614]/30 shadow-[0_30px_60px_rgba(0,0,0,0.55)] ${compact ? "p-5" : "p-10"}`}
          style={{ transform: "translateZ(20px)" }}
        >
          <div
            className={`flex justify-between font-mono font-medium tracking-[0.2em] text-[#1a0f05]/80 ${compact ? "gap-2 text-[10px]" : "gap-4 text-[15px]"}`}
            style={{ WebkitTextStroke: "0.5px #1a0f05" }}
          >
            <div>
              DOSSIÊ <strong className="text-[#1a0f05]">Nº 001</strong>
            </div>
            <div className="text-right">
              CLASSIFICAÇÃO <strong className="text-[#1a0f05]">COHORT I</strong>
            </div>
          </div>

          <div
            className={`mx-auto w-full max-w-full px-1 text-center ${compact ? "my-3" : "my-6"}`}
          >
            <h2
              className={`mx-auto max-w-full font-serif leading-[1.02] text-[#1a0f05] italic ${compact ? "text-[1.65rem]" : "text-[clamp(1.75rem,5.2vw,3.35rem)]"}`}
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
            <div
              className={`bg-amber mx-auto h-px w-10 ${compact ? "my-3" : "my-6"}`}
            />
            <p
              className={`text-[#1a0f05]/85 italic ${compact ? "text-xs" : "text-lg"}`}
              style={{ WebkitTextStroke: "0.35px #1a0f05" }}
            >
              {copy.dossie.coverSubtitle}
            </p>
          </div>

          <div
            className={`flex justify-between gap-2 font-mono font-medium tracking-[0.2em] text-[#1a0f05]/80 ${compact ? "text-[10px]" : "text-[15px]"}`}
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

        {!compact ? (
          <>
            <div
              className="text-alerta-600 absolute top-[74%] left-[5%] flex h-[34%] w-[42%] items-center justify-center"
              style={{ transform: "translateZ(45px) rotate(-7deg)" }}
            >
              <div
                className="border-alerta-600 rotate-[-3deg] border-[2.5px] px-2 py-0.5 font-mono text-[15px] font-black tracking-[0.05em] uppercase shadow-[0_0_10px_rgba(184,50,58,0.15)]"
                style={{ WebkitTextStroke: "0.5px currentColor" }}
              >
                CONFIDENCIAL
              </div>
            </div>

            <div
              className="absolute top-[80%] -right-[8%] flex h-[30%] w-[68%] items-center justify-center font-mono text-[14px] font-bold tracking-[0.2em] text-[#1a0f05]"
              style={{
                transform: "translateZ(45px) rotate(6deg)",
                WebkitTextStroke: "0.5px #1a0f05",
              }}
            >
              <span className="whitespace-nowrap">
                INÍCIO <strong className="font-extrabold">11 AGO</strong>
              </span>
            </div>

            <div
              className="bg-amber text-paper absolute -right-4 -bottom-4 flex h-16 w-16 items-center justify-center rounded-full font-serif text-xs italic shadow-xl"
              style={{ transform: "translateZ(50px)" }}
            >
              {copy.dossie.sealLabel}
            </div>
          </>
        ) : null}
      </div>
    </div>
  );
}
