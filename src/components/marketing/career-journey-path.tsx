"use client";

import { useEffect, useRef, useState } from "react";
import gsap from "gsap";
import { MotionPathPlugin } from "gsap/MotionPathPlugin";

import {
  CAREER_JOURNEY_PATH,
  CAREER_JOURNEY_SPAN,
  CAREER_JOURNEY_VIEWBOX,
  careerMilestones,
} from "@/data/career-journey";

gsap.registerPlugin(MotionPathPlugin);

const WALK_LOOP_SECONDS = 30;
const ACCESSORY_ORDER = [
  "graduacao",
  "promotor",
  "mestrado",
  "enm",
  "revista",
  "obra",
  "ouvidor",
] as const;

/**
 * HUD Holográfico: Exibe o texto do marco ativo sem poluir o centro.
 */
function HolographicDisplay({ 
  activeIndex, 
  visible 
}: { 
  activeIndex: number;
  visible: boolean;
}) {
  const m = careerMilestones[activeIndex];
  if (!m) return null;

  return (
    <div 
      className={`absolute inset-x-0 bottom-6 z-20 flex flex-col items-center px-6 transition-all duration-700 ease-out ${
        visible ? "translate-y-0 opacity-100" : "translate-y-4 opacity-0"
      }`}
    >
      <div className="border-amber/50 bg-carbon/90 w-full max-w-[280px] rounded-xl border p-4 shadow-[0_0_30px_rgba(0,0,0,0.6)] backdrop-blur-xl">
        <div className="flex items-center gap-3 border-b border-amber/30 pb-2 mb-2">
          <span className="text-amber fm-mono text-xl font-black leading-none tracking-tighter drop-shadow-[0_0_8px_rgba(221,173,12,0.4)]">
            {m.year}
          </span>
          <div className="h-px flex-1 bg-gradient-to-r from-amber/60 via-amber/20 to-transparent" />
        </div>
        <p className="text-white text-[15px] font-semibold leading-tight drop-shadow-sm">
          {m.text}
        </p>
        <div className="mt-3 flex gap-1">
          {careerMilestones.map((_, i) => (
            <div 
              key={i} 
              className={`h-1 flex-1 rounded-full transition-all duration-500 ${
                i === activeIndex 
                  ? "bg-amber shadow-[0_0_10px_rgba(221,173,12,0.6)]" 
                  : i < activeIndex ? "bg-amber/40" : "bg-white/10"
              }`}
            />
          ))}
        </div>
      </div>
      {/* Decorative scanning line */}
      <div className="absolute top-0 h-[2px] w-full max-w-[280px] bg-gradient-to-r from-transparent via-amber/60 to-transparent animate-pulse" />
    </div>
  );
}

function JourneyFigure({ stage }: { stage: number }) {
  const show = (id: (typeof ACCESSORY_ORDER)[number]) =>
    ACCESSORY_ORDER.indexOf(id) <= stage;

  return (
    <g className="journey-figure" aria-hidden>
      {/* Shadow - At anchor 0,0 */}
      <ellipse
        className="journey-shadow"
        cx="0"
        cy="0"
        rx="12"
        ry="3"
        fill="rgba(0,0,0,0.4)"
        filter="url(#jf-shadow-blur)"
      />

      {/* The Animated GIF Character - Feet at 0,0 */}
      <image
        href="/images/journey/walking_man.gif"
        x="-18"
        y="-54"
        width="36"
        height="54"
        preserveAspectRatio="xMidYMid meet"
      />

      {/* Accessories Overlay - Repositioned to avoid overlapping the character */}
      <g className="journey-accessories">
        {show("graduacao") && (
          <g transform="translate(-32, -45)" style={{ filter: "drop-shadow(0 0 4px rgba(255,255,255,0.4))" }}>
            {/* Stylized Mortarboard (Cap) - Floating to the Left */}
            <path d="M 0 4 L 10 0 L 20 4 L 10 8 Z" fill="#1a1a1a" stroke="url(#jf-gold-stroke)" strokeWidth="0.8" />
            <path d="M 3 5 L 3 8 Q 10 11 17 8 L 17 5" fill="#1a1a1a" stroke="url(#jf-gold-stroke)" strokeWidth="0.8" />
            <circle cx="20" cy="8" r="1" fill="#ddad0c" />
          </g>
        )}
        {show("promotor") && (
          <g transform="translate(24, -36)" style={{ filter: "drop-shadow(0 0 5px rgba(221,173,12,0.6))" }}>
            {/* Premium Gold Justice Emoji (⚖️) Reconstruction */}
            {/* Base & Pillar */}
            <path d="M -5 12 L 5 12 L 4 11 L -4 11 Z" fill="url(#jf-gold-stroke)" />
            <path d="M -1.5 11 L 1.5 11 L 1 -2 L -1 -2 Z" fill="url(#jf-gold-stroke)" />
            <circle cy="-2" r="2.5" fill="url(#jf-gold-stroke)" />
            
            {/* Crossbeam */}
            <path d="M -12 -1 Q 0 -3 12 -1" fill="none" stroke="url(#jf-gold-stroke)" strokeWidth="1.8" strokeLinecap="round" />
            
            {/* Left Pan */}
            <g transform="translate(-12, -1)">
              <path d="M -0.5 0 L -3.5 6 M 0.5 0 L 3.5 6" stroke="url(#jf-gold-stroke)" strokeWidth="0.6" />
              <path d="M -4 6 Q 0 9 4 6 Z" fill="url(#jf-gold-stroke)" />
            </g>
            
            {/* Right Pan */}
            <g transform="translate(12, -1)">
              <path d="M -0.5 0 L -3.5 6 M 0.5 0 L 3.5 6" stroke="url(#jf-gold-stroke)" strokeWidth="0.6" />
              <path d="M -4 6 Q 0 9 4 6 Z" fill="url(#jf-gold-stroke)" />
            </g>
          </g>
        )}
        {show("mestrado") && (
          <g transform="translate(-28, -20)" style={{ filter: "drop-shadow(0 0 4px rgba(221,173,12,0.3))" }}>
            {/* Elegant Hardbound Book - Floating Bottom Left */}
            <rect x="-8" y="0" width="16" height="11" rx="1" fill="url(#jf-robe-back)" stroke="url(#jf-gold-stroke)" strokeWidth="0.7" />
            <path d="M -5 2 L -5 9" fill="none" stroke="url(#jf-gold-stroke)" strokeWidth="1.2" opacity="0.6" />
          </g>
        )}
        {show("ouvidor") && (
          <g transform="translate(22, -15)" style={{ filter: "drop-shadow(0 0 6px rgba(221,173,12,0.4))" }}>
            {/* Modern Shield / Ombudsman Crest - Floating Bottom Right */}
            <path d="M -8 0 L 8 0 L 8 6 Q 8 12 0 15 Q -8 12 -8 6 Z" fill="url(#jf-robe-front)" stroke="url(#jf-gold-stroke)" strokeWidth="0.8" />
            <circle cy="10" r="1.5" fill="#ffd700" />
          </g>
        )}
      </g>

      {/* Dynamic Halo */}
      <circle cy="-24" r="22" fill="none" stroke="url(#jf-gold-stroke)" strokeWidth="0.3" opacity="0.12">
        <animate attributeName="opacity" values="0.12;0.04;0.12" dur="4s" repeatCount="indefinite" />
        <animate attributeName="r" values="22;25;22" dur="4s" repeatCount="indefinite" />
      </circle>
    </g>
  );
}

/** Pseudoaleatório determinístico (mesmo valor no SSR e no cliente). */
function seededUnit(seed: number) {
  const x = Math.sin(seed * 12.9898) * 43758.5453;
  return x - Math.floor(x);
}

function particleProps(index: number) {
  const s = index * 6.28318 + 1.41;
  return {
    r: seededUnit(s + 1) * 1.5 + 0.5,
    opacity: seededUnit(s + 2) * 0.5 + 0.2,
    fromX: seededUnit(s + 3) * 360,
    toX: seededUnit(s + 4) * 360,
    durX: seededUnit(s + 5) * 10 + 10,
    durY: seededUnit(s + 6) * 15 + 10,
  };
}

/**
 * Sistema de Partículas para atmosfera
 */
function Particles({ count = 15 }: { count?: number }) {
  const particles = Array.from({ length: count }, (_, i) => particleProps(i));

  return (
    <g className="particles" opacity="0.4">
      {particles.map((p, i) => (
        <circle
          key={i}
          r={p.r}
          fill="#ddad0c"
          opacity={p.opacity}
        >
          <animate
            attributeName="cx"
            from={p.fromX}
            to={p.toX}
            dur={`${p.durX}s`}
            repeatCount="indefinite"
          />
          <animate
            attributeName="cy"
            from={480}
            to={-20}
            dur={`${p.durY}s`}
            repeatCount="indefinite"
          />
        </circle>
      ))}
    </g>
  );
}

function nearestMilestoneIndex(progress: number, thresholds: number[]) {
  let best = 0;
  let bestDist = Infinity;
  for (let i = 0; i < thresholds.length; i++) {
    const d = Math.abs(progress - thresholds[i]!);
    if (d < bestDist) {
      bestDist = d;
      best = i;
    }
  }
  return best;
}

function computeMilestoneThresholds(pathEl: SVGPathElement) {
  const len = pathEl.getTotalLength();
  return careerMilestones.map((m) => {
    let bestT = 0;
    let bestD = Infinity;
    for (let s = 0; s <= 500; s++) {
      const t = s / 500;
      const p = pathEl.getPointAtLength(t * len);
      const d = (p.x - m.x) ** 2 + (p.y - m.y) ** 2;
      if (d < bestD) {
        bestD = d;
        bestT = t;
      }
    }
    return bestT;
  });
}

export function CareerJourneyPath() {
  const rootRef = useRef<HTMLDivElement>(null);
  const figureWrapRef = useRef<SVGGElement>(null);
  const pathRef = useRef<SVGPathElement>(null);
  const [activeIndex, setActiveIndex] = useState(0);
  const [iconIndex, setIconIndex] = useState(0);
  const [isHudVisible, setIsHudVisible] = useState(true);
  const milestoneThresholdsRef = useRef<number[]>([]);
  const activeIndexRef = useRef(0);
  const iconIndexRef = useRef(0);

  useEffect(() => {
    const root = rootRef.current;
    const figureWrap = figureWrapRef.current;
    const pathEl = pathRef.current;
    if (!root || !figureWrap || !pathEl) return;

    milestoneThresholdsRef.current = computeMilestoneThresholds(pathEl);

    const ctx = gsap.context(() => {
      // Path Travel Animation
      const travel = gsap.to(figureWrap, {
        motionPath: {
          path: pathEl,
          align: pathEl,
          alignOrigin: [0.5, 1.0],
          autoRotate: false,
        },
        duration: WALK_LOOP_SECONDS,
        ease: "none",
        repeat: -1,
        onUpdate: () => {
          const raw = travel.progress();
          const len = pathEl.getTotalLength();
          
          // Fixed Scale
          const baseScale = 1.8;

          // Find Nearest Milestone
          const idx = nearestMilestoneIndex(raw, milestoneThresholdsRef.current);
          if (idx !== activeIndexRef.current) {
            activeIndexRef.current = idx;
            setActiveIndex(idx);
          }

          // Icon Trigger: 2 seconds early offset
          const iconProgressOffset = 2 / WALK_LOOP_SECONDS;
          const nextIdx = nearestMilestoneIndex(raw + iconProgressOffset, milestoneThresholdsRef.current);
          if (nextIdx !== iconIndexRef.current) {
            iconIndexRef.current = nextIdx;
            setIconIndex(nextIdx);
          }

          // Horizontal flip
          const p = pathEl.getPointAtLength(raw * len);
          const pNext = pathEl.getPointAtLength(((raw + 0.005) % 1) * len);
          const isFacingLeft = pNext.x < p.x;

          gsap.set(figureWrap, { 
            scaleY: baseScale,
            scaleX: isFacingLeft ? -baseScale : baseScale
          });
        },
      });

      return () => {
        travel.kill();
      };
    }, root);

    return () => ctx.revert();
  }, []);

  const { w, h } = CAREER_JOURNEY_VIEWBOX;

  return (
    <section
      ref={rootRef}
      className="bg-carbon/10 border-amber/20 relative mt-4 overflow-hidden rounded-2xl border aspect-[3/5]"
    >
      {/* Immersive Background */}
      <div className="absolute inset-0 bg-gradient-to-b from-carbon/40 via-carbon/10 to-carbon/60 pointer-events-none" />
      
      <div className="relative z-10 p-5">
        <header className="flex items-center justify-between">
          <p className="text-amber fm-mono text-[11px] font-bold uppercase tracking-[0.2em]">
            {CAREER_JOURNEY_SPAN.title}
          </p>
          <div className="h-1.5 w-1.5 rounded-full bg-amber animate-ping" />
        </header>
      </div>

      <svg
        viewBox={`0 0 ${w} ${h}`}
        className="absolute inset-0 h-full w-full"
        preserveAspectRatio="xMidYMid slice"
        overflow="visible"
      >
        <defs>
          <filter id="spiral-glow" x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur stdDeviation="4" result="blur" />
            <feComposite in="SourceGraphic" in2="blur" operator="over" />
          </filter>
          <filter id="jf-shadow-blur" x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur in="SourceGraphic" stdDeviation="3" />
          </filter>
          <linearGradient id="spiral-grad" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#ffec8b" />
            <stop offset="50%" stopColor="#ddad0c" stopOpacity="0.6" />
            <stop offset="100%" stopColor="#ddad0c" stopOpacity="0.1" />
          </linearGradient>
          <linearGradient id="jf-gold-stroke" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#ffec8b" />
            <stop offset="50%" stopColor="#ddad0c" />
            <stop offset="100%" stopColor="#a67c00" />
          </linearGradient>
          <radialGradient id="jf-skin" cx="35%" cy="30%" r="70%">
            <stop offset="0%" stopColor="#fff5e6" />
            <stop offset="100%" stopColor="#e6c49c" />
          </radialGradient>
          <linearGradient id="jf-robe-front" x1="0" y1="-10" x2="0" y2="16" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#25518b" />
            <stop offset="100%" stopColor="#0e2547" />
          </linearGradient>
          <linearGradient id="jf-robe-back" x1="0" y1="-12" x2="0" y2="18" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#0d1f3b" />
            <stop offset="100%" stopColor="#030812" />
          </linearGradient>
          <linearGradient id="jf-tie" x1="0" y1="1" x2="0" y2="11" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#ffd700" />
            <stop offset="100%" stopColor="#a67c00" />
          </linearGradient>
          <linearGradient id="jf-badge" x1="0" y1="-20" x2="0" y2="-10" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#ffe44d" />
            <stop offset="100%" stopColor="#b8860b" />
          </linearGradient>
        </defs>

        <Particles count={15} />

        {/* The Spiral Path */}
        <path
          ref={pathRef}
          d={CAREER_JOURNEY_PATH}
          fill="none"
          stroke="url(#spiral-grad)"
          strokeWidth="2"
          strokeDasharray="4 8"
          strokeLinecap="round"
          style={{ filter: "url(#spiral-glow)" }}
          opacity="0.4"
        />

        {/* Milestone Markers */}
        {careerMilestones.map((m, i) => {
          const isCurrent = i === activeIndex;
          const isLeft = m.x < 180;
          return (
            <g key={m.id} className="transition-all duration-500" style={{ opacity: i <= activeIndex ? 1 : 0.2 }}>
              <circle
                cx={m.x}
                cy={m.y}
                r={isCurrent ? 12 : 6}
                fill={isCurrent ? "#ddad0c" : "none"}
                stroke="#ddad0c"
                strokeWidth={isCurrent ? 4 : 1.5}
              />
              {isCurrent && (
                <circle cx={m.x} cy={m.y} r={20} fill="none" stroke="#ddad0c" strokeWidth="1" opacity="0.5">
                  <animate attributeName="r" values="12;24;12" dur="2s" repeatCount="indefinite" />
                  <animate attributeName="opacity" values="0.5;0;0.5" dur="2s" repeatCount="indefinite" />
                </circle>
              )}
              {/* Year Label - Positioned according to user markings */}
              <text
                x={isLeft ? m.x - 22 : m.x + 22}
                y={m.y + 6}
                textAnchor={isLeft ? "end" : "start"}
                fill={isCurrent ? "#ffec8b" : "#94a3b8"}
                fontSize="12"
                fontWeight="800"
                style={{ 
                  fontFamily: "var(--font-mono, monospace)",
                  textShadow: isCurrent ? "0 0 8px rgba(221, 173, 12, 0.6)" : "none"
                }}
              >
                {m.year}
              </text>
            </g>
          );
        })}

        {/* Character Figure */}
        <g ref={figureWrapRef}>
          <JourneyFigure stage={iconIndex} />
        </g>
      </svg>

      {/* Holographic HUD */}
      <HolographicDisplay 
        activeIndex={activeIndex} 
        visible={isHudVisible} 
      />

      <div className="absolute top-4 right-4 z-20">
        <button 
          onClick={() => setIsHudVisible(!isHudVisible)}
          className="text-amber/60 hover:text-amber fm-mono text-[10px] uppercase tracking-wider transition-colors"
        >
          {isHudVisible ? "[ Esconder HUD ]" : "[ Mostrar HUD ]"}
        </button>
      </div>
    </section>
  );
}
