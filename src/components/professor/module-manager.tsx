"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

import type { ProfessorModule } from "@/lib/professor/modules";
import { slugifyCourseName } from "@/lib/professor/product-types";

type Props = {
  productSlug: string;
  initialModules: ProfessorModule[];
};

type FormState = {
  title: string;
  slug: string;
  subtitle: string;
};

const EMPTY: FormState = { title: "", slug: "", subtitle: "" };

const inputCls =
  "border-paper-200 focus:border-amber bg-carbon text-paper w-full border px-3 py-2 text-sm outline-none";

export function ModuleManager({ productSlug, initialModules }: Props) {
  const router = useRouter();
  const [modules, setModules] = useState<ProfessorModule[]>(initialModules);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<FormState>(EMPTY);
  const [slugTouched, setSlugTouched] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const base = `/api/professor/products/${encodeURIComponent(productSlug)}/modules`;

  async function refresh() {
    try {
      const res = await fetch(base);
      if (res.ok) {
        const d = (await res.json()) as { modules?: ProfessorModule[] };
        setModules(d.modules ?? []);
      }
    } catch {
      /* mantém lista atual */
    }
    // Atualiza o seletor de módulos no LessonManager (server component).
    router.refresh();
  }

  function resetForm() {
    setEditingId(null);
    setForm(EMPTY);
    setSlugTouched(false);
  }

  function startEdit(m: ProfessorModule) {
    setEditingId(m.id);
    setError(null);
    setSlugTouched(true);
    setForm({ title: m.title, slug: m.slug, subtitle: m.subtitle });
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.title.trim()) {
      setError("Título do módulo é obrigatório.");
      return;
    }
    setBusy(true);
    setError(null);
    const payload = {
      title: form.title.trim(),
      slug: form.slug.trim() || slugifyCourseName(form.title),
      subtitle: form.subtitle,
    };
    try {
      const res = await fetch(editingId ? `${base}/${editingId}` : base, {
        method: editingId ? "PATCH" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const d = (await res.json()) as { error?: string };
      if (!res.ok) {
        setError(d.error ?? "Falha ao salvar módulo.");
        return;
      }
      resetForm();
      await refresh();
    } catch {
      setError("Falha de rede.");
    } finally {
      setBusy(false);
    }
  }

  async function mutate(
    moduleId: string,
    method: "PATCH" | "DELETE",
    body?: unknown,
  ) {
    setBusy(true);
    setError(null);
    try {
      const res = await fetch(`${base}/${moduleId}`, {
        method,
        headers: body ? { "Content-Type": "application/json" } : undefined,
        body: body ? JSON.stringify(body) : undefined,
      });
      if (!res.ok) {
        const d = (await res.json().catch(() => ({}))) as { error?: string };
        setError(d.error ?? "Falha na operação.");
        return;
      }
      await refresh();
    } catch {
      setError("Falha de rede.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="space-y-6">
      {error && (
        <p className="border-alerta-400/50 text-alerta-400 bg-alerta-400/10 border px-3 py-2 text-sm">
          {error}
        </p>
      )}

      {/* Formulário (criar/editar módulo) */}
      <form
        onSubmit={submit}
        className="border-paper-100 bg-carbon-elevated space-y-4 border p-5"
      >
        <p className="text-amber font-mono text-[10px] tracking-[0.2em] uppercase">
          {editingId ? "Editar módulo" : "Novo módulo"}
        </p>
        <div className="grid gap-4 md:grid-cols-2">
          <label className="block">
            <span className="text-paper-600 fm-mono">Título *</span>
            <input
              className={inputCls}
              value={form.title}
              onChange={(e) =>
                setForm((f) => ({
                  ...f,
                  title: e.target.value,
                  slug: slugTouched
                    ? f.slug
                    : slugifyCourseName(e.target.value),
                }))
              }
              placeholder="I — Cadeia de custódia"
            />
          </label>
          <label className="block">
            <span className="text-paper-600 fm-mono">Slug *</span>
            <input
              className={`${inputCls} font-mono`}
              value={form.slug}
              onChange={(e) => {
                setSlugTouched(true);
                setForm((f) => ({ ...f, slug: e.target.value }));
              }}
              placeholder="cadeia-custodia"
            />
          </label>
        </div>
        <label className="block">
          <span className="text-paper-600 fm-mono">Subtítulo</span>
          <input
            className={inputCls}
            value={form.subtitle}
            onChange={(e) => setForm({ ...form, subtitle: e.target.value })}
            placeholder="Fundamentos e etapas da cadeia de custódia."
          />
        </label>
        <div className="flex justify-end gap-2">
          {editingId && (
            <button
              type="button"
              onClick={resetForm}
              disabled={busy}
              className="border-paper-200 text-paper-700 hover:border-amber fm-mono border px-4 py-2 text-[10px] tracking-[0.16em] uppercase disabled:opacity-50"
            >
              Cancelar
            </button>
          )}
          <button
            type="submit"
            disabled={busy}
            className="bg-amber text-carbon hover:bg-amber-soft fm-mono px-4 py-2 text-[10px] tracking-[0.16em] uppercase disabled:opacity-50"
          >
            {busy
              ? "Salvando…"
              : editingId
                ? "Salvar módulo"
                : "Adicionar módulo"}
          </button>
        </div>
      </form>

      {/* Lista de módulos */}
      {modules.length === 0 ? (
        <p className="text-paper-600 italic">
          Nenhum módulo ainda. As aulas sem módulo aparecem agrupadas em “Sem
          módulo” abaixo.
        </p>
      ) : (
        <ul className="border-paper-100 bg-carbon-elevated divide-paper-100 divide-y border">
          {modules.map((m, i) => (
            <li
              key={m.id}
              className="flex flex-wrap items-center justify-between gap-3 px-5 py-4"
            >
              <div className="min-w-0">
                <p className="text-paper font-serif">
                  <span className="text-paper-600 fm-mono mr-2">
                    {String(m.position).padStart(2, "0")}
                  </span>
                  {m.title}
                  <span className="border-paper-200 text-paper-600 fm-mono ml-3 border px-1.5 py-[1px]">
                    {m.lessonCount} aula{m.lessonCount === 1 ? "" : "s"}
                  </span>
                </p>
                <p className="text-paper-600 fm-mono mt-1 text-[11px]">
                  /{m.slug}
                  {m.subtitle ? ` · ${m.subtitle}` : ""}
                </p>
              </div>
              <div className="flex flex-wrap items-center gap-2">
                <button
                  type="button"
                  disabled={busy || i === 0}
                  onClick={() =>
                    void mutate(m.id, "PATCH", {
                      action: "move",
                      direction: "up",
                    })
                  }
                  aria-label="Subir"
                  className="border-paper-200 text-paper-700 hover:border-amber border px-2 py-1 text-xs disabled:opacity-30"
                >
                  ↑
                </button>
                <button
                  type="button"
                  disabled={busy || i === modules.length - 1}
                  onClick={() =>
                    void mutate(m.id, "PATCH", {
                      action: "move",
                      direction: "down",
                    })
                  }
                  aria-label="Descer"
                  className="border-paper-200 text-paper-700 hover:border-amber border px-2 py-1 text-xs disabled:opacity-30"
                >
                  ↓
                </button>
                <button
                  type="button"
                  disabled={busy}
                  onClick={() => startEdit(m)}
                  className="border-amber text-paper hover:bg-amber hover:text-carbon fm-mono border px-3 py-1 text-[10px] tracking-[0.14em] uppercase disabled:opacity-50"
                >
                  Editar
                </button>
                <button
                  type="button"
                  disabled={busy}
                  onClick={() => {
                    if (
                      confirm(
                        `Excluir o módulo "${m.title}"? As aulas ficam sem módulo.`,
                      )
                    ) {
                      void mutate(m.id, "DELETE");
                    }
                  }}
                  className="border-alerta-400/50 text-alerta-400 hover:bg-alerta-400/10 fm-mono border px-3 py-1 text-[10px] tracking-[0.14em] uppercase disabled:opacity-50"
                >
                  Excluir
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
