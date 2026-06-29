import type { Metadata } from "next";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";

import { LessonCardCompact } from "@/components/aluno/lesson-card-compact";
import { LabeledProgress } from "@/components/aluno/labeled-progress";
import { formatDuration } from "@/data/mock-aluno";
import {
  courseCatalogLabel,
  nextLessonInCourse,
} from "@/lib/course/aluno-courses";
import { getCourseFromDb } from "@/lib/course/db-course";
import { progressPercentFromRatio } from "@/lib/utils";
import { fmTitleClamp } from "@/lib/ui/fm-title-clamp";
import { getSessionFromCookies } from "@/lib/auth/session";
import { userHasAccess } from "@/lib/enrollment";

type Params = Promise<{ slug: string }>;

export async function generateMetadata({
  params,
}: {
  params: Params;
}): Promise<Metadata> {
  const { slug } = await params;
  const course = await getCourseFromDb(slug);
  if (!course) return { title: "Curso não encontrado" };
  return {
    title: `${course.shortTitle} — área do aluno`,
    robots: { index: false, follow: false },
  };
}

export default async function CursoMatriculadoPage({
  params,
}: {
  params: Params;
}) {
  const { slug } = await params;

  const session = await getSessionFromCookies();
  if (!session) redirect("/entrar");

  const course = await getCourseFromDb(slug, session.sub);
  if (!course) notFound();

  const hasAccess = await userHasAccess(session.sub, slug);
  if (!hasAccess) redirect(`/cursos/${slug}`);

  const totalSec = course.modules
    .flatMap((m) => m.lessons)
    .reduce((acc, l) => acc + l.durationSec, 0);

  const completedSec = course.modules
    .flatMap((m) => m.lessons)
    .reduce(
      (acc, l) =>
        acc + (l.status === "concluida" ? l.durationSec : l.watchedSec),
      0,
    );

  const next = nextLessonInCourse(course);
  const overall = course.completedLessonCount / Math.max(1, course.lessonCount);

  return (
    <>
      <section
        className="fm-hero-under-header relative overflow-hidden"
        aria-label={course.title}
      >
        <div
          className="relative h-[58vh] min-h-[440px] w-full"
          style={{
            backgroundImage: `linear-gradient(${course.cover.angle ?? 135}deg, ${course.cover.from}, ${course.cover.via ?? course.cover.from}, ${course.cover.to})`,
          }}
        >
          <div
            aria-hidden
            className="absolute top-1/3 -left-32 h-[480px] w-[480px] rounded-full opacity-15 blur-3xl"
            style={{ background: "var(--color-amber)" }}
          />
          <div className="from-carbon via-carbon/70 absolute inset-0 bg-gradient-to-t to-transparent" />
          <div className="from-carbon/85 via-carbon/40 absolute inset-0 bg-gradient-to-r to-transparent" />

          <div className="relative z-10 flex h-full items-end pb-16">
            <div className="fm-site-container w-full">
              <p className="text-amber fm-mono">{courseCatalogLabel(course)}</p>
              <h1
                className="fm-title-fluid mt-3 font-serif leading-[1.05]"
                style={fmTitleClamp("2.25rem", "4.5vw", "3.75rem")}
              >
                {course.title}
              </h1>
              <p className="text-paper-700 mt-4 max-w-2xl text-base leading-relaxed md:text-lg">
                {course.tagline}
              </p>

              <div className="mt-8 flex flex-wrap items-center gap-6">
                {next && (
                  <Link
                    href={`/aluno/aulas/${next.slug}`}
                    className="bg-paper text-carbon hover:bg-amber inline-flex items-center gap-3 px-6 py-3 font-mono text-[12px] font-semibold tracking-[0.2em] uppercase no-underline transition-colors"
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="18"
                      height="18"
                      viewBox="0 0 24 24"
                      fill="currentColor"
                    >
                      <polygon points="6 3 20 12 6 21 6 3" />
                    </svg>
                    Continuar
                  </Link>
                )}
                <div className="min-w-[260px] flex-1">
                  <LabeledProgress
                    label={`${course.completedLessonCount} de ${course.lessonCount} aulas`}
                    value={progressPercentFromRatio(overall)}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="fm-site-page py-12">
        <div className="grid gap-8 lg:grid-cols-[2fr_1fr]">
          <div>
            <h2 className="text-paper font-serif text-2xl">Sobre o curso</h2>
            <p className="text-paper-800 mt-4 leading-relaxed">
              {course.description}
            </p>
          </div>

          <aside className="border-paper-100 bg-carbon-elevated border p-6">
            <h3 className="text-amber fm-mono">Programa</h3>
            <dl className="mt-4 space-y-3 text-sm">
              <div className="flex justify-between gap-4">
                <dt className="text-paper-700">Módulos</dt>
                <dd className="text-paper">{course.modules.length}</dd>
              </div>
              <div className="flex justify-between gap-4">
                <dt className="text-paper-700">Aulas</dt>
                <dd className="text-paper">{course.lessonCount}</dd>
              </div>
              <div className="flex justify-between gap-4">
                <dt className="text-paper-700">Carga total</dt>
                <dd className="text-paper">{formatDuration(totalSec)}</dd>
              </div>
              <div className="flex justify-between gap-4">
                <dt className="text-paper-700">Já assistido</dt>
                <dd className="text-paper">{formatDuration(completedSec)}</dd>
              </div>
            </dl>
          </aside>
        </div>
      </section>

      <section className="fm-site-page pb-20">
        <header className="mb-10 flex items-end justify-between">
          <div>
            <p className="text-amber fm-mono">Sua jornada</p>
            <h2 className="text-paper mt-2 font-serif text-3xl">
              Módulos do curso
            </h2>
          </div>
          <p className="text-paper-600 fm-mono hidden md:block">
            {course.modules.length} módulos · {course.lessonCount} aulas
          </p>
        </header>

        <div className="relative">
          <div
            aria-hidden
            className="bg-amber/30 absolute top-7 bottom-7 left-[27px] w-px md:left-[31px]"
          />

          <ol className="space-y-12">
            {course.modules.map((mod, i) => {
              const moduleSec = mod.lessons.reduce(
                (acc, l) => acc + l.durationSec,
                0,
              );
              const moduleDone = mod.lessons.filter(
                (l) => l.status === "concluida",
              ).length;

              return (
                <li key={mod.slug} className="relative pl-16 md:pl-20">
                  <span
                    aria-hidden
                    className="bg-amber text-carbon border-amber absolute top-0 left-0 grid h-14 w-14 place-items-center rounded-full border-2 font-serif text-xl italic md:h-16 md:w-16 md:text-2xl"
                  >
                    {i + 1}
                  </span>

                  <header className="mb-6">
                    <p className="text-amber fm-mono">Módulo {i + 1}</p>
                    <h3 className="text-paper mt-1 font-serif text-2xl leading-tight">
                      {mod.title}
                    </h3>
                    <p className="text-paper-700 mt-2 text-sm">
                      {mod.subtitle}
                    </p>
                    <p className="text-paper-600 fm-mono mt-2 text-[11px]">
                      {moduleDone}/{mod.lessons.length} aulas ·{" "}
                      {formatDuration(moduleSec)}
                    </p>
                  </header>

                  <ul className="space-y-3">
                    {mod.lessons.map((lesson) => (
                      <li key={lesson.id}>
                        <LessonCardCompact
                          lesson={lesson}
                          eyebrow={`Aula ${lesson.position.toString().padStart(2, "0")}`}
                        />
                      </li>
                    ))}
                  </ul>
                </li>
              );
            })}
          </ol>
        </div>
      </section>
    </>
  );
}
