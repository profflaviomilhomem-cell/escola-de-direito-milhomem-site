"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import type { ProductType } from "@prisma/client";

import { editorInputClass } from "@/components/professor/editor-field";
import { PRODUCT_TYPE_LABEL } from "@/lib/professor/product-types";
import type { ManualEnrollmentRow } from "@/lib/enrollment/list-manual-enrollments";

type GrantableProduct = {
  slug: string;
  name: string;
  type: ProductType;
};

type Props = {
  products: GrantableProduct[];
  initialEnrollments: ManualEnrollmentRow[];
};

function formatDate(iso: string) {
  return new Intl.DateTimeFormat("pt-BR", {
    dateStyle: "short",
    timeStyle: "short",
  }).format(new Date(iso));
}

export function ManualEnrollmentPanel({
  products,
  initialEnrollments,
}: Props) {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [productSlug, setProductSlug] = useState(
    products[0]?.slug ?? "",
  );
  const [note, setNote] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [enrollments, setEnrollments] =
    useState<ManualEnrollmentRow[]>(initialEnrollments);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError(null);
    setSuccess(null);

    try {
      const res = await fetch("/api/professor/enrollments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email,
          productSlug,
          note: note.trim() || undefined,
        }),
      });

      const data = (await res.json()) as {
        error?: string;
        message?: string;
        alreadyHadAccess?: boolean;
        enrollments?: ManualEnrollmentRow[];
      };

      if (!res.ok) {
        setError(data.error ?? "Não foi possível conceder o acesso.");
        return;
      }

      if (data.alreadyHadAccess) {
        setSuccess(data.message ?? "Aluno já tinha acesso.");
      } else {
        setSuccess(`Acesso concedido para ${email.trim()}.`);
        setEmail("");
        setNote("");
      }

      if (data.enrollments) {
        setEnrollments(data.enrollments);
      }

      router.refresh();
    } catch {
      setError("Falha de rede. Tente novamente.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="mt-12 grid gap-12 xl:grid-cols-[minmax(0,22rem)_1fr]">
      <section className="border-paper-100 bg-carbon-elevated border p-6">
        <h2 className="text-paper font-serif text-xl">
          Conceder acesso manual
        </h2>
        <p className="text-paper-600 mt-2 text-sm leading-relaxed">
          Para turma fundadora, cortesias ou pagamentos fora do checkout.
          Cria um pedido <span className="fm-mono text-xs">PAID</span> sem
          Pagar.me.
        </p>

        {products.length === 0 ? (
          <p className="text-paper-600 mt-6 text-sm">
            Nenhum produto elegível. Cadastre um curso cohort, tripwire ou
            comunidade em Cursos.
          </p>
        ) : (
          <form onSubmit={handleSubmit} className="mt-6 space-y-4">
            <label className="block">
              <span className="text-paper-600 fm-mono text-[10px] uppercase tracking-[0.18em]">
                E-mail do aluno
              </span>
              <input
                type="email"
                required
                autoComplete="off"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="aluno@exemplo.com"
                className={`${editorInputClass} mt-2 w-full`}
              />
            </label>

            <label className="block">
              <span className="text-paper-600 fm-mono text-[10px] uppercase tracking-[0.18em]">
                Produto
              </span>
              <select
                required
                value={productSlug}
                onChange={(e) => setProductSlug(e.target.value)}
                className={`${editorInputClass} mt-2 w-full`}
              >
                {products.map((p) => (
                  <option key={p.slug} value={p.slug}>
                    {p.name} ({PRODUCT_TYPE_LABEL[p.type]})
                  </option>
                ))}
              </select>
            </label>

            <label className="block">
              <span className="text-paper-600 fm-mono text-[10px] uppercase tracking-[0.18em]">
                Observação (opcional)
              </span>
              <input
                type="text"
                maxLength={500}
                value={note}
                onChange={(e) => setNote(e.target.value)}
                placeholder="Ex.: Turma fundadora — pagamento PIX externo"
                className={`${editorInputClass} mt-2 w-full`}
              />
            </label>

            {error ? (
              <p className="text-red-400 text-sm" role="alert">
                {error}
              </p>
            ) : null}
            {success ? (
              <p className="text-amber text-sm" role="status">
                {success}
              </p>
            ) : null}

            <button
              type="submit"
              disabled={saving}
              className="bg-amber text-carbon hover:bg-amber/90 disabled:opacity-60 w-full px-4 py-3 font-mono text-xs uppercase tracking-[0.16em] transition-colors"
            >
              {saving ? "Concedendo…" : "Conceder acesso"}
            </button>
          </form>
        )}
      </section>

      <section>
        <h2 className="text-paper fm-mono text-[11px] uppercase tracking-[0.2em]">
          Matrículas manuais recentes
        </h2>

        {enrollments.length === 0 ? (
          <p className="text-paper-600 mt-6 text-sm">
            Nenhuma matrícula manual registrada ainda.
          </p>
        ) : (
          <div className="mt-6 overflow-x-auto">
            <table className="border-paper-100 w-full min-w-[640px] border text-left text-sm">
              <thead className="bg-carbon-elevated text-paper-600 fm-mono text-[10px] uppercase tracking-[0.14em]">
                <tr>
                  <th className="border-paper-100 border px-4 py-3 font-normal">
                    Aluno
                  </th>
                  <th className="border-paper-100 border px-4 py-3 font-normal">
                    Produto
                  </th>
                  <th className="border-paper-100 border px-4 py-3 font-normal">
                    Tipo
                  </th>
                  <th className="border-paper-100 border px-4 py-3 font-normal">
                    Quando
                  </th>
                </tr>
              </thead>
              <tbody>
                {enrollments.map((row) => (
                  <tr
                    key={`${row.kind}-${row.id}`}
                    className="border-paper-100 border-b"
                  >
                    <td className="border-paper-100 border px-4 py-3">
                      <p className="text-paper font-medium">
                        {row.studentName ?? "—"}
                      </p>
                      <p className="text-paper-600 mt-0.5 text-xs">
                        {row.studentEmail}
                      </p>
                      {row.kind === "order" && row.note ? (
                        <p className="text-paper-600 mt-1 text-xs italic">
                          {row.note}
                        </p>
                      ) : null}
                    </td>
                    <td className="border-paper-100 border px-4 py-3">
                      <p className="text-paper">{row.productName}</p>
                      <p className="text-paper-600 fm-mono mt-0.5 text-xs">
                        {row.productSlug}
                      </p>
                    </td>
                    <td className="border-paper-100 text-paper-600 border px-4 py-3 fm-mono text-xs">
                      {row.kind === "order" ? "Pedido PAID" : "Assinatura"}
                    </td>
                    <td className="border-paper-100 text-paper-600 border px-4 py-3 fm-mono text-xs whitespace-nowrap">
                      {formatDate(row.createdAt)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  );
}
