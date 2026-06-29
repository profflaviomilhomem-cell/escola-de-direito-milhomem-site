import { requireAdminSession } from "@/lib/auth/require-admin";
import type { Metadata } from "next";

import { CourseEditor } from "@/components/professor/course-editor";
import { fmTitleClamp } from "@/lib/ui/fm-title-clamp";

export const metadata: Metadata = {
  title: "Novo curso — Painel do professor",
  robots: { index: false, follow: false },
};

export default async function ProfessorNovoCursoPage() {
  await requireAdminSession();
  return (
    <section className="fm-site-page py-12">
      <header className="mb-10">
        <p className="text-amber font-mono text-[10px] tracking-[0.2em] uppercase">
          Catálogo
        </p>
        <h1
          className="fm-title-fluid mt-3 font-serif leading-[1.05]"
          style={fmTitleClamp("32px", "4vw", "48px")}
        >
          Novo <em className="text-amber italic">curso</em>
        </h1>
        <p className="text-paper-700 mt-3 max-w-2xl text-base leading-relaxed">
          Defina identidade visual (capa e banner), texto de venda e status de
          publicação. Salve como rascunho até estar pronto para o site.
        </p>
      </header>
      <CourseEditor />
    </section>
  );
}
