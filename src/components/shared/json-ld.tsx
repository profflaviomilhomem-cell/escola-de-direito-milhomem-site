/**
 * Escapa a serialização JSON para embutir com segurança dentro de
 * `<script>`. `JSON.stringify` NÃO escapa `<`, então um campo contendo
 * `</script>` fecharia a tag `<script type="application/ld+json">` e
 * injetaria HTML vivo (XSS armazenado via conteúdo do CMS). Trocamos os
 * caracteres perigosos pelos seus escapes unicode — continua JSON válido e
 * a tag nunca fecha cedo. (U+2028/U+2029 são válidos dentro do JSON deste
 * contexto e não quebram a tag, então não precisam ser tratados aqui.)
 */
function safeJsonLd(block: object): string {
  return JSON.stringify(block)
    .replace(/</g, "\\u003c")
    .replace(/>/g, "\\u003e")
    .replace(/&/g, "\\u0026");
}

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
          dangerouslySetInnerHTML={{ __html: safeJsonLd(block) }}
        />
      ))}
    </>
  );
}
