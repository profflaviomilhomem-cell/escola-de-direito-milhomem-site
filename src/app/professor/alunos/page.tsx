import type { Metadata } from "next";

import { mockStudents } from "@/data/mock-professor";

export const metadata: Metadata = {
  title: "Alunos — Painel do professor",
  robots: { index: false, follow: false },
};

/**
 * Lista de alunos matriculados — esqueleto navegável já mostrando os
 * registros com progresso. Próxima iteração: filtros (atividade,
 * progresso, pagamento), busca, ações de moderação e CSV export.
 */
export default function ProfessorAlunosPage() {
  return (
    <section className="px-gutter mx-auto max-w-(--container-narrow) py-12 lg:px-12">
      <header className="mb-10">
        <p className="text-amber font-mono text-[10px] uppercase tracking-[0.2em]">
          CRM do cohort
        </p>
        <h1
          className="mt-3 font-serif leading-[1.05]"
          style={{ fontSize: "clamp(36px, 4.5vw, 56px)" }}
        >
          Seus <em className="text-amber italic">alunos</em>.
        </h1>
        <p className="text-paper-700 mt-4 max-w-2xl text-base leading-relaxed md:text-lg">
          {mockStudents.length} matriculados no cohort 2026. Listagem em
          forma de tabela; próxima iteração inclui busca, filtros,
          exportação e ações em lote.
        </p>
      </header>

      <div className="border-paper-100 bg-carbon-elevated overflow-hidden border">
        <table className="w-full text-sm">
          <thead className="border-paper-100 border-b">
            <tr className="text-paper-600 font-mono text-[10px] uppercase tracking-[0.2em]">
              <th className="px-5 py-3 text-left">Aluno</th>
              <th className="hidden px-5 py-3 text-left md:table-cell">
                Matrícula
              </th>
              <th className="px-5 py-3 text-left">Progresso</th>
              <th className="hidden px-5 py-3 text-left md:table-cell">
                Última atividade
              </th>
            </tr>
          </thead>
          <tbody className="divide-paper-100 divide-y">
            {mockStudents.map((s) => (
              <tr key={s.id} className="hover:bg-paper-50">
                <td className="px-5 py-4">
                  <div className="flex items-center gap-3">
                    <span className="bg-paper text-carbon grid h-9 w-9 flex-shrink-0 place-items-center rounded-full text-xs font-bold">
                      {s.initials}
                    </span>
                    <div className="min-w-0">
                      <p className="text-paper truncate font-serif text-base leading-tight">
                        {s.name}
                      </p>
                      <p className="text-paper-600 truncate font-mono text-[10px] uppercase tracking-[0.15em]">
                        {s.email}
                      </p>
                    </div>
                  </div>
                </td>
                <td className="text-paper-700 hidden whitespace-nowrap px-5 py-4 font-mono text-[11px] md:table-cell">
                  {new Date(s.joinedAt).toLocaleDateString("pt-BR", {
                    day: "2-digit",
                    month: "short",
                    year: "numeric",
                  })}
                </td>
                <td className="px-5 py-4">
                  <div className="flex items-center gap-3">
                    <div className="bg-paper-200 relative h-1 flex-1 overflow-hidden">
                      <span
                        className="bg-amber absolute inset-y-0 left-0"
                        style={{ width: `${s.progressPct * 100}%` }}
                      />
                    </div>
                    <span className="text-paper-700 whitespace-nowrap font-mono text-[10px]">
                      {Math.round(s.progressPct * 100)}%
                    </span>
                  </div>
                </td>
                <td className="text-paper-600 hidden whitespace-nowrap px-5 py-4 font-mono text-[10px] uppercase tracking-[0.15em] md:table-cell">
                  {s.lastSeen}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}
