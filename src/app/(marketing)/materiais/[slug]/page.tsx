import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { NewsletterForm } from "@/components/marketing/newsletter-form";
import { copy } from "@/config/copy";

type Props = { params: Promise<{ slug: string }> };

const SLUGS = Object.keys(copy.materiais.bySlug);

export async function generateStaticParams() {
  return SLUGS.map((slug) => ({ slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const item = copy.materiais.bySlug[slug as keyof typeof copy.materiais.bySlug];
  if (!item) return { title: "Material não encontrado" };
  return {
    title: item.title,
    description: item.lead,
    alternates: { canonical: `/materiais/${slug}` },
  };
}

export default async function MaterialPage({ params }: Props) {
  const { slug } = await params;
  const item = copy.materiais.bySlug[slug as keyof typeof copy.materiais.bySlug];
  if (!item) notFound();

  return (
    <article className="fm-site-page max-w-prose py-page">
      <header>
        <p className="text-amber font-mono text-[11px] uppercase tracking-[0.2em]">
          Material gratuito
        </p>
        <h1
          className="mt-3 font-serif leading-[1.05]"
          style={{ fontSize: "clamp(36px, 4vw, 52px)" }}
        >
          {item.title}
        </h1>
        <p className="text-paper-700 mt-4 leading-relaxed">{item.lead}</p>
      </header>

      <section
        className="border-amber/30 mt-12 rounded-xl border bg-carbon-elevated/30 p-6"
        aria-labelledby="download-title"
      >
        <h2 id="download-title" className="font-serif text-xl">
          Baixar o PDF
        </h2>
        <p className="text-paper-600 mt-2 text-sm leading-relaxed">
          Informe seu e-mail para receber o link de download. Sem spam — apenas
          este material e o boletim, se você optar por recebê-lo.
        </p>
        <div className="mt-6">
          <NewsletterForm source={`material-${slug}`} leadMagnetSlug={slug} />
        </div>
      </section>
    </article>
  );
}
