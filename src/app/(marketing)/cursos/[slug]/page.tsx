import type { Metadata } from "next";
import { notFound } from "next/navigation";

type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  return {
    title: `Curso · ${slug}`,
    alternates: { canonical: `/cursos/${slug}` },
  };
}

/**
 * Landing dinâmica de curso (blueprint Seção 8.4).
 *
 * O slug `edicao-lancamento` será o cohort fundador.
 * 14 blocos: acima da dobra, diferenciais, sobre Flávio, para quem é,
 * ementa, cronograma, como funciona, professores, materiais,
 * depoimentos, investimento, FAQ, garantia, CTA final.
 */
export default async function CursoSlugPage({ params }: Props) {
  const { slug } = await params;

  // TODO: buscar curso no Prisma (tabela Product) por slug.
  // Se não achar, notFound().
  if (!slug) notFound();

  return (
    <article className="mx-auto max-w-prose-wide px-gutter py-page">
      <h1 className="font-serif text-heading-1 text-tinta-700">
        Curso: {slug}
      </h1>
      <p className="text-slate-700 mt-2">
        Landing em construção. Estrutura de 14 blocos a ser preenchida na
        sprint dedicada do roadmap.
      </p>
    </article>
  );
}
