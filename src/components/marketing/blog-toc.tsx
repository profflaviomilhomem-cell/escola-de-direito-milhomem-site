import type { TocItem } from "@/lib/blog/toc";

/**
 * Índice do artigo ("Neste artigo") — tabela de conteúdo semântica
 * a partir dos H2/H3 do corpo (guia 6.7 — AEO). Server Component.
 */
export function BlogToc({ items }: { items: TocItem[] }) {
  if (items.length === 0) return null;
  return (
    <nav
      aria-label="Índice do artigo"
      className="border-paper-100 bg-carbon-elevated mb-10 border p-6 md:p-8"
    >
      <p className="text-amber font-mono text-[10px] uppercase tracking-[0.2em]">
        Neste artigo
      </p>
      <ol className="mt-4 space-y-2">
        {items.map((item) => (
          <li
            key={item.id}
            className={item.level === 3 ? "pl-5" : undefined}
          >
            <a
              href={`#${item.id}`}
              className="text-paper-700 hover:text-amber text-sm leading-snug transition-colors"
            >
              {item.text}
            </a>
          </li>
        ))}
      </ol>
    </nav>
  );
}

/**
 * Bloco de resposta sintética no topo do artigo (guia 6.7 — AEO,
 * "answer-first"). Usado quando o título do post é uma pergunta:
 * a resposta direta abre o corpo, antes do desenvolvimento.
 */
export function BlogAnswerFirst({ text }: { text: string }) {
  return (
    <aside className="border-amber/40 bg-amber/5 mb-10 border-l-2 px-6 py-6 md:px-8">
      <p className="text-amber font-mono text-[10px] uppercase tracking-[0.2em]">
        Resposta direta
      </p>
      <p className="text-paper mt-3 text-lg leading-relaxed md:text-xl">
        {text}
      </p>
    </aside>
  );
}
