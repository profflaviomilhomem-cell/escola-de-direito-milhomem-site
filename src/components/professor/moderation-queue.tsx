"use client";

import { useState } from "react";
import type { ModerationStatus } from "@prisma/client";

import type { ModerationItem } from "@/lib/forum/comments";

const STATUS_LABEL: Record<ModerationStatus, string> = {
  APPROVED: "Aprovado",
  PENDING: "Pendente",
  REJECTED: "Rejeitado",
};

const STATUS_CLS: Record<ModerationStatus, string> = {
  APPROVED: "border-amber/60 bg-amber/10 text-amber",
  PENDING: "border-paper-200 text-paper-700",
  REJECTED: "border-alerta-400/50 text-alerta-400 bg-alerta-400/10",
};

function ago(iso: string) {
  return new Date(iso).toLocaleString("pt-BR", {
    day: "2-digit",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function ModerationQueue({ items }: { items: ModerationItem[] }) {
  const [rows, setRows] = useState(items);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function moderate(id: string, status: ModerationStatus) {
    setBusyId(id);
    setError(null);
    try {
      const res = await fetch(`/api/professor/comments/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });
      if (!res.ok) {
        const data = (await res.json().catch(() => ({}))) as { error?: string };
        setError(data.error ?? "Falha ao moderar.");
        return;
      }
      setRows((prev) => prev.map((r) => (r.id === id ? { ...r, status } : r)));
    } catch {
      setError("Falha de rede.");
    } finally {
      setBusyId(null);
    }
  }

  if (rows.length === 0) {
    return (
      <p className="text-paper-600 italic">
        Nenhum comentário no fórum ainda. Quando os alunos comentarem nas aulas,
        a fila aparece aqui.
      </p>
    );
  }

  return (
    <div className="space-y-4">
      {error && (
        <p className="border-alerta-400/50 text-alerta-400 bg-alerta-400/10 border px-3 py-2 text-sm">
          {error}
        </p>
      )}
      <ul className="border-paper-100 bg-carbon-elevated divide-paper-100 divide-y border">
        {rows.map((c) => (
          <li key={c.id} className="p-5">
            <div className="text-paper-600 fm-mono mb-2 flex flex-wrap items-center gap-2">
              <span className="text-paper">{c.author.name}</span>
              {c.author.role === "professor" && (
                <span className="border-amber/40 text-amber border px-1.5 py-[1px]">
                  professor
                </span>
              )}
              <span aria-hidden>·</span>
              <span>{ago(c.createdAt)}</span>
              <span aria-hidden>·</span>
              <span className="text-paper-700">{c.lesson.title}</span>
              <span
                className={`fm-mono ml-auto border px-2 py-[1px] ${STATUS_CLS[c.status]}`}
              >
                {STATUS_LABEL[c.status]}
              </span>
            </div>
            <p className="text-paper-800 text-sm leading-relaxed">
              {c.content}
            </p>
            <div className="mt-3 flex flex-wrap gap-2">
              <button
                type="button"
                disabled={busyId === c.id || c.status === "APPROVED"}
                onClick={() => moderate(c.id, "APPROVED")}
                className="border-amber text-paper hover:bg-amber hover:text-carbon fm-mono border px-3 py-1.5 text-[10px] tracking-[0.14em] uppercase transition-colors disabled:opacity-40"
              >
                Aprovar
              </button>
              <button
                type="button"
                disabled={busyId === c.id || c.status === "REJECTED"}
                onClick={() => moderate(c.id, "REJECTED")}
                className="border-alerta-400/50 text-alerta-400 hover:bg-alerta-400/10 fm-mono border px-3 py-1.5 text-[10px] tracking-[0.14em] uppercase transition-colors disabled:opacity-40"
              >
                Rejeitar
              </button>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
