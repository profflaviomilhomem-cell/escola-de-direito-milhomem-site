import type { Metadata } from "next";
import Link from "next/link";

import { LessonManager } from "@/components/professor/lesson-manager";
import { listProductLessons } from "@/lib/professor/lessons";
import { getProfessorCourses } from "@/lib/professor/products";
import { fmTitleClamp } from "@/lib/ui/fm-title-clamp";

export const metadata: Metadata = {
  title: "Aulas — Painel do professor",
  robots: { index: false, follow: false },
};

type Props = { searchParams: Promise<{ curso?: string }> };

export default async function ProfessorAulasPage({ searchParams }: Props) {
  const { curso } = await searchParams;
  const courses = await getProfessorCourses();

  if (courses.length === 0) {
    return (
      <section className="fm-site-page py-12">
        <h1 className="font-serif text-3xl">Aulas</h1>
        <p className="text-paper-700 mt-4">
          Nenhum curso cadastrado ainda.{" "}
          <Link
            href="/professor/cursos/novo"
            className="text-amber hover:underline"
          >
            Criar curso →
          </Link>
        </p>
      </section>
    );
  }

  const selected = courses.find((c) => c.slug === curso) ?? courses[0]!;
  const lessons = await listProductLessons(selected.slug);

  return (
    <section className="fm-site-page py-12">
      <header className="mb-8">
        <p className="text-amber font-mono text-[10px] tracking-[0.2em] uppercase">
          Conteúdo · {selected.name}
        </p>
        <h1
          className="fm-title-fluid mt-3 font-serif leading-[1.05]"
          style={fmTitleClamp("36px", "4.5vw", "56px")}
        >
          <em className="text-amber italic">Módulos</em> e aulas.
        </h1>

        {courses.length > 1 && (
          <div className="mt-5 flex flex-wrap gap-2">
            {courses.map((c) => (
              <Link
                key={c.slug}
                href={`/professor/aulas?curso=${encodeURIComponent(c.slug)}`}
                className={`fm-mono border px-3 py-1.5 text-[11px] transition-colors ${
                  c.slug === selected.slug
                    ? "border-amber bg-amber/10 text-amber"
                    : "border-paper-200 text-paper-700 hover:border-paper-400"
                }`}
              >
                {c.name}
              </Link>
            ))}
          </div>
        )}
      </header>

      <LessonManager productSlug={selected.slug} initialLessons={lessons} />
    </section>
  );
}
