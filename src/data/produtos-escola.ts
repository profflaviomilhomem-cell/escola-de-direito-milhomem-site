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
      "Direito Penal pela perspectiva da acusação · cohort de 12 semanas com acesso ao professor",
    tipo: "cohort",
    destaque: true,
    cargaHoraria: "60–80 h",
    ticketLabel: "A partir de R$ 1.997 (fundador)",
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
    slug: "prova-digital",
    titulo: "Prova Digital no Processo Penal",
    subtitulo: "Produto legado na Eduzz — prova digital e cadeia de custódia",
    tipo: "legado",
    href: "https://eduzz.com",
    externo: true,
  },
] as const;
