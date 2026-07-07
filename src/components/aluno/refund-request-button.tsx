"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";

type Props = {
  orderId: string;
  /** Valor elegível estimado (centavos) segundo a política. */
  eligibleAmountCents: number;
};

function formatMoney(cents: number) {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(cents / 100);
}

export function RefundRequestButton({ orderId, eligibleAmountCents }: Props) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [reason, setReason] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function submit() {
    setIsSubmitting(true);
    try {
      const res = await fetch("/api/aluno/refunds", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ orderId, reason: reason.trim() || undefined }),
      });
      const body = await res.json().catch(() => ({}));
      if (!res.ok) {
        throw new Error(body.error || "Falha ao solicitar reembolso.");
      }
      toast.success(
        "Solicitação de reembolso registrada. Nossa equipe vai analisar.",
      );
      setOpen(false);
      router.refresh();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Erro inesperado.");
    } finally {
      setIsSubmitting(false);
    }
  }

  if (!open) {
    return (
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="border-paper-200 text-paper-700 hover:border-amber hover:text-amber fm-mono mt-3 border px-4 py-2 text-xs transition-colors"
      >
        Solicitar reembolso
      </button>
    );
  }

  return (
    <div className="border-paper-100 bg-carbon mt-3 border p-4">
      <p className="text-paper-700 text-sm">
        Valor elegível estimado:{" "}
        <span className="text-amber font-semibold">
          {formatMoney(eligibleAmountCents)}
        </span>
        .{" "}
        <Link
          href="/reembolso"
          className="text-paper-600 hover:text-amber underline underline-offset-2"
        >
          Ver Política de Reembolso
        </Link>
      </p>
      <label className="mt-3 block">
        <span className="text-paper-600 fm-mono text-xs">
          Motivo (opcional)
        </span>
        <textarea
          value={reason}
          onChange={(e) => setReason(e.target.value)}
          rows={3}
          maxLength={1000}
          className="border-paper-200 focus:border-amber bg-carbon-elevated text-paper mt-2 block w-full border px-3 py-2 text-sm transition-colors outline-none"
          placeholder="Conte por que você quer o reembolso."
        />
      </label>
      <div className="mt-3 flex gap-3">
        <button
          type="button"
          onClick={submit}
          disabled={isSubmitting}
          className="bg-amber text-carbon hover:bg-amber-soft fm-mono px-4 py-2 text-xs transition-colors disabled:cursor-not-allowed disabled:opacity-50"
        >
          {isSubmitting ? "Enviando…" : "Confirmar solicitação"}
        </button>
        <button
          type="button"
          onClick={() => setOpen(false)}
          disabled={isSubmitting}
          className="text-paper-600 hover:text-paper fm-mono px-4 py-2 text-xs transition-colors"
        >
          Cancelar
        </button>
      </div>
    </div>
  );
}
