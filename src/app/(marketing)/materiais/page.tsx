import type { Metadata } from "next";
import Link from "next/link";

import { InstitutionalNotice } from "@/components/marketing/institutional-notice";
import { copy } from "@/config/copy";
import { fmTitleClamp } from "@/lib/ui/fm-title-clamp";

export const metadata: Metadata = {
  title: "Materiais gratuitos",
  // Sobrou da troca de títulos de 03/08: os materiais viraram os do Livro-Guia
  // (cap. 3.9), mas a description continuava anunciando os títulos antigos.
  description:
    "Materiais gratuitos da Escola Flávio Milhomem — as 20 decisões do STJ que a acusação mais cita e os dez pontos da defesa que a acusação mais ataca, para apoio ao estudo de direito criminal.",
  alternates: { canonical: "/materiais" },
};

const materiais = Object.entries(copy.materiais.bySlug);

/**
 * Índice dos materiais gratuitos.
 *
 * Existe porque as páginas `/materiais/[slug]` estão no sitemap e são divulgadas
 * isoladamente: sem este índice, `/materiais` respondia 404 — link quebrado para
 * quem apaga o slug da URL e para crawler que sobe na hierarquia.
 */
export default function MateriaisPage() {
  return (
    <section className="fm-site-page py-page">
      <p className="text-amber fm-mono text-[11px] tracking-[0.22em] uppercase">
        Materiais gratuitos
      </p>
      <h1
        className="fm-title-fluid mt-3 font-serif leading-[1.05]"
        style={fmTitleClamp("40px", "5vw", "56px")}
      >
        Material de <em className="text-amber italic">apoio</em>
      </h1>
      <p className="text-paper-700 mt-5 max-w-2xl text-lg leading-relaxed">
        Materiais de estudo em PDF, gratuitos. Informe seu e-mail na página do
        material para receber o link de download.
      </p>

      <ul className="mt-12 grid gap-6 sm:grid-cols-2">
        {materiais.map(([slug, item]) => (
          <li key={slug}>
            <Link
              href={`/materiais/${slug}`}
              className="border-amber/20 hover:border-amber/50 focus-visible:border-amber flex h-full flex-col border bg-white/[0.02] p-8 transition-colors"
            >
              <h2 className="font-serif text-xl leading-snug">{item.title}</h2>
              <p className="text-paper-700 mt-3 flex-1 text-sm leading-relaxed">
                {item.lead}
              </p>
              <span className="text-amber fm-mono mt-6 text-[10px] tracking-[0.18em] uppercase">
                Baixar o PDF
              </span>
            </Link>
          </li>
        ))}
      </ul>

      <InstitutionalNotice className="mt-14 max-w-2xl" />
    </section>
  );
}
