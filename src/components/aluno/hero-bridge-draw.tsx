"use client";

import { useId, useLayoutEffect, useRef } from "react";

import bridgeArt from "@/data/bridge-art-paths.json";
import { siteConfig } from "@/config/site";

const STAGGER_MS = 145;
const DRAW_MS = 5800;
const HOLD_COMPLETE_MS = 2000;

const MASK_STROKE_WIDTH = 4;
const GLOW_STROKE_WIDTH = 1.35;

/** Passos do traço — ritmo calmo, com pausas no início e no fim. */
const HAND_DRAW_STEPS = [
  0, 0.06, 0.14, 0.26, 0.4, 0.55, 0.7, 0.84, 0.94, 1,
] as const;
const HAND_DRAW_EASING = "cubic-bezier(0.42, 0, 0.14, 1)";

type Props = {
  className?: string;
};

type StrokeTiming = {
  drawDelay: number;
  drawMs: number;
  drawEnd: number;
  staggerMs: number;
  eraseDelay: number;
  eraseMs: number;
  eraseEnd: number;
};

/** Progresso ao longo do traço — início e fim mais lentos (construção com calma). */
function handDrawProgress(linearT: number): number {
  if (linearT <= 0) return 0;
  if (linearT >= 1) return 1;
  if (linearT < 0.24) return (linearT / 0.24) * 0.055;
  if (linearT < 0.64) {
    const u = (linearT - 0.24) / 0.4;
    return 0.055 + u * 0.5;
  }
  const u = (linearT - 0.64) / 0.36;
  return 0.555 + (1 - (1 - u) ** 3) * 0.445;
}

function strokeTiming(
  index: number,
  pathLength: number,
): {
  staggerMs: number;
  drawMs: number;
} {
  const seed = (index * 19 + 5) % 13;
  const durationMult = 0.94 + (seed / 13) * 0.18;
  const lengthFactor = 0.94 + Math.min(pathLength, 900) / 3800;
  const staggerJitter = ((index * 11 + 2) % 9) - 4;
  const penLift =
    index > 0 && index % 11 === 0 ? 220 : index % 7 === 0 ? 130 : 0;

  return {
    staggerMs: STAGGER_MS + staggerJitter * 7 + penLift,
    drawMs: Math.round(DRAW_MS * durationMult * lengthFactor),
  };
}

function offsetAt(cycleMs: number, ms: number): number {
  return ms / cycleMs;
}

/** Mesmos passos e curva do desenho, aplicados a construir ou apagar um traço. */
function appendHandStrokeKeyframes(
  kf: Keyframe[],
  len: number,
  phaseStartMs: number,
  phaseDurationMs: number,
  cycleMs: number,
  mode: "draw" | "erase",
): void {
  const phaseEndMs = phaseStartMs + phaseDurationMs;

  if (mode === "draw") {
    kf.push({
      strokeDashoffset: len,
      offset: offsetAt(cycleMs, phaseStartMs),
    });
  } else {
    kf.push({
      strokeDashoffset: 0,
      offset: offsetAt(cycleMs, phaseStartMs),
    });
  }

  for (let i = 1; i < HAND_DRAW_STEPS.length; i++) {
    const step = HAND_DRAW_STEPS[i];
    const t = phaseStartMs + phaseDurationMs * step;
    const progress = handDrawProgress(step);
    const dashOffset = mode === "draw" ? len * (1 - progress) : len * progress;

    kf.push({
      strokeDashoffset: dashOffset,
      offset: offsetAt(cycleMs, t),
      easing: HAND_DRAW_EASING,
    });
  }

  kf.push({
    strokeDashoffset: mode === "draw" ? 0 : len,
    offset: offsetAt(cycleMs, phaseEndMs),
    easing: HAND_DRAW_EASING,
  });
}

function appendHandGlowStrokeKeyframes(
  kf: Keyframe[],
  len: number,
  phaseStartMs: number,
  phaseDurationMs: number,
  cycleMs: number,
  mode: "draw" | "erase",
): void {
  const phaseEndMs = phaseStartMs + phaseDurationMs;

  if (mode === "draw") {
    kf.push({
      strokeDashoffset: len,
      opacity: 0.12,
      strokeWidth: GLOW_STROKE_WIDTH * 0.85,
      offset: offsetAt(cycleMs, phaseStartMs),
    });
  } else {
    kf.push({
      strokeDashoffset: 0,
      opacity: 0.12,
      strokeWidth: GLOW_STROKE_WIDTH * 0.85,
      offset: offsetAt(cycleMs, phaseStartMs),
    });
  }

  for (let i = 1; i < HAND_DRAW_STEPS.length; i++) {
    const step = HAND_DRAW_STEPS[i];
    const t = phaseStartMs + phaseDurationMs * step;
    const progress = handDrawProgress(step);
    const visible = mode === "draw" ? progress : 1 - progress;
    const pressure = 0.35 + visible * 0.65;
    const width =
      GLOW_STROKE_WIDTH * (0.92 + Math.sin(visible * Math.PI) * 0.38);
    const dashOffset = mode === "draw" ? len * (1 - progress) : len * progress;

    kf.push({
      strokeDashoffset: dashOffset,
      opacity: 0.25 + pressure * 0.78,
      strokeWidth: width,
      offset: offsetAt(cycleMs, t),
      easing: HAND_DRAW_EASING,
    });
  }

  kf.push({
    strokeDashoffset: mode === "draw" ? 0 : len,
    opacity: mode === "draw" ? 1 : 0,
    strokeWidth: GLOW_STROKE_WIDTH * (mode === "draw" ? 1.15 : 1),
    offset: offsetAt(cycleMs, phaseEndMs),
    easing: HAND_DRAW_EASING,
  });
}

function buildHandDrawKeyframes(
  len: number,
  timing: StrokeTiming,
  cycleMs: number,
): Keyframe[] {
  const { drawDelay, drawMs, drawEnd, eraseDelay, eraseMs, eraseEnd } = timing;
  const kf: Keyframe[] = [{ strokeDashoffset: len, offset: 0 }];

  appendHandStrokeKeyframes(kf, len, drawDelay, drawMs, cycleMs, "draw");

  kf.push(
    { strokeDashoffset: 0, offset: offsetAt(cycleMs, drawEnd) },
    { strokeDashoffset: 0, offset: offsetAt(cycleMs, eraseDelay) },
  );

  appendHandStrokeKeyframes(kf, len, eraseDelay, eraseMs, cycleMs, "erase");

  kf.push(
    { strokeDashoffset: len, offset: offsetAt(cycleMs, eraseEnd) },
    { strokeDashoffset: len, offset: 1 },
  );

  return kf;
}

function buildHandGlowKeyframes(
  len: number,
  timing: StrokeTiming,
  cycleMs: number,
): Keyframe[] {
  const { drawDelay, drawMs, drawEnd, eraseDelay, eraseMs, eraseEnd } = timing;
  const kf: Keyframe[] = [
    {
      strokeDashoffset: len,
      opacity: 0,
      strokeWidth: GLOW_STROKE_WIDTH,
      offset: 0,
    },
  ];

  appendHandGlowStrokeKeyframes(kf, len, drawDelay, drawMs, cycleMs, "draw");

  kf.push(
    {
      strokeDashoffset: 0,
      opacity: 0,
      strokeWidth: GLOW_STROKE_WIDTH,
      offset: offsetAt(cycleMs, drawEnd),
    },
    {
      strokeDashoffset: 0,
      opacity: 0,
      offset: offsetAt(cycleMs, eraseDelay),
    },
  );

  appendHandGlowStrokeKeyframes(kf, len, eraseDelay, eraseMs, cycleMs, "erase");

  kf.push(
    {
      strokeDashoffset: len,
      opacity: 0,
      strokeWidth: GLOW_STROKE_WIDTH,
      offset: offsetAt(cycleMs, eraseEnd),
    },
    { strokeDashoffset: len, opacity: 0, offset: 1 },
  );

  return kf;
}

const EMPTY_TIMING: StrokeTiming = {
  drawDelay: 0,
  drawMs: 0,
  drawEnd: 0,
  staggerMs: 0,
  eraseDelay: 0,
  eraseMs: 0,
  eraseEnd: 0,
};

function computeDrawTimings(maskPaths: SVGPathElement[]): StrokeTiming[] {
  let drawCursor = 0;
  const timings: StrokeTiming[] = [];

  maskPaths.forEach((path, index) => {
    const len = path.getTotalLength();
    if (len < 6) {
      timings.push({ ...EMPTY_TIMING });
      return;
    }

    const { staggerMs, drawMs } = strokeTiming(index, len);
    const drawDelay = drawCursor;
    drawCursor += staggerMs;
    timings.push({
      drawDelay,
      drawMs,
      drawEnd: drawDelay + drawMs,
      staggerMs,
      eraseDelay: 0,
      eraseMs: drawMs,
      eraseEnd: 0,
    });
  });

  return timings;
}

/** Espelha construção: mesmo delay, duração e intervalo entre linhas. */
function applyEraseTimings(
  timings: StrokeTiming[],
  erasePhaseStart: number,
): number {
  timings.forEach((t) => {
    if (t.drawMs === 0) return;
    t.eraseDelay = erasePhaseStart + t.drawDelay;
    t.eraseMs = t.drawMs;
    t.eraseEnd = t.eraseDelay + t.eraseMs;
  });

  return Math.max(erasePhaseStart, ...timings.map((t) => t.eraseEnd));
}

function animateStrokePair(
  maskPath: SVGPathElement,
  glowPath: SVGPathElement | null,
  cycleMs: number,
  timing: StrokeTiming,
  reduced: boolean,
): Animation[] {
  const len = maskPath.getTotalLength();
  if (len < 6) {
    maskPath.style.display = "none";
    if (glowPath) glowPath.style.display = "none";
    return [];
  }

  maskPath.style.strokeDasharray = `${len}`;
  maskPath.style.strokeDashoffset = `${len}`;
  if (glowPath) {
    glowPath.style.strokeDasharray = `${len}`;
    glowPath.style.strokeDashoffset = `${len}`;
  }

  if (reduced) {
    maskPath.style.strokeDashoffset = "0";
    if (glowPath) glowPath.style.opacity = "0";
    return [];
  }

  const maskAnim = maskPath.animate(
    buildHandDrawKeyframes(len, timing, cycleMs),
    {
      duration: cycleMs,
      iterations: Infinity,
      fill: "both",
    },
  );

  const anims: Animation[] = [maskAnim];

  if (glowPath) {
    const glowAnim = glowPath.animate(
      buildHandGlowKeyframes(len, timing, cycleMs),
      {
        duration: cycleMs,
        iterations: Infinity,
        fill: "both",
      },
    );
    anims.push(glowAnim);
  }

  return anims;
}

/**
 * Loop: construção linha a linha → imagem completa 2s (sem esmaecer) →
 * desconstrução linha a linha → repete.
 */
export function HeroBridgeDrawAnimation({ className }: Props) {
  const rootRef = useRef<HTMLDivElement>(null);
  const maskId = useId().replace(/:/g, "");
  const gradId = useId().replace(/:/g, "");

  const imageHref =
    "asset" in bridgeArt && typeof bridgeArt.asset === "string"
      ? bridgeArt.asset
      : siteConfig.brand.courseHeroBanner;

  useLayoutEffect(() => {
    const root = rootRef.current;
    if (!root) return;

    const maskPaths = Array.from(
      root.querySelectorAll<SVGPathElement>(".fm-bridge-mask-stroke"),
    );
    const reduced = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;

    const strokeTimings = computeDrawTimings(maskPaths);
    const buildDuration = Math.max(0, ...strokeTimings.map((t) => t.drawEnd));
    const completeAt = buildDuration;
    const erasePhaseStart = completeAt + HOLD_COMPLETE_MS;
    const erasePhaseEnd = applyEraseTimings(strokeTimings, erasePhaseStart);
    const cycleMs = erasePhaseEnd;

    root.style.setProperty("--fm-bridge-cycle", `${cycleMs}ms`);

    const animations: Animation[] = [];

    maskPaths.forEach((maskPath, index) => {
      const glowPath = root.querySelector<SVGPathElement>(
        `.fm-bridge-glow-stroke[data-stroke-idx="${index}"]`,
      );
      animations.push(
        ...animateStrokePair(
          maskPath,
          glowPath,
          cycleMs,
          strokeTimings[index] ?? { ...EMPTY_TIMING },
          reduced,
        ),
      );
    });

    return () => animations.forEach((a) => a.cancel());
  }, [maskId, gradId]);

  return (
    <div ref={rootRef} className={className} aria-hidden>
      <svg
        className="fm-hero-bridge-draw__svg"
        viewBox={bridgeArt.viewBox}
        preserveAspectRatio="xMaxYMid slice"
      >
        <defs>
          <linearGradient
            id={`fm-bridge-gold-${gradId}`}
            x1="0%"
            y1="100%"
            x2="100%"
            y2="0%"
          >
            <stop offset="0%" stopColor="var(--color-amber-soft)" />
            <stop offset="45%" stopColor="#ffe08a" />
            <stop offset="100%" stopColor="var(--color-amber)" />
          </linearGradient>
          <filter
            id={`fm-bridge-glow-${gradId}`}
            x="-20%"
            y="-20%"
            width="140%"
            height="140%"
          >
            <feGaussianBlur stdDeviation="2.5" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
          <mask
            id={`fm-bridge-mask-${maskId}`}
            maskUnits="userSpaceOnUse"
            x="0"
            y="0"
            width="1000"
            height="1000"
          >
            <rect width="1000" height="1000" fill="black" />
            <g
              fill="none"
              stroke="white"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              {bridgeArt.paths.map((d, i) => (
                <path
                  key={`m-${i}`}
                  d={d}
                  className="fm-bridge-mask-stroke"
                  strokeWidth={MASK_STROKE_WIDTH}
                />
              ))}
            </g>
          </mask>
        </defs>

        {/* Imagem oficial — revelada traço a traço (máscara invisível) */}
        <image
          href={imageHref}
          x="0"
          y="0"
          width="1000"
          height="1000"
          preserveAspectRatio="xMaxYMid slice"
          mask={`url(#fm-bridge-mask-${maskId})`}
        />

        {/* Traços dourados brilhantes por cima — uma linha de cada vez */}
        <g
          className="fm-bridge-glow-layer"
          fill="none"
          stroke={`url(#fm-bridge-gold-${gradId})`}
          strokeLinecap="round"
          strokeLinejoin="round"
          filter={`url(#fm-bridge-glow-${gradId})`}
        >
          {bridgeArt.paths.map((d, i) => (
            <path
              key={`g-${i}`}
              d={d}
              data-stroke-idx={i}
              className="fm-bridge-glow-stroke"
              strokeWidth={GLOW_STROKE_WIDTH}
            />
          ))}
        </g>
      </svg>
    </div>
  );
}
