import { ORDER_STATUSES_WITH_ACCESS } from "@/lib/business/commercial-rules";
import { prisma } from "@/lib/prisma";

/**
 * KPIs operacionais do painel interno (/admin/dashboard) — visão de aquisição
 * e comercial agregada do banco real. Fallback gracioso: DB indisponível
 * retorna zeros e listas vazias em vez de quebrar a página.
 */

export type RecentOrder = {
  id: string;
  produto: string;
  status: string;
  amountCents: number;
  createdAt: string;
};

export type CampaignRow = { campaign: string; total: number };

export type AdminDashboard = {
  receitaCents: number;
  pedidosPagos: number;
  pedidosPendentes: number;
  pedidosReembolsados: number;
  alunos: number;
  assinaturasAtivas: number;
  leadsTotal: number;
  leadsConfirmados: number;
  taxaConfirmacaoPct: number;
  aulas: number;
  conclusoes: number;
  certificados: number;
  comentariosPendentes: number;
  recentOrders: RecentOrder[];
  topCampaigns: CampaignRow[];
};

const ZERO: AdminDashboard = {
  receitaCents: 0,
  pedidosPagos: 0,
  pedidosPendentes: 0,
  pedidosReembolsados: 0,
  alunos: 0,
  assinaturasAtivas: 0,
  leadsTotal: 0,
  leadsConfirmados: 0,
  taxaConfirmacaoPct: 0,
  aulas: 0,
  conclusoes: 0,
  certificados: 0,
  comentariosPendentes: 0,
  recentOrders: [],
  topCampaigns: [],
};

/** Taxa de confirmação de leads (duplo opt-in). Puro/testável. */
export function confirmRatePct(input: {
  total: number;
  confirmados: number;
}): number {
  if (input.total <= 0) return 0;
  return Math.round((input.confirmados / input.total) * 100);
}

export async function getAdminDashboard(): Promise<AdminDashboard> {
  try {
    const [
      receita,
      pedidosPagos,
      pedidosPendentes,
      pedidosReembolsados,
      alunosRows,
      assinaturasAtivas,
      leadsTotal,
      leadsConfirmados,
      aulas,
      conclusoes,
      certificados,
      comentariosPendentes,
      recentRows,
      campaignGroups,
    ] = await Promise.all([
      prisma.order.aggregate({
        where: { status: "PAID" },
        _sum: { amountCents: true },
      }),
      prisma.order.count({ where: { status: "PAID" } }),
      prisma.order.count({ where: { status: "PENDING" } }),
      prisma.order.count({ where: { status: "REFUNDED" } }),
      prisma.order.findMany({
        where: { status: { in: [...ORDER_STATUSES_WITH_ACCESS] } },
        select: { userId: true },
        distinct: ["userId"],
      }),
      prisma.subscription.count({ where: { status: "ACTIVE" } }),
      prisma.lead.count(),
      prisma.lead.count({ where: { doubleOptInAt: { not: null } } }),
      prisma.lesson.count(),
      prisma.userLessonProgress.count({
        where: { completedAt: { not: null } },
      }),
      prisma.certificate.count(),
      prisma.comment.count({ where: { moderationStatus: "PENDING" } }),
      prisma.order.findMany({
        orderBy: { createdAt: "desc" },
        take: 10,
        select: {
          id: true,
          status: true,
          amountCents: true,
          createdAt: true,
          product: { select: { name: true } },
        },
      }),
      prisma.uTMEvent.groupBy({
        by: ["utmCampaign"],
        where: { utmCampaign: { not: null } },
        _count: { _all: true },
        orderBy: { _count: { utmCampaign: "desc" } },
        take: 5,
      }),
    ]);

    return {
      receitaCents: receita._sum.amountCents ?? 0,
      pedidosPagos,
      pedidosPendentes,
      pedidosReembolsados,
      alunos: alunosRows.length,
      assinaturasAtivas,
      leadsTotal,
      leadsConfirmados,
      taxaConfirmacaoPct: confirmRatePct({
        total: leadsTotal,
        confirmados: leadsConfirmados,
      }),
      aulas,
      conclusoes,
      certificados,
      comentariosPendentes,
      recentOrders: recentRows.map((o) => ({
        id: o.id,
        produto: o.product.name,
        status: o.status,
        amountCents: o.amountCents,
        createdAt: o.createdAt.toISOString(),
      })),
      topCampaigns: campaignGroups.map((g) => ({
        campaign: g.utmCampaign ?? "—",
        total: g._count._all,
      })),
    };
  } catch {
    return ZERO;
  }
}
