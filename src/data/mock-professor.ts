/**
 * Camada de mock — área do professor (admin).
 *
 * Reaproveita `mockForumThreads` e `mockCourse` da camada do aluno
 * para manter coerência cruzada (a thread que o aluno vê como "minha
 * pergunta" é a mesma que o professor vê como "aguardando minha
 * resposta"). Quando o "wiring" começar, vira queries Prisma com
 * filtros por role e timestamps reais.
 */

import {
  mockCourse,
  mockForumThreads,
  type MockForumThread,
} from "@/data/mock-aluno";

// =====================================================================
// PROFESSOR (sessão admin)
// =====================================================================

export const mockProfessor = {
  id: "user_flavio_mock",
  name: "Flávio Milhomem",
  email: "flavio@escolaflaviomilhomem.com.br",
  initials: "FM",
  title: "Promotor de Justiça do MPDFT · Ouvidor-Geral 2025–2027",
  avatarSrc: "/images/professor/flavio-avatar-64.jpg",
  portraitSrc: "/images/professor/flavio-portrait.png",
};

// =====================================================================
// MÉTRICAS — totais agregados (mock)
// =====================================================================

export type MockMetric = {
  label: string;
  value: string;
  /** Variação opcional (texto curto, ex.: "+3 essa semana") */
  delta?: string;
  /** Tom visual da variação */
  tone?: "positive" | "neutral" | "alert";
};

export const mockMetrics: MockMetric[] = [
  {
    label: "Alunos ativos",
    value: "37",
    delta: "+3 esta semana",
    tone: "positive",
  },
  {
    label: "Taxa de conclusão",
    value: "62%",
    delta: "+4 pp vs. cohort piloto",
    tone: "positive",
  },
  {
    label: "NPS do cohort",
    value: "8,4",
    delta: "n=24 respostas",
    tone: "neutral",
  },
  {
    label: "Aguardando resposta",
    value: mockForumThreads
      .filter((t) => !t.professorReplied)
      .length.toString(),
    delta: "SLA 72h",
    tone: "alert",
  },
];

// =====================================================================
// FÓRUM — threads que ainda não receberam resposta do professor
// =====================================================================

/**
 * Threads filtradas para o professor: as que precisam da palavra dele.
 * Em produção isso seria `where: { professorRepliedAt: null }`.
 */
export function pendingThreadsForProfessor(): MockForumThread[] {
  return mockForumThreads.filter((t) => !t.professorReplied);
}

/**
 * Threads onde o professor já respondeu (para a timeline de atividade).
 */
export function answeredThreadsForProfessor(): MockForumThread[] {
  return mockForumThreads.filter((t) => t.professorReplied);
}

// =====================================================================
// ATIVIDADE RECENTE — feed misto (alunos novos, comentários, conclusões)
// =====================================================================

export type MockActivity = {
  id: string;
  kind: "novo-aluno" | "comentario" | "aula-concluida" | "anuncio-publicado";
  who: string;
  when: string; // texto humano: "agora", "há 2h", "ontem"
  detail: string;
  href?: string;
};

export const mockActivity: MockActivity[] = [
  {
    id: "act_1",
    kind: "comentario",
    who: "Patrícia Mendonça",
    when: "há 4 horas",
    detail: "abriu tópico sobre laudo pericial entregue 65 dias depois.",
    href: "/professor/forum#cadeia-custodia-prazo-laudo",
  },
  {
    id: "act_2",
    kind: "aula-concluida",
    who: "Diego Pessoa",
    when: "há 6 horas",
    detail: "concluiu a Aula 2 do Módulo III (Tráfico vs. usuário).",
  },
  {
    id: "act_3",
    kind: "novo-aluno",
    who: "Camila Veloso",
    when: "ontem",
    detail: "matriculou-se no cohort 2026.",
  },
  {
    id: "act_4",
    kind: "comentario",
    who: "Lúcia Fernandes",
    when: "há 2 dias",
    detail: "perguntou como cronometrar 10 min de sustentação no STJ.",
    href: "/professor/forum#sustentacao-oral-tempo",
  },
  {
    id: "act_5",
    kind: "anuncio-publicado",
    who: "Você",
    when: "há 3 dias",
    detail: "publicou aviso da sessão ao vivo de 15/mai.",
  },
];

// =====================================================================
// ANÚNCIOS PUBLICADOS — escritos pelo professor para o cohort
// =====================================================================

export type MockProfessorAnnouncement = {
  id: string;
  publishedAt: string;
  title: string;
  body: string;
  audience: "todos" | "modulo-1" | "modulo-2" | "modulo-3" | "modulo-4";
  views: number;
};

export const mockProfessorAnnouncements: MockProfessorAnnouncement[] = [
  {
    id: "pa_1",
    publishedAt: "2026-05-06",
    title: "Sessão ao vivo de Q&A — 15/mai, 20h",
    body:
      "Vamos abrir 90 minutos para perguntas sobre cadeia de custódia. " +
      "Link enviado por e-mail; gravação fica permanente na sua conta.",
    audience: "todos",
    views: 31,
  },
  {
    id: "pa_2",
    publishedAt: "2026-05-02",
    title: "Novo PDF — Quadro comparativo de insignificância no STJ",
    body: "Tabela cruzada de 23 acórdãos recentes anexada à Aula 2 do Módulo I.",
    audience: "modulo-1",
    views: 22,
  },
  {
    id: "pa_3",
    publishedAt: "2026-04-25",
    title: "Boas-vindas ao cohort 2026",
    body:
      "Estou animado para começar este cohort. As primeiras três aulas " +
      "abrem na semana que vem. Qualquer dúvida, fórum aberto 24/7.",
    audience: "todos",
    views: 37,
  },
];

// =====================================================================
// ALUNOS — pequena amostra para a futura página /professor/alunos
// =====================================================================

export type MockEnrolledStudent = {
  id: string;
  name: string;
  email: string;
  initials: string;
  joinedAt: string;
  progressPct: number;
  lastSeen: string; // texto humano
};

export const mockStudents: MockEnrolledStudent[] = [
  {
    id: "stu_001",
    name: "Rafael Andrade",
    email: "rafael@advogados-rj.com",
    initials: "RA",
    joinedAt: "2026-04-12",
    progressPct: 0.33,
    lastSeen: "agora",
  },
  {
    id: "stu_002",
    name: "Patrícia Mendonça",
    email: "patricia@mpdft.mp.br",
    initials: "PM",
    joinedAt: "2026-04-13",
    progressPct: 0.41,
    lastSeen: "há 4 horas",
  },
  {
    id: "stu_003",
    name: "Diego Pessoa",
    email: "diego.pessoa@mpsp.mp.br",
    initials: "DP",
    joinedAt: "2026-04-15",
    progressPct: 0.5,
    lastSeen: "há 6 horas",
  },
  {
    id: "stu_004",
    name: "Lúcia Fernandes",
    email: "lucia.f@mpf.mp.br",
    initials: "LF",
    joinedAt: "2026-04-19",
    progressPct: 0.25,
    lastSeen: "há 2 dias",
  },
  {
    id: "stu_005",
    name: "Tiago Bernardes",
    email: "tiago.b@advogados-df.com",
    initials: "TB",
    joinedAt: "2026-04-20",
    progressPct: 0.66,
    lastSeen: "ontem",
  },
  {
    id: "stu_006",
    name: "Camila Veloso",
    email: "camila.v@oab-rj.org.br",
    initials: "CV",
    joinedAt: "2026-05-07",
    progressPct: 0.08,
    lastSeen: "há 12 horas",
  },
  {
    id: "stu_007",
    name: "Marcos Lopes",
    email: "marcos.lopes@mpgo.mp.br",
    initials: "ML",
    joinedAt: "2026-04-25",
    progressPct: 0.92,
    lastSeen: "há 3 horas",
  },
];

// =====================================================================
// REFERÊNCIA AO CURSO ATIVO — para CTAs do dashboard
// =====================================================================

export const activeCourse = mockCourse;
