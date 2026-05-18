export const LS_THEME = "fm-theme";
export const LS_TEXT_STEP = "fm-text-step";
export const LS_VISION = "fm-vision";

export type ThemePref = "dark" | "light";
export type VisionPref =
  | "none"
  | "high-contrast"
  | "mono"
  | "assist-full";

/** Mínimo = normal do site (sem redução de fonte). */
export const TEXT_STEP_MIN = 2;
export const TEXT_STEP_MAX = 4;
export type TextStep = 2 | 3 | 4;

export function parseTextStep(raw: string | null): TextStep {
  if (raw === "3" || raw === "4") {
    return Number(raw) as TextStep;
  }
  /* 0/1 legados ou ausente → normal, nunca menor que o padrão */
  return 2;
}

export function parseVisionPref(raw: string | null): VisionPref {
  if (raw === "none" || raw === null || raw === "") {
    return "none";
  }
  /* Migração: modos antigos de simulação passam ao apoio real leitura+vídeo */
  if (raw === "protan" || raw === "deutan") {
    return "assist-full";
  }
  if (raw === "high-contrast" || raw === "mono" || raw === "assist-full") {
    return raw;
  }
  return "none";
}

export function parseThemePref(raw: string | null): ThemePref {
  return raw === "light" ? "light" : "dark";
}

export function applyThemeToDom(theme: ThemePref): void {
  const root = document.documentElement;
  root.classList.remove("dark", "light");
  if (theme === "light") {
    root.classList.add("light");
  } else {
    root.classList.add("dark");
  }
  try {
    localStorage.setItem(LS_THEME, theme);
  } catch {
    /* ignore */
  }
}

export function applyTextStepToDom(step: TextStep): void {
  const normalized = parseTextStep(String(step));
  const root = document.documentElement;
  root.setAttribute("data-fm-text-step", String(normalized));
  try {
    localStorage.setItem(LS_TEXT_STEP, String(normalized));
  } catch {
    /* ignore */
  }
}

export function applyVisionToDom(vision: VisionPref): void {
  const root = document.documentElement;
  if (vision === "none") {
    root.removeAttribute("data-fm-vision");
  } else {
    root.setAttribute("data-fm-vision", vision);
  }
  try {
    localStorage.setItem(LS_VISION, vision);
  } catch {
    /* ignore */
  }
}

export function readDomPreferences(): {
  theme: ThemePref;
  textStep: TextStep;
  vision: VisionPref;
} {
  if (typeof document === "undefined") {
    return readStoredPreferences();
  }
  const root = document.documentElement;
  const theme: ThemePref = root.classList.contains("light")
    ? "light"
    : "dark";
  const rawStep = root.getAttribute("data-fm-text-step");
  const textStep =
    rawStep !== null && rawStep !== ""
      ? parseTextStep(rawStep)
      : parseTextStep(
          (() => {
            try {
              return localStorage.getItem(LS_TEXT_STEP);
            } catch {
              return null;
            }
          })(),
        );
  const rawVision = root.getAttribute("data-fm-vision");
  const vision =
    rawVision !== null && rawVision !== ""
      ? parseVisionPref(rawVision)
      : parseVisionPref(
          (() => {
            try {
              return localStorage.getItem(LS_VISION);
            } catch {
              return null;
            }
          })(),
        );
  return { theme, textStep, vision };
}

export function readStoredPreferences(): {
  theme: ThemePref;
  textStep: TextStep;
  vision: VisionPref;
} {
  if (typeof window === "undefined") {
    return { theme: "dark", textStep: 2, vision: "none" };
  }
  try {
    return {
      theme: parseThemePref(localStorage.getItem(LS_THEME)),
      textStep: parseTextStep(localStorage.getItem(LS_TEXT_STEP)),
      vision: parseVisionPref(localStorage.getItem(LS_VISION)),
    };
  } catch {
    return { theme: "dark", textStep: 2, vision: "none" };
  }
}
