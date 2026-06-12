import type { Metadata } from "next";

import { CursoVitrineCard } from "@/components/marketing/curso-vitrine-card";
import { InstitutionalNotice } from "@/components/marketing/institutional-notice";
import { getCatalogWithFallback } from "@/lib/marketing/catalog";
import { fmTitleClamp } from "@/lib/ui/fm-title-clamp";

export const metadata: Metadata = {
  title: "Cursos",
  description:
    "Cursos da Escola Flávio Milhomem — Prova Digital no Processo Penal (cohort da Edição Lançamento) e Direito Penal em Questões para concurseiros, na Eduzz.",
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
        A Escola oferece um único curso nesta edição: Prova Digital no Processo
        Penal, voltado ao público profissional, no cohort inaugural da Edição
        Lançamento. Para quem estuda para concursos, o Direito Penal em Questões
        está disponível na Eduzz.
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
        Para concurseiros
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
