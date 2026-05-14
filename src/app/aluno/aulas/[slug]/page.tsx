import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

import { CommentTree } from "@/components/aluno/comment-tree";
import { LabeledProgress } from "@/components/aluno/labeled-progress";
import { LessonTabs } from "@/components/aluno/lesson-tabs";
import { PlayerVideoMock } from "@/components/aluno/player-video-mock";
import {
  findLessonBySlug,
  formatDuration,
  mockCourse,
  mockForumThreads,
  type MockLesson,
} from "@/data/mock-aluno";
import { progressPercentFromRatio } from "@/lib/utils";

type Params = Promise<{ slug: string }>;

export async function generateMetadata({
  params,
}: {
  params: Params;
}): Promise<Metadata> {
  const { slug } = await params;
  const lesson = findLessonBySlug(slug);
  if (!lesson) return { title: "Aula não encontrada" };
  return {
    title: `${lesson.title} — ${mockCourse.shortTitle}`,
    robots: { index: false, follow: false },
  };
}

/**
 * Página de aula — player no topo, abas (Resumo / Materiais / Fórum)
 * embaixo, sidebar à direita com módulos do curso e navegação prev/next.
 */
export default async function AulaPage({ params }: { params: Params }) {
  const { slug } = await params;
  const lesson = findLessonBySlug(slug);
  if (!lesson) notFound();

  const flat: MockLesson[] = mockCourse.modules.flatMap((m) => m.lessons);
  const idx = flat.findIndex((l) => l.id === lesson.id);
  const prev = idx > 0 ? flat[idx - 1] : null;
  const next = idx < flat.length - 1 ? flat[idx + 1] : null;
  const progress =
    lesson.durationSec > 0 ? lesson.watchedSec / lesson.durationSec : 0;

  // Discussões da aula — filtragem mock
  const lessonThreads = mockForumThreads.filter(
    (t) => t.lessonSlug === lesson.slug,
  );

  return (
    <div className="px-gutter mx-auto max-w-(--container-narrow) py-10 lg:px-12">
      {/* Breadcrumb editorial */}
      <nav className="text-paper-600 fm-mono mb-6 flex flex-wrap items-center gap-2">
        <Link href={`/aluno/cursos/${mockCourse.slug}`} className="hover:text-amber">
          {mockCourse.shortTitle}
        </Link>
        <span aria-hidden>/</span>
        <span>{lesson.moduleTitle}</span>
        <span aria-hidden>/</span>
        <span className="text-paper">
          Aula {lesson.position.toString().padStart(2, "0")}
        </span>
      </nav>

      <div className="grid gap-10 lg:grid-cols-[minmax(0,1fr)_320px]">
        {/* Coluna principal */}
        <div className="min-w-0">
          <PlayerVideoMock lesson={lesson} />

          <div className="mt-6 space-y-3">
            <p className="text-amber fm-mono">{lesson.moduleTitle}</p>
            <h1 className="text-paper font-serif text-3xl leading-tight md:text-4xl">
              {lesson.title}
            </h1>
            <div className="flex flex-wrap items-center gap-3">
              <span className="text-paper-700 fm-mono">
                {formatDuration(lesson.durationSec)}
              </span>
              <span className="text-paper-400" aria-hidden>·</span>
              <span className="text-paper-700 fm-mono">
                Aula {lesson.position} de {flat.length}
              </span>
              {lesson.status === "concluida" && (
                <>
                  <span className="text-paper-400" aria-hidden>·</span>
                  <span className="text-amber fm-mono">Concluída</span>
                </>
              )}
            </div>
            {lesson.status === "em-andamento" && (
              <div className="max-w-md">
                <LabeledProgress
                  label={`${Math.round(progress * 100)}%`}
                  value={progressPercentFromRatio(progress)}
                />
              </div>
            )}
          </div>

          <div className="mt-10">
            <LessonTabs
              tabs={[
                {
                  id: "resumo",
                  label: "Resumo",
                  content: (
                    <div className="space-y-6">
                      <p className="text-paper-800 max-w-prose-wide leading-relaxed md:text-lg">
                        {lesson.summary}
                      </p>
                      <div>
                        <h3 className="text-paper font-serif text-xl">
                          Pontos-chave
                        </h3>
                        <ul className="mt-4 space-y-3">
                          {lesson.keyPoints.map((kp, i) => (
                            <li
                              key={i}
                              className="border-amber/40 text-paper-800 border-l-2 pl-4 leading-relaxed"
                            >
                              {kp}
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  ),
                },
                {
                  id: "materiais",
                  label: "Materiais",
                  count: lesson.materials.length,
                  content:
                    lesson.materials.length === 0 ? (
                      <p className="text-paper-600 italic">
                        Nenhum PDF anexado a esta aula.
                      </p>
                    ) : (
                      <ul className="space-y-3">
                        {lesson.materials.map((m, i) => (
                          <li
                            key={i}
                            className="border-paper-100 hover:border-amber bg-carbon-elevated flex items-center justify-between gap-4 border p-4 transition-colors"
                          >
                            <div>
                              <p className="text-paper font-serif text-base">
                                {m.title}
                              </p>
                              <p className="text-paper-600 fm-mono mt-1">
                                {m.pages} páginas · {m.sizeKb} KB · PDF
                              </p>
                            </div>
                            <button
                              type="button"
                              className="border-amber text-paper hover:bg-amber hover:text-carbon fm-mono shrink-0 border px-4 py-2 transition-colors"
                            >
                              Baixar
                            </button>
                          </li>
                        ))}
                      </ul>
                    ),
                },
                {
                  id: "forum",
                  label: "Fórum desta aula",
                  count: lessonThreads.reduce(
                    (acc, t) => acc + t.replyCount,
                    0,
                  ),
                  content:
                    lessonThreads.length === 0 ? (
                      <p className="text-paper-600 italic">
                        Nenhuma discussão nesta aula ainda.
                      </p>
                    ) : (
                      <div className="space-y-8">
                        {lessonThreads.map((thread) => (
                          <article key={thread.id}>
                            <header className="mb-3">
                              <p className="text-amber fm-mono">
                                {thread.author.name} ·{" "}
                                {new Date(thread.createdAt).toLocaleDateString(
                                  "pt-BR",
                                  { day: "2-digit", month: "short" },
                                )}
                              </p>
                              <h3 className="text-paper mt-2 font-serif text-xl">
                                {thread.title}
                              </h3>
                              <p className="text-paper-700 mt-2 leading-relaxed">
                                {thread.body}
                              </p>
                            </header>
                            <CommentTree comments={thread.comments} />
                          </article>
                        ))}
                      </div>
                    ),
                },
              ]}
            />
          </div>

          {/* Navegação prev/next */}
          <nav
            aria-label="Navegação entre aulas"
            className="border-paper-100 mt-12 grid grid-cols-1 gap-3 border-t pt-6 md:grid-cols-2"
          >
            {prev ? (
              <Link
                href={`/aluno/aulas/${prev.slug}`}
                className="border-paper-100 hover:border-amber bg-carbon-elevated group block border p-4 transition-colors"
              >
                <span className="text-paper-600 fm-mono group-hover:text-amber">
                  ← Aula anterior
                </span>
                <p className="text-paper mt-2 font-serif text-base leading-tight">
                  {prev.title}
                </p>
              </Link>
            ) : (
              <span />
            )}
            {next ? (
              <Link
                href={`/aluno/aulas/${next.slug}`}
                className="border-paper-100 hover:border-amber bg-carbon-elevated group block border p-4 text-right transition-colors"
              >
                <span className="text-paper-600 fm-mono group-hover:text-amber">
                  Próxima aula →
                </span>
                <p className="text-paper mt-2 font-serif text-base leading-tight">
                  {next.title}
                </p>
              </Link>
            ) : (
              <span />
            )}
          </nav>
        </div>

        {/* Sidebar — módulos do curso */}
        <aside
          aria-label="Conteúdo do curso"
          className="lg:sticky lg:top-24 lg:self-start"
        >
          <h2 className="text-amber fm-mono mb-4">Conteúdo do curso</h2>
          <div className="border-paper-100 bg-carbon-elevated divide-paper-100 max-h-[70vh] divide-y overflow-y-auto border">
            {mockCourse.modules.map((mod) => (
              <details
                key={mod.slug}
                open={mod.slug === lesson.moduleSlug}
                className="group"
              >
                <summary className="hover:bg-paper-100 flex cursor-pointer items-center justify-between px-4 py-3">
                  <span className="text-paper font-serif text-sm">
                    {mod.title}
                  </span>
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
                    className="text-paper-600 transition-transform group-open:rotate-180"
                  >
                    <path d="m6 9 6 6 6-6" />
                  </svg>
                </summary>
                <ul className="border-paper-100 border-t">
                  {mod.lessons.map((l) => {
                    const isCurrent = l.id === lesson.id;
                    return (
                      <li key={l.id}>
                        <Link
                          href={`/aluno/aulas/${l.slug}`}
                          className={`flex items-center gap-3 px-4 py-3 transition-colors ${
                            isCurrent
                              ? "bg-amber/10 border-amber border-l-2"
                              : "border-l-2 border-transparent hover:bg-paper-100"
                          }`}
                        >
                          <span
                            aria-hidden
                            className={`grid h-6 w-6 flex-shrink-0 place-items-center rounded-full text-[10px] ${
                              l.status === "concluida"
                                ? "bg-amber text-carbon"
                                : isCurrent
                                  ? "border-amber text-amber border"
                                  : "border-paper-200 text-paper-600 border"
                            }`}
                          >
                            {l.status === "concluida" ? "✓" : l.position}
                          </span>
                          <div className="min-w-0 flex-1">
                            <p
                              className={`line-clamp-2 text-sm leading-tight ${
                                isCurrent ? "text-amber" : "text-paper"
                              }`}
                            >
                              {l.title}
                            </p>
                            <p className="text-paper-600 fm-mono mt-1">
                              {formatDuration(l.durationSec)}
                            </p>
                          </div>
                        </Link>
                      </li>
                    );
                  })}
                </ul>
              </details>
            ))}
          </div>
        </aside>
      </div>
    </div>
  );
}
