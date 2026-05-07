import type { Metadata } from "next";

type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  return {
    title: slug.replace(/-/g, " "),
    alternates: { canonical: `/blog/${slug}` },
  };
}

/**
 * Página individual de artigo (blueprint Seção 8.5).
 * Tipografia serifada Newsreader 18px, coluna 68ch, schema Article.
 * Bloco de CTA final + sugestão de relacionados.
 */
export default async function BlogArtigoPage({ params }: Props) {
  const { slug } = await params;

  return (
    <article className="mx-auto max-w-prose px-gutter py-page prose-juridica">
      <p className="text-overline text-dourado-600">Análise de decisão</p>
      <h1 className="font-serif text-display-2 text-tinta-700 mt-3">
        {slug.replace(/-/g, " ")}
      </h1>
      <p className="text-slate-500 mt-2 text-sm italic">
        Artigo placeholder · pipeline editorial em construção
      </p>
    </article>
  );
}
