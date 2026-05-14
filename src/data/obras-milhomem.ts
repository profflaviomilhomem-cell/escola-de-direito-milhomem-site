/**
 * Obras do professor com ficha verificável em catálogo comercial (Martins Fontes Paulista).
 * Atualizar aqui quando houver novos ISBN ou edições.
 */
export type ObraCatalogo = {
  titulo: string;
  editora: string;
  edicaoAno: string;
  paginas: number;
  isbn: string;
  area: string;
  sinopse: string;
  /** Página do distribuidor (referência, sem afiliação). */
  fichaUrl: string;
  /** Capa no CDN VTEX do distribuidor (IDs estáveis por SKU). */
  capaSrc: string;
};

export const obrasMilhomemCatalogo: readonly ObraCatalogo[] = [
  {
    titulo: "Direito Penal Objetivo: Teoria e Questões",
    editora: "Alumnus",
    edicaoAno: "1ª edição · 2014",
    paginas: 304,
    isbn: "978-85-65295-71-0",
    area: "Direito Penal",
    sinopse:
      "Guia objetivo aos tópicos centrais da disciplina, com jurisprudência predominante e questões de concursos comentadas pelo autor.",
    fichaUrl:
      "https://www.martinsfontespaulista.com.br/direito-penal-objetivo---teoria-e-questoes-806799/p",
    capaSrc:
      "https://martinsfontespaulista.vteximg.com.br/arquivos/ids/404895-800-1200/806799_ampliada.jpg",
  },
  {
    titulo: "Direito Processual Penal Objetivo: Teoria e Questões",
    editora: "Alumnus",
    edicaoAno: "3ª edição · 2016",
    paginas: 328,
    isbn: "978-85-84230-70-9",
    area: "Direito Processual Penal",
    sinopse:
      "Tópicos essenciais do processo penal com questões comentadas e gabaritadas, alinhadas ao que as bancas cobram na prática.",
    fichaUrl:
      "https://www.martinsfontespaulista.com.br/direito-processual-penal-objetivo-806816/p",
    capaSrc:
      "https://martinsfontespaulista.vteximg.com.br/arquivos/ids/404956-800-1200/806816_ampliada.jpg",
  },
] as const;
