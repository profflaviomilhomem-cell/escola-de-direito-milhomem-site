import type { Metadata } from "next";
import Link from "next/link";
import { getSessionFromCookies } from "@/lib/auth/session";
import { redirect } from "next/navigation";

import { AreaEmptyState } from "@/components/shared/area-empty-state";
import { CourseLibraryCard } from "@/components/aluno/course-library-card";
import { fmTitleClamp } from "@/lib/ui/fm-title-clamp";
import { getEnrolledCourses } from "@/lib/enrollment";

export const metadata: Metadata = {
  title: "Meus cursos",
  robots: { index: false, follow: false },
};

export default async function MeusCursosPage() {
  const session = await getSessionFromCookies();

  // Proxy já redireciona não-autenticado, mas mantemos defesa em profundidade.
  const userId = session?.sub;
  if (!userId) redirect("/entrar");

  const enrolled = await getEnrolledCourses(userId);

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
        {enrolled.length === 0 ? (
          <>
            <AreaEmptyState
              title="Nenhum curso matriculado"
              description="Após a compra ou concessão de acesso pela turma, seus cursos aparecerão nesta biblioteca."
              className="md:col-span-2"
            />
            <p className="text-paper-600 text-center text-sm md:col-span-2">
              <Link href="/cursos" className="text-amber hover:underline">
                Ver cursos disponíveis →
              </Link>
            </p>
          </>
        ) : (
          enrolled.map((course) => (
            <CourseLibraryCard key={course.id} course={course} />
          ))
        )}
      </div>
    </section>
  );
}
