type Props = { params: Promise<{ slug: string }> };

/**
 * Página de curso matriculado — lista de módulos expansível,
 * marcador de aula concluída/em progresso/não iniciada.
 */
export default async function CursoMatriculadoPage({ params }: Props) {
  const { slug } = await params;
  return (
    <section className="mx-auto max-w-(--container-narrow) px-gutter py-stack">
      <h1 className="font-serif text-heading-1 text-tinta-700">
        {slug}
      </h1>
      <p className="text-slate-700 mt-2">Lista de módulos placeholder.</p>
    </section>
  );
}
