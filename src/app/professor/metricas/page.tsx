import type { Metadata } from "next";

import { mockMetrics } from "@/data/mock-professor";
import { fmTitleClamp } from "@/lib/ui/fm-title-clamp";

export const metadata: Metadata = {
  title: "Métricas — Painel do professor",
  robots: { index: false, follow: false },
};

/**
 * Métricas agregadas do cohort — esqueleto navegável.
 * Próxima iteração: gráficos (linha de progresso semanal, funil de
 * conclusão por módulo, distribuição de NPS, retenção D7/D30) e
 * cruzamento com tracking GA4/PostHog.
 */
export default function ProfessorMetricasPage() {
  return (
    <section className="fm-site-page py-12">
      <header className="mb-10">
        <p className="text-amber font-mono text-[10px] uppercase tracking-[0.2em]">
          Painel · Métricas
        </p>
        <h1
          className="fm-title-fluid mt-3 font-serif leading-[1.05]"
          style={fmTitleClamp("36px", "4.5vw", "56px")}
        >
          O <em className="text-amber italic">cohort</em> em números.
        </h1>
        <p className="text-paper-700 mt-4 max-w-2xl text-base leading-relaxed md:text-lg">
          Visão executiva agregada. A próxima iteração inclui gráficos de
          retenção, funil de conclusão por módulo e cruzamento com GA4 +
          PostHog.
        </p>
      </header>

      <div className="border-paper-100 bg-carbon-elevated/60 grid grid-cols-1 gap-px border md:grid-cols-2 lg:grid-cols-4">
        {mockMetrics.map((m) => (
          <div key={m.label} className="bg-carbon-elevated/40 p-7">
            <p className="text-paper-600 font-mono text-[10px] uppercase tracking-[0.2em]">
              {m.label}
            </p>
            <p className="text-paper mt-3 font-serif text-4xl">{m.value}</p>
            {m.delta && (
              <p
                className={`mt-2 font-mono text-[10px] uppercase tracking-[0.15em] ${
                  m.tone === "alert"
                    ? "text-alerta-400"
                    : m.tone === "positive"
                      ? "text-amber"
                      : "text-paper-700"
                }`}
              >
                {m.delta}
              </p>
            )}
          </div>
        ))}
      </div>

      <div className="border-paper-100 bg-carbon-elevated/40 mt-12 border p-12 text-center">
        <p className="text-amber font-mono text-[10px] uppercase tracking-[0.2em]">
          Em breve
        </p>
        <p className="text-paper-700 mx-auto mt-3 max-w-md font-serif text-xl leading-tight">
          Gráficos de retenção, funil por módulo e cruzamento com GA4 /
          PostHog entram quando a Fase 5 for ativada no checklist.
        </p>
      </div>
    </section>
  );
}
