import { prisma } from "@/lib/prisma";

/**
 * KPIs operacionais do Painel do Professor (Fase 3.4) — calculados a partir
 * do banco real. Tudo com fallback gracioso: se o DB estiver indisponível
 * (ex.: DATABASE_URL ausente em dev), retorna zeros em vez de quebrar a página.
 */

export type ProfessorMetrics = {
  alunos: number; // alunos distintos com pedido PAGO
  matriculas: number; // pedidos PAGOS (inclui recompra)
  receitaCents: number; // soma dos pedidos PAGOS
  aulas: number; // aulas cadastradas
  conclusoes: number; // aulas concluídas (UserLessonProgress.completedAt)
  conclusaoMediaPct: number; // % médio de conclusão da trilha por aluno
  certificados: number; // certificados emitidos
  comentarios: number; // comentários no fórum
  comentariosPendentes: number; // aguardando moderação
};

const ZERO: ProfessorMetrics = {
  alunos: 0,
  matriculas: 0,
  receitaCents: 0,
  aulas: 0,
  conclusoes: 0,
  conclusaoMediaPct: 0,
  certificados: 0,
  comentarios: 0,
  comentariosPendentes: 0,
};

/** % médio de conclusão: aulas concluídas / (alunos × aulas). Puro/testável. */
export function completionRatePct(input: {
  conclusoes: number;
  alunos: number;
  aulas: number;
}): number {
  const universo = input.alunos * input.aulas;
  if (universo <= 0) return 0;
  return Math.round((input.conclusoes / universo) * 100);
}

/** Centavos → "R$ 1.234,56". Puro/testável. */
export function formatBRL(cents: number): string {
  return (cents / 100).toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL",
  });
}

export async function getProfessorMetrics(): Promise<ProfessorMetrics> {
  try {
    const [
      alunosRows,
      matriculas,
      receita,
      aulas,
      conclusoes,
      certificados,
      comentarios,
      comentariosPendentes,
    ] = await Promise.all([
      prisma.order.findMany({
        where: { status: "PAID" },
        select: { userId: true },
        distinct: ["userId"],
      }),
      prisma.order.count({ where: { status: "PAID" } }),
      prisma.order.aggregate({
        where: { status: "PAID" },
        _sum: { amountCents: true },
      }),
      prisma.lesson.count(),
      prisma.userLessonProgress.count({
        where: { completedAt: { not: null } },
      }),
      prisma.certificate.count(),
      prisma.comment.count(),
      prisma.comment.count({ where: { moderationStatus: "PENDING" } }),
    ]);

    const alunos = alunosRows.length;
    return {
      alunos,
      matriculas,
      receitaCents: receita._sum.amountCents ?? 0,
      aulas,
      conclusoes,
      conclusaoMediaPct: completionRatePct({ conclusoes, alunos, aulas }),
      certificados,
      comentarios,
      comentariosPendentes,
    };
  } catch (err) {
    // Uma query falha -> métricas zeradas. Logar p/ não confundir "banco
    // fora" com "0 alunos/0 receita real".
    console.error("[professor] getProfessorMetrics falhou:", err);
    return ZERO;
  }
}
