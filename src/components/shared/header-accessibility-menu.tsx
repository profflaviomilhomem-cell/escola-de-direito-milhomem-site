"use client";

import { Accessibility, Glasses, Minus, Plus, Sun, Moon } from "lucide-react";
import {
  useCallback,
  useEffect,
  useId,
  useRef,
  useState,
  useSyncExternalStore,
} from "react";
import { createPortal } from "react-dom";

import { Button } from "@/components/ui/button";
import {
  TEXT_STEP_MAX,
  TEXT_STEP_MIN,
  type TextStep,
  type ThemePref,
  type VisionPref,
  applyTextStepToDom,
  applyThemeToDom,
  applyVisionToDom,
  readDomPreferences,
} from "@/lib/ui/accessibility-preferences";
import { cn } from "@/lib/utils";

const visionOptions: { value: VisionPref; label: string; hint?: string }[] = [
  { value: "none", label: "Cores padrão" },
  { value: "high-contrast", label: "Alto contraste" },
  { value: "mono", label: "Monocromático" },
  {
    value: "assist-full",
    label: "Apoio leitura e vídeos",
    hint: "Contraste reforçado, links sublinhados, texto mais espaçado e vídeos/embeds mais nítidos.",
  },
];

const labels = ["Normal", "Grande", "Muito grande"] as const;

function textStepLabel(step: TextStep): string {
  return labels[step - TEXT_STEP_MIN];
}

function stopMenuClose(e: React.SyntheticEvent) {
  e.stopPropagation();
}

/** Snapshot constante: false no servidor, true após hidratar no cliente. */
const subscribeNoop = () => () => {};

/**
 * Menu de acessibilidade — tema, escala de texto e modos de visão.
 * Painel em portal; não fecha ao ajustar (só Esc, toggle ou clique fora).
 */
export function HeaderAccessibilityMenu() {
  const idVision = useId();
  const idRange = useId();
  const rootRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const [open, setOpen] = useState(false);
  const [panelStyle, setPanelStyle] = useState<{
    top: number;
    left: number;
    width: number;
  }>();
  // Lazy: readDomPreferences é SSR-safe e os valores só aparecem dentro do
  // painel (fechado na hidratação) — sem effect de sincronização no mount.
  const [theme, setTheme] = useState<ThemePref>(
    () => readDomPreferences().theme,
  );
  const [textStep, setTextStep] = useState<TextStep>(
    () => readDomPreferences().textStep,
  );
  const [vision, setVision] = useState<VisionPref>(
    () => readDomPreferences().vision,
  );
  const mounted = useSyncExternalStore(
    subscribeNoop,
    () => true,
    () => false,
  );
  const ready = mounted;

  const positionPanel = useCallback(() => {
    const trigger = triggerRef.current;
    if (!trigger) return;
    const rect = trigger.getBoundingClientRect();
    const width = Math.min(window.innerWidth - 20, 296);
    setPanelStyle({
      top: rect.bottom + 8,
      left: Math.max(
        10,
        Math.min(rect.right - width, window.innerWidth - width - 10),
      ),
      width,
    });
  }, []);

  useEffect(() => {
    if (!open) return;
    positionPanel();
    const onLayout = () => positionPanel();
    window.addEventListener("resize", onLayout);
    window.addEventListener("scroll", onLayout, true);
    return () => {
      window.removeEventListener("resize", onLayout);
      window.removeEventListener("scroll", onLayout, true);
    };
  }, [open, positionPanel]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const onClickOutside = (e: MouseEvent) => {
      const target = e.target;
      if (!(target instanceof Node)) return;
      if (triggerRef.current?.contains(target)) return;
      if (panelRef.current?.contains(target)) return;
      setOpen(false);
    };
    const id = window.setTimeout(() => {
      document.addEventListener("click", onClickOutside);
    }, 0);
    return () => {
      window.clearTimeout(id);
      document.removeEventListener("click", onClickOutside);
    };
  }, [open]);

  const setThemeAndPersist = (next: ThemePref) => {
    applyThemeToDom(next);
    setTheme(next);
  };

  const setStepAndPersist = (next: TextStep) => {
    applyTextStepToDom(next);
    setTextStep(next);
  };

  const setVisionAndPersist = (next: VisionPref) => {
    applyVisionToDom(next);
    setVision(next);
  };

  const panel =
    open && panelStyle && mounted ? (
      <div
        ref={panelRef}
        id="fm-a11y-panel"
        role="dialog"
        aria-label="Preferências de acessibilidade"
        style={{
          position: "fixed",
          top: panelStyle.top,
          left: panelStyle.left,
          width: panelStyle.width,
          zIndex: 200,
        }}
        className="border-amber/20 bg-carbon-elevated text-paper rounded-lg border p-4 shadow-lg backdrop-blur-md"
        onPointerDown={stopMenuClose}
        onClick={stopMenuClose}
      >
        <div role="toolbar" aria-label="Preferências de acessibilidade">
          <p className="text-paper fm-mono mb-4 border-b border-paper-100/20 pb-3 text-[10px] uppercase tracking-[0.18em]">
            Acessibilidade
          </p>

          <div className="space-y-4">
            <div>
              <p className="text-paper-600 fm-mono mb-2 text-[9px] uppercase tracking-[0.14em]">
                Tamanho do texto
              </p>
              <div className="flex items-center gap-2">
                <Button
                  type="button"
                  variant="ghost"
                  size="icon-sm"
                  className="text-paper hover:text-amber h-8 w-8 shrink-0"
                  aria-label="Diminuir texto"
                  disabled={!ready || textStep <= TEXT_STEP_MIN}
                  onClick={() =>
                    setStepAndPersist(
                      Math.max(TEXT_STEP_MIN, textStep - 1) as TextStep,
                    )
                  }
                >
                  <Minus className="size-4" aria-hidden />
                </Button>
                <div className="min-w-0 flex-1 px-1">
                  <label htmlFor={idRange} className="sr-only">
                    Tamanho do texto: {textStepLabel(textStep)}
                  </label>
                  <input
                    id={idRange}
                    type="range"
                    min={TEXT_STEP_MIN}
                    max={TEXT_STEP_MAX}
                    step={1}
                    value={textStep}
                    disabled={!ready}
                    aria-valuemin={TEXT_STEP_MIN}
                    aria-valuemax={TEXT_STEP_MAX}
                    aria-valuenow={textStep}
                    aria-valuetext={textStepLabel(textStep)}
                    className="accent-amber h-2 w-full cursor-pointer"
                    onChange={(e) =>
                      setStepAndPersist(Number(e.target.value) as TextStep)
                    }
                  />
                </div>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon-sm"
                  className="text-paper hover:text-amber h-8 w-8 shrink-0"
                  aria-label="Aumentar texto"
                  disabled={!ready || textStep >= TEXT_STEP_MAX}
                  onClick={() =>
                    setStepAndPersist(
                      Math.min(TEXT_STEP_MAX, textStep + 1) as TextStep,
                    )
                  }
                >
                  <Plus className="size-4" aria-hidden />
                </Button>
              </div>
              <p
                className="text-paper-600 mt-1.5 text-center text-[11px]"
                aria-live="polite"
              >
                {textStepLabel(textStep)}
              </p>
            </div>

            <div>
              <p className="text-paper-600 fm-mono mb-2 text-[9px] uppercase tracking-[0.14em]">
                Tema
              </p>
              <div className="flex gap-2">
                <Button
                  type="button"
                  variant={theme === "dark" ? "secondary" : "outline"}
                  size="sm"
                  className="fm-mono flex-1 gap-1.5 text-[10px] uppercase tracking-[0.12em]"
                  aria-pressed={theme === "dark"}
                  onClick={() => setThemeAndPersist("dark")}
                >
                  <Moon className="size-3.5" aria-hidden />
                  Escuro
                </Button>
                <Button
                  type="button"
                  variant={theme === "light" ? "secondary" : "outline"}
                  size="sm"
                  className="fm-mono flex-1 gap-1.5 text-[10px] uppercase tracking-[0.12em]"
                  aria-pressed={theme === "light"}
                  onClick={() => setThemeAndPersist("light")}
                >
                  <Sun className="size-3.5" aria-hidden />
                  Claro
                </Button>
              </div>
            </div>

            <div>
              <p
                id={idVision}
                className="text-paper-600 fm-mono mb-2 flex items-center gap-1.5 text-[9px] uppercase tracking-[0.14em]"
              >
                <Glasses className="text-amber size-3" aria-hidden />
                Leitura, cores e vídeos
              </p>
              <div
                role="radiogroup"
                aria-labelledby={idVision}
                className="flex flex-col gap-1.5"
              >
                {visionOptions.map((o) => (
                  <button
                    key={o.value}
                    type="button"
                    role="radio"
                    aria-checked={vision === o.value}
                    disabled={!ready}
                    onClick={() => setVisionAndPersist(o.value)}
                    className={cn(
                      "fm-mono rounded-md border px-2.5 py-2 text-left text-[10px] uppercase tracking-[0.1em] transition-colors",
                      vision === o.value
                        ? "border-amber/50 bg-amber/15 text-paper"
                        : "border-paper-100/30 text-paper-700 hover:border-amber/35 hover:text-paper bg-transparent",
                    )}
                  >
                    {o.label}
                  </button>
                ))}
              </div>
              {vision !== "none" ? (
                <p className="text-paper-600 mt-2 text-[11px] leading-snug">
                  {visionOptions.find((o) => o.value === vision)?.hint ??
                    "Ajusta contraste e legibilidade em todo o site."}
                </p>
              ) : null}
            </div>
          </div>
        </div>
      </div>
    ) : null;

  return (
    <div ref={rootRef} className="relative z-[120]">
      <button
        ref={triggerRef}
        type="button"
        aria-expanded={open}
        aria-haspopup="dialog"
        aria-controls="fm-a11y-panel"
        onClick={(e) => {
          e.stopPropagation();
          setOpen((v) => {
            const next = !v;
            if (next) requestAnimationFrame(positionPanel);
            return next;
          });
        }}
        className="border-amber/25 text-paper-700 hover:border-amber/50 hover:text-paper fm-mono flex cursor-pointer items-center gap-2 rounded-md border bg-paper/[0.04] px-2.5 py-2 text-[10px] uppercase tracking-[0.14em] transition-colors"
      >
        <Accessibility className="text-amber size-5 shrink-0" aria-hidden />
        <span className="text-paper-700 hidden max-w-[11rem] truncate sm:inline">
          Acessibilidade
        </span>
      </button>

      {mounted && panel ? createPortal(panel, document.body) : null}
    </div>
  );
}
