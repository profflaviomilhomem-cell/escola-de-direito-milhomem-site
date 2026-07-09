import Link from "next/link";

import { LessonMediaCover } from "@/components/aluno/lesson-media-cover";
import { LabeledProgress } from "@/components/aluno/labeled-progress";
import type { MockCourse } from "@/lib/course/types";
import { courseCatalogLabel } from "@/lib/course/aluno-courses";
import { formatDuration } from "@/lib/course/format";
import { progressPercentFromRatio } from "@/lib/utils";

type Props = {
  course: MockCourse;
};

export function CourseLibraryCard({ course }: Props) {
  const totalSec = course.modules
    .flatMap((m) => m.lessons)
    .reduce((acc, l) => acc + l.durationSec, 0);
  const overall = course.completedLessonCount / Math.max(1, course.lessonCount);
  const hasVideo = course.modules.some((m) =>
    m.lessons.some((l) => Boolean(l.videoSrc)),
  );

  return (
    <Link
      href={`/aluno/cursos/${course.slug}`}
      className="group border-paper-100 hover:border-amber relative block overflow-hidden border no-underline transition-colors"
    >
      <div className="relative aspect-[16/9] overflow-hidden">
        <LessonMediaCover
          cover={course.cover}
          posterSrc={course.coverImageSrc}
          alt={course.title}
          className="absolute inset-0"
        />
        <div className="from-carbon via-carbon/40 pointer-events-none absolute inset-0 bg-gradient-to-t to-transparent" />
        <div
          aria-hidden
          className="absolute top-1/3 -right-12 h-48 w-48 rounded-full opacity-25 blur-3xl"
          style={{ background: "var(--color-amber)" }}
        />
        <div className="absolute inset-x-0 bottom-0 p-5">
          <p className="text-amber fm-mono">{courseCatalogLabel(course)}</p>
          <h2 className="text-paper mt-2 font-serif text-2xl leading-tight">
            {course.title}
          </h2>
          {hasVideo ? (
            <p className="text-paper-600 fm-mono mt-2 text-[10px] tracking-widest uppercase">
              Vídeos e slides disponíveis
            </p>
          ) : null}
        </div>
      </div>
      <div className="bg-carbon-elevated p-5">
        <LabeledProgress
          label={`${course.completedLessonCount} de ${course.lessonCount} aulas`}
          value={progressPercentFromRatio(overall)}
        />
        <p className="text-paper-700 fm-mono mt-3">
          {course.modules.length} módulos · {formatDuration(totalSec)}
        </p>
      </div>
    </Link>
  );
}
