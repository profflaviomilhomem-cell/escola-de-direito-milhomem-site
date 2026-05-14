"use client";

import { useState } from "react";

import {
  CATEGORY_LABEL,
  type BlogCategory,
  type BlogStatus,
  type MockBlogPost,
} from "@/data/mock-blog";

type Props = {
  /** Post existente para edição. Omitido = novo artigo (form vazio). */
  post?: MockBlogPost;
};

const STATUS_OPTIONS: Array<{ value: BlogStatus; label: string }> = [
  { value: "rascunho", label: "Rascunho" },
  { value: "agendado", label: "Agendado" },
  { value: "publicado", label: "Publicado" },
];

/**
 * Editor visual de artigo. Por enquanto é um form HTML controlado, sem
 * persistência — em produção integra com Prisma `Post` ou MDX em
 * /content/blog/. O preview renderiza o body em tempo real (simples
 * markdown: **bold**, *itálico amber*, parágrafos por linha em branco).
 */
export function BlogEditor({ post }: Props) {
  const [title, setTitle] = useState(post?.title ?? "");
  const [slug, setSlug] = useState(post?.slug ?? "");
  const [excerpt, setExcerpt] = useState(post?.excerpt ?? "");
  const [body, setBody] = useState(post?.body ?? "");
  const [category, setCategory] = useState<BlogCategory>(
    post?.category ?? "analise-decisao",
  );
  const [status, setStatus] = useState<BlogStatus>(post?.status ?? "rascunho");
  const [tags, setTags] = useState((post?.tags ?? []).join(", "));
  const [publishedAt, setPublishedAt] = useState(
    post?.publishedAt ?? new Date().toISOString().slice(0, 10),
  );

  // Preview HTML (mesma transformação simples do artigo público)
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
      {/* Coluna esquerda — campos de edição */}
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

        <Field label="Corpo" hint="**negrito** e *itálico amber* aceitos. Quebra de linha dupla = novo parágrafo.">
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
              {Object.entries(CATEGORY_LABEL).map(([key, label]) => (
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

          <Field label="Tags" hint="Separadas por vírgula">
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

      {/* Coluna direita — preview + ações */}
      <aside className="space-y-6 lg:sticky lg:top-24 lg:self-start">
        <div className="border-paper-100 bg-carbon-elevated border p-6">
          <p className="text-amber font-mono text-[10px] uppercase tracking-[0.2em] mb-3">
            Preview · {CATEGORY_LABEL[category]}
          </p>
          <h2 className="text-paper font-serif text-xl leading-tight">
            {title || "Sem título"}
          </h2>
          <p className="text-paper-700 mt-3 text-sm leading-relaxed">
            {excerpt || "Resumo aparece aqui."}
          </p>
          <div
            className="prose-juridica text-paper-800 mt-5 max-h-[280px] overflow-y-auto text-[14px] leading-[1.7]"
            dangerouslySetInnerHTML={{ __html: bodyHtml || "<p><em>Corpo vazio…</em></p>" }}
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
              onClick={() => alert("Salvar — ainda mock; persistência entra com o wiring de DB.")}
            >
              {status === "publicado" ? "Atualizar publicação" : "Salvar rascunho"}
            </button>
            <button
              type="button"
              className="border-paper-200 text-paper-700 hover:border-amber hover:text-amber w-full border px-4 py-3 font-mono text-[11px] uppercase tracking-[0.2em] transition-colors"
              onClick={() => window.history.back()}
            >
              Cancelar
            </button>
            {post && post.status === "publicado" && (
              <button
                type="button"
                className="border-alerta-400/50 text-alerta-400 hover:bg-alerta-400/10 w-full border px-4 py-3 font-mono text-[11px] uppercase tracking-[0.2em] transition-colors"
              >
                Despublicar
              </button>
            )}
          </div>
        </div>

        <p className="text-paper-600 text-[12px] leading-relaxed italic">
          Persistência entra na fase de &quot;wiring&quot; (Prisma + Neon). Por
          enquanto, o salvar é simulado.
        </p>
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
