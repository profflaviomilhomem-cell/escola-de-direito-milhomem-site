/**
 * Camada de mock — pipeline editorial do blog.
 *
 * Os 3 tipos editoriais (análise de decisão · dogmática aplicada ·
 * comentário atual) seguem o blueprint Seção 8.5 do guia. Quando o
 * "wiring" começar, esta camada vira leitura de MDX em `/content/blog/`
 * ou queries Prisma sobre o modelo `Post`.
 */

export type BlogCategory =
  | "analise-decisao"
  | "dogmatica-aplicada"
  | "comentario-atual";

export type BlogStatus = "publicado" | "rascunho" | "agendado";

export type MockBlogPost = {
  slug: string;
  title: string;
  excerpt: string;
  body: string;
  category: BlogCategory;
  status: BlogStatus;
  /** ISO date — quando o artigo foi (ou será) publicado */
  publishedAt: string;
  /** Tempo estimado de leitura, em minutos */
  readingMin: number;
  /** Visualizações acumuladas (mock) */
  views: number;
  /** Tags como chips */
  tags: string[];
  /** Cover gradient (sem assets externos por enquanto) */
  cover: { from: string; to: string };
  /** Imagem de capa opcional (URL absoluta ou /public) */
  coverImage?: string;
  author: { name: string; role: string; avatarSrc: string };
};

export const CATEGORY_LABEL: Record<BlogCategory, string> = {
  "analise-decisao": "Análise de decisão",
  "dogmatica-aplicada": "Dogmática aplicada",
  "comentario-atual": "Comentário atual",
};

const FLAVIO = {
  name: "Flávio Milhomem",
  role: "Promotor de Justiça · MPDFT",
  avatarSrc: "/images/professor/flavio-avatar-64.jpg",
};

export const mockBlogPosts: MockBlogPost[] = [
  {
    slug: "stj-cadeia-custodia-laudo-65-dias",
    title:
      "STJ e o atraso de 65 dias na cadeia de custódia: defeito sanável ou nulidade?",
    excerpt:
      "Tese da defesa em alta nos tribunais — e por que o art. 158-D §3º do CPP, lido com calma, ainda blinda a acusação na maioria dos casos concretos.",
    body:
      "A reforma de 2019 trouxe ao Código Penal o protocolo formal de cadeia de custódia (arts. 158-A a 158-F). Quase seis anos depois, o STJ ainda calibra os limites entre defeito sanável e nulidade insanável — e o atraso na devolução do laudo pericial é um dos pontos mais disputados.\n\nEm decisões recentes da Sexta Turma, o Tribunal vem firmando posição no sentido de que o **simples atraso temporal**, isolado, não invalida a prova. O que o juízo exige é demonstração concreta de quebra: substituição de material, contaminação, dúvida razoável sobre a integridade do objeto periciado. Sem isso, o atraso é defeito sanável.\n\nO art. 158-D §3º é, talvez, o aliado mais subutilizado da acusação aqui. Permite a chamada \"reconstituição da cadeia\" — apresentação de elementos extrínsecos (ofício do laboratório, registro de movimentação interna no SEI, fotografias datadas) que reconectam os pontos. Bem articulado, supre o vácuo temporal sem nulificar.\n\nO promotor que enfrenta essa tese da defesa precisa, portanto, antecipar três coisas no parecer escrito: (1) prova documental do trânsito do material, (2) razão técnica para o atraso (sobrecarga laboratorial é causa frequente que o STJ aceita) e (3) ausência de prejuízo concreto à parte. Quem sustenta esses três blocos costuma vencer.",
    category: "analise-decisao",
    status: "publicado",
    publishedAt: "2026-05-04",
    readingMin: 7,
    views: 342,
    tags: ["STJ", "cadeia de custódia", "art. 158-D", "Lei 13.964/19"],
    cover: { from: "#0E2547", to: "#06172F" },
    author: FLAVIO,
  },
  {
    slug: "tipicidade-material-reincidencia-sumula-599",
    title: "Tipicidade material e Súmula 599: o réu reincidente fica sem saída?",
    excerpt:
      "A leitura literal da súmula afasta o princípio da insignificância sempre que houver reincidência. Mas três precedentes recentes flexibilizam o entendimento.",
    body:
      "A Súmula 599 do STJ é direta: \"O princípio da insignificância é inaplicável aos crimes contra a Administração Pública\". A jurisprudência derivada estendeu o raciocínio para outros contextos — entre eles, a reincidência específica em crimes patrimoniais.\n\nMas a leitura literal nem sempre cabe.\n\nNo HC 168.052/SP, o STF afastou a tipicidade material em furto de bem ínfimo (R$ 4) cometido por réu com antecedente único e antigo. A Corte ressaltou que a análise de tipicidade material é concreta, não estatística — e que reincidência não é álgebra automática.",
    category: "dogmatica-aplicada",
    status: "publicado",
    publishedAt: "2026-04-28",
    readingMin: 5,
    views: 218,
    tags: ["insignificância", "Súmula 599", "STJ", "STF"],
    cover: { from: "#1F3268", to: "#16234C" },
    author: FLAVIO,
  },
  {
    slug: "rer-635659-trafico-versus-usuario",
    title: "RE 635.659 dois anos depois: o que mudou no campo prático?",
    excerpt:
      "A descriminalização sinalizada pelo STF não chegou — mas a tese reorganizou a prova nos juízos de instrução. Onde a acusação ainda tem chão firme?",
    body:
      "O RE 635.659 não chegou a um desfecho de mérito que mudasse a Lei 11.343 — mas reorganizou, na prática, o que se cobra como prova de mercancia.\n\nO promotor que enfrenta o tema precisa hoje articular três blocos com mais cuidado do que se cobrava cinco anos atrás...",
    category: "comentario-atual",
    status: "publicado",
    publishedAt: "2026-04-15",
    readingMin: 6,
    views: 156,
    tags: ["RE 635.659", "tráfico", "Lei 11.343", "STF"],
    cover: { from: "#7E510B", to: "#5D3B0D" },
    author: FLAVIO,
  },
  {
    slug: "sustentacao-oral-stj-10-minutos",
    title: "10 minutos no STJ: a estrutura 1/3-1/3-1/3 que muda o jogo",
    excerpt:
      "Por que a sustentação oral mais técnica do mundo perde se o tempo for mal distribuído. Modelo de divisão que adoto há 25 anos no plenário.",
    body:
      "A sustentação oral é a última prova que você apresenta — e a única em que o tempo, não a tese, costuma derrotar o promotor.\n\nO modelo que adoto há 25 anos divide os 10 minutos disponíveis em três blocos rigorosos...",
    category: "dogmatica-aplicada",
    status: "rascunho",
    publishedAt: "2026-05-15",
    readingMin: 4,
    views: 0,
    tags: ["sustentação oral", "STJ", "técnica forense"],
    cover: { from: "#16234C", to: "#0F1734" },
    author: FLAVIO,
  },
  {
    slug: "lei-13964-cinco-anos-balanco",
    title: "Cinco anos da Lei 13.964/19: o que sobrou do pacote anticrime?",
    excerpt:
      "Balanço técnico-político do pacote, com mapa do que pegou no STF, do que está pendente e do que o MP precisa retomar na agenda legislativa.",
    body: "Texto em produção…",
    category: "comentario-atual",
    status: "agendado",
    publishedAt: "2026-05-22",
    readingMin: 8,
    views: 0,
    tags: ["Lei 13.964/19", "pacote anticrime", "STF", "MP"],
    cover: { from: "#3F280C", to: "#1F1505" },
    author: FLAVIO,
  },
];

export function findBlogPost(slug: string): MockBlogPost | undefined {
  return mockBlogPosts.find((p) => p.slug === slug);
}

export function publishedBlogPosts(): MockBlogPost[] {
  return mockBlogPosts
    .filter((p) => p.status === "publicado")
    .sort(
      (a, b) =>
        new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime(),
    );
}

export function relatedPosts(slug: string, limit = 3): MockBlogPost[] {
  const post = findBlogPost(slug);
  if (!post) return [];
  return publishedBlogPosts()
    .filter((p) => p.slug !== slug)
    .sort((a, b) => {
      // ordena por sobreposição de tags (relevância simples)
      const overlap = (p: MockBlogPost) =>
        p.tags.filter((t) => post.tags.includes(t)).length;
      return overlap(b) - overlap(a);
    })
    .slice(0, limit);
}
