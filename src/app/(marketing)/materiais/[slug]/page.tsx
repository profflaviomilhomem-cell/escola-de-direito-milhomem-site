import type { Metadata } from "next";

type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  return {
    title: `Material gratuito · ${slug}`,
    alternates: { canonical: `/materiais/${slug}` },
  };
}

/**
 * Página de isca/material gratuito (PDF baixado via formulário).
 * Slug → registro em LeadMagnet, captura via /api/leads.
 */
export default async function MaterialPage({ params }: Props) {
  const { slug } = await params;

  return (
    <section className="mx-auto max-w-prose px-gutter py-page">
      <h1 className="font-serif text-heading-1 text-tinta-700">
        Material: {slug}
      </h1>
      <p className="text-slate-500 mt-2 italic">
        Página de isca placeholder — preencher com material editorial.
      </p>
    </section>
  );
}
