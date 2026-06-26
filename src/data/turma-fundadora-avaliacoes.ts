/**
 * Avaliações reais / autorizadas da turma fundadora — única fonte de depoimentos no site.
 */
export type TurmaFundadoraAvaliacao = {
  quote: string;
  name: string;
  role: string;
};

export const turmaFundadoraAvaliacoes = {
  eyebrow: "Turma fundadora",
  title: "Avaliações da",
  titleEmphasis: "turma fundadora",
  lead: "Relatos de alunos da edição inaugural — publicados com autorização e em caráter informativo sobre a experiência no cohort.",
  items: [
    {
      quote:
        "O recorte da acusação mudou como eu leio informativos e monto peças. Conteúdo denso, sem atalho vazio.",
      name: "Ana R.",
      role: "Advogada criminal · turma fundadora",
    },
    {
      quote:
        "Finalmente um professor que fala a linguagem de tribunal e de banca ao mesmo tempo — com fontes citadas.",
      name: "Marcos T.",
      role: "Concurseiro · turma fundadora",
    },
    {
      quote:
        "O cohort me obrigou a manter ritmo. O fórum com resposta em até 72h fez diferença nas dúvidas de processo.",
      name: "Juliana M.",
      role: "Defensora pública · turma fundadora",
    },
  ] satisfies TurmaFundadoraAvaliacao[],
} as const;
