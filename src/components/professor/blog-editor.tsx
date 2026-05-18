"use client";

import { useState } from "react";
import type { BlogCategory, BlogStatus } from "@prisma/client";

import { DB_CATEGORY_LABEL } from "@/lib/blog/prisma-posts";
import { PROFESSOR_STATUS_LABEL, type ProfessorBlogPost } from "@/lib/blog/professor";

type Props = {
  post?: ProfessorBlogPost;
};

const STATUS_OPTIONS: Array<{ value: BlogStatus; label: string }> = (
  Object.keys(PROFESSOR_STATUS_LABEL) as BlogStatus[]
).map((value) => ({
  value,
  label: PROFESSOR_STATUS_LABEL[value].label,
}));

const CATEGORY_OPTIONS = Object.entries(DB_CATEGORY_LABEL) as Array<
  [BlogCategory, string]
>;

export function BlogEditor({ post }: Props) {
  const [title, setTitle] = useState(post?.title ?? "");
  const [slug, setSlug] = useState(post?.slug ?? "");
  const [excerpt, setExcerpt] = useState(post?.excerpt ?? "");
  const [body, setBody] = useState(post?.body ?? "");
  const [category, setCategory] = useState<BlogCategory>(
    post?.category ?? "GERAL",
  );
  const [status, setStatus] = useState<BlogStatus>(post?.status ?? "DRAFT");
  const [tags, setTags] = useState("");
  const [publishedAt, setPublishedAt] = useState(
    post?.publishedAt
      ? post.publishedAt.slice(0, 10)
      : new Date().toISOString().slice(0, 10),
  );

  const bodyHtml = body
    .split(/\n\n+/)
    .map(
      (p) =>
        `<p>${p
          .replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>")
          .replace(/\*(.+?)\*/g, "<em>$1</em>")}</p>`,
    )
    .join("");

  return (
    <form className="grid gap-8 lg:grid-cols-[1.2fr_1fr]">
      <div className="space-y-5">
        <Field label="Título" required>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Título do artigo"
            className="border-paper-200 focus:border-amber bg-carbon text-paper w-full border px-4 py-3 text-sm outline-none"
          />
        </Field>

        <Field label="Slug (URL)" hint="Aparece em /blog/{slug}">
          <input
            type="text"
            value={slug}
            onChange={(e) => setSlug(e.target.value)}
            placeholder="exemplo-de-slug-do-artigo"
            className="border-paper-200 focus:border-amber bg-carbon text-paper w-full border px-4 py-3 font-mono text-sm outline-none"
          />
        </Field>

        <Field label="Resumo" hint="Aparece nos cards e no SEO meta description">
          <textarea
            value={excerpt}
            onChange={(e) => setExcerpt(e.target.value)}
            rows={3}
            placeholder="Em até 200 caracteres."
            className="border-paper-200 focus:border-amber bg-carbon text-paper w-full border px-4 py-3 text-sm leading-relaxed outline-none"
          />
        </Field>

        <Field
          label="Corpo"
          hint="HTML do WordPress ou texto com **negrito** e *itálico*."
        >
          <textarea
            value={body}
            onChange={(e) => setBody(e.target.value)}
            rows={18}
            placeholder="Escreva o artigo completo aqui."
            className="border-paper-200 focus:border-amber bg-carbon text-paper w-full border px-4 py-3 font-serif text-base leading-relaxed outline-none"
          />
        </Field>

        <div className="grid gap-5 md:grid-cols-2">
          <Field label="Categoria">
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value as BlogCategory)}
              className="border-paper-200 focus:border-amber bg-carbon text-paper w-full border px-4 py-3 text-sm outline-none"
            >
              {CATEGORY_OPTIONS.map(([key, label]) => (
                <option key={key} value={key}>
                  {label}
                </option>
              ))}
            </select>
          </Field>

          <Field label="Status">
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value as BlogStatus)}
              className="border-paper-200 focus:border-amber bg-carbon text-paper w-full border px-4 py-3 text-sm outline-none"
            >
              {STATUS_OPTIONS.map((s) => (
                <option key={s.value} value={s.value}>
                  {s.label}
                </option>
              ))}
            </select>
          </Field>
        </div>

        <div className="grid gap-5 md:grid-cols-2">
          <Field label="Data de publicação">
            <input
              type="date"
              value={publishedAt}
              onChange={(e) => setPublishedAt(e.target.value)}
              className="border-paper-200 focus:border-amber bg-carbon text-paper w-full border px-4 py-3 font-mono text-sm outline-none"
            />
          </Field>

          <Field label="Tags" hint="Separadas por vírgula (em breve no banco)">
            <input
              type="text"
              value={tags}
              onChange={(e) => setTags(e.target.value)}
              placeholder="STJ, cadeia de custódia, CPP"
              className="border-paper-200 focus:border-amber bg-carbon text-paper w-full border px-4 py-3 text-sm outline-none"
            />
          </Field>
        </div>
      </div>

      <aside className="space-y-6 lg:sticky lg:top-24 lg:self-start">
        <div className="border-paper-100 bg-carbon-elevated border p-6">
          <p className="text-amber font-mono text-[10px] uppercase tracking-[0.2em] mb-3">
            Preview · {DB_CATEGORY_LABEL[category]}
          </p>
          <h2 className="text-paper font-serif text-xl leading-tight">
            {title || "Sem título"}
          </h2>
          <p className="text-paper-700 mt-3 text-sm leading-relaxed">
            {excerpt || "Resumo aparece aqui."}
          </p>
          <div
            className="prose-juridica text-paper-800 mt-5 max-h-[280px] overflow-y-auto text-[14px] leading-[1.7]"
            dangerouslySetInnerHTML={{
              __html: bodyHtml || "<p><em>Corpo vazio…</em></p>",
            }}
          />
        </div>

        <div className="border-paper-100 bg-carbon-elevated border p-6">
          <h3 className="text-amber font-mono text-[10px] uppercase tracking-[0.2em] mb-4">
            Ações
          </h3>
          <div className="space-y-3">
            <button
              type="button"
              className="bg-amber text-carbon hover:bg-amber-soft w-full px-4 py-3 font-mono text-[11px] uppercase tracking-[0.2em] transition-colors"
              onClick={() =>
                alert("Salvar em breve — API de persistência no Prisma.")
              }
            >
              {status === "PUBLISHED" ? "Atualizar publicação" : "Salvar rascunho"}
            </button>
            <button
              type="button"
              className="border-paper-200 text-paper-700 hover:border-amber hover:text-amber w-full border px-4 py-3 font-mono text-[11px] uppercase tracking-[0.2em] transition-colors"
              onClick={() => window.history.back()}
            >
              Cancelar
            </button>
            {post?.status === "PUBLISHED" && (
              <button
                type="button"
                className="border-alerta-400/50 text-alerta-400 hover:bg-alerta-400/10 w-full border px-4 py-3 font-mono text-[11px] uppercase tracking-[0.2em] transition-colors"
              >
                Despublicar
              </button>
            )}
          </div>
        </div>
      </aside>
    </form>
  );
}

function Field({
  label,
  hint,
  children,
  required,
}: {
  label: string;
  hint?: string;
  children: React.ReactNode;
  required?: boolean;
}) {
  return (
    <label className="block">
      <span className="text-paper-600 mb-2 flex items-center gap-2 font-mono text-[10px] uppercase tracking-[0.2em]">
        {label}
        {required && <span className="text-amber">*</span>}
      </span>
      {children}
      {hint && (
        <span className="text-paper-600 mt-2 block text-[12px] leading-relaxed">
          {hint}
        </span>
      )}
    </label>
  );
}
