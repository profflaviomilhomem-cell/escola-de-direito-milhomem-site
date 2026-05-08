"use client";

import Image from "next/image";
import { useMemo, useState } from "react";

import { CommentTree } from "@/components/aluno/comment-tree";
import { LessonCardCompact } from "@/components/aluno/lesson-card-compact";
import {
  formatDuration,
  type MockCourse,
  type MockForumThread,
  type MockLesson,
} from "@/data/mock-aluno";

type SortKey = "recent" | "most-replies" | "oldest-no-prof";

type FilterKey =
  | "all"
  | "no-prof"
  | "has-prof"
  | "modulo-1-fundamentos"
  | "modulo-2-provas"
  | "modulo-3-tipologia"
  | "modulo-4-sustentacao";

type Props = {
  threads: MockForumThread[];
  course: MockCourse;
};

const FILTERS: Array<{ key: FilterKey; label: string; tone?: "danger" | "amber" }> = [
  { key: "all", label: "Todos" },
  { key: "no-prof", label: "Sem resposta do professor", tone: "danger" },
  { key: "has-prof", label: "Resposta do professor", tone: "amber" },
  { key: "modulo-1-fundamentos", label: "Módulo I" },
  { key: "modulo-2-provas", label: "Módulo II" },
  { key: "modulo-3-tipologia", label: "Módulo III" },
  { key: "modulo-4-sustentacao", label: "Módulo IV" },
];

const SORTS: Array<{ key: SortKey; label: string }> = [
  { key: "recent", label: "Mais recentes" },
  { key: "most-replies", label: "Mais respondidas" },
  { key: "oldest-no-prof", label: "Sem resposta há mais tempo" },
];

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

function initials(name: string): string {
  return name
    .split(/\s+/)
    .map((p) => p[0])
    .filter(Boolean)
    .slice(0, 2)
    .join("")
    .toUpperCase();
}

export function ForumFeed({ threads, course }: Props) {
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState<FilterKey>("all");
  const [sort, setSort] = useState<SortKey>("recent");

  const lessonsBySlug = useMemo(() => {
    const map = new Map<string, MockLesson>();
    for (const m of course.modules) {
      for (const l of m.lessons) {
        map.set(l.slug, l);
      }
    }
    return map;
  }, [course]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    let out = threads.filter((t) => {
      if (q) {
        const blob =
          `${t.title} ${t.body} ${t.author.name}`.toLowerCase();
        if (!blob.includes(q)) return false;
      }
      switch (filter) {
        case "all":
          return true;
        case "no-prof":
          return !t.professorReplied;
        case "has-prof":
          return t.professorReplied;
        default:
          return t.lessonSlug?.startsWith(filter) ?? false;
      }
    });

    if (sort === "recent") {
      out = out.sort(
        (a, b) =>
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
      );
    } else if (sort === "most-replies") {
      out = out.sort((a, b) => b.replyCount - a.replyCount);
    } else {
      out = out
        .filter((t) => !t.professorReplied)
        .sort(
          (a, b) =>
            new Date(a.createdAt).getTime() -
            new Date(b.createdAt).getTime(),
        );
    }
    return out;
  }, [threads, query, filter, sort]);

  const counts = {
    all: threads.length,
    "no-prof": threads.filter((t) => !t.professorReplied).length,
    "has-prof": threads.filter((t) => t.professorReplied).length,
  };

  return (
    <>
      {/* Toolbar sticky abaixo do top nav (h-16) */}
      <div className="border-paper-100 bg-carbon/85 sticky top-16 z-30 border-b backdrop-blur-md">
        <div className="px-gutter mx-auto max-w-(--container-narrow) py-4 lg:px-12">
          <div className="flex flex-wrap items-center gap-3">
            {/* Search */}
            <label className="border-paper-200 focus-within:border-amber bg-carbon-elevated flex min-w-[260px] flex-1 items-center gap-2 border px-3 py-2 transition-colors">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.6"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="text-paper-600 shrink-0"
              >
                <circle cx="11" cy="11" r="7" />
                <path d="m20 20-3.5-3.5" />
              </svg>
              <input
                type="search"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Buscar por título, autor ou trecho…"
                className="bg-transparent text-paper placeholder:text-paper-600 w-full outline-none text-sm"
                aria-label="Buscar no fórum"
              />
              {query && (
                <button
                  type="button"
                  onClick={() => setQuery("")}
                  aria-label="Limpar busca"
                  className="text-paper-600 hover:text-paper"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="14"
                    height="14"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M18 6 6 18" />
                    <path d="m6 6 12 12" />
                  </svg>
                </button>
              )}
            </label>

            {/* Sort select */}
            <div className="relative">
              <select
                value={sort}
                onChange={(e) => setSort(e.target.value as SortKey)}
                aria-label="Ordenar por"
                className="border-paper-200 focus:border-amber bg-carbon-elevated text-paper appearance-none border py-2 pl-3 pr-9 text-sm outline-none transition-colors"
              >
                {SORTS.map((s) => (
                  <option
                    key={s.key}
                    value={s.key}
                    className="bg-carbon-elevated text-paper"
                  >
                    {s.label}
                  </option>
                ))}
              </select>
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="14"
                height="14"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="text-paper-600 pointer-events-none absolute right-3 top-1/2 -translate-y-1/2"
              >
                <path d="m6 9 6 6 6-6" />
              </svg>
            </div>
          </div>

          {/* Filter chips */}
          <div className="mt-3 flex flex-wrap items-center gap-2">
            {FILTERS.map((f) => {
              const active = filter === f.key;
              const count =
                f.key === "all"
                  ? counts.all
                  : f.key === "no-prof"
                    ? counts["no-prof"]
                    : f.key === "has-prof"
                      ? counts["has-prof"]
                      : threads.filter((t) =>
                          t.lessonSlug?.startsWith(f.key),
                        ).length;
              return (
                <button
                  key={f.key}
                  type="button"
                  onClick={() => setFilter(f.key)}
                  className={`fm-mono inline-flex items-center gap-2 border px-3 py-1.5 transition-colors ${
                    active
                      ? f.tone === "danger"
                        ? "border-alerta-400 bg-alerta-400/10 text-alerta-400"
                        : "border-amber bg-amber/10 text-amber"
                      : "border-paper-200 text-paper-700 hover:border-paper-400 hover:text-paper"
                  }`}
                  aria-pressed={active}
                >
                  {f.label}
                  <span className="opacity-70">({count})</span>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Feed compacto */}
      <div className="px-gutter mx-auto max-w-(--container-narrow) py-10 lg:px-12">
        {filtered.length === 0 ? (
          <div className="border-paper-100 bg-carbon-elevated border p-12 text-center">
            <p className="text-paper-700 font-serif text-xl">
              Nenhum tópico bate com o filtro.
            </p>
            <p className="text-paper-600 fm-mono mt-3">
              Tente outra combinação ou abra um tópico novo.
            </p>
          </div>
        ) : (
          <ul className="border-paper-100 bg-carbon-elevated divide-paper-100 divide-y border">
            {filtered.map((thread) => {
              const lesson = thread.lessonSlug
                ? lessonsBySlug.get(thread.lessonSlug)
                : null;
              const moduleSlug = thread.lessonSlug?.split("-aula-")[0];
              const moduleNumber = moduleSlug?.match(/modulo-(\d)/)?.[1];

              return (
                <li key={thread.id} id={thread.slug} className="scroll-mt-32">
                  <details className="group/thread">
                    <summary className="hover:bg-paper-100 group/summary flex cursor-pointer flex-col gap-3 px-5 py-5 transition-colors md:flex-row md:items-center md:gap-5 md:px-7">
                      {/* Indicador de expansão (linha amber à esquerda) */}
                      <span
                        aria-hidden
                        className="bg-amber pointer-events-none absolute left-0 hidden h-full w-[3px] -translate-x-full opacity-0 transition-all group-open/thread:translate-x-0 group-open/thread:opacity-100 md:block"
                      />

                      {/* Avatar — foto real para o professor, iniciais para os demais */}
                      {thread.author.role === "professor" ? (
                        <Image
                          src="/images/professor/flavio-avatar-64.jpg"
                          alt={`Foto de ${thread.author.name}`}
                          width={44}
                          height={44}
                          className="border-amber h-11 w-11 flex-shrink-0 rounded-full border-2 object-cover"
                        />
                      ) : (
                        <span
                          className={`grid h-11 w-11 flex-shrink-0 place-items-center rounded-full text-sm font-bold ${
                            thread.author.role === "monitor"
                              ? "bg-paper-200 text-paper border-paper-400 border"
                              : "bg-paper text-carbon"
                          }`}
                        >
                          {initials(thread.author.name)}
                        </span>
                      )}

                      {/* Mini-thumb da aula vinculada — visível na linha
                          recolhida para ancorar a pergunta no contexto. */}
                      {lesson && (
                        <span
                          role="img"
                          aria-label={`Capa da aula: ${lesson.title}`}
                          className="border-paper-100 group-open/thread:border-amber relative aspect-video w-24 flex-shrink-0 overflow-hidden border transition-colors sm:w-28 md:w-32"
                          style={{
                            backgroundImage: `linear-gradient(${lesson.cover.angle ?? 135}deg, ${lesson.cover.from}, ${lesson.cover.to})`,
                          }}
                        >
                          {/* Vinheta para legibilidade do badge */}
                          <span
                            aria-hidden
                            className="absolute inset-0 bg-gradient-to-tr from-carbon/70 via-transparent to-transparent"
                          />
                          {/* Duração mini no canto */}
                          <span className="bg-carbon/80 text-paper fm-mono absolute bottom-1 left-1 px-1 py-[1px] text-[8px] tracking-[0.15em] backdrop-blur-sm">
                            {formatDuration(lesson.durationSec)}
                          </span>
                          {/* ✓ amber se a aula já foi concluída */}
                          {lesson.status === "concluida" && (
                            <span
                              aria-hidden
                              className="bg-amber text-carbon absolute right-1 top-1 grid h-4 w-4 place-items-center rounded-full"
                            >
                              <svg
                                xmlns="http://www.w3.org/2000/svg"
                                width="9"
                                height="9"
                                viewBox="0 0 24 24"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth="3.5"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                              >
                                <path d="M20 6 9 17l-5-5" />
                              </svg>
                            </span>
                          )}
                        </span>
                      )}

                      <div className="min-w-0 flex-1">
                        {/* Linha 1: meta */}
                        <div className="text-paper-600 fm-mono mb-1 flex flex-wrap items-center gap-2">
                          <span className="text-paper">
                            {thread.author.name}
                          </span>
                          <span aria-hidden>·</span>
                          <span>{ago(thread.createdAt)}</span>
                          {moduleNumber && (
                            <>
                              <span aria-hidden>·</span>
                              <span className="border-paper-200 text-paper-700 border px-1.5 py-[1px]">
                                Mód. {"I".repeat(parseInt(moduleNumber))}
                              </span>
                            </>
                          )}
                        </div>

                        {/* Linha 2: título */}
                        <h2 className="text-paper group-open/thread:text-amber font-serif text-lg leading-snug transition-colors md:text-xl">
                          {thread.title}
                        </h2>
                      </div>

                      {/* Estado */}
                      <div className="flex shrink-0 items-center gap-3">
                        {thread.professorReplied ? (
                          <span className="border-amber/60 text-amber bg-amber/10 fm-mono border px-2 py-1">
                            ✓ Professor
                          </span>
                        ) : (
                          <span className="border-alerta-400/50 text-alerta-400 fm-mono border px-2 py-1">
                            Aguardando
                          </span>
                        )}
                        <span className="text-paper-700 fm-mono whitespace-nowrap">
                          {thread.replyCount} resp.
                        </span>
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
                          className="text-paper-600 transition-transform group-open/thread:rotate-180"
                          aria-hidden
                        >
                          <path d="m6 9 6 6 6-6" />
                        </svg>
                      </div>
                    </summary>

                    {/* Conteúdo expandido */}
                    <div className="border-paper-100 bg-carbon/40 border-t px-5 py-7 md:px-7">
                      <p className="text-paper-800 max-w-prose-wide leading-relaxed md:text-base">
                        {thread.body}
                      </p>

                      {lesson && (
                        <div className="mt-6">
                          <LessonCardCompact
                            lesson={lesson}
                            eyebrow="Aula vinculada à discussão"
                          />
                        </div>
                      )}

                      <div className="mt-8">
                        <h3 className="text-amber fm-mono mb-4">
                          {thread.replyCount} resposta
                          {thread.replyCount === 1 ? "" : "s"}
                        </h3>
                        <CommentTree comments={thread.comments} />
                      </div>

                      {/* Form de resposta — só na thread aberta */}
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
                            Markdown básico · revisão antes de publicar
                          </p>
                          <button
                            type="button"
                            className="border-amber text-paper hover:bg-amber hover:text-carbon fm-mono border px-4 py-2 transition-colors"
                          >
                            Enviar resposta
                          </button>
                        </div>
                      </form>
                    </div>
                  </details>
                </li>
              );
            })}
          </ul>
        )}
      </div>

      {/* FAB — Novo tópico */}
      <button
        type="button"
        className="bg-amber text-carbon hover:bg-amber-soft group/fab fixed bottom-6 right-6 z-40 inline-flex items-center gap-3 rounded-full px-5 py-4 font-mono text-[12px] font-semibold uppercase tracking-[0.2em] shadow-2xl transition-all hover:scale-105 md:bottom-8 md:right-8"
        aria-label="Abrir novo tópico no fórum"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="18"
          height="18"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M5 12h14" />
          <path d="M12 5v14" />
        </svg>
        <span className="hidden md:inline">Novo tópico</span>
      </button>
    </>
  );
}
