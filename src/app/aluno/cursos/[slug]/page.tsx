import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

import { ProgressBar } from "@/components/aluno/progress-bar";
import {
  formatDuration,
  mockCourse,
  nextLesson as pickNext,
} from "@/data/mock-aluno";

type Params = Promise<{ slug: string }>;

export async function generateMetadata({
  params,
}: {
  params: Params;
}): Promise<Metadata> {
  const { slug } = await params;
  if (slug !== mockCourse.slug) return { title: "Curso não encontrado" };
  return {
    title: `${mockCourse.shortTitle} — área do aluno`,
    robots: { index: false, follow: false },
  };
}

export default async function CursoMatriculadoPage({
  params,
}: {
  params: Params;
}) {
  const { slug } = await params;
  if (slug !== mockCourse.slug) notFound();

  const totalSec = mockCourse.modules
    .flatMap((m) => m.lessons)
    .reduce((acc, l) => acc + l.durationSec, 0);

  const completedSec = mockCourse.modules
    .flatMap((m) => m.lessons)
    .reduce(
      (acc, l) =>
        acc +
        (l.status === "concluida" ? l.durationSec : l.watchedSec),
      0,
    );

  const next = pickNext();
  const overall = mockCourse.completedLessonCount / mockCourse.lessonCount;

  return (
    <>
      {/* Hero do curso */}
      <section
        className="relative -mt-16 overflow-hidden"
        aria-label={mockCourse.title}
      >
        <div
          className="relative h-[58vh] min-h-[440px] w-full"
          style={{
            backgroundImage: `linear-gradient(${mockCourse.cover.angle ?? 135}deg, ${mockCourse.cover.from}, ${mockCourse.cover.via ?? mockCourse.cover.from}, ${mockCourse.cover.to})`,
          }}
        >
          <div
            aria-hidden
            className="absolute -left-32 top-1/3 h-[480px] w-[480px] rounded-full opacity-15 blur-3xl"
            style={{ background: "var(--color-amber)" }}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-carbon via-carbon/70 to-transparent" />
          <div className="absolute inset-0 bg-gradient-to-r from-carbon/85 via-carbon/40 to-transparent" />

          <div className="relative z-10 flex h-full items-end pb-16">
            <div className="px-gutter mx-auto w-full max-w-(--container-narrow) lg:px-12">
              <p className="text-amber fm-mono">Cohort 2026 · Edição Lançamento</p>
              <h1
                className="mt-3 font-serif leading-[1.05]"
                style={{ fontSize: "clamp(2.25rem, 4.5vw, 3.75rem)" }}
              >
                {mockCourse.title}
              </h1>
              <p className="text-paper-700 mt-4 max-w-2xl text-base leading-relaxed md:text-lg">
                {mockCourse.tagline}
              </p>

              <div className="mt-8 flex flex-wrap items-center gap-6">
                {next && (
                  <Link
                    href={`/aluno/aulas/${next.slug}`}
                    className="bg-paper text-carbon hover:bg-amber inline-flex items-center gap-3 px-6 py-3 font-mono text-[12px] font-semibold uppercase tracking-[0.2em] no-underline transition-colors"
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="18"
                      height="18"
                      viewBox="0 0 24 24"
                      fill="currentColor"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <polygon points="6 3 20 12 6 21 6 3" />
                    </svg>
                    Continuar
                  </Link>
                )}
                <div className="min-w-[260px] flex-1">
                  <ProgressBar
                    value={overall}
                    label={`${mockCourse.completedLessonCount} de ${mockCourse.lessonCount} aulas`}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Resumo do curso */}
      <section className="px-gutter mx-auto max-w-(--container-narrow) py-12 lg:px-12">
        <div className="grid gap-8 lg:grid-cols-[2fr_1fr]">
          <div>
            <h2 className="text-paper font-serif text-2xl">Sobre o curso</h2>
            <p className="text-paper-800 mt-4 leading-relaxed">
              {mockCourse.description}
            </p>
          </div>

          <aside className="border-paper-100 bg-carbon-elevated border p-6">
            <h3 className="text-amber fm-mono">Programa</h3>
            <dl className="mt-4 space-y-3 text-sm">
              <div className="flex justify-between gap-4">
                <dt className="text-paper-700">Módulos</dt>
                <dd className="text-paper">{mockCourse.modules.length}</dd>
              </div>
              <div className="flex justify-between gap-4">
                <dt className="text-paper-700">Aulas</dt>
                <dd className="text-paper">{mockCourse.lessonCount}</dd>
              </div>
              <div className="flex justify-between gap-4">
                <dt className="text-paper-700">Carga total</dt>
                <dd className="text-paper">
                  {formatDuration(totalSec)}
                </dd>
              </div>
              <div className="flex justify-between gap-4">
                <dt className="text-paper-700">Já assistido</dt>
                <dd className="text-paper">
                  {formatDuration(completedSec)}
                </dd>
              </div>
            </dl>
          </aside>
        </div>
      </section>

      {/* Módulos */}
      <section className="px-gutter mx-auto max-w-(--container-narrow) pb-20 lg:px-12">
        <h2 className="text-paper mb-8 font-serif text-3xl">Módulos</h2>
        <div className="space-y-4">
          {mockCourse.modules.map((mod, i) => {
            const moduleSec = mod.lessons.reduce(
              (acc, l) => acc + l.durationSec,
              0,
            );
            const moduleDone = mod.lessons.filter(
              (l) => l.status === "concluida",
            ).length;
            const moduleProgress = moduleDone / mod.lessons.length;

            return (
              <details
                key={mod.slug}
                open={i === 0 || mod.lessons.some((l) => l.status === "em-andamento")}
                className="border-paper-100 hover:border-amber/60 bg-carbon-elevated group border transition-colors"
              >
                <summary className="flex cursor-pointer flex-col gap-3 p-6 md:flex-row md:items-center md:justify-between">
                  <div className="flex items-start gap-4">
                    <span
                      className="bg-amber/10 text-amber border-amber/40 grid h-12 w-12 flex-shrink-0 place-items-center rounded-full border font-serif italic"
                    >
                      {i + 1}
                    </span>
                    <div>
                      <h3 className="text-paper font-serif text-xl leading-tight">
                        {mod.title}
                      </h3>
                      <p className="text-paper-700 mt-1 text-sm">
                        {mod.subtitle}
                      </p>
                      <p className="text-paper-600 fm-mono mt-2">
                        {mod.lessons.length} aulas ·{" "}
                        {formatDuration(moduleSec)}
                      </p>
                    </div>
                  </div>
                  <div className="md:w-48 md:text-right">
                    <ProgressBar
                      value={moduleProgress}
                      size="sm"
                      label={`${moduleDone}/${mod.lessons.length}`}
                    />
                  </div>
                </summary>

                <ul className="border-paper-100 divide-paper-100 divide-y border-t">
                  {mod.lessons.map((lesson) => {
                    const lessonProgress =
                      lesson.durationSec > 0
                        ? lesson.watchedSec / lesson.durationSec
                        : 0;
                    return (
                      <li key={lesson.id}>
                        <Link
                          href={`/aluno/aulas/${lesson.slug}`}
                          className="hover:bg-paper-100 group/lesson flex items-center gap-4 p-5 transition-colors"
                        >
                          <span
                            aria-hidden
                            className={`grid h-9 w-9 flex-shrink-0 place-items-center rounded-full text-sm ${
                              lesson.status === "concluida"
                                ? "bg-amber text-carbon"
                                : lesson.status === "em-andamento"
                                  ? "border-amber text-amber border"
                                  : "border-paper-200 text-paper-600 border"
                            }`}
                          >
                            {lesson.status === "concluida" ? (
                              <svg
                                xmlns="http://www.w3.org/2000/svg"
                                width="14"
                                height="14"
                                viewBox="0 0 24 24"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth="3"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                              >
                                <path d="M20 6 9 17l-5-5" />
                              </svg>
                            ) : (
                              <svg
                                xmlns="http://www.w3.org/2000/svg"
                                width="12"
                                height="12"
                                viewBox="0 0 24 24"
                                fill="currentColor"
                              >
                                <polygon points="6 3 20 12 6 21 6 3" />
                              </svg>
                            )}
                          </span>
                          <div className="min-w-0 flex-1">
                            <p className="text-paper group-hover/lesson:text-amber font-serif text-base leading-tight transition-colors">
                              {lesson.title}
                            </p>
                            <p className="text-paper-600 fm-mono mt-1">
                              {formatDuration(lesson.durationSec)}
                              {lesson.status === "em-andamento" &&
                                ` · ${Math.round(lessonProgress * 100)}%`}
                            </p>
                          </div>
                          <span className="text-paper-600 group-hover/lesson:text-amber fm-mono hidden md:block">
                            Aula{" "}
                            {lesson.position.toString().padStart(2, "0")}
                          </span>
                        </Link>
                      </li>
                    );
                  })}
                </ul>
              </details>
            );
          })}
        </div>
      </section>
    </>
  );
}
