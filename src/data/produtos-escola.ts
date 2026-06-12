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
    slug: "prova-digital-no-processo-penal",
    titulo: "Prova Digital no Processo Penal",
    subtitulo:
      "Para quem atua no processo penal — cohort de 12 semanas com acesso ao professor, na Edição Lançamento",
    tipo: "cohort",
    destaque: true,
    cargaHoraria: "60–80 h",
    ticketLabel: "R$ 297,00 (turma fundadora)",
    href: "/cursos/prova-digital-no-processo-penal",
  },
  {
    slug: "direito-penal-questoes",
    titulo: "Direito Penal em Questões",
    subtitulo:
      "Para concurseiros — questões comentadas e revisão objetiva, disponível na Eduzz",
    tipo: "legado",
    // TODO: trocar pelo link real do produto na Eduzz (aguardando o professor)
    href: "https://eduzz.com",
    externo: true,
  },
] as const;
