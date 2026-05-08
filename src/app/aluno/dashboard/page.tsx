import type { Metadata } from "next";

import { AnnouncementCard } from "@/components/aluno/announcement-card";
import { DashboardRow } from "@/components/aluno/dashboard-row";
import { ForumThreadCard } from "@/components/aluno/forum-thread-card";
import { HeroBillboard } from "@/components/aluno/hero-billboard";
import { LessonCard } from "@/components/aluno/lesson-card";
import {
  formatDuration,
  mockAnnouncements,
  mockCourse,
  mockForumThreads,
  mockUser,
  nextLesson as pickNext,
} from "@/data/mock-aluno";
import { getSessionFromCookies } from "@/lib/auth/session";

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
 */
export default async function DashboardPage() {
  const session = await getSessionFromCookies();
  const studentName = session?.name ?? mockUser.name;
  const next = pickNext();

  // Aulas em andamento + a próxima sugerida (deduplicadas).
  const inProgress = mockCourse.modules.flatMap((m) =>
    m.lessons.filter((l) => l.status === "em-andamento"),
  );
  const continueRow = next
    ? [next, ...inProgress.filter((l) => l.id !== next.id)]
    : inProgress;

  // Próximas: pega 6 não-iniciadas a partir de onde o aluno parou.
  const upcoming = mockCourse.modules
    .flatMap((m) => m.lessons)
    .filter((l) => l.status === "nao-iniciada")
    .slice(0, 6);

  // Aulas concluídas para o "Já assistido"
  const completed = mockCourse.modules.flatMap((m) =>
    m.lessons.filter((l) => l.status === "concluida"),
  );

  // Total de horas assistidas
  const totalSec = completed.reduce((acc, l) => acc + l.durationSec, 0)
    + (next?.watchedSec ?? 0);

  return (
    <>
      <HeroBillboard course={mockCourse} nextLesson={next} studentName={studentName} />

      {/* Faixa de stats — embaixo do billboard */}
      <section className="border-paper-100 border-y bg-carbon-elevated/50">
        <div className="px-gutter mx-auto grid max-w-(--container-narrow) grid-cols-2 gap-6 py-6 md:grid-cols-4 lg:px-12">
          <Stat label="Aulas concluídas" value={`${completed.length} / ${mockCourse.lessonCount}`} />
          <Stat label="Tempo de estudo" value={formatDuration(totalSec)} />
          <Stat label="Sequência semanal" value={`${mockUser.weeklyStreak} dias`} />
          <Stat label="Próxima sessão ao vivo" value="15/mai · 20h" />
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
            <LessonCard
              key={lesson.id}
              lesson={lesson}
              width="md"
              showModule
            />
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
              <LessonCard
                key={lesson.id}
                lesson={lesson}
                width="md"
                showModule
              />
            ))}
          </DashboardRow>
        )}
      </div>
    </>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-paper-600 fm-mono">{label}</p>
      <p className="text-paper mt-2 font-serif text-2xl">{value}</p>
    </div>
  );
}
