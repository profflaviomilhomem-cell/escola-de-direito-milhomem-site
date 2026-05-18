import type { Metadata } from "next";
import Link from "next/link";

import { DB_CATEGORY_LABEL } from "@/lib/blog/prisma-posts";
import {
  getProfessorBlogPosts,
  PROFESSOR_STATUS_LABEL,
} from "@/lib/blog/professor";

export const metadata: Metadata = {
  title: "Blog — Painel do professor",
  robots: { index: false, follow: false },
};

export default async function ProfessorBlogPage() {
  const posts = await getProfessorBlogPosts();
  const publicados = posts.filter((p) => p.status === "PUBLISHED");
  const rascunhos = posts.filter((p) => p.status === "DRAFT");
  const agendados = posts.filter((p) => p.status === "SCHEDULED");

  return (
    <section className="fm-site-page py-12">
      <header className="mb-10 flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-amber font-mono text-[10px] uppercase tracking-[0.2em]">
            Pipeline editorial
          </p>
          <h1
            className="mt-3 font-serif leading-[1.05]"
            style={{ fontSize: "clamp(36px, 4.5vw, 56px)" }}
          >
            <em className="text-amber italic">Blog</em> da Escola.
          </h1>
          <p className="text-paper-700 mt-3 max-w-2xl text-base leading-relaxed">
            {posts.length} artigos no total · {publicados.length} publicados ·{" "}
            {rascunhos.length} rascunho{rascunhos.length === 1 ? "" : "s"} ·{" "}
            {agendados.length} agendado{agendados.length === 1 ? "" : "s"}.
          </p>
        </div>
        <Link
          href="/professor/blog/novo"
          className="bg-amber text-carbon hover:bg-amber-soft inline-flex items-center gap-2 px-5 py-3 font-mono text-[11px] uppercase tracking-[0.2em] transition-colors"
        >
          Novo artigo
        </Link>
      </header>

      <div className="border-paper-100 bg-carbon-elevated/60 mb-10 grid grid-cols-2 gap-px border md:grid-cols-4">
        <Stat label="Publicados" value={publicados.length.toString()} />
        <Stat
          label="Rascunhos"
          value={rascunhos.length.toString()}
          tone="alert"
        />
        <Stat label="Agendados" value={agendados.length.toString()} />
        <Stat label="No catálogo" value={posts.length.toString()} />
      </div>

      <div className="border-paper-100 bg-carbon-elevated overflow-hidden border">
        <table className="w-full text-sm">
          <thead className="border-paper-100 border-b">
            <tr className="text-paper-600 font-mono text-[10px] uppercase tracking-[0.2em]">
              <th className="px-5 py-3 text-left">Artigo</th>
              <th className="hidden px-5 py-3 text-left md:table-cell">
                Categoria
              </th>
              <th className="px-5 py-3 text-left">Status</th>
              <th className="px-5 py-3 text-right">Ações</th>
            </tr>
          </thead>
          <tbody className="divide-paper-100 divide-y">
            {posts.map((post) => {
              const tone = PROFESSOR_STATUS_LABEL[post.status];
              return (
                <tr key={post.slug} className="hover:bg-paper-50">
                  <td className="px-5 py-4">
                    <p className="text-paper font-serif text-base leading-tight">
                      {post.title}
                    </p>
                    <p className="text-paper-600 mt-1 font-mono text-[10px] uppercase tracking-[0.15em]">
                      {new Date(post.publishedAt).toLocaleDateString("pt-BR", {
                        day: "2-digit",
                        month: "short",
                        year: "numeric",
                      })}{" "}
                      · {post.readingMin} min
                    </p>
                  </td>
                  <td className="hidden px-5 py-4 md:table-cell">
                    <span className="text-paper-700 font-mono text-[10px] uppercase tracking-[0.15em]">
                      {DB_CATEGORY_LABEL[post.category] ?? post.category}
                    </span>
                  </td>
                  <td className="px-5 py-4">
                    <span
                      className={`inline-block border px-2 py-1 font-mono text-[10px] uppercase tracking-[0.15em] ${tone.cls}`}
                    >
                      {tone.label}
                    </span>
                  </td>
                  <td className="px-5 py-4 text-right">
                    <div className="flex items-center justify-end gap-2">
                      {post.status === "PUBLISHED" && (
                        <Link
                          href={`/blog/${post.slug}`}
                          className="border-paper-200 text-paper-700 hover:border-amber hover:text-amber border px-3 py-1.5 font-mono text-[10px] uppercase tracking-[0.15em] transition-colors"
                        >
                          Abrir
                        </Link>
                      )}
                      <Link
                        href={`/professor/blog/${post.slug}/editar`}
                        className="border-amber text-amber hover:bg-amber hover:text-carbon border px-3 py-1.5 font-mono text-[10px] uppercase tracking-[0.15em] transition-colors"
                      >
                        Editar
                      </Link>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </section>
  );
}

function Stat({
  label,
  value,
  tone,
}: {
  label: string;
  value: string;
  tone?: "alert" | "positive";
}) {
  return (
    <div className="bg-carbon-elevated/40 p-5">
      <p className="text-paper-600 font-mono text-[10px] uppercase tracking-[0.2em]">
        {label}
      </p>
      <p
        className={`mt-2 font-serif text-2xl ${
          tone === "alert"
            ? "text-alerta-400"
            : tone === "positive"
              ? "text-amber"
              : "text-paper"
        }`}
      >
        {value}
      </p>
    </div>
  );
}
