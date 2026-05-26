import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";

import { AreaEmptyState } from "@/components/shared/area-empty-state";
import { getSessionFromCookies } from "@/lib/auth/session";
import { getEnrolledCourses } from "@/lib/enrollment";

export const metadata: Metadata = {
  title: "Certificados — Escola Flávio Milhomem",
  robots: { index: false, follow: false },
};

export default async function CertificadosPage() {
  const session = await getSessionFromCookies();
  const userId = session?.sub;
  if (!userId) redirect("/entrar");

  const enrolled = await getEnrolledCourses(userId);

  if (enrolled.length === 0) {
    return (
      <section className="fm-site-page py-20">
        <p className="text-amber fm-mono">Credenciais</p>
        <h1 className="text-paper mt-3 font-serif text-3xl md:text-4xl">
          Certificados
        </h1>
        <div className="mt-12">
          <AreaEmptyState
            title="Nenhum curso matriculado"
            description="Os certificados ficam disponíveis após a matrícula e a conclusão da trilha exigida em cada programa."
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

  const totalLessons = enrolled.reduce((n, c) => n + c.lessonCount, 0);
  const completed = enrolled.reduce((n, c) => n + c.completedLessonCount, 0);

  return (
    <section className="fm-site-page py-20">
      <p className="text-amber fm-mono">Credenciais</p>
      <h1 className="text-paper mt-3 font-serif text-3xl md:text-4xl">
        Certificados
      </h1>
      <p className="text-paper-700 mt-4 max-w-2xl text-base leading-relaxed">
        Progresso atual: {completed} de {totalLessons} aulas em{" "}
        {enrolled.length === 1
          ? "1 curso matriculado"
          : `${enrolled.length} cursos matriculados`}
        . Os certificados emitidos aparecerão aqui após a conclusão da trilha
        exigida em cada programa.
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
