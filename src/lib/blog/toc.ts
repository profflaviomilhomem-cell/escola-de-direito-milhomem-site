/**
 * Tabela de conteúdo semântica dos artigos (guia 6.7 — AEO).
 *
 * Injeta `id` âncora nos H2/H3 do HTML migrado e extrai a lista de
 * seções para o componente de índice. Processamento por regex no
 * servidor — suficiente para o HTML do WordPress migrado, sem custo
 * de um parser DOM completo.
 */

export type TocItem = {
  id: string;
  text: string;
  level: 2 | 3;
};

const HEADING_RE = /<h([23])([^>]*)>([\s\S]*?)<\/h\1>/gi;
const EXISTING_ID_RE = /\bid=["']([^"']+)["']/i;

/** Mínimo de seções para o índice valer a pena visualmente. */
export const TOC_MIN_ITEMS = 3;

function stripTags(html: string): string {
  return html
    .replace(/<[^>]+>/g, "")
    .replace(/&nbsp;/gi, " ")
    .replace(/&amp;/gi, "&")
    .replace(/&quot;/gi, '"')
    .replace(/&#8211;|&ndash;/gi, "–")
    .replace(/&#8217;|&rsquo;/gi, "'")
    .replace(/\s+/g, " ")
    .trim();
}

function slugify(text: string): string {
  return (
    text
      .normalize("NFD")
      .replace(/[̀-ͯ]/g, "")
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, "")
      .trim()
      .replace(/\s+/g, "-")
      .slice(0, 80) || "secao"
  );
}

/**
 * Devolve o HTML com âncoras nos H2/H3 e a lista de itens do índice.
 * Headings que já possuem `id` são preservados (e entram no índice).
 */
export function anchorHeadingsAndExtractToc(html: string): {
  html: string;
  toc: TocItem[];
} {
  const toc: TocItem[] = [];
  const used = new Set<string>();

  const out = html.replace(HEADING_RE, (match, lvl, attrs, inner) => {
    const text = stripTags(String(inner));
    if (!text) return match;

    const existing = String(attrs).match(EXISTING_ID_RE);
    const base = existing ? existing[1] : slugify(text);
    let id = base;
    let suffix = 2;
    while (used.has(id)) id = `${base}-${suffix++}`;
    used.add(id);

    toc.push({ id, text, level: Number(lvl) as 2 | 3 });

    if (existing) {
      // Id duplicado no HTML de origem: reescreve para o id único do índice.
      if (id === existing[1]) return match;
      const dedupedAttrs = String(attrs).replace(EXISTING_ID_RE, `id="${id}"`);
      return `<h${lvl}${dedupedAttrs}>${inner}</h${lvl}>`;
    }
    return `<h${lvl}${attrs} id="${id}">${inner}</h${lvl}>`;
  });

  return { html: out, toc };
}

/** Título termina em pergunta → candidato a bloco de resposta direta (AEO). */
export function isQuestionTitle(title: string): boolean {
  return title.trim().endsWith("?");
}
