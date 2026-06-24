import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";

import { AreaEmptyState } from "@/components/shared/area-empty-state";
import { DashboardRow } from "@/components/aluno/dashboard-row";
import { HeroBillboard } from "@/components/aluno/hero-billboard";
import { LabeledProgress } from "@/components/aluno/labeled-progress";
import { LessonCard } from "@/components/aluno/lesson-card";
import { LessonCardRanked } from "@/components/aluno/lesson-card-ranked";
import { formatDuration, initialsFromName } from "@/lib/course/format";
import { getSessionFromCookies } from "@/lib/auth/session";
import {
  flattenCourseLessons,
  nextLessonAcrossCourses,
} from "@/lib/course/aluno-courses";
import { getEnrolledCoursesWithProgress } from "@/lib/enrollment";
import { cn } from "@/lib/utils";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export const metadata: Metadata = {
  title: "Painel do aluno",
  robots: { index: false, follow: false },
};

export default async function DashboardPage() {
  const session = await getSessionFromCookies();
  const userId = session?.sub;
  if (!userId) redirect("/entrar");

  const studentName = session.name ?? session.email ?? "Aluno";
  const enrolled = await getEnrolledCoursesWithProgress(userId);

  if (enrolled.length === 0) {
    return (
      <section className="fm-site-page py-20">
        <p className="text-amber fm-mono">Painel</p>
        <h1 className="text-paper mt-3 font-serif text-3xl md:text-4xl">
          Olá, {studentName.split(/\s+/)[0]}.
        </h1>
        <div className="mt-12">
          <AreaEmptyState
            title="Nenhum curso matriculado"
            description="Quando você concluir a compra ou receber acesso da turma, seus cursos aparecerão aqui com aulas e progresso."
          />
          <p className="text-paper-600 mt-6 text-center text-sm">
            <Link href="/cursos" className="text-amber hover:underline">
              Ver cursos disponíveis →
            </Link>
          </p>
        </div>
      </section>
    );
  }

  const primaryCourse = enrolled[0]!;
  const next = nextLessonAcrossCourses(enrolled);

  const allLessons = flattenCourseLessons(enrolled);
  const inProgress = allLessons.filter((l) => l.status === "em-andamento");
  const continueRow = next
    ? [next, ...inProgress.filter((l) => l.id !== next.id)]
    : inProgress;

  const upcoming = allLessons
    .filter((l) => l.status === "nao-iniciada")
    .slice(0, 6);

  const completed = allLessons.filter((l) => l.status === "concluida");
  const totalLessons = enrolled.reduce((n, c) => n + c.lessonCount, 0);

  const totalSec =
    completed.reduce((acc, l) => acc + l.durationSec, 0) +
    (next?.watchedSec ?? 0);

  const lessonsProgressPct = Math.min(
    100,
    Math.round((completed.length / Math.max(1, totalLessons)) * 100),
  );

  const initials = initialsFromName(studentName);

  return (
    <>
      <HeroBillboard
        course={primaryCourse}
        nextLesson={next}
        studentName={studentName}
      />

      <section className="border-paper-100 border-y">
        <div className="fm-site-page flex flex-col gap-4 py-6 lg:flex-row lg:items-stretch lg:gap-6">
          <Card
            size="sm"
            className="border-paper-100/50 bg-card/90 flex w-full shrink-0 items-center justify-center py-8 ring-1 ring-paper-100/10 lg:w-40 lg:py-6"
          >
            <Avatar size="lg" className="border border-paper-200">
              <AvatarFallback className="bg-muted font-serif text-lg text-paper">
                {initials}
              </AvatarFallback>
            </Avatar>
          </Card>
          <div className="grid flex-1 grid-cols-2 gap-4 lg:grid-cols-3">
            <StatCard
              label="Aulas concluídas"
              value={`${completed.length} / ${totalLessons}`}
              progress={lessonsProgressPct}
            />
            <StatCard label="Tempo de estudo" value={formatDuration(totalSec)} />
            <StatCard
              label="Cursos matriculados"
              value={String(enrolled.length)}
            />
          </div>
        </div>
      </section>

      <div className="space-y-14 py-14">
        {continueRow.length > 0 ? (
          <DashboardRow
            eyebrow="Continue de onde parou"
            title="Suas aulas em andamento"
            cta={{ label: "Ver cursos", href: "/aluno/cursos" }}
          >
            {continueRow.map((lesson) => (
              <LessonCard key={lesson.id} lesson={lesson} width="md" showModule />
            ))}
          </DashboardRow>
        ) : null}

        {upcoming.length > 0 ? (
          <DashboardRow eyebrow="Roteiro" title="Próximas aulas">
            {upcoming.map((lesson) => (
              <LessonCardRanked key={lesson.id} lesson={lesson} />
            ))}
          </DashboardRow>
        ) : null}

        {completed.length > 0 ? (
          <DashboardRow eyebrow="Concluídas" title="Já assistidas">
            {completed.map((lesson) => (
              <LessonCardRanked key={lesson.id} lesson={lesson} />
            ))}
          </DashboardRow>
        ) : null}

        <section className="fm-site-page">
          <AreaEmptyState
            title="Fórum e avisos em breve"
            description="As discussões por aula e os comunicados da turma serão exibidos aqui quando a plataforma estiver conectada ao banco de dados."
          />
          <p className="text-paper-600 mt-4 text-center text-sm">
            <Link href="/aluno/forum" className="text-amber hover:underline">
              Ir ao fórum
            </Link>
          </p>
        </section>
      </div>
    </>
  );
}

function StatCard({
  label,
  value,
  progress,
  className,
}: {
  label: string;
  value: string;
  progress?: number;
  className?: string;
}) {
  return (
    <Card
      size="sm"
      className={cn(
        "border-paper-100/50 bg-card/90 ring-1 ring-paper-100/10 shadow-none backdrop-blur-sm",
        className,
      )}
    >
      <CardHeader className="pb-2">
        <CardDescription className="text-paper-600 fm-mono">{label}</CardDescription>
        <CardTitle className="font-serif text-2xl leading-tight text-paper">
          {value}
        </CardTitle>
      </CardHeader>
      {progress != null && (
        <CardContent className="pt-0">
          <LabeledProgress value={progress} />
        </CardContent>
      )}
    </Card>
  );
}
