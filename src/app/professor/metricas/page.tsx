import type { Metadata } from "next";

import { getProfessorMetrics, formatBRL } from "@/lib/professor/metrics";
import { fmTitleClamp } from "@/lib/ui/fm-title-clamp";

export const metadata: Metadata = {
  title: "Métricas — Painel do professor",
  robots: { index: false, follow: false },
};

export default async function ProfessorMetricasPage() {
  const m = await getProfessorMetrics();

  const cards: Array<{ label: string; value: string; hint: string }> = [
    { label: "Alunos", value: String(m.alunos), hint: "com pedido pago" },
    {
      label: "Matrículas",
      value: String(m.matriculas),
      hint: "pedidos pagos (inclui recompra)",
    },
    {
      label: "Receita",
      value: formatBRL(m.receitaCents),
      hint: "soma dos pedidos pagos",
    },
    {
      label: "Conclusão média",
      value: `${m.conclusaoMediaPct}%`,
      hint: `${m.conclusoes} de ${m.alunos * m.aulas} aulas-aluno`,
    },
    { label: "Certificados", value: String(m.certificados), hint: "emitidos" },
    {
      label: "Fórum",
      value: String(m.comentarios),
      hint:
        m.comentariosPendentes > 0
          ? `${m.comentariosPendentes} aguardando moderação`
          : "nenhum pendente",
    },
  ];

  return (
    <section className="fm-site-page py-12">
      <p className="text-amber font-mono text-[10px] tracking-[0.2em] uppercase">
        Analytics
      </p>
      <h1
        className="fm-title-fluid mt-3 font-serif leading-[1.05]"
        style={fmTitleClamp("36px", "4.5vw", "56px")}
      >
        Métricas <em className="text-amber italic">do programa</em>
      </h1>
      <p className="text-paper-700 mt-4 max-w-2xl text-base leading-relaxed">
        Indicadores calculados em tempo real a partir da plataforma (pedidos,
        progresso das aulas, fórum e certificados).
      </p>

      <div className="border-paper-100 bg-paper-100 mt-12 grid gap-px sm:grid-cols-2 lg:grid-cols-3 [&>*]:bg-white">
        {cards.map((c) => (
          <div key={c.label} className="px-6 py-7">
            <p className="text-paper-600 font-mono text-[10px] tracking-[0.2em] uppercase">
              {c.label}
            </p>
            <p className="text-paper mt-3 font-serif text-4xl leading-none">
              {c.value}
            </p>
            <p className="text-paper-600 mt-2 text-[13px]">{c.hint}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
