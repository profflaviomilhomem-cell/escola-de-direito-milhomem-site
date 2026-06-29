import { requireAdminSession } from "@/lib/auth/require-admin";
import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { CourseEditor } from "@/components/professor/course-editor";
import { getProfessorCourseBySlug } from "@/lib/professor/products";
import { fmTitleClamp } from "@/lib/ui/fm-title-clamp";

type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const course = await getProfessorCourseBySlug(slug);
  return {
    title: course ? `Editar ${course.name} — Professor` : "Curso — Professor",
    robots: { index: false, follow: false },
  };
}

export default async function ProfessorEditarCursoPage({ params }: Props) {
  await requireAdminSession();
  const { slug } = await params;
  const course = await getProfessorCourseBySlug(slug);
  if (!course) notFound();

  return (
    <section className="fm-site-page py-12">
      <header className="mb-10">
        <p className="text-amber font-mono text-[10px] tracking-[0.2em] uppercase">
          {course.slug}
        </p>
        <h1
          className="fm-title-fluid mt-3 font-serif leading-[1.05]"
          style={fmTitleClamp("32px", "4vw", "48px")}
        >
          Editar <em className="text-amber italic">curso</em>
        </h1>
        <p className="text-paper-700 mt-3 max-w-2xl text-base leading-relaxed">
          {course.name} · {course.lessonCount} aula
          {course.lessonCount === 1 ? "" : "s"} vinculada
          {course.lessonCount === 1 ? "" : "s"}.
        </p>
      </header>
      <CourseEditor course={course} />
    </section>
  );
}
