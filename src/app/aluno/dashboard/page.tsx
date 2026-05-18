import type { Metadata } from "next";

import { AnnouncementCard } from "@/components/aluno/announcement-card";
import { DashboardRow } from "@/components/aluno/dashboard-row";
import { ForumThreadCard } from "@/components/aluno/forum-thread-card";
import { HeroBillboard } from "@/components/aluno/hero-billboard";
import { LabeledProgress } from "@/components/aluno/labeled-progress";
import { LessonCard } from "@/components/aluno/lesson-card";
import { LessonCardRanked } from "@/components/aluno/lesson-card-ranked";
import { getSessionFromCookies } from "@/lib/auth/session";
import {
  formatDuration,
  mockAnnouncements,
  mockCourse,
  mockForumThreads,
  mockUser,
  nextLesson as pickNext,
} from "@/data/mock-aluno";
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
  title: "Painel do aluno — Escola Flávio Milhomem",
  robots: { index: false, follow: false },
};

/**
 * Dashboard pós-login (Cap 9 do guia).
 *
 * Estrutura streaming: hero billboard com curso atual + linhas de
 * recomendação (próximas aulas, todas as aulas em andamento, em alta
 * no fórum, anúncios). Sem dados reais por enquanto — alimentado pelo
 * mock-aluno.
 *
 * Faixa de métricas: shadcn Card + Progress + Avatar (@cursor / Gemini).
 */
export default async function DashboardPage() {
  const session = await getSessionFromCookies();
  const studentName = session?.name ?? mockUser.name;
  const next = pickNext();

  const inProgress = mockCourse.modules.flatMap((m) =>
    m.lessons.filter((l) => l.status === "em-andamento"),
  );
  const continueRow = next
    ? [next, ...inProgress.filter((l) => l.id !== next.id)]
    : inProgress;

  const upcoming = mockCourse.modules
    .flatMap((m) => m.lessons)
    .filter((l) => l.status === "nao-iniciada")
    .slice(0, 6);

  const completed = mockCourse.modules.flatMap((m) =>
    m.lessons.filter((l) => l.status === "concluida"),
  );

  const totalSec =
    completed.reduce((acc, l) => acc + l.durationSec, 0) +
    (next?.watchedSec ?? 0);

  const lessonsProgressPct = Math.min(
    100,
    Math.round(
      (completed.length / Math.max(1, mockCourse.lessonCount)) * 100,
    ),
  );

  const initials = initialsFromName(studentName);

  return (
    <>
      <HeroBillboard course={mockCourse} nextLesson={next} studentName={studentName} />

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
          <div className="grid flex-1 grid-cols-2 gap-4 lg:grid-cols-4">
            <StatCard
              label="Aulas concluídas"
              value={`${completed.length} / ${mockCourse.lessonCount}`}
              progress={lessonsProgressPct}
            />
            <StatCard label="Tempo de estudo" value={formatDuration(totalSec)} />
            <StatCard
              label="Sequência semanal"
              value={`${mockUser.weeklyStreak} dias`}
            />
            <StatCard label="Próxima sessão ao vivo" value="15/mai · 20h" />
          </div>
        </div>
      </section>

      <div className="space-y-14 py-14">
        <DashboardRow
          eyebrow="Continue de onde parou"
          title="Suas aulas em andamento"
          cta={{
            label: "Ver curso completo",
            href: `/aluno/cursos/${mockCourse.slug}`,
          }}
        >
          {continueRow.map((lesson) => (
            <LessonCard
              key={lesson.id}
              lesson={lesson}
              width="md"
              showModule
            />
          ))}
        </DashboardRow>

        <DashboardRow
          eyebrow="Roteiro do curso"
          title="Próximas aulas no programa"
        >
          {upcoming.map((lesson) => (
            <LessonCardRanked key={lesson.id} lesson={lesson} />
          ))}
        </DashboardRow>

        <DashboardRow
          eyebrow="Comunidade"
          title="Em alta no fórum"
          cta={{ label: "Ver tudo", href: "/aluno/forum" }}
        >
          {mockForumThreads.map((thread) => (
            <ForumThreadCard key={thread.id} thread={thread} />
          ))}
        </DashboardRow>

        <DashboardRow
          eyebrow="Avisos da Escola"
          title="Anúncios institucionais"
        >
          {mockAnnouncements.map((ann) => (
            <AnnouncementCard key={ann.id} announcement={ann} />
          ))}
        </DashboardRow>

        {completed.length > 0 && (
          <DashboardRow
            eyebrow="Memória do que você já cobriu"
            title="Já assistidas"
          >
            {completed.map((lesson) => (
              <LessonCardRanked key={lesson.id} lesson={lesson} />
            ))}
          </DashboardRow>
        )}
      </div>
    </>
  );
}

function initialsFromName(name: string): string {
  return name
    .split(/\s+/)
    .map((p) => p[0])
    .filter(Boolean)
    .slice(0, 2)
    .join("")
    .toUpperCase();
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
