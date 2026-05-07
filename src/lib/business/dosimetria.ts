/**
 * Dosimetria trifásica — cálculo determinístico (CP, art. 68).
 *
 * Função pura, sem I/O, executada no servidor (API Route).
 * Tudo em DIAS (1 ano = 365, 1 mês = 30 — art. 11 CP).
 *
 * Heurísticas didáticas adotadas (alinhadas à doutrina majoritária
 * de concursos, não vinculam o juiz no caso concreto):
 *
 * Fase 1 — pena-base parte do mínimo. Cada uma das 8 circunstâncias
 *   judiciais (art. 59) consideradas DESFAVORÁVEIS soma (max - min)/8
 *   à pena. Pena-base não ultrapassa o máximo legal.
 *
 * Fase 2 — atenuante e agravante valem 1/6 da pena-base cada.
 *   Súmula 231/STJ: atenuante não reduz abaixo do mínimo legal.
 *   Por simetria didática, agravante também não passa do máximo.
 *
 * Fase 3 — causas de aumento e diminuição aplicadas SEQUENCIALMENTE
 *   sobre a pena intermediária. Aqui pode-se ultrapassar mínimo e máximo.
 *
 * O retorno explica cada passo para uso pedagógico.
 */

import { findCrime } from "./crimes";

export type CircunstanciaArt59 =
  | "culpabilidade"
  | "antecedentes"
  | "condutaSocial"
  | "personalidade"
  | "motivos"
  | "circunstancias"
  | "consequencias"
  | "comportamentoVitima";

export const labelsArt59: Record<CircunstanciaArt59, string> = {
  culpabilidade: "Culpabilidade",
  antecedentes: "Antecedentes",
  condutaSocial: "Conduta social",
  personalidade: "Personalidade do agente",
  motivos: "Motivos do crime",
  circunstancias: "Circunstâncias do crime",
  consequencias: "Consequências do crime",
  comportamentoVitima: "Comportamento da vítima",
};

export type DosimetriaInput = {
  crimeSlug?: string;
  /** Usado quando o usuário escolhe "outro" — sobrepõe o preset. */
  minDias?: number;
  maxDias?: number;
  desfavoraveis: CircunstanciaArt59[];
  agravantes: number;
  atenuantes: number;
  /** Frações como decimais — ex.: [0.333, 0.5] = +1/3 depois +1/2. */
  causasAumento: number[];
  causasDiminuicao: number[];
};

export type PassoCalculo = {
  fase: 1 | 2 | 3;
  titulo: string;
  detalhe: string;
  resultadoDias: number;
};

export type DosimetriaResult = {
  crime: { nome: string; artigo: string; minDias: number; maxDias: number };
  penaBaseDias: number;
  penaIntermediariaDias: number;
  penaFinalDias: number;
  passos: PassoCalculo[];
  formatado: {
    penaBase: string;
    penaIntermediaria: string;
    penaFinal: string;
  };
};

const ANO = 365;
const MES = 30;

export function formatarPena(dias: number): string {
  const total = Math.max(0, Math.round(dias));
  const anos = Math.floor(total / ANO);
  const restoApósAnos = total - anos * ANO;
  const meses = Math.floor(restoApósAnos / MES);
  const diasFinais = restoApósAnos - meses * MES;

  const partes: string[] = [];
  if (anos > 0) partes.push(`${anos} ${anos === 1 ? "ano" : "anos"}`);
  if (meses > 0) partes.push(`${meses} ${meses === 1 ? "mês" : "meses"}`);
  if (diasFinais > 0)
    partes.push(`${diasFinais} ${diasFinais === 1 ? "dia" : "dias"}`);

  return partes.length > 0 ? partes.join(", ") : "0 dias";
}

function clamp(valor: number, min: number, max: number): number {
  return Math.min(Math.max(valor, min), max);
}

function fracaoLegivel(decimal: number): string {
  const candidatos: Array<[string, number]> = [
    ["1/6", 1 / 6],
    ["1/4", 1 / 4],
    ["1/3", 1 / 3],
    ["1/2", 1 / 2],
    ["2/3", 2 / 3],
    ["3/4", 3 / 4],
  ];
  const match = candidatos.find(([, val]) => Math.abs(val - decimal) < 0.005);
  return match ? match[0] : `${(decimal * 100).toFixed(1)}%`;
}

export function calcular(input: DosimetriaInput): DosimetriaResult {
  const preset = input.crimeSlug ? findCrime(input.crimeSlug) : undefined;

  const minDias = preset?.minDias ?? input.minDias ?? 0;
  const maxDias = preset?.maxDias ?? input.maxDias ?? 0;

  if (minDias <= 0 || maxDias <= 0 || maxDias < minDias) {
    throw new Error("Limites legais inválidos.");
  }

  const crime = {
    nome: preset?.nome ?? "Crime customizado",
    artigo: preset?.artigo ?? "—",
    minDias,
    maxDias,
  };

  const passos: PassoCalculo[] = [];
  const intervalo = maxDias - minDias;

  // === Fase 1 — Pena-base ===
  const desfavoraveisCount = new Set(input.desfavoraveis).size;
  const acrescimoFase1 = (intervalo / 8) * desfavoraveisCount;
  const penaBaseDias = clamp(minDias + acrescimoFase1, minDias, maxDias);

  passos.push({
    fase: 1,
    titulo: "Pena-base (art. 59)",
    detalhe:
      desfavoraveisCount === 0
        ? `Nenhuma circunstância judicial desfavorável. Pena-base fixada no mínimo legal (${formatarPena(minDias)}).`
        : `${desfavoraveisCount} de 8 circunstâncias judiciais desfavoráveis. Acréscimo de ${desfavoraveisCount}/8 do intervalo legal (${formatarPena(intervalo)}) sobre o mínimo.`,
    resultadoDias: penaBaseDias,
  });

  // === Fase 2 — Atenuantes e agravantes (1/6 cada, Súmula 231/STJ) ===
  const liquido = input.agravantes - input.atenuantes;
  const ajusteFase2 = (penaBaseDias / 6) * liquido;
  const penaIntermediariaDias = clamp(
    penaBaseDias + ajusteFase2,
    minDias,
    maxDias,
  );

  const detalheFase2: string[] = [];
  if (input.agravantes > 0)
    detalheFase2.push(
      `${input.agravantes} agravante${input.agravantes > 1 ? "s" : ""} (+${input.agravantes}/6)`,
    );
  if (input.atenuantes > 0)
    detalheFase2.push(
      `${input.atenuantes} atenuante${input.atenuantes > 1 ? "s" : ""} (-${input.atenuantes}/6)`,
    );
  if (detalheFase2.length === 0) detalheFase2.push("Nenhuma incidência");

  passos.push({
    fase: 2,
    titulo: "Pena intermediária (arts. 61-66)",
    detalhe: `${detalheFase2.join(" • ")}. Súmula 231/STJ: atenuante não reduz abaixo do mínimo legal.`,
    resultadoDias: penaIntermediariaDias,
  });

  // === Fase 3 — Causas de aumento e diminuição (sequenciais, sem cap) ===
  let penaFinalDias = penaIntermediariaDias;
  const aplicacoes: string[] = [];

  for (const fracao of input.causasAumento) {
    penaFinalDias = penaFinalDias * (1 + fracao);
    aplicacoes.push(`+${fracaoLegivel(fracao)}`);
  }
  for (const fracao of input.causasDiminuicao) {
    penaFinalDias = penaFinalDias * (1 - fracao);
    aplicacoes.push(`-${fracaoLegivel(fracao)}`);
  }

  if (aplicacoes.length === 0) aplicacoes.push("Nenhuma causa incidente");

  passos.push({
    fase: 3,
    titulo: "Pena definitiva (causas de aumento/diminuição)",
    detalhe: `${aplicacoes.join(" • ")}. Aplicadas sequencialmente sobre a pena intermediária. Nesta fase pode-se ultrapassar mínimo/máximo legais.`,
    resultadoDias: penaFinalDias,
  });

  return {
    crime,
    penaBaseDias,
    penaIntermediariaDias,
    penaFinalDias,
    passos,
    formatado: {
      penaBase: formatarPena(penaBaseDias),
      penaIntermediaria: formatarPena(penaIntermediariaDias),
      penaFinal: formatarPena(penaFinalDias),
    },
  };
}
