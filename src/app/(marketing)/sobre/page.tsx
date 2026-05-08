import type { Metadata } from "next";
import Image from "next/image";

export const metadata: Metadata = {
  title: "Sobre Flávio Milhomem",
  description:
    "Promotor de Justiça do MPDFT desde 1996, mestre pela Universidade Católica Portuguesa, especialista pela ENM francesa, professor há 25 anos.",
  alternates: { canonical: "/sobre" },
};

/**
 * Página Sobre Flávio (blueprint Seção 8.2).
 * Biografia editorial em duas colunas — retrato à esquerda, narrativa à
 * direita. Placeholder editorial: o texto final aguarda revisão da
 * mentoria estratégica e confirmação institucional.
 */
export default function SobrePage() {
  return (
    <article className="px-gutter py-page mx-auto max-w-(--container-narrow) lg:px-12">
      <header className="mb-12 lg:mb-16">
        <p className="text-amber fm-mono">Sobre o professor</p>
        <h1
          className="mt-4 font-serif leading-[1.02]"
          style={{ fontSize: "clamp(44px, 5vw, 72px)" }}
        >
          Flávio <em className="text-amber italic">Milhomem</em>
        </h1>
      </header>

      <div className="grid items-start gap-10 lg:grid-cols-[minmax(0,420px)_minmax(0,1fr)] lg:gap-16">
        {/* Retrato — sticky em telas grandes */}
        <figure className="lg:sticky lg:top-28">
          <div className="border-amber/30 relative overflow-hidden border">
            <Image
              src="/images/professor/flavio-portrait.png"
              alt="Retrato de Flávio Milhomem, Promotor de Justiça do MPDFT"
              width={528}
              height={670}
              priority
              className="h-auto w-full object-cover"
            />
            {/* Vinheta sutil pra integrar com a paleta */}
            <div
              aria-hidden
              className="absolute inset-0 bg-gradient-to-t from-carbon/40 via-transparent to-transparent"
            />
          </div>
          <figcaption className="text-paper-600 fm-mono mt-3">
            MPDFT · 30 anos de carreira · Ouvidor-Geral 2025-2027
          </figcaption>
        </figure>

        {/* Narrativa biográfica */}
        <div className="prose-juridica space-y-6">
          <p
            className="text-paper-800 leading-[1.65]"
            style={{ fontSize: "20px" }}
          >
            Promotor de Justiça do{" "}
            <strong className="text-paper">
              Ministério Público do Distrito Federal e Territórios
            </strong>{" "}
            desde 1996, com 30 anos de carreira institucional. Mestre em
            Ciências Jurídico-Criminais pela Universidade Católica Portuguesa,
            especialista pela École Nationale de la Magistrature francesa.
            Professor de Direito Penal e Processo Penal há 25 anos.
          </p>

          <p className="text-paper-700 leading-[1.7]">
            Autor de livros nas áreas de Direito Penal, Processo Penal, Direito
            Penal Militar e Processo Penal Militar. Coordenador da Revista
            Jurídica do MPDFT. No biênio 2025-2027 ocupa o cargo de
            Ouvidor-Geral do MPDFT.
          </p>

          <p className="text-paper-700 leading-[1.7]">
            A Escola nasce de uma tese: o conhecimento penal pelo ângulo da
            acusação está pulverizado em cursos generalistas que não respeitam
            a especificidade técnica do MP nem a ética processual que separa
            o promotor do litigante comum. Aqui o currículo é construído ao
            redor da{" "}
            <em className="text-amber italic">prática forense real</em> e da{" "}
            <em className="text-amber italic">jurisprudência viva</em> do STJ
            e STF — não da repetição de doutrinária da década passada.
          </p>

          {/* Linha do tempo de credenciais */}
          <ul className="border-paper-100 mt-stack space-y-3 border-t pt-8">
            {[
              { year: "1996", text: "Ingresso no MPDFT como Promotor de Justiça" },
              { year: "2001", text: "Mestrado pela Universidade Católica Portuguesa" },
              { year: "2008", text: "Especialização pela École Nationale de la Magistrature (França)" },
              { year: "2012", text: "Coordenador da Revista Jurídica do MPDFT" },
              { year: "2025", text: "Ouvidor-Geral do MPDFT (biênio 2025-2027)" },
            ].map((item) => (
              <li key={item.year} className="grid grid-cols-[80px_1fr] items-baseline gap-4">
                <span className="text-amber font-mono text-[11px] uppercase tracking-[0.2em]">
                  {item.year}
                </span>
                <span className="text-paper-800 leading-relaxed">
                  {item.text}
                </span>
              </li>
            ))}
          </ul>

          <p className="text-paper-600 mt-stack text-sm italic">
            Texto editorial em revisão pela mentoria estratégica. Versão final
            será publicada após o aval institucional.
          </p>
        </div>
      </div>
    </article>
  );
}
