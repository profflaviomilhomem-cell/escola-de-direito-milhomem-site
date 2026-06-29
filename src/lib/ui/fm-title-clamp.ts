import type { CSSProperties } from "react";

/**
 * Variáveis para `.fm-title-fluid` — o tamanho original é preservado no passo
 * Normal e multiplicado em Grande / Muito grande (nunca substituído por valores menores).
 */
export function fmTitleClamp(
  min: string,
  fluid: string,
  max: string,
): CSSProperties {
  return {
    ["--fm-title-min" as string]: min,
    ["--fm-title-fluid" as string]: fluid,
    ["--fm-title-max" as string]: max,
  };
}
