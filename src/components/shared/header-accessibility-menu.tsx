"use client";

import { Accessibility, Glasses, Minus, Plus, Sun, Moon } from "lucide-react";
import { startTransition, useEffect, useId, useState } from "react";

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
  readStoredPreferences,
} from "@/lib/ui/accessibility-preferences";

const visionOptions: { value: VisionPref; label: string; hint?: string }[] = [
  { value: "none", label: "Cores padrão" },
  { value: "high-contrast", label: "Alto contraste (texto)" },
  { value: "mono", label: "Monocromático" },
  {
    value: "assist-full",
    label: "Apoio leitura e vídeos",
    hint: "Contraste reforçado, links sublinhados, texto mais espaçado e vídeos/embeds mais nítidos.",
  },
];

const labels = ["Muito pequeno", "Pequeno", "Normal", "Grande", "Muito grande"];

/**
 * Menu compacto (native `<details>`) para não competir com a navegação.
 * Painel com controlos de letra, tema e visão.
 */
export function HeaderAccessibilityMenu() {
  const idVision = useId();
  const idRange = useId();
  const [theme, setTheme] = useState<ThemePref>(
    () => readStoredPreferences().theme,
  );
  const [textStep, setTextStep] = useState<TextStep>(
    () => readStoredPreferences().textStep,
  );
  const [vision, setVision] = useState<VisionPref>(
    () => readStoredPreferences().vision,
  );

  /** Alinhar ao `<html>` após o script inline (evita drift hidratação vs DOM). */
  useEffect(() => {
    const d = readDomPreferences();
    startTransition(() => {
      setTheme(d.theme);
      setTextStep(d.textStep);
      setVision(d.vision);
    });
  }, []);

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

  return (
    <details className="group relative z-[60]">
      <summary
        className="border-amber/25 text-paper-700 hover:border-amber/50 hover:text-paper fm-mono list-none flex cursor-pointer items-center gap-2 rounded-md border bg-paper/[0.04] px-2.5 py-2 text-[10px] uppercase tracking-[0.14em] transition-colors marker:content-none [&::-webkit-details-marker]:hidden"
        aria-label="Abrir opções de acessibilidade"
      >
        <Accessibility className="text-amber size-5 shrink-0" aria-hidden />
        <span className="text-paper-700 hidden max-w-[11rem] truncate sm:inline">
          Acessibilidade
        </span>
      </summary>

      <div
        role="presentation"
        className="border-amber/20 bg-carbon-elevated/95 text-paper-700 absolute right-0 top-[calc(100%+0.5rem)] w-[min(calc(100vw-2.5rem),18.5rem)] rounded-lg border p-4 shadow-lg backdrop-blur-md"
        onPointerDown={(e) => e.stopPropagation()}
        onClick={(e) => e.stopPropagation()}
        onKeyDown={(e) => e.stopPropagation()}
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
                  disabled={textStep <= TEXT_STEP_MIN}
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
                    Tamanho do texto: {labels[textStep]}
                  </label>
                  <input
                    id={idRange}
                    type="range"
                    min={TEXT_STEP_MIN}
                    max={TEXT_STEP_MAX}
                    step={1}
                    value={textStep}
                    aria-valuemin={TEXT_STEP_MIN}
                    aria-valuemax={TEXT_STEP_MAX}
                    aria-valuenow={textStep}
                    aria-valuetext={labels[textStep]}
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
                  disabled={textStep >= TEXT_STEP_MAX}
                  onClick={() =>
                    setStepAndPersist(
                      Math.min(TEXT_STEP_MAX, textStep + 1) as TextStep,
                    )
                  }
                >
                  <Plus className="size-4" aria-hidden />
                </Button>
              </div>
              <p className="text-paper-600 mt-1.5 text-center text-[11px]">
                {labels[textStep]}
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
              <p className="text-paper-600 fm-mono mb-2 flex items-center gap-1.5 text-[9px] uppercase tracking-[0.14em]">
                <Glasses className="text-amber size-3" aria-hidden />
                Leitura, cores e vídeos
              </p>
              <label htmlFor={idVision} className="sr-only">
                Modo de cores
              </label>
              <select
                id={idVision}
                value={vision}
                onChange={(e) =>
                  setVisionAndPersist(e.target.value as VisionPref)
                }
                className="border-paper-100/40 bg-carbon text-paper focus-visible:ring-amber w-full cursor-pointer rounded-md border py-2 pl-2.5 pr-8 text-xs outline-none focus-visible:ring-2"
              >
                {visionOptions.map((o) => (
                  <option key={o.value} value={o.value}>
                    {o.label}
                  </option>
                ))}
              </select>
              {vision !== "none" && (
                <p className="text-paper-600 mt-2 text-[11px] leading-snug">
                  {visionOptions.find((o) => o.value === vision)?.hint ??
                    "Ajusta contraste e legibilidade em todo o site."}
                </p>
              )}
            </div>
          </div>
        </div>
      </div>
    </details>
  );
}
