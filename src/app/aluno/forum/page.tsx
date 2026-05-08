import type { Metadata } from "next";
import Link from "next/link";

import { CommentTree } from "@/components/aluno/comment-tree";
import { mockCourse, mockForumThreads } from "@/data/mock-aluno";

export const metadata: Metadata = {
  title: "Fórum — Escola Flávio Milhomem",
  robots: { index: false, follow: false },
};

function ago(iso: string): string {
  const ms = Date.now() - new Date(iso).getTime();
  const days = Math.floor(ms / (1000 * 60 * 60 * 24));
  if (days <= 0) return "hoje";
  if (days === 1) return "ontem";
  if (days < 7) return `há ${days} dias`;
  return new Date(iso).toLocaleDateString("pt-BR", {
    day: "2-digit",
    month: "long",
  });
}

/**
 * Fórum aninhado — feed de tópicos com expansão inline (anchor + scroll-margin).
 * SLA do professor: 72h. Resposta do professor recebe destaque visual via
 * `border-amber` e badge no card e dentro do CommentTree.
 */
export default function ForumPage() {
  return (
    <section className="px-gutter mx-auto max-w-(--container-narrow) py-20 lg:px-12">
      <header className="flex flex-wrap items-end justify-between gap-6">
        <div>
          <p className="text-amber fm-mono">Comunidade</p>
          <h1
            className="mt-3 font-serif leading-[1.05]"
            style={{ fontSize: "clamp(2.25rem, 4.5vw, 3.5rem)" }}
          >
            Fórum da Escola.
          </h1>
          <p className="text-paper-700 mt-4 max-w-2xl text-base leading-relaxed md:text-lg">
            Onde casos reais viram aprendizado coletivo. Flávio responde em até
            72h; monitores filtram nulidades e padronizações antes.
          </p>
        </div>
        <button
          type="button"
          className="bg-amber text-carbon hover:bg-amber-soft inline-flex shrink-0 items-center gap-2 px-6 py-3 font-mono text-[12px] font-semibold uppercase tracking-[0.2em] transition-colors"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M5 12h14" />
            <path d="M12 5v14" />
          </svg>
          Novo tópico
        </button>
      </header>

      <div className="border-paper-100 bg-carbon mt-10 grid grid-cols-2 gap-px border md:grid-cols-4">
        <Stat
          label="Tópicos abertos"
          value={mockForumThreads.length.toString()}
        />
        <Stat
          label="Respostas hoje"
          value={mockForumThreads
            .reduce((acc, t) => acc + t.replyCount, 0)
            .toString()}
        />
        <Stat label="SLA do professor" value="≤ 72h" />
        <Stat label="Você nessa semana" value="2 leituras" />
      </div>

      <div className="mt-12 space-y-12">
        {mockForumThreads.map((thread) => {
          const lessonInCourse = thread.lessonSlug
            ? mockCourse.modules
                .flatMap((m) => m.lessons)
                .find((l) => l.slug === thread.lessonSlug)
            : null;
          return (
            <article
              key={thread.id}
              id={thread.slug}
              className={`scroll-mt-24 border ${
                thread.professorReplied
                  ? "border-amber/50 bg-carbon-elevated"
                  : "border-paper-100 bg-carbon-elevated"
              } p-6 md:p-8`}
            >
              <header className="mb-5 flex flex-wrap items-center gap-3">
                <span className="bg-paper text-carbon grid h-9 w-9 place-items-center rounded-full text-xs font-bold">
                  {thread.author.name
                    .split(/\s+/)
                    .map((p) => p[0])
                    .filter(Boolean)
                    .slice(0, 2)
                    .join("")
                    .toUpperCase()}
                </span>
                <span className="text-paper text-sm font-semibold">
                  {thread.author.name}
                </span>
                <span className="text-paper-600 fm-mono">
                  {ago(thread.createdAt)}
                </span>
                {thread.professorReplied && (
                  <span className="bg-amber text-carbon fm-mono px-2 py-1">
                    Resposta do professor
                  </span>
                )}
              </header>

              <h2 className="text-paper font-serif text-2xl leading-tight md:text-3xl">
                {thread.title}
              </h2>
              <p className="text-paper-800 mt-4 leading-relaxed">
                {thread.body}
              </p>

              {lessonInCourse && (
                <Link
                  href={`/aluno/aulas/${lessonInCourse.slug}`}
                  className="border-amber/40 hover:border-amber bg-amber/5 fm-mono mt-5 inline-flex items-center gap-2 border px-3 py-2 transition-colors"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="14"
                    height="14"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.6"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <polygon points="6 3 20 12 6 21 6 3" />
                  </svg>
                  Aula vinculada · {lessonInCourse.title}
                </Link>
              )}

              <div className="mt-8">
                <h3 className="text-amber fm-mono mb-4">
                  {thread.replyCount} resposta
                  {thread.replyCount === 1 ? "" : "s"}
                </h3>
                <CommentTree comments={thread.comments} />
              </div>

              {/* Resposta rápida (visual) */}
              <form className="border-paper-100 mt-8 border-t pt-6">
                <label
                  htmlFor={`reply-${thread.id}`}
                  className="text-amber fm-mono"
                >
                  Sua resposta
                </label>
                <textarea
                  id={`reply-${thread.id}`}
                  rows={3}
                  className="border-paper-200 focus:border-amber bg-carbon text-paper placeholder:text-paper-400 mt-3 block w-full border px-3 py-2 outline-none"
                  placeholder="Escreva com clareza. Cite artigo/STJ quando puder."
                />
                <div className="mt-3 flex flex-wrap items-center justify-between gap-3">
                  <p className="text-paper-600 fm-mono">
                    Markdown básico aceito · revisão por monitores antes de
                    publicar
                  </p>
                  <button
                    type="button"
                    className="border-amber text-paper hover:bg-amber hover:text-carbon fm-mono border px-4 py-2 transition-colors"
                  >
                    Enviar resposta
                  </button>
                </div>
              </form>
            </article>
          );
        })}
      </div>
    </section>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="bg-carbon-elevated p-4">
      <p className="text-paper-600 fm-mono">{label}</p>
      <p className="text-paper mt-2 font-serif text-xl">{value}</p>
    </div>
  );
}
