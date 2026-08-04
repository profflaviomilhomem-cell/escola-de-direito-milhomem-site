/**
 * Catálogo de ofertas — alinhado ao Livro-Guia (Cap. 5.8, 6.5).
 */

export type ProdutoEscola = {
  slug: string;
  titulo: string;
  subtitulo: string;
  tipo: "cohort" | "legado";
  destaque?: boolean;
  cargaHoraria?: string;
  ticketLabel?: string;
  href: string;
  externo?: boolean;
};

/** Slug do curso principal — mesma chave do produto publicado no banco. */
export const CURSO_PRINCIPAL_SLUG = "prova-digital-no-processo-penal";
export const CURSO_PRINCIPAL_PATH = `/cursos/${CURSO_PRINCIPAL_SLUG}`;

/** Vagas da turma fundadora (Edição Lançamento) — selo "até 50 alunos". */
export const COHORT_VAGAS_TOTAL = 50;

export const produtosEscola: readonly ProdutoEscola[] = [
  {
    slug: CURSO_PRINCIPAL_SLUG,
    titulo: "Prova Digital no Processo Penal",
    subtitulo:
      "Para quem atua no processo penal — cohort de 12 semanas com acesso ao professor, na Edição Lançamento",
    tipo: "cohort",
    destaque: true,
    // Medido nos arquivos de vídeo em 04/08/2026: 2h47min37s nas 10 aulas. O valor
    // anterior ("60–80 h") não correspondia a nada verificável.
    cargaHoraria: "10 aulas · 2h47",
    ticketLabel: "R$ 297,00 (turma fundadora)",
    href: CURSO_PRINCIPAL_PATH,
  },
  /*
   * "Direito Penal em Questões" saiu do catálogo em 04/08/2026.
   *
   * Motivo: o card apontava para `https://eduzz.com` — a home genérica da
   * plataforma, não o produto — e a investigação de 03/08 mostrou que o checkout
   * responde "Este produto encontra-se inativo" (erro #PRD_G). No painel da Eduzz,
   * os DOIS produtos do professor estão inativos porque a CONTA está restrita por
   * cadastro incompleto. Ou seja: não havia link certo a colocar aqui — o produto
   * não está à venda em lugar nenhum.
   *
   * Card que leva a lugar nenhum é pior do que card ausente, ainda mais numa
   * vitrine de curso pago. Volta assim que o professor regularizar o cadastro e
   * reativar o produto — basta restaurar o objeto abaixo com o link real:
   *
   * {
   *   slug: "direito-penal-questoes",
   *   titulo: "Direito Penal em Questões",
   *   subtitulo:
   *     "Para concurseiros — questões comentadas e revisão objetiva, disponível na Eduzz",
   *   tipo: "legado",
   *   href: "<URL REAL DO PRODUTO NA EDUZZ>",
   *   externo: true,
   * },
   */
] as const;
