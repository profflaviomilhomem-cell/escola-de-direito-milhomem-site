import type { Metadata } from "next";

import { getAdminDashboard } from "@/lib/admin/dashboard-metrics";
import { requireAdminSession } from "@/lib/auth/require-admin";
import { getCohortVagas } from "@/lib/marketing/catalog";
import { formatBRL } from "@/lib/professor/metrics";
import { fmTitleClamp } from "@/lib/ui/fm-title-clamp";
import { formatDateShortPtBR } from "@/lib/utils";

export const metadata: Metadata = {
  title: "Painel interno — Operação",
  robots: { index: false, follow: false },
};

const ORDER_STATUS_LABEL: Record<string, string> = {
  PAID: "Pago",
  PENDING: "Pendente",
  AUTHORIZED: "Autorizado",
  REFUSED: "Recusado",
  REFUNDED: "Reembolsado",
  CHARGEDBACK: "Chargeback",
};

export default async function AdminDashboardPage() {
  await requireAdminSession();
  const [m, vagas] = await Promise.all([getAdminDashboard(), getCohortVagas()]);

  const comercial: Array<{ label: string; value: string; hint: string }> = [
    {
      label: "Receita",
      value: formatBRL(m.receitaCents),
      hint: "pedidos pagos",
    },
    {
      label: "Pedidos pagos",
      value: String(m.pedidosPagos),
      hint: "inclui recompra",
    },
    {
      label: "Pendentes",
      value: String(m.pedidosPendentes),
      hint: "aguardando pagamento",
    },
    {
      label: "Reembolsos",
      value: String(m.pedidosReembolsados),
      hint: "pedidos reembolsados",
    },
    {
      label: "Alunos",
      value: String(m.alunos),
      hint: "com acesso liberado",
    },
    {
      label: "Assinaturas",
      value: String(m.assinaturasAtivas),
      hint: "ativas (comunidade)",
    },
  ];

  const funil: Array<{ label: string; value: string; hint: string }> = [
    {
      label: "Leads",
      value: String(m.leadsTotal),
      hint: "capturados",
    },
    {
      label: "Leads confirmados",
      value: `${m.leadsConfirmados}`,
      hint: `${m.taxaConfirmacaoPct}% de confirmação (duplo opt-in)`,
    },
    {
      label: "Vagas da turma",
      value: vagas ? `${vagas.restantes}/${vagas.total}` : "—",
      hint: vagas ? `${vagas.preenchidas} preenchidas` : "banco indisponível",
    },
    {
      label: "Aulas concluídas",
      value: String(m.conclusoes),
      hint: "registros de conclusão",
    },
    {
      label: "Certificados",
      value: String(m.certificados),
      hint: "emitidos",
    },
    {
      label: "Moderação",
      value: String(m.comentariosPendentes),
      hint: m.comentariosPendentes > 0 ? "comentários pendentes" : "fila limpa",
    },
  ];

  return (
    <section className="fm-site-page py-12">
      <p className="text-amber font-mono text-[10px] tracking-[0.2em] uppercase">
        Operação
      </p>
      <h1
        className="fm-title-fluid mt-3 font-serif leading-[1.05]"
        style={fmTitleClamp("36px", "4.5vw", "56px")}
      >
        Painel <em className="text-amber italic">interno</em>
      </h1>
      <p className="text-paper-700 mt-4 max-w-2xl text-base leading-relaxed">
        Visão agregada em tempo real — comercial, aquisição e produto — a partir
        do banco. Indicadores para a rotina de operação da Escola.
      </p>

      <h2 className="text-paper-700 mt-12 font-mono text-[11px] tracking-[0.2em] uppercase">
        Comercial
      </h2>
      <div className="border-paper-100 bg-paper-100 mt-4 grid gap-px sm:grid-cols-2 lg:grid-cols-3 [&>*]:bg-white">
        {comercial.map((c) => (
          <div key={c.label} className="px-6 py-7">
            <p className="text-paper-600 font-mono text-[10px] tracking-[0.2em] uppercase">
              {c.label}
            </p>
            <p className="text-paper mt-3 font-serif text-4xl leading-none">
              {c.value}
            </p>
            <p className="text-paper-600 mt-2 text-[13px]">{c.hint}</p>
          </div>
        ))}
      </div>

      <h2 className="text-paper-700 mt-12 font-mono text-[11px] tracking-[0.2em] uppercase">
        Aquisição e produto
      </h2>
      <div className="border-paper-100 bg-paper-100 mt-4 grid gap-px sm:grid-cols-2 lg:grid-cols-3 [&>*]:bg-white">
        {funil.map((c) => (
          <div key={c.label} className="px-6 py-7">
            <p className="text-paper-600 font-mono text-[10px] tracking-[0.2em] uppercase">
              {c.label}
            </p>
            <p className="text-paper mt-3 font-serif text-4xl leading-none">
              {c.value}
            </p>
            <p className="text-paper-600 mt-2 text-[13px]">{c.hint}</p>
          </div>
        ))}
      </div>

      <div className="mt-12 grid gap-8 lg:grid-cols-[1.4fr_1fr]">
        {/* Pedidos recentes */}
        <div>
          <h2 className="text-paper-700 font-mono text-[11px] tracking-[0.2em] uppercase">
            Últimos pedidos
          </h2>
          {m.recentOrders.length === 0 ? (
            <p className="text-paper-600 mt-4 text-sm italic">
              Nenhum pedido registrado ainda.
            </p>
          ) : (
            <ul className="border-paper-100 bg-carbon-elevated/30 divide-paper-100 mt-4 divide-y border">
              {m.recentOrders.map((o) => (
                <li
                  key={o.id}
                  className="flex items-center justify-between gap-3 px-5 py-3"
                >
                  <div className="min-w-0">
                    <p className="text-paper truncate text-sm">{o.produto}</p>
                    <p className="text-paper-600 font-mono text-[11px]">
                      {formatDateShortPtBR(o.createdAt)} ·{" "}
                      {ORDER_STATUS_LABEL[o.status] ?? o.status}
                    </p>
                  </div>
                  <span className="text-paper shrink-0 font-mono text-sm">
                    {formatBRL(o.amountCents)}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* Top campanhas */}
        <div>
          <h2 className="text-paper-700 font-mono text-[11px] tracking-[0.2em] uppercase">
            Top campanhas (UTM)
          </h2>
          {m.topCampaigns.length === 0 ? (
            <p className="text-paper-600 mt-4 text-sm italic">
              Sem eventos de campanha registrados.
            </p>
          ) : (
            <ul className="border-paper-100 bg-carbon-elevated/30 divide-paper-100 mt-4 divide-y border">
              {m.topCampaigns.map((c) => (
                <li
                  key={c.campaign}
                  className="flex items-center justify-between gap-3 px-5 py-3"
                >
                  <span className="text-paper truncate text-sm">
                    {c.campaign}
                  </span>
                  <span className="text-paper-600 shrink-0 font-mono text-sm">
                    {c.total}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </section>
  );
}
