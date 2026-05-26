import type { Metadata } from "next";

import { AreaEmptyState } from "@/components/shared/area-empty-state";
import { enrolledCourses } from "@/lib/course/aluno-courses";

export const metadata: Metadata = {
  title: "Certificados — Escola Flávio Milhomem",
  robots: { index: false, follow: false },
};

export default function CertificadosPage() {
  const totalLessons = enrolledCourses.reduce((n, c) => n + c.lessonCount, 0);
  const completed = enrolledCourses.reduce(
    (n, c) => n + c.completedLessonCount,
    0,
  );

  return (
    <section className="fm-site-page py-20">
      <p className="text-amber fm-mono">Credenciais</p>
      <h1 className="text-paper mt-3 font-serif text-3xl md:text-4xl">
        Certificados
      </h1>
      <p className="text-paper-700 mt-4 max-w-2xl text-base leading-relaxed">
        Progresso atual: {completed} de {totalLessons} aulas nos cursos
        matriculados. Os certificados emitidos aparecerão aqui após a conclusão
        da trilha exigida em cada programa.
      </p>
      <div className="mt-12">
        <AreaEmptyState
          title="Nenhum certificado emitido"
          description="Conclua a carga horária e os requisitos do curso para solicitar o certificado da Escola."
        />
      </div>
    </section>
  );
}
