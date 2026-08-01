/**
 * Avaliações reais / autorizadas da turma fundadora — única fonte de depoimentos no site.
 *
 * REGRA: só entra aqui relato de aluno REAL, com autorização de publicação registrada.
 * Nada de exemplo, rascunho ou nome fictício — depoimento inventado é publicidade
 * enganosa (CDC art. 37) e o público deste site é advogado.
 *
 * `items` vazio é estado legítimo: a turma fundadora estreia em 11/ago/2026 e ainda
 * não existem avaliações. Enquanto a lista estiver vazia, `TestimonialsSection` não
 * renderiza nada — basta adicionar os relatos reais aqui para a seção voltar sozinha.
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
  items: [] satisfies TurmaFundadoraAvaliacao[] as TurmaFundadoraAvaliacao[],
} as const;
