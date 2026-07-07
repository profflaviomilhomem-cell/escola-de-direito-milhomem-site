import type { Metadata } from "next";

import {
  RefundQueue,
  type RefundQueueItem,
} from "@/components/professor/refund-queue";
import { requireAdminSession } from "@/lib/auth/require-admin";
import { listOpenRefundRequests } from "@/lib/refunds/summary";
import { fmTitleClamp } from "@/lib/ui/fm-title-clamp";

export const metadata: Metadata = {
  title: "Reembolsos — Painel do professor",
  robots: { index: false, follow: false },
};

export default async function ProfessorReembolsosPage() {
  await requireAdminSession();

  let items: RefundQueueItem[] = [];
  try {
    const requests = await listOpenRefundRequests();
    items = requests.map((r) => ({
      id: r.id,
      status: r.status,
      reason: r.reason,
      amountCents: r.amountCents,
      createdAt: r.createdAt.toISOString(),
      productName: r.order.product.name,
      productSlug: r.order.product.slug,
      alunoEmail: r.order.user.email,
      alunoName: r.order.user.name,
      orderAmountCents: r.order.amountCents,
      hasCharge: Boolean(r.order.pagarmeChargeId),
    }));
  } catch {
    /* DB indisponível — a fila renderiza vazia */
  }

  return (
    <section className="fm-site-page py-12">
      <p className="text-amber font-mono text-[10px] tracking-[0.2em] uppercase">
        Comercial
      </p>
      <h1
        className="fm-title-fluid mt-3 font-serif leading-[1.05]"
        style={fmTitleClamp("36px", "4.5vw", "56px")}
      >
        Fila de <em className="text-amber italic">reembolsos</em>
      </h1>
      <p className="text-paper-600 mt-4 max-w-2xl text-sm leading-relaxed">
        Solicitações abertas pelos alunos. Aprovar executa o estorno no Pagar.me
        e marca o pedido como reembolsado; rejeitar registra a recusa. O valor
        elegível segue a Política de Reembolso.
      </p>

      <RefundQueue initial={items} />
    </section>
  );
}
