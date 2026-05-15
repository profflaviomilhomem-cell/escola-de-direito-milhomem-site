import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { EdicaoLancamentoLanding } from "@/components/marketing/edicao-lancamento-landing";

type Props = { params: Promise<{ slug: string }> };

const EDICAO_SLUG = "edicao-lancamento";

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  if (slug !== EDICAO_SLUG) {
    return { title: `Curso · ${slug}` };
  }
  return {
    title: "Edição Lançamento — Direito Penal pela perspectiva da acusação",
    description:
      "Cohort inaugural de 12 semanas com Flávio Milhomem. Turma fundadora, trilha certificada e acesso ao professor no fórum.",
    alternates: { canonical: `/cursos/${EDICAO_SLUG}` },
  };
}

export default async function CursoSlugPage({ params }: Props) {
  const { slug } = await params;

  if (slug === EDICAO_SLUG) {
    return <EdicaoLancamentoLanding />;
  }

  // TODO: buscar curso no Prisma (tabela Product) por slug.
  if (!slug) notFound();

  return (
    <article className="mx-auto max-w-prose-wide px-gutter py-page">
      <h1 className="font-serif text-heading-1 text-tinta-700">Curso: {slug}</h1>
      <p className="text-slate-700 mt-2">Página do produto em construção.</p>
    </article>
  );
}
