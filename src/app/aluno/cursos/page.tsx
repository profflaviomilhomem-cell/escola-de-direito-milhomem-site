import type { Metadata } from "next";

import { CourseLibraryCard } from "@/components/aluno/course-library-card";
import { enrolledCourses } from "@/lib/course/aluno-courses";
import { fmTitleClamp } from "@/lib/ui/fm-title-clamp";

export const metadata: Metadata = {
  title: "Meus cursos — Escola Flávio Milhomem",
  robots: { index: false, follow: false },
};

export default function MeusCursosPage() {
  return (
    <section className="fm-site-page py-20">
      <p className="text-amber fm-mono">Sua biblioteca</p>
      <h1
        className="fm-title-fluid mt-3 font-serif leading-[1.05]"
        style={fmTitleClamp("2.25rem", "4.5vw", "3.5rem")}
      >
        Cursos em andamento.
      </h1>
      <p className="text-paper-700 mt-4 max-w-2xl text-base leading-relaxed md:text-lg">
        Cohorts e cursos gravados que você está cursando. Aulas com vídeo,
        slides e fórum ficam disponíveis aqui — o acesso é vitalício após a
        matrícula.
      </p>

      <div className="mt-12 grid gap-6 md:grid-cols-2">
        {enrolledCourses.map((course) => (
          <CourseLibraryCard key={course.id} course={course} />
        ))}
      </div>
    </section>
  );
}
