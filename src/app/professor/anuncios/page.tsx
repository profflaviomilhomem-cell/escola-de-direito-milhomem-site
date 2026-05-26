import type { Metadata } from "next";

import { AreaEmptyState } from "@/components/shared/area-empty-state";
import { fmTitleClamp } from "@/lib/ui/fm-title-clamp";

export const metadata: Metadata = {
  title: "Anúncios — Painel do professor",
  robots: { index: false, follow: false },
};

export default function ProfessorAnunciosPage() {
  return (
    <section className="fm-site-page py-12">
      <p className="text-amber font-mono text-[10px] uppercase tracking-[0.2em]">
        Comunicados
      </p>
      <h1
        className="fm-title-fluid mt-3 font-serif leading-[1.05]"
        style={fmTitleClamp("36px", "4.5vw", "56px")}
      >
        Anúncios <em className="text-amber italic">da turma</em>
      </h1>
      <div className="mt-12">
        <AreaEmptyState
          title="Nenhum anúncio publicado"
          description="Crie avisos para a turma quando o módulo de comunicados estiver ativo."
        />
      </div>
    </section>
  );
}
