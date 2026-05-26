import type { Metadata } from "next";

import { AreaEmptyState } from "@/components/shared/area-empty-state";
import { fmTitleClamp } from "@/lib/ui/fm-title-clamp";

export const metadata: Metadata = {
  title: "Fórum — Painel do professor",
  robots: { index: false, follow: false },
};

export default function ProfessorForumPage() {
  return (
    <section className="fm-site-page py-12">
      <p className="text-amber font-mono text-[10px] uppercase tracking-[0.2em]">
        Moderação
      </p>
      <h1
        className="fm-title-fluid mt-3 font-serif leading-[1.05]"
        style={fmTitleClamp("36px", "4.5vw", "56px")}
      >
        Fórum <em className="text-amber italic">do cohort</em>
      </h1>
      <div className="mt-12">
        <AreaEmptyState
          title="Nenhuma pergunta pendente"
          description="As discussões dos alunos aparecerão aqui quando o fórum estiver conectado ao banco de dados."
        />
      </div>
    </section>
  );
}
