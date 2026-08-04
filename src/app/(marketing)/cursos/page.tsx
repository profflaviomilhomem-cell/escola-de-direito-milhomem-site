import type { Metadata } from "next";

import { CursoVitrineCard } from "@/components/marketing/curso-vitrine-card";
import { InstitutionalNotice } from "@/components/marketing/institutional-notice";
import { getCatalogWithFallback } from "@/lib/marketing/catalog";
import { fmTitleClamp } from "@/lib/ui/fm-title-clamp";

export const metadata: Metadata = {
  title: "Cursos",
  description:
    "Cursos da Escola Flávio Milhomem — Prova Digital no Processo Penal, cohort da Edição Lançamento, para quem atua no processo penal.",
  alternates: { canonical: "/cursos" },
};

/**
 * Vitrine de cursos (Livro-Guia 5.8).
 */
export default async function CursosPage() {
  const { principal, legados, fromDatabase } = await getCatalogWithFallback();

  return (
    <section className="fm-site-page py-page">
      <p className="text-amber fm-mono text-[11px] tracking-[0.22em] uppercase">
        Programas
      </p>
      <h1
        className="fm-title-fluid mt-3 font-serif leading-[1.05]"
        style={fmTitleClamp("40px", "5vw", "56px")}
      >
        Cursos da <em className="text-amber italic">Escola</em>
      </h1>
      <p className="text-paper-700 mt-5 max-w-2xl text-lg leading-relaxed">
        {/* A menção ao "Direito Penal em Questões, na Eduzz" saiu em 04/08/2026:
            o produto está inativo na plataforma porque a conta do professor está
            restrita por cadastro incompleto. Indicar um curso que ninguém
            consegue comprar é pior do que não indicar nada. Volta quando o
            cadastro for regularizado — ver `data/produtos-escola.ts`. */}
        A Escola oferece um único curso nesta edição: Prova Digital no Processo
        Penal, voltado ao público profissional, no cohort inaugural da Edição
        Lançamento.
        {fromDatabase ? (
          <span className="text-paper-600 mt-2 block text-sm">
            Catálogo sincronizado com os cursos publicados no painel do
            professor.
          </span>
        ) : null}
      </p>

      <div className="mt-12 space-y-6">
        {principal.map((p) => (
          <CursoVitrineCard key={p.slug} produto={p} />
        ))}
      </div>

      <h2 className="text-paper fm-mono mt-16 text-[11px] tracking-[0.22em] uppercase">
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
