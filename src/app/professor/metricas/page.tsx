import type { Metadata } from "next";

import { AreaEmptyState } from "@/components/shared/area-empty-state";
import { fmTitleClamp } from "@/lib/ui/fm-title-clamp";

export const metadata: Metadata = {
  title: "Métricas — Painel do professor",
  robots: { index: false, follow: false },
};

export default function ProfessorMetricasPage() {
  return (
    <section className="fm-site-page py-12">
      <p className="text-amber font-mono text-[10px] uppercase tracking-[0.2em]">
        Analytics
      </p>
      <h1
        className="fm-title-fluid mt-3 font-serif leading-[1.05]"
        style={fmTitleClamp("36px", "4.5vw", "56px")}
      >
        Métricas <em className="text-amber italic">do programa</em>
      </h1>
      <div className="mt-12">
        <AreaEmptyState
          title="Dados em breve"
          description="Indicadores de engajamento, conclusão e satisfação serão calculados a partir da plataforma."
        />
      </div>
    </section>
  );
}
