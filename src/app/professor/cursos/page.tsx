import type { Metadata } from "next";
import Link from "next/link";

import {
  getProfessorCourses,
  PRODUCT_PUBLISH_LABEL,
  PRODUCT_TYPE_LABEL,
} from "@/lib/professor/products";
import { fmTitleClamp } from "@/lib/ui/fm-title-clamp";

export const metadata: Metadata = {
  title: "Cursos — Painel do professor",
  robots: { index: false, follow: false },
};

export const dynamic = "force-dynamic";

export default async function ProfessorCursosPage() {
  const courses = await getProfessorCourses();
  const publicados = courses.filter((c) => c.publishStatus === "PUBLISHED");
  const rascunhos = courses.filter((c) => c.publishStatus === "DRAFT");

  return (
    <section className="fm-site-page py-12">
      <header className="mb-10 flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-amber font-mono text-[10px] uppercase tracking-[0.2em]">
            Catálogo · cohorts e produtos
          </p>
          <h1
            className="fm-title-fluid mt-3 font-serif leading-[1.05]"
            style={fmTitleClamp("36px", "4.5vw", "56px")}
          >
            Seus <em className="text-amber italic">cursos</em>.
          </h1>
          <p className="text-paper-700 mt-3 max-w-2xl text-base leading-relaxed">
            Capa, banner, preço e publicação. Depois de criar o curso, gerencie
            módulos e aulas em Aulas.
          </p>
        </div>
        <Link
          href="/professor/cursos/novo"
          className="bg-amber text-carbon hover:bg-amber-soft inline-flex px-5 py-3 font-mono text-[11px] uppercase tracking-[0.2em] transition-colors"
        >
          Novo curso
        </Link>
      </header>

      <div className="border-paper-100 bg-carbon-elevated/60 mb-10 grid grid-cols-2 gap-px border md:grid-cols-4">
        <Stat label="Total" value={courses.length.toString()} />
        <Stat label="Publicados" value={publicados.length.toString()} />
        <Stat label="Rascunhos" value={rascunhos.length.toString()} />
        <Stat
          label="Aulas (soma)"
          value={courses.reduce((n, c) => n + c.lessonCount, 0).toString()}
        />
      </div>

      {courses.length === 0 ? (
        <p className="text-paper-600 border-paper-100 border p-8 text-sm leading-relaxed">
          Nenhum curso na tabela <code className="text-paper">Product</code>.
          Sincronize o curso gravado com{" "}
          <code className="text-paper">npm run seed:prova-digital</code> ou crie
          um em <strong className="text-paper font-normal">Novo curso</strong>.
          Se acabou de rodar o seed, recarregue a página (Cmd+Shift+R).
        </p>
      ) : (
        <div className="border-paper-100 bg-carbon-elevated overflow-hidden border">
          <table className="w-full text-sm">
            <thead className="border-paper-100 border-b">
              <tr className="text-paper-600 font-mono text-[10px] uppercase tracking-[0.2em]">
                <th className="px-5 py-3 text-left">Curso</th>
                <th className="hidden px-5 py-3 text-left lg:table-cell">Tipo</th>
                <th className="px-5 py-3 text-left">Status</th>
                <th className="hidden px-5 py-3 text-right md:table-cell">Aulas</th>
                <th className="px-5 py-3 text-right">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-paper-100 divide-y">
              {courses.map((course) => {
                const tone = PRODUCT_PUBLISH_LABEL[course.publishStatus];
                return (
                  <tr key={course.id} className="hover:bg-paper-50">
                    <td className="px-5 py-4">
                      <p className="text-paper font-serif text-base leading-tight">
                        {course.name}
                      </p>
                      <p className="text-paper-600 mt-1 font-mono text-[11px]">
                        /{course.slug}
                      </p>
                    </td>
                    <td className="text-paper-600 hidden px-5 py-4 lg:table-cell">
                      {PRODUCT_TYPE_LABEL[course.type]}
                    </td>
                    <td className="px-5 py-4">
                      <span
                        className={`inline-block border px-2 py-0.5 font-mono text-[9px] uppercase tracking-widest ${tone.cls}`}
                      >
                        {tone.label}
                      </span>
                    </td>
                    <td className="text-paper-600 hidden px-5 py-4 text-right md:table-cell">
                      {course.lessonCount}
                    </td>
                    <td className="px-5 py-4 text-right">
                      <Link
                        href={`/professor/cursos/${course.slug}/editar`}
                        className="text-amber hover:underline font-mono text-[10px] uppercase tracking-widest"
                      >
                        Editar
                      </Link>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="bg-carbon-elevated px-5 py-4">
      <p className="text-paper-600 font-mono text-[10px] uppercase tracking-[0.2em]">
        {label}
      </p>
      <p className="text-paper mt-2 font-serif text-3xl">{value}</p>
    </div>
  );
}
