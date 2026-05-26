import type { Metadata } from "next";

import { CursoVitrineCard } from "@/components/marketing/curso-vitrine-card";
import { InstitutionalNotice } from "@/components/marketing/institutional-notice";
import { getCatalogWithFallback } from "@/lib/marketing/catalog";
import { fmTitleClamp } from "@/lib/ui/fm-title-clamp";

export const metadata: Metadata = {
  title: "Cursos",
  description:
    "Vitrine dos cursos da Escola Flávio Milhomem — Edição Lançamento em cohort e produtos legados na Eduzz.",
  alternates: { canonical: "/cursos" },
};

/**
 * Vitrine de cursos (Livro-Guia 5.8).
 */
export default async function CursosPage() {
  const { principal, legados, fromDatabase } = await getCatalogWithFallback();

  return (
    <section className="fm-site-page py-page">
      <p className="text-amber fm-mono text-[11px] uppercase tracking-[0.22em]">Programas</p>
      <h1
        className="fm-title-fluid mt-3 font-serif leading-[1.05]"
        style={fmTitleClamp("40px", "5vw", "56px")}
      >
        Cursos da <em className="text-amber italic">Escola</em>
      </h1>
      <p className="text-paper-700 mt-5 max-w-2xl text-lg leading-relaxed">
        No lançamento, a Edição Lançamento concentra o cohort inaugural. Os produtos na
        Eduzz permanecem disponíveis durante a transição para a plataforma própria.
        {fromDatabase ? (
          <span className="text-paper-600 block mt-2 text-sm">
            Catálogo sincronizado com os cursos publicados no painel do professor.
          </span>
        ) : null}
      </p>

      <div className="mt-12 space-y-6">
        {principal.map((p) => (
          <CursoVitrineCard key={p.slug} produto={p} />
        ))}
      </div>

      <h2 className="text-paper fm-mono mt-16 text-[11px] uppercase tracking-[0.22em]">
        Catálogo em transição
      </h2>
      <div className="mt-6 grid gap-4 sm:grid-cols-2">
        {legados.map((p) => (
          <CursoVitrineCard key={p.slug} produto={p} />
        ))}
      </div>

      <InstitutionalNotice className="mt-14 max-w-2xl" />
    </section>
  );
}
