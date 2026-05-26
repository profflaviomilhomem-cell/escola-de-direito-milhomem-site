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

export const produtosEscola: readonly ProdutoEscola[] = [
  {
    slug: "edicao-lancamento",
    titulo: "Edição Lançamento",
    subtitulo:
      "Direito criminal pela perspectiva da acusação · cohort de 12 semanas com acesso ao professor",
    tipo: "cohort",
    destaque: true,
    cargaHoraria: "60–80 h",
    ticketLabel: "R$ 297,00 (turma fundadora)",
    href: "/cursos/edicao-lancamento",
  },
  {
    slug: "direito-penal-questoes",
    titulo: "Direito Penal em Questões",
    subtitulo: "Produto legado na Eduzz — exercícios e revisão objetiva",
    tipo: "legado",
    href: "https://eduzz.com",
    externo: true,
  },
  {
    slug: "prova-digital-no-processo-penal",
    titulo: "Prova Digital no Processo Penal",
    subtitulo: "10 aulas gravadas · vídeo editado e slides (acervo importado)",
    tipo: "legado",
    href: "/cursos/edicao-lancamento#ementa-title",
  },
] as const;
