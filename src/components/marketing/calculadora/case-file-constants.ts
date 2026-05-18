import type { CrimePreset } from "@/lib/business/crimes";
import type { CircunstanciaArt59, DosimetriaResult } from "@/lib/business/dosimetria";

// ====================================================================
// CONSTANTES — atenuantes/agravantes/causas com label (UI only)
// ====================================================================

export const ATENUANTES_LABEL: Array<{ slug: string; label: string }> = [
  { slug: "menoridade", label: "Menoridade relativa (< 21 anos)" },
  { slug: "confissao", label: "Confissão espontânea" },
  { slug: "reparacao", label: "Reparação do dano" },
  { slug: "coacao", label: "Coação resistível" },
  { slug: "violenta-emocao", label: "Violenta emoção" },
];

export const AGRAVANTES_LABEL: Array<{ slug: string; label: string }> = [
  { slug: "reincidencia", label: "Reincidência" },
  { slug: "motivo-torpe", label: "Motivo torpe" },
  { slug: "premeditacao", label: "Premeditação" },
  { slug: "vitima-vulneravel", label: "Vítima vulnerável" },
  { slug: "concurso-pessoas", label: "Concurso de pessoas" },
];

export const CAUSAS_AUMENTO: Array<{ slug: string; label: string; fracao: number }> = [
  { slug: "continuidade", label: "Continuidade delitiva (1/6 a 2/3)", fracao: 1 / 3 },
  { slug: "concurso-formal", label: "Concurso formal (1/6 a 1/2)", fracao: 1 / 6 },
  { slug: "qualificadora-aumento", label: "Causa especial — 1/3 (art. 226, II)", fracao: 1 / 3 },
  { slug: "violencia-domestica", label: "Violência doméstica (art. 61, II, f)", fracao: 1 / 2 },
];

export const CAUSAS_DIMINUICAO: Array<{ slug: string; label: string; fracao: number }> = [
  { slug: "tentativa", label: "Tentativa (1/3 a 2/3) — art. 14, II", fracao: 2 / 3 },
  { slug: "arrependimento", label: "Arrependimento posterior — 1/3 a 2/3", fracao: 1 / 3 },
  { slug: "semi-imputavel", label: "Semi-imputabilidade — art. 26, p.ú.", fracao: 1 / 2 },
  { slug: "trafico-privilegiado", label: "Tráfico privilegiado — art. 33 §4°", fracao: 2 / 3 },
];

// Categorias por slug (heurística pelo artigo). 50 crimes
// distribuídos em 4 famílias para o filtro.
export function categoryOf(c: CrimePreset): "patrimonio" | "pessoa" | "drogas" | "outros" {
  if (c.artigo.startsWith("Lei 11.343")) return "drogas";
  const m = c.artigo.match(/art\.\s*(\d+)/);
  if (!m) return "outros";
  const n = parseInt(m[1]!, 10);
  if (n >= 121 && n <= 154) return "pessoa";
  if (n >= 155 && n <= 183) return "patrimonio";
  return "outros";
}

// Jurisprudência mock — 5 crimes mais ensinados ganham entradas reais.
export const JURISPRUDENCIA: Record<
  string,
  Array<{ tribunal: string; code: string; summary: string }>
> = {
  "furto-simples": [
    { tribunal: "STJ", code: "Súmula 599", summary: "Insignificância afastada por reincidência específica." },
    { tribunal: "STJ", code: "AgRg 1.892.401/RS", summary: "Furto noturno isolado: sem qualificadora se ausente violência." },
    { tribunal: "STF", code: "HC 168.052/SP", summary: "Bem ínfimo + ausência de antecedentes = atipicidade material." },
  ],
  "furto-qualificado": [
    { tribunal: "STJ", code: "HC 715.823/MG", summary: "Concurso de pessoas exige liame subjetivo demonstrado." },
    { tribunal: "STJ", code: "Súmula 511", summary: "Privilégio aplica-se ao §4° quando primário e bem ínfimo." },
  ],
  estelionato: [
    { tribunal: "STJ", code: "Súmula 17", summary: "Estelionato consumido pelo falso é absorvido." },
    { tribunal: "STF", code: "HC 211.890/SP", summary: "Estelionato eletrônico: competência do local da vantagem." },
  ],
  "roubo-simples": [
    { tribunal: "STJ", code: "Tese 56", summary: "Emprego de arma branca volta a qualificar (Lei 13.654/18 não retroage)." },
  ],
  "trafico-caput": [
    { tribunal: "STF", code: "RE 635.659", summary: "Distinção tráfico × usuário exige análise concreta." },
    { tribunal: "STJ", code: "HC 769.842/SP", summary: "Apreensão fracionada + balança = mercancia." },
  ],
};

// ====================================================================
// HELPERS
// ====================================================================

export function formatRange(c: CrimePreset): string {
  const ANO = 365;
  const fmt = (d: number) => {
    const a = Math.round(d / ANO);
    return `${a} ano${a === 1 ? "" : "s"}`;
  };
  return `${fmt(c.minDias)} a ${fmt(c.maxDias)}`;
}

// ====================================================================
// COMPONENTE
// ====================================================================

export type Tab = "dados" | "fato" | "calculo" | "sentenca" | "exportar";

export const TABS: Array<{ id: Tab; label: string; short: string }> = [
  { id: "dados", label: "Dados", short: "Crime" },
  { id: "fato", label: "Fato", short: "Fato" },
  { id: "calculo", label: "Cálculo", short: "Pena" },
  { id: "sentenca", label: "Sentença", short: "Texto" },
  { id: "exportar", label: "Exportar", short: "PDF" },
];

export const EMPTY_DOSIMETRIA: DosimetriaResult = {
  crime: { nome: "", artigo: "—", minDias: 0, maxDias: 0 },
  penaBaseDias: 0,
  penaIntermediariaDias: 0,
  penaFinalDias: 0,
  passos: [],
  formatado: {
    penaBase: "—",
    penaIntermediaria: "—",
    penaFinal: "—",
  },
};
