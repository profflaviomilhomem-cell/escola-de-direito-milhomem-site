/**
 * Redesign Radical: Espiral Ascendente (Holográfica) - VERSÃO COM HUD ISOLADO
 * Altura aumentada para 600, com a trilha deslocada para o topo para liberar a base para o HUD.
 */

export type CareerMilestone = {
  id: string;
  year: string;
  text: string;
  lines: readonly [string] | readonly [string, string];
  x: number;
  y: number;
  labelAlign: "left" | "right";
  accessoryId:
    | "graduacao"
    | "promotor"
    | "mestrado"
    | "enm"
    | "revista"
    | "obra"
    | "ouvidor";
};

/**
 * Path em espiral ascendente 3D deslocado para cima (ViewBox Height: 600)
 * A trilha termina em y=430, deixando ~170 unidades livres na base.
 */
export const CAREER_JOURNEY_PATH =
  "M 180 430 " +
  "C 340 430, 340 360, 180 360 " + // Loop 1
  "C 20 360, 20 290, 180 290 " +   // Loop 2
  "C 300 290, 300 230, 180 230 " + // Loop 3
  "C 60 230, 60 170, 180 170 " +   // Loop 4
  "C 260 170, 260 120, 180 120 " + // Loop 5
  "C 100 120, 100 70, 180 70 " +   // Loop 6
  "C 180 70, 180 20, 180 20";      // Ascensão Final

export const careerMilestones: CareerMilestone[] = [
  {
    id: "formacao-unb",
    year: "UnB",
    text: "Graduação em Direito pela Universidade de Brasília",
    lines: ["Graduação em Direito"],
    x: 180,
    y: 430,
    labelAlign: "right",
    accessoryId: "graduacao",
  },
  {
    id: "mp-1996",
    year: "1996",
    text: "Aprovação no 18º concurso e ingresso no MPDFT como Promotor de Justiça",
    lines: ["18º concurso", "Promotor · MPDFT"],
    x: 260,
    y: 395,
    labelAlign: "left",
    accessoryId: "promotor",
  },
  {
    id: "mestrado-2001",
    year: "2001",
    text: "Mestrado em Ciências Jurídico-Criminais pela Universidade Católica Portuguesa",
    lines: ["Mestrado em Ciências", "Jurídico-Criminais"],
    x: 100,
    y: 325,
    labelAlign: "right",
    accessoryId: "mestrado",
  },
  {
    id: "enm-2008",
    year: "2008",
    text: "Especialização pela École Nationale de la Magistrature (França)",
    lines: ["Especialização ENM", "(França)"],
    x: 240,
    y: 260,
    labelAlign: "left",
    accessoryId: "enm",
  },
  {
    id: "revista-2012",
    year: "2012",
    text: "Coordenação da Revista Jurídica do MPDFT",
    lines: ["Revista Jurídica", "do MPDFT"],
    x: 120,
    y: 200,
    labelAlign: "right",
    accessoryId: "revista",
  },
  {
    id: "obra-2014",
    year: "2014",
    text: "1ª edição de Direito Penal Objetivo: Teoria e Questões (Alumnus)",
    lines: ["Direito Penal Objetivo", "1ª ed. · Alumnus"],
    x: 220,
    y: 145,
    labelAlign: "left",
    accessoryId: "obra",
  },
  {
    id: "ouvidor-2025",
    year: "2025",
    text: "Ouvidor-Geral do MPDFT (biênio 2025–2027)",
    lines: ["Ouvidor-Geral", "do MPDFT"],
    x: 180,
    y: 30,
    labelAlign: "right",
    accessoryId: "ouvidor",
  },
];

export const CAREER_JOURNEY_VIEWBOX = { w: 360, h: 600 } as const;

export const CAREER_JOURNEY_SPAN = {
  from: "UnB",
  to: "2025",
  title: "Jornada · UnB — 2025",
} as const;
