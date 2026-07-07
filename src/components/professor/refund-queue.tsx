"use client";

import { useState } from "react";
import { toast } from "sonner";

export type RefundQueueItem = {
  id: string;
  status: string;
  reason: string | null;
  amountCents: number | null;
  createdAt: string;
  productName: string;
  productSlug: string;
  alunoEmail: string;
  alunoName: string | null;
  orderAmountCents: number;
  hasCharge: boolean;
};

function formatMoney(cents: number) {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(cents / 100);
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    year: "2-digit",
  });
}

export function RefundQueue({ initial }: { initial: RefundQueueItem[] }) {
  const [items, setItems] = useState(initial);
  const [busyId, setBusyId] = useState<string | null>(null);

  async function decide(id: string, decision: "approve" | "reject") {
    setBusyId(id);
    try {
      const res = await fetch("/api/admin/refunds", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ refundRequestId: id, decision }),
      });
      const body = await res.json().catch(() => ({}));
      if (!res.ok) {
        throw new Error(body.error || "Falha ao processar a decisão.");
      }
      toast.success(
        decision === "approve"
          ? "Reembolso aprovado e estorno solicitado ao Pagar.me."
          : "Solicitação rejeitada.",
      );
      setItems((prev) => prev.filter((i) => i.id !== id));
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Erro inesperado.");
    } finally {
      setBusyId(null);
    }
  }

  if (items.length === 0) {
    return (
      <p className="text-paper-600 mt-8 text-sm italic">
        Nenhuma solicitação de reembolso em aberto.
      </p>
    );
  }

  return (
    <div className="mt-8 space-y-4">
      {items.map((item) => (
        <div
          key={item.id}
          className="border-paper-100 bg-carbon-elevated border p-5"
        >
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div className="min-w-0">
              <p className="text-paper font-semibold">{item.productName}</p>
              <p className="text-paper-600 fm-mono mt-1 text-xs">
                {item.alunoName ? `${item.alunoName} · ` : ""}
                {item.alunoEmail}
              </p>
              <p className="text-paper-600 fm-mono mt-1 text-xs">
                Solicitado em {formatDate(item.createdAt)}
                {!item.hasCharge && " · sem cobrança Pagar.me"}
              </p>
              {item.reason && (
                <p className="text-paper-700 mt-3 max-w-prose text-sm">
                  “{item.reason}”
                </p>
              )}
            </div>
            <div className="text-right">
              <p className="text-paper-600 fm-mono text-xs">Valor elegível</p>
              <p className="text-amber fm-mono text-lg">
                {formatMoney(item.amountCents ?? 0)}
              </p>
              <p className="text-paper-600 fm-mono mt-1 text-xs">
                pedido {formatMoney(item.orderAmountCents)}
              </p>
            </div>
          </div>

          <div className="mt-4 flex gap-3">
            <button
              type="button"
              onClick={() => decide(item.id, "approve")}
              disabled={busyId === item.id}
              className="bg-amber text-carbon hover:bg-amber-soft fm-mono px-4 py-2 text-xs transition-colors disabled:cursor-not-allowed disabled:opacity-50"
            >
              {busyId === item.id ? "Processando…" : "Aprovar e estornar"}
            </button>
            <button
              type="button"
              onClick={() => decide(item.id, "reject")}
              disabled={busyId === item.id}
              className="border-paper-200 text-paper-700 hover:border-alerta-400 hover:text-alerta-400 fm-mono border px-4 py-2 text-xs transition-colors disabled:cursor-not-allowed disabled:opacity-50"
            >
              Rejeitar
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}
