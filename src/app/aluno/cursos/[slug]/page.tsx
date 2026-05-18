import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

import { LessonCardCompact } from "@/components/aluno/lesson-card-compact";
import { LabeledProgress } from "@/components/aluno/labeled-progress";
import {
  formatDuration,
  mockCourse,
  nextLesson as pickNext,
} from "@/data/mock-aluno";
import { progressPercentFromRatio } from "@/lib/utils";

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
        className="relative -mt-24 overflow-hidden"
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
            <div className="fm-site-container w-full">
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
                  <LabeledProgress
                    label={`${mockCourse.completedLessonCount} de ${mockCourse.lessonCount} aulas`}
                    value={progressPercentFromRatio(overall)}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Resumo do curso */}
      <section className="fm-site-page py-12">
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

      {/* Módulos — linha do tempo vertical com cards de aula */}
      <section className="fm-site-page pb-20">
        <header className="mb-10 flex items-end justify-between">
          <div>
            <p className="text-amber fm-mono">Sua jornada</p>
            <h2 className="text-paper mt-2 font-serif text-3xl">
              Módulos do curso
            </h2>
          </div>
          <p className="text-paper-600 fm-mono hidden md:block">
            {mockCourse.modules.length} módulos · {mockCourse.lessonCount} aulas
          </p>
        </header>

        {/* Container relativo. A linha vertical fica como pseudo-fundo
            entre o primeiro e o último marker, em amber/30. */}
        <div className="relative">
          <div
            aria-hidden
            className="bg-amber/30 absolute left-[27px] top-7 bottom-7 w-px md:left-[31px]"
          />

          <ol className="space-y-12">
            {mockCourse.modules.map((mod, i) => {
              const moduleSec = mod.lessons.reduce(
                (acc, l) => acc + l.durationSec,
                0,
              );
              const moduleDone = mod.lessons.filter(
                (l) => l.status === "concluida",
              ).length;
              const moduleProgress = moduleDone / mod.lessons.length;

              const moduleStatus: "done" | "active" | "todo" =
                moduleDone === mod.lessons.length
                  ? "done"
                  : mod.lessons.some(
                        (l) =>
                          l.status === "em-andamento" ||
                          l.status === "concluida",
                      )
                    ? "active"
                    : "todo";

              const markerClasses =
                moduleStatus === "done"
                  ? "bg-amber text-carbon border-amber"
                  : moduleStatus === "active"
                    ? "bg-amber/10 text-amber border-amber"
                    : "bg-carbon-elevated text-paper-600 border-paper-200";

              return (
                <li
                  key={mod.slug}
                  className="grid gap-5 md:grid-cols-[64px_1fr] md:gap-7"
                >
                  {/* Marker da timeline */}
                  <div className="relative flex items-start">
                    <span
                      className={`relative z-10 grid h-14 w-14 place-items-center rounded-full border-2 font-serif text-xl italic ${markerClasses}`}
                    >
                      {moduleStatus === "done" ? (
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          width="22"
                          height="22"
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
                        i + 1
                      )}
                    </span>
                  </div>

                  {/* Conteúdo do módulo */}
                  <div className="min-w-0">
                    {/* Header do módulo */}
                    <div className="border-paper-100 bg-carbon-elevated border p-6">
                      <div className="flex flex-wrap items-start justify-between gap-4">
                        <div className="min-w-0">
                          <p className="text-amber fm-mono">
                            Módulo {i + 1}
                            {moduleStatus === "done" && " · concluído"}
                            {moduleStatus === "active" && " · em andamento"}
                            {moduleStatus === "todo" && " · a iniciar"}
                          </p>
                          <h3 className="text-paper mt-2 font-serif text-2xl leading-tight">
                            {mod.title}
                          </h3>
                          <p className="text-paper-700 mt-2 leading-relaxed">
                            {mod.subtitle}
                          </p>
                        </div>
                        <div className="text-paper-600 fm-mono whitespace-nowrap text-right">
                          {mod.lessons.length} aulas
                          <br />
                          {formatDuration(moduleSec)}
                        </div>
                      </div>
                      <div className="mt-5">
                        <LabeledProgress
                          label={`${moduleDone}/${mod.lessons.length}`}
                          value={progressPercentFromRatio(moduleProgress)}
                        />
                      </div>
                    </div>

                    {/* Cards das aulas — vertical, com thumbnail */}
                    <ul className="mt-4 space-y-3">
                      {mod.lessons.map((lesson) => (
                        <li key={lesson.id}>
                          <LessonCardCompact lesson={lesson} />
                        </li>
                      ))}
                    </ul>
                  </div>
                </li>
              );
            })}
          </ol>
        </div>
      </section>
    </>
  );
}
