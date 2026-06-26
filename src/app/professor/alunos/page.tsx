import type { Metadata } from "next";

import { ManualEnrollmentPanel } from "@/components/professor/manual-enrollment-panel";
import { productGrantsAccessInMvp } from "@/lib/business/commercial-rules";
import { listManualEnrollments } from "@/lib/enrollment/list-manual-enrollments";
import { getProfessorCourses } from "@/lib/professor/products";
import { fmTitleClamp } from "@/lib/ui/fm-title-clamp";

export const metadata: Metadata = {
  title: "Alunos — Painel do professor",
  robots: { index: false, follow: false },
};

export default async function ProfessorAlunosPage() {
  let products: {
    slug: string;
    name: string;
    type: import("@prisma/client").ProductType;
  }[] = [];
  let initialEnrollments: Awaited<ReturnType<typeof listManualEnrollments>> =
    [];

  try {
    const [courses, enrollments] = await Promise.all([
      getProfessorCourses(),
      listManualEnrollments(40),
    ]);
    products = courses
      .filter((c) => c.active && productGrantsAccessInMvp(c.type))
      .map((c) => ({ slug: c.slug, name: c.name, type: c.type }));
    initialEnrollments = enrollments;
  } catch {
    /* DB indisponível — formulário ainda renderiza vazio */
  }

  return (
    <section className="fm-site-page py-12">
      <p className="text-amber font-mono text-[10px] tracking-[0.2em] uppercase">
        Matrículas
      </p>
      <h1
        className="fm-title-fluid mt-3 font-serif leading-[1.05]"
        style={fmTitleClamp("36px", "4.5vw", "56px")}
      >
        Alunos <em className="text-amber italic">matriculados</em>
      </h1>
      <p className="text-paper-600 mt-4 max-w-2xl text-sm leading-relaxed">
        Conceda acesso manual para turma fundadora ou pagamentos recebidos fora
        do checkout online. O aluno precisa já ter conta cadastrada no e-mail
        informado.
      </p>

      <ManualEnrollmentPanel
        products={products}
        initialEnrollments={initialEnrollments}
      />
    </section>
  );
}
