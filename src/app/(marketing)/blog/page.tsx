import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Blog",
  description:
    "Análise de decisões do STJ/STF, dogmática aplicada e comentários atuais sobre Direito Penal e Processo Penal pelo ângulo da acusação.",
  alternates: { canonical: "/blog" },
};

/**
 * Listagem do blog (blueprint Seção 8.5).
 * Cadência: 4-5 artigos/mês inicialmente, escalando para 6-8.
 * Três tipos: análise de decisão, dogmática aplicada, comentário atual.
 */
export default function BlogPage() {
  return (
    <section className="mx-auto max-w-(--container-narrow) px-gutter py-page">
      <h1 className="font-serif text-heading-1 text-tinta-700">Blog</h1>
      <p className="text-slate-700 mt-2">
        Listagem em construção — primeiros artigos publicados em maio.
      </p>
    </section>
  );
}
