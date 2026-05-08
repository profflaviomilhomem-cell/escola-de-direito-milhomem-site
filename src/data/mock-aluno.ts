/**
 * Camada de mock — área do aluno.
 *
 * Sustenta a UI de `/aluno/*` enquanto a Fase 0.2 (contas externas) e o
 * setup do Prisma migrations não foram executados. Quando o "wiring"
 * começar, esta camada é substituída por queries Prisma com a mesma
 * forma de dado.
 *
 * Convenções:
 * - IDs são strings determinísticas (slug-like) — sem cuid randômico.
 * - Capas de aulas/módulos são gradientes CSS (sem assets externos).
 * - Tempos em segundos.
 */

export type MockLessonStatus = "concluida" | "em-andamento" | "nao-iniciada";

export type MockLesson = {
  id: string;
  slug: string;
  title: string;
  description: string;
  durationSec: number;
  position: number;
  moduleSlug: string;
  moduleTitle: string;
  status: MockLessonStatus;
  /** Segundos já assistidos (para a barra de progresso) */
  watchedSec: number;
  /** Gradient CSS para a thumbnail (sem assets externos por enquanto) */
  cover: { from: string; to: string; angle?: number };
  /** Resumo editorial mostrado na aba "Resumo" */
  summary: string;
  /** Pontos-chave / takeaways da aula */
  keyPoints: string[];
  /** PDFs de apoio (mock — apenas títulos) */
  materials: { title: string; pages: number; sizeKb: number }[];
};

export type MockModule = {
  slug: string;
  title: string;
  subtitle: string;
  lessons: MockLesson[];
};

export type MockCourse = {
  id: string;
  slug: string;
  title: string;
  shortTitle: string;
  tagline: string;
  description: string;
  cover: { from: string; via?: string; to: string; angle?: number };
  modules: MockModule[];
  /** Total de aulas no curso (calculado, mas guardado para os componentes) */
  lessonCount: number;
  completedLessonCount: number;
};

export type MockComment = {
  id: string;
  author: { name: string; role: "aluno" | "professor" | "monitor" };
  createdAt: string; // ISO
  content: string;
  replies?: MockComment[];
};

export type MockForumThread = {
  id: string;
  slug: string;
  title: string;
  body: string;
  lessonSlug?: string; // link opcional para a aula
  createdAt: string;
  author: { name: string; role: MockComment["author"]["role"] };
  replyCount: number;
  professorReplied: boolean;
  comments: MockComment[];
};

export type MockAnnouncement = {
  id: string;
  publishedAt: string;
  eyebrow: string;
  title: string;
  body: string;
  cta?: { label: string; href: string };
};

export type MockCertificate = {
  id: string;
  slug: string;
  title: string;
  issuedAt: string;
  hash: string;
  hoursLoad: number;
  cover: { from: string; to: string };
};

export type MockOrder = {
  id: string;
  productName: string;
  amountCents: number;
  paymentMethod: "cartao" | "pix" | "boleto";
  status: "pago" | "pendente" | "cancelado";
  paidAt: string;
};

export type MockUser = {
  id: string;
  name: string;
  email: string;
  initials: string;
  joinedAt: string;
  weeklyStreak: number; // dias seguidos consumindo
  totalWatchSec: number;
};

// =====================================================================
// USUÁRIO MOCK
// =====================================================================

export const mockUser: MockUser = {
  id: "user_rafael_mock",
  name: "Rafael Andrade",
  email: "rafael@advogados-rj.com",
  initials: "RA",
  joinedAt: "2026-04-12",
  weeklyStreak: 5,
  totalWatchSec: 4 * 50 * 60 + 22 * 60, // ~3h42 — 4 aulas + meia da quinta
};

// =====================================================================
// CURSO PRINCIPAL
// =====================================================================

const NAVY = "#06172F";
const CARBON = "#242A34";
const AMBER = "#DDAD0C";
const PAPER = "#EAE4D9";

const lessons = (
  moduleSlug: string,
  moduleTitle: string,
  startPos: number,
  items: Array<{
    title: string;
    durationMin: number;
    summary: string;
    keyPoints: string[];
    materials?: MockLesson["materials"];
    status?: MockLessonStatus;
    watchedMin?: number;
    cover: MockLesson["cover"];
  }>,
): MockLesson[] =>
  items.map((it, i) => {
    const slug = `${moduleSlug}-aula-${i + 1}`;
    const status = it.status ?? "nao-iniciada";
    const watchedSec = (it.watchedMin ?? 0) * 60;
    return {
      id: `lesson_${slug}`,
      slug,
      title: it.title,
      description: it.summary.slice(0, 140) + "…",
      durationSec: it.durationMin * 60,
      position: startPos + i,
      moduleSlug,
      moduleTitle,
      status,
      watchedSec:
        status === "concluida"
          ? it.durationMin * 60
          : status === "em-andamento"
            ? watchedSec
            : 0,
      cover: it.cover,
      summary: it.summary,
      keyPoints: it.keyPoints,
      materials: it.materials ?? [],
    };
  });

export const mockCourse: MockCourse = {
  id: "prod_cohort_2026_lancamento",
  slug: "direito-penal-acusatorio-lancamento",
  title: "Direito Penal Acusatório — Edição Lançamento",
  shortTitle: "Direito Penal Acusatório",
  tagline: "Pelo ângulo da acusação. Sem pastiche. Sem filler.",
  description:
    "Doze semanas costurando a teoria penal à prática real do MP. " +
    "Cada módulo entrega ferramentas para sustentar acusação com lastro " +
    "técnico e ética processual. Aulas gravadas em vídeo, fórum direto " +
    "com Flávio Milhomem, certificado de 60h.",
  cover: { from: NAVY, via: "#0E2547", to: CARBON, angle: 135 },
  modules: [
    {
      slug: "modulo-1-fundamentos",
      title: "I — Fundamentos da Acusação",
      subtitle: "O que diferencia uma denúncia escrita pra durar.",
      lessons: lessons("modulo-1-fundamentos", "I — Fundamentos da Acusação", 1, [
        {
          title: "A acusação como narrativa técnica",
          durationMin: 48,
          status: "concluida",
          summary:
            "Por que toda peça acusatória é, antes, uma narrativa. Estrutura " +
            "factual, encadeamento lógico e ancoragem probatória. " +
            "Diferenças entre denúncia, queixa e representação.",
          keyPoints: [
            "Toda denúncia é uma narrativa que precisa convencer um terceiro neutro.",
            "Ancore cada fato em pelo menos um elemento de prova específico.",
            "Evite adjetivação — substantivos pesam, adjetivos esvaziam.",
          ],
          materials: [
            { title: "Modelo de denúncia comentada — STJ HC 612.345", pages: 14, sizeKb: 280 },
            { title: "Glossário do MP federal", pages: 6, sizeKb: 120 },
          ],
          cover: { from: "#0E2547", to: "#06172F", angle: 135 },
        },
        {
          title: "Tipicidade material: o que importa de fato",
          durationMin: 52,
          status: "concluida",
          summary:
            "Diferença entre tipicidade formal e material. Princípio da " +
            "insignificância na visão da acusação. Casos do STJ que mudaram " +
            "a jurisprudência nos últimos cinco anos.",
          keyPoints: [
            "Tipicidade material exige análise concreta do bem jurídico.",
            "Insignificância: 4 vetores cumulativos do STF.",
            "Reincidência costuma afastar insignificância — STJ Súmula 599.",
          ],
          materials: [
            { title: "Quadro comparativo — insignificância no STJ", pages: 8, sizeKb: 160 },
          ],
          cover: { from: "#1F3268", to: "#16234C", angle: 135 },
        },
        {
          title: "Princípio acusatório e ônus da prova",
          durationMin: 41,
          status: "concluida",
          summary:
            "O sistema acusatório no CPP pós-Lei 13.964/19. Iniciativa " +
            "probatória do juiz, gestão da prova pelo MP e o papel real do " +
            "investigador na construção da denúncia.",
          keyPoints: [
            "Ônus da prova é da acusação — arts. 156 e 386 CPP.",
            "Juiz das garantias e a separação funcional pós-pacote anticrime.",
            "Casos em que a defesa pode produzir prova negativa.",
          ],
          cover: { from: "#16234C", to: "#0F1734", angle: 135 },
        },
      ]),
    },
    {
      slug: "modulo-2-provas",
      title: "II — Provas e Cadeia de Custódia",
      subtitle: "Como uma prova nasce, vive e morre num processo.",
      lessons: lessons("modulo-2-provas", "II — Provas e Cadeia de Custódia", 4, [
        {
          title: "Cadeia de custódia depois da Lei 13.964/19",
          durationMin: 56,
          status: "em-andamento",
          watchedMin: 22,
          summary:
            "Os arts. 158-A a 158-F do CPP em prática. Como auditar a " +
            "cadeia desde a apreensão até o laudo final. Pontos típicos de " +
            "ataque pela defesa e como blindar a acusação.",
          keyPoints: [
            "Seis etapas: reconhecimento, isolamento, fixação, coleta, acondicionamento, transporte.",
            "Ausência de lacre não invalida automática — STJ exige prova de quebra real.",
            "Laudo fora de prazo: defeito sanável vs. insanável.",
          ],
          materials: [
            { title: "Checklist de cadeia de custódia (24 itens)", pages: 4, sizeKb: 90 },
            { title: "Decisões recentes — STJ T6", pages: 22, sizeKb: 410 },
          ],
          cover: { from: "#7E510B", to: "#5D3B0D", angle: 135 },
        },
        {
          title: "Prova digital: print, log, e a IPL 2025",
          durationMin: 47,
          summary:
            "Hash, metadados, encaminhamento espontâneo de print por terceiro. " +
            "O que a IPL 2025 mudou na admissibilidade de prova de mensagem.",
          keyPoints: [
            "Hash SHA-256 vira padrão de fato no MP.",
            "Print sem hash é prova frágil mas admitida com corroboração.",
            "WhatsApp Business API muda regime de retenção.",
          ],
          cover: { from: "#A36C0C", to: "#7E510B", angle: 135 },
        },
        {
          title: "Interceptação telefônica e o teste das três premissas",
          durationMin: 53,
          summary:
            "Indispensabilidade, fumus comissi delicti e proporcionalidade. " +
            "Como o juízo decide e onde a defesa costuma cravar nulidade.",
          keyPoints: [
            "Indispensabilidade exige demonstração de meios alternativos esgotados.",
            "Renovação de prazo — fundamentação per relationem é nula.",
            "Encontros fortuitos: três correntes ainda em aberto no STF.",
          ],
          cover: { from: "#CB8D12", to: "#A36C0C", angle: 135 },
        },
      ]),
    },
    {
      slug: "modulo-3-tipologia",
      title: "III — Tipologia Penal Aplicada",
      subtitle: "Quatro tipos que respondem pela maioria das peças do MP.",
      lessons: lessons("modulo-3-tipologia", "III — Tipologia Penal Aplicada", 7, [
        {
          title: "Furto qualificado vs. roubo: a fronteira da grave ameaça",
          durationMin: 44,
          summary:
            "Onde a doutrina e o STJ traçam a linha. Casos-limite recentes " +
            "(furto com simulacro, fuga com violência, abolitio criminis " +
            "do furto noturno).",
          keyPoints: [
            "Simulacro pode caracterizar grave ameaça em concreto.",
            "Violência contra coisa (porta, tranca) não basta para roubo.",
            "Súmula 511 STJ — privilegiada no furto também se aplica ao § 4º.",
          ],
          cover: { from: "#3F280C", to: "#1F1505", angle: 135 },
        },
        {
          title: "Tráfico vs. usuário: a dosimetria do § 4º do art. 33",
          durationMin: 49,
          summary:
            "Como o MP constrói a denúncia para garantir a tipificação " +
            "como tráfico. Critérios objetivos e subjetivos para distinguir " +
            "do usuário.",
          keyPoints: [
            "Quantidade isolada não basta — STF RE 635.659.",
            "Apreensão fracionada + dinheiro trocado = tráfico.",
            "Casa-via: investigar fluxo é mais forte que estoque.",
          ],
          cover: { from: "#5D3B0D", to: "#3F280C", angle: 135 },
        },
        {
          title: "Estupro de vulnerável e a vedação ao abrandamento",
          durationMin: 38,
          summary:
            "Súmula 593 STJ. Como a acusação trabalha em casos com pleno " +
            "consentimento aparente. Ética e técnica caminhando juntas.",
          keyPoints: [
            "Vulnerabilidade é absoluta abaixo dos 14 anos.",
            "Consentimento da vítima é juridicamente irrelevante.",
            "Discutir consequências penais e a função do MP enquanto custos legis.",
          ],
          cover: { from: "#7E510B", to: "#5D3B0D", angle: 135 },
        },
      ]),
    },
    {
      slug: "modulo-4-sustentacao",
      title: "IV — Sustentação Oral e Réplica",
      subtitle: "O microfone é a última prova que você apresenta.",
      lessons: lessons("modulo-4-sustentacao", "IV — Sustentação Oral e Réplica", 10, [
        {
          title: "Estrutura de uma sustentação oral memorável",
          durationMin: 51,
          summary:
            "Os três blocos: ancoragem factual (1/3), demonstração de " +
            "tipicidade (1/3), pedido (1/3). Tempo, ritmo, microexpressão.",
          keyPoints: [
            "10 minutos no STJ — primeiro 30s decide se vão ouvir.",
            "Citações de doutrina valem mais que de jurisprudência genérica.",
            "Pedido sempre com numeração explícita ('item 1, item 2').",
          ],
          cover: { from: "#0F1734", to: "#0E2547", angle: 135 },
        },
        {
          title: "Réplica: o que responder e o que ignorar",
          durationMin: 42,
          summary:
            "Triagem de argumentos defensivos. Quais você ataca de frente " +
            "e quais você esvazia por silêncio estratégico.",
          keyPoints: [
            "Argumento de fato → responder com prova específica.",
            "Argumento doutrinário sem precedente → silêncio é resposta.",
            "Nunca repita argumento da defesa para refutá-lo — ancora na cabeça do tribunal.",
          ],
          cover: { from: "#16234C", to: "#0F1734", angle: 135 },
        },
        {
          title: "Encerramento: o pedido como peça autônoma",
          durationMin: 36,
          summary:
            "Pedido bem feito é metade da acusação. Construção, dosimetria " +
            "e a margem ética entre exigir o teto e calibrar pelo provável.",
          keyPoints: [
            "Sempre formule alternativos (principal + subsidiário).",
            "Dosimetria pedida por escrito — o juiz tende a se ancorar.",
            "Reservar o último parágrafo para o que você quer que fique como manchete.",
          ],
          cover: { from: "#1F3268", to: "#16234C", angle: 135 },
        },
      ]),
    },
  ],
  lessonCount: 12,
  completedLessonCount: 3,
};

// =====================================================================
// FÓRUM
// =====================================================================

export const mockForumThreads: MockForumThread[] = [
  {
    id: "thread_001",
    slug: "cadeia-custodia-prazo-laudo",
    title: "Laudo pericial entregue 65 dias depois — ainda dá pra blindar a denúncia?",
    body:
      "Caso real que está parado no nosso gabinete: PC apreendeu material em " +
      "março, laudo só voltou em junho. Defesa já apontou o atraso como " +
      "quebra de cadeia. Vocês usariam art. 158-D §3º para sustentar " +
      "regularidade ou já abriria flanco para nulidade?",
    lessonSlug: "modulo-2-provas-aula-1",
    createdAt: "2026-05-04T14:32:00Z",
    author: { name: "Patrícia Mendonça", role: "aluno" },
    replyCount: 4,
    professorReplied: true,
    comments: [
      {
        id: "c1",
        author: { name: "Flávio Milhomem", role: "professor" },
        createdAt: "2026-05-04T18:10:00Z",
        content:
          "Patrícia, atraso isolado não invalida — STJ tem firmado que cabe " +
          "à defesa demonstrar quebra concreta. O 158-D §3º é seu aliado. " +
          "Resposta: sustenta regularidade documentando o trânsito do " +
          "material e o motivo do prazo (sobrecarga laboratorial é causa " +
          "frequente que o STJ aceita).",
        replies: [
          {
            id: "c1a",
            author: { name: "Patrícia Mendonça", role: "aluno" },
            createdAt: "2026-05-04T19:02:00Z",
            content:
              "Faz sentido. Tenho ofício do laboratório justificando o " +
              "atraso por backlog. Vou anexar à manifestação.",
          },
          {
            id: "c1b",
            author: { name: "Tiago Bernardes", role: "aluno" },
            createdAt: "2026-05-04T20:15:00Z",
            content:
              "Eu juntaria também o trânsito interno do material — " +
              "movimentação no SEI ou equivalente. Costumo blindar com " +
              "isso aqui no MPF.",
          },
        ],
      },
      {
        id: "c2",
        author: { name: "Marina Souto", role: "monitor" },
        createdAt: "2026-05-04T21:40:00Z",
        content:
          "Lembrete prático: a STJ Sexta Turma exige demonstração da " +
          "quebra. Sem prova de adulteração ou troca de material o " +
          "atraso é defeito sanável.",
      },
    ],
  },
  {
    id: "thread_002",
    slug: "tripico-fronteira-usuario",
    title: "Apreensão fracionada + R$ 480 em notas pequenas: tráfico ou margem do § 4º?",
    body:
      "MP estadual aqui. Caso clássico: 12 porções, balança, dinheiro em " +
      "trocados. Defensoria está pedindo aplicação do § 4º. Sustento " +
      "tráfico puro com base no fluxo, mas a juíza tem inclinação por " +
      "minoritária dela. Como vocês argumentariam contra-fluxo?",
    lessonSlug: "modulo-3-tipologia-aula-2",
    createdAt: "2026-05-03T09:15:00Z",
    author: { name: "Diego Pessoa", role: "aluno" },
    replyCount: 2,
    professorReplied: true,
    comments: [
      {
        id: "c3",
        author: { name: "Flávio Milhomem", role: "professor" },
        createdAt: "2026-05-03T17:00:00Z",
        content:
          "Diego, fluxo > estoque, sempre. Estrutura sua sustentação em três " +
          "blocos: (1) fracionamento dosado, (2) instrumento (balança), " +
          "(3) dinheiro convertido. Os três juntos evidenciam mercancia. " +
          "Para neutralizar a tendência da magistrada: cite RE 635.659 do " +
          "STF e o teste das circunstâncias do caso concreto.",
      },
      {
        id: "c4",
        author: { name: "Diego Pessoa", role: "aluno" },
        createdAt: "2026-05-03T19:22:00Z",
        content:
          "Perfeito. Vou amarrar o RE no parecer escrito antes da audiência.",
      },
    ],
  },
  {
    id: "thread_003",
    slug: "sustentacao-oral-tempo",
    title: "Como vocês cronometram 10 minutos de sustentação no STJ?",
    body:
      "Tô preparando minha primeira pelo MPF e a ansiedade de cronômetro " +
      "está me travando. Alguém compartilha um modelo de marcação?",
    lessonSlug: "modulo-4-sustentacao-aula-1",
    createdAt: "2026-05-02T11:48:00Z",
    author: { name: "Lúcia Fernandes", role: "aluno" },
    replyCount: 3,
    professorReplied: false,
    comments: [
      {
        id: "c5",
        author: { name: "Tiago Bernardes", role: "aluno" },
        createdAt: "2026-05-02T13:05:00Z",
        content:
          "Eu divido em 3 blocos de 3min com 60s de margem. Treino com " +
          "cronômetro de mesa em silêncio. Os primeiros 30s eu memorizo " +
          "literalmente.",
        replies: [
          {
            id: "c5a",
            author: { name: "Lúcia Fernandes", role: "aluno" },
            createdAt: "2026-05-02T13:30:00Z",
            content: "Boa. Vou montar uma planilha desse jeito.",
          },
        ],
      },
      {
        id: "c6",
        author: { name: "Marina Souto", role: "monitor" },
        createdAt: "2026-05-02T15:10:00Z",
        content:
          "Lúcia, na aula 10 (módulo IV) o Flávio mostra a estrutura " +
          "1/3-1/3-1/3 que muda o jogo. Recomendo assistir antes da " +
          "sustentação.",
      },
    ],
  },
];

// =====================================================================
// ANÚNCIOS
// =====================================================================

export const mockAnnouncements: MockAnnouncement[] = [
  {
    id: "ann_001",
    publishedAt: "2026-05-06",
    eyebrow: "Aviso institucional",
    title: "Sessão ao vivo de Q&A com Flávio — 15/mai, 20h",
    body:
      "Bloco aberto para perguntas sobre a Aula 5 (cadeia de custódia). " +
      "Link na semana e gravação fica permanente na sua conta.",
    cta: { label: "Adicionar à agenda", href: "#" },
  },
  {
    id: "ann_002",
    publishedAt: "2026-05-02",
    eyebrow: "Material novo",
    title: "Novo PDF — Quadro comparativo de insignificância no STJ",
    body:
      "Tabela cruzada de 23 acórdãos recentes. Anexo na Aula 2 do Módulo I, " +
      "também disponível na sua biblioteca.",
    cta: { label: "Abrir PDF", href: "#" },
  },
];

// =====================================================================
// CERTIFICADOS
// =====================================================================

export const mockCertificates: MockCertificate[] = [
  {
    id: "cert_001",
    slug: "masterclass-dosimetria-2026",
    title: "Masterclass — Dosimetria Trifásica na Prática",
    issuedAt: "2026-03-22",
    hash: "fmcert_a8c3d12e9b4f7",
    hoursLoad: 8,
    cover: { from: "#1F3268", to: "#06172F" },
  },
];

// =====================================================================
// PEDIDOS
// =====================================================================

export const mockOrders: MockOrder[] = [
  {
    id: "ord_001",
    productName: "Direito Penal Acusatório — Edição Lançamento",
    amountCents: 1_997_00,
    paymentMethod: "cartao",
    status: "pago",
    paidAt: "2026-04-12",
  },
];

// =====================================================================
// HELPERS
// =====================================================================

export function findLessonBySlug(slug: string): MockLesson | null {
  for (const mod of mockCourse.modules) {
    const found = mod.lessons.find((l) => l.slug === slug);
    if (found) return found;
  }
  return null;
}

export function findThreadBySlug(slug: string): MockForumThread | null {
  return mockForumThreads.find((t) => t.slug === slug) ?? null;
}

/** Próxima aula sugerida (em-andamento ou primeira não-iniciada) */
export function nextLesson(): MockLesson | null {
  for (const mod of mockCourse.modules) {
    const inProgress = mod.lessons.find((l) => l.status === "em-andamento");
    if (inProgress) return inProgress;
  }
  for (const mod of mockCourse.modules) {
    const notStarted = mod.lessons.find((l) => l.status === "nao-iniciada");
    if (notStarted) return notStarted;
  }
  return null;
}

export function formatDuration(seconds: number): string {
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  if (h > 0) return `${h}h${m.toString().padStart(2, "0")}`;
  return `${m}min`;
}

export const palette = { NAVY, CARBON, AMBER, PAPER };
