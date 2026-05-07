type Props = { params: Promise<{ slug: string }> };

/**
 * Página de aula — player Cloudflare Stream + abas
 * (resumo / material PDF / fórum) + comentários aninhados abaixo.
 */
export default async function AulaPage({ params }: Props) {
  const { slug } = await params;
  return (
    <section className="mx-auto max-w-(--container-narrow) px-gutter py-stack">
      <h1 className="font-serif text-heading-2 text-tinta-700">
        Aula: {slug}
      </h1>
      <div className="bg-slate-200 mt-stack aspect-video w-full rounded-lg">
        <div className="text-slate-600 flex h-full items-center justify-center text-sm italic">
          Player Cloudflare Stream (placeholder)
        </div>
      </div>
    </section>
  );
}
