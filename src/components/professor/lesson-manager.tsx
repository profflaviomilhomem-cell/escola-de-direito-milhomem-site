"use client";

import { useState } from "react";

import type { ProfessorLesson } from "@/lib/professor/lessons";

type Props = {
  productSlug: string;
  initialLessons: ProfessorLesson[];
};

type FormState = {
  slug: string;
  title: string;
  description: string;
  durationMin: string;
  videoId: string;
  published: boolean;
};

const EMPTY: FormState = {
  slug: "",
  title: "",
  description: "",
  durationMin: "",
  videoId: "",
  published: false,
};

const inputCls =
  "border-paper-200 focus:border-amber bg-carbon text-paper w-full border px-3 py-2 text-sm outline-none";

export function LessonManager({ productSlug, initialLessons }: Props) {
  const [lessons, setLessons] = useState<ProfessorLesson[]>(initialLessons);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<FormState>(EMPTY);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const base = `/api/professor/products/${encodeURIComponent(productSlug)}/lessons`;

  async function refresh() {
    try {
      const res = await fetch(base);
      if (res.ok) {
        const d = (await res.json()) as { lessons?: ProfessorLesson[] };
        setLessons(d.lessons ?? []);
      }
    } catch {
      /* mantém lista atual */
    }
  }

  function resetForm() {
    setEditingId(null);
    setForm(EMPTY);
  }

  function startEdit(l: ProfessorLesson) {
    setEditingId(l.id);
    setError(null);
    setForm({
      slug: l.slug,
      title: l.title,
      description: l.description,
      durationMin: l.durationSec ? String(Math.round(l.durationSec / 60)) : "",
      videoId: l.videoId,
      published: l.published,
    });
  }

  function payloadFromForm() {
    const min = parseFloat(form.durationMin.replace(",", "."));
    return {
      slug: form.slug.trim(),
      title: form.title.trim(),
      description: form.description,
      durationSec: Number.isFinite(min) && min > 0 ? Math.round(min * 60) : 0,
      videoId: form.videoId,
      published: form.published,
    };
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.title.trim() || !form.slug.trim()) {
      setError("Título e slug são obrigatórios.");
      return;
    }
    setBusy(true);
    setError(null);
    try {
      const res = await fetch(editingId ? `${base}/${editingId}` : base, {
        method: editingId ? "PATCH" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payloadFromForm()),
      });
      const d = (await res.json()) as { error?: string };
      if (!res.ok) {
        setError(d.error ?? "Falha ao salvar.");
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
    lessonId: string,
    method: "PATCH" | "DELETE",
    body?: unknown,
  ) {
    setBusy(true);
    setError(null);
    try {
      const res = await fetch(`${base}/${lessonId}`, {
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

  function togglePublish(l: ProfessorLesson) {
    void mutate(l.id, "PATCH", {
      slug: l.slug,
      title: l.title,
      description: l.description,
      durationSec: l.durationSec,
      videoId: l.videoId,
      published: !l.published,
    });
  }

  return (
    <div className="space-y-8">
      {error && (
        <p className="border-alerta-400/50 text-alerta-400 bg-alerta-400/10 border px-3 py-2 text-sm">
          {error}
        </p>
      )}

      {/* Formulário (criar/editar) */}
      <form
        onSubmit={submit}
        className="border-paper-100 bg-carbon-elevated space-y-4 border p-5"
      >
        <p className="text-amber font-mono text-[10px] uppercase tracking-[0.2em]">
          {editingId ? "Editar aula" : "Nova aula"}
        </p>
        <div className="grid gap-4 md:grid-cols-2">
          <label className="block">
            <span className="text-paper-600 fm-mono">Título *</span>
            <input
              className={inputCls}
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
              placeholder="Aula 01 — Cadeia de custódia"
            />
          </label>
          <label className="block">
            <span className="text-paper-600 fm-mono">Slug *</span>
            <input
              className={`${inputCls} font-mono`}
              value={form.slug}
              onChange={(e) => setForm({ ...form, slug: e.target.value })}
              placeholder="modulo-1-aula-01"
            />
          </label>
          <label className="block">
            <span className="text-paper-600 fm-mono">Duração (min)</span>
            <input
              className={inputCls}
              inputMode="decimal"
              value={form.durationMin}
              onChange={(e) =>
                setForm({ ...form, durationMin: e.target.value })
              }
              placeholder="18"
            />
          </label>
          <label className="block">
            <span className="text-paper-600 fm-mono">
              Vídeo (Cloudflare Stream UID)
            </span>
            <input
              className={`${inputCls} font-mono`}
              value={form.videoId}
              onChange={(e) => setForm({ ...form, videoId: e.target.value })}
              placeholder="opcional"
            />
          </label>
        </div>
        <label className="block">
          <span className="text-paper-600 fm-mono">Descrição</span>
          <textarea
            className={inputCls}
            rows={2}
            value={form.description}
            onChange={(e) => setForm({ ...form, description: e.target.value })}
          />
        </label>
        <div className="flex flex-wrap items-center justify-between gap-3">
          <label className="flex items-center gap-2 text-sm text-paper">
            <input
              type="checkbox"
              className="accent-amber h-4 w-4"
              checked={form.published}
              onChange={(e) =>
                setForm({ ...form, published: e.target.checked })
              }
            />
            Publicada (visível ao aluno)
          </label>
          <div className="flex gap-2">
            {editingId && (
              <button
                type="button"
                onClick={resetForm}
                disabled={busy}
                className="border-paper-200 text-paper-700 hover:border-amber fm-mono border px-4 py-2 text-[10px] uppercase tracking-[0.16em] disabled:opacity-50"
              >
                Cancelar
              </button>
            )}
            <button
              type="submit"
              disabled={busy}
              className="bg-amber text-carbon hover:bg-amber-soft fm-mono px-4 py-2 text-[10px] uppercase tracking-[0.16em] disabled:opacity-50"
            >
              {busy ? "Salvando…" : editingId ? "Salvar aula" : "Adicionar aula"}
            </button>
          </div>
        </div>
      </form>

      {/* Lista de aulas */}
      {lessons.length === 0 ? (
        <p className="text-paper-600 italic">
          Nenhuma aula neste curso ainda. Use o formulário acima para adicionar.
        </p>
      ) : (
        <ul className="border-paper-100 bg-carbon-elevated divide-paper-100 divide-y border">
          {lessons.map((l, i) => (
            <li
              key={l.id}
              className="flex flex-wrap items-center justify-between gap-3 px-5 py-4"
            >
              <div className="min-w-0">
                <p className="text-paper font-serif">
                  <span className="text-paper-600 fm-mono mr-2">
                    {String(l.position).padStart(2, "0")}
                  </span>
                  {l.title}
                  {l.published ? (
                    <span className="border-amber/40 text-amber fm-mono ml-3 border px-1.5 py-[1px]">
                      publicada
                    </span>
                  ) : (
                    <span className="border-paper-200 text-paper-600 fm-mono ml-3 border px-1.5 py-[1px]">
                      rascunho
                    </span>
                  )}
                </p>
                <p className="text-paper-600 fm-mono mt-1 text-[11px]">
                  /{l.slug}
                  {l.durationSec
                    ? ` · ${Math.round(l.durationSec / 60)} min`
                    : ""}
                  {l.videoId ? " · vídeo" : ""}
                </p>
              </div>
              <div className="flex flex-wrap items-center gap-2">
                <button
                  type="button"
                  disabled={busy || i === 0}
                  onClick={() =>
                    void mutate(l.id, "PATCH", {
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
                  disabled={busy || i === lessons.length - 1}
                  onClick={() =>
                    void mutate(l.id, "PATCH", {
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
                  onClick={() => togglePublish(l)}
                  className="border-paper-200 text-paper-700 hover:border-amber fm-mono border px-3 py-1 text-[10px] uppercase tracking-[0.14em] disabled:opacity-50"
                >
                  {l.published ? "Despublicar" : "Publicar"}
                </button>
                <button
                  type="button"
                  disabled={busy}
                  onClick={() => startEdit(l)}
                  className="border-amber text-paper hover:bg-amber hover:text-carbon fm-mono border px-3 py-1 text-[10px] uppercase tracking-[0.14em] disabled:opacity-50"
                >
                  Editar
                </button>
                <button
                  type="button"
                  disabled={busy}
                  onClick={() => {
                    if (confirm(`Excluir a aula "${l.title}"?`)) {
                      void mutate(l.id, "DELETE");
                    }
                  }}
                  className="border-alerta-400/50 text-alerta-400 hover:bg-alerta-400/10 fm-mono border px-3 py-1 text-[10px] uppercase tracking-[0.14em] disabled:opacity-50"
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
