import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Sobre Flávio Milhomem",
  description:
    "Promotor de Justiça do MPDFT desde 1996, mestre pela Universidade Católica Portuguesa, especialista pela ENM francesa, professor há 25 anos.",
  alternates: { canonical: "/sobre" },
};

/**
 * Página Sobre Flávio (blueprint Seção 8.2).
 * Biografia em narrativa contínua, linha do tempo, capas de livro,
 * download de CV em PDF, schema Person no head do layout raiz.
 *
 * Placeholder — preencher na sprint editorial.
 */
export default function SobrePage() {
  return (
    <article className="mx-auto max-w-prose px-gutter py-page prose-juridica">
      <h1 className="font-serif text-heading-1 text-tinta-700">
        Sobre Flávio Milhomem
      </h1>
      <p className="text-slate-500 mt-2 italic">
        Página em construção — biografia institucional completa em breve.
      </p>
      <p className="mt-stack">
        Promotor de Justiça do Ministério Público do Distrito Federal e
        Territórios desde 1996, com 30 anos de carreira institucional. Mestre
        em Ciências Jurídico-Criminais pela Universidade Católica Portuguesa,
        especialista pela École Nationale de la Magistrature francesa.
        Professor de Direito Penal e Processo Penal há 25 anos.
      </p>
      <p className="mt-4">
        Autor de livros nas áreas de Direito Penal, Processo Penal, Direito
        Penal Militar e Processo Penal Militar. Coordenador da Revista
        Jurídica do MPDFT. No biênio 2025-2027 ocupa o cargo de Ouvidor-Geral
        do MPDFT.
      </p>
    </article>
  );
}
