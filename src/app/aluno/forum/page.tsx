import type { Metadata } from "next";

import { AreaEmptyState } from "@/components/shared/area-empty-state";
import { primaryCourse } from "@/lib/course/aluno-courses";

export const metadata: Metadata = {
  title: "Fórum — Escola Flávio Milhomem",
  robots: { index: false, follow: false },
};

export default function AlunoForumPage() {
  return (
    <section className="fm-site-page py-20">
      <p className="text-amber fm-mono">Comunidade</p>
      <h1 className="text-paper mt-3 font-serif text-3xl md:text-4xl">
        Fórum do curso
      </h1>
      <p className="text-paper-700 mt-4 max-w-2xl text-base leading-relaxed">
        Discussões por aula — {primaryCourse.title}. O fórum será habilitado
        quando as matrículas estiverem sincronizadas com a plataforma.
      </p>
      <div className="mt-12">
        <AreaEmptyState
          title="Nenhuma discussão ainda"
          description="Quando o fórum estiver ativo, você poderá abrir tópicos por aula e receber resposta do professor em até 72 horas úteis."
        />
      </div>
    </section>
  );
}
