import type { Metadata } from "next";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";

import { LabeledProgress } from "@/components/aluno/labeled-progress";
import { LessonComments } from "@/components/aluno/lesson-comments";
import { LessonTabs } from "@/components/aluno/lesson-tabs";
import { PlayerVideo } from "@/components/aluno/player-video";
import { formatDuration } from "@/lib/course/format";
import type { CourseLesson } from "@/lib/course/types";
import { getLessonFromDb } from "@/lib/course/db-course";
import { getSessionFromCookies } from "@/lib/auth/session";
import { userHasAccess } from "@/lib/enrollment";
import {
  listLessonComments,
  type ForumCommentNode,
} from "@/lib/forum/comments";
import { progressPercentFromRatio } from "@/lib/utils";

type Params = Promise<{ slug: string }>;

export async function generateMetadata({
  params,
}: {
  params: Params;
}): Promise<Metadata> {
  const { slug } = await params;
  const found = await getLessonFromDb(slug);
  if (!found) return { title: "Aula não encontrada" };
  return {
    title: `${found.lesson.title} — ${found.course.shortTitle}`,
    robots: { index: false, follow: false },
  };
}

/**
 * Página de aula — player no topo, abas (Resumo / Materiais / Fórum)
 * embaixo, sidebar à direita com módulos do curso e navegação prev/next.
 */
export default async function AulaPage({ params }: { params: Params }) {
  const { slug } = await params;

  const session = await getSessionFromCookies();
  if (!session) redirect("/entrar");

  // Curso + aula vêm do banco com progresso real e videoId (Stream) aplicados.
  const found = await getLessonFromDb(slug, session.sub);
  if (!found) notFound();
  const { course, lesson } = found;

  const hasAccess = await userHasAccess(session.sub, course.slug);
  if (!hasAccess) redirect(`/cursos/${course.slug}`);

  let initialComments: ForumCommentNode[] = [];
  try {
    initialComments = await listLessonComments(
      course.slug,
      lesson.slug,
      session.sub,
    );
  } catch {
    /* banco indisponível: fórum carrega vazio e recarrega no client */
  }

  const flat: CourseLesson[] = course.modules.flatMap((m) => m.lessons);
  const idx = flat.findIndex((l) => l.id === lesson.id);
  const prev = idx > 0 ? flat[idx - 1] : null;
  const next = idx < flat.length - 1 ? flat[idx + 1] : null;
  const progress =
    lesson.durationSec > 0 ? lesson.watchedSec / lesson.durationSec : 0;

  return (
    <div className="fm-site-page py-10">
      {/* Breadcrumb editorial */}
      <nav className="text-paper-600 fm-mono mb-6 flex flex-wrap items-center gap-2">
        <Link
          href={`/aluno/cursos/${course.slug}`}
          className="hover:text-amber"
        >
          {course.shortTitle}
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
          <PlayerVideo lesson={lesson} course={course} />

          <div className="mt-6 space-y-3">
            <p className="text-amber fm-mono">{lesson.moduleTitle}</p>
            <h1 className="text-paper font-serif text-3xl leading-tight md:text-4xl">
              {lesson.title}
            </h1>
            <div className="flex flex-wrap items-center gap-3">
              <span className="text-paper-700 fm-mono">
                {formatDuration(lesson.durationSec)}
              </span>
              <span className="text-paper-400" aria-hidden>
                ·
              </span>
              <span className="text-paper-700 fm-mono">
                Aula {idx + 1} de {flat.length}
              </span>
              {lesson.status === "concluida" && (
                <>
                  <span className="text-paper-400" aria-hidden>
                    ·
                  </span>
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
                                {m.pages > 0 ? `${m.pages} páginas · ` : ""}
                                {m.sizeKb} KB ·{" "}
                                {lesson.slidesSrc ? "PPTX" : "PDF"}
                              </p>
                            </div>
                            {lesson.slidesSrc ? (
                              <a
                                href={lesson.slidesSrc}
                                download
                                className="border-amber text-paper hover:bg-amber hover:text-carbon fm-mono shrink-0 border px-4 py-2 transition-colors"
                              >
                                Baixar
                              </a>
                            ) : (
                              <span
                                aria-disabled
                                className="border-paper-100 text-paper-600 fm-mono shrink-0 cursor-not-allowed border px-4 py-2 opacity-60"
                              >
                                Em breve
                              </span>
                            )}
                          </li>
                        ))}
                      </ul>
                    ),
                },
                {
                  id: "forum",
                  label: "Fórum desta aula",
                  content: (
                    <LessonComments
                      productSlug={course.slug}
                      lessonSlug={lesson.slug}
                      initialComments={initialComments}
                    />
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
            {course.modules.map((mod) => (
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
                              : "hover:bg-paper-100 border-l-2 border-transparent"
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
