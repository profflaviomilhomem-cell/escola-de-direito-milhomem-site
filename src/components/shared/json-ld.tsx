/**
 * Renderiza um ou mais blocos de dados estruturados JSON-LD.
 *
 * Server Component — o `<script type="application/ld+json">` é emitido no
 * HTML inicial, legível por buscadores e answer engines sem hidratação.
 */
export function JsonLd({ data }: { data: object | object[] }) {
  const blocks = Array.isArray(data) ? data : [data];
  return (
    <>
      {blocks.map((block, i) => (
        <script
          key={i}
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(block) }}
        />
      ))}
    </>
  );
}
