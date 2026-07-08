import fs from "node:fs";
import path from "node:path";

/**
 * Serve o organograma MESTRE (`organograma-checklist.html`, ~308 nós gerados
 * do livro-guia) como HTML cru, para ser exibido num <iframe> pela página
 * `/dev/organograma`. Ferramenta interna de desenvolvimento (no-index).
 *
 * Lê o arquivo de `docs/` em tempo de request (estado vivo).
 */
export const dynamic = "force-dynamic";

const MASTER_PATH = path.join(
  process.cwd(),
  "docs",
  "organograma-checklist.html",
);

export function GET() {
  if (!fs.existsSync(MASTER_PATH)) {
    return new Response(
      "Organograma mestre não encontrado (organograma-checklist.html).",
      { status: 404, headers: { "content-type": "text/plain; charset=utf-8" } },
    );
  }
  const html = fs.readFileSync(MASTER_PATH, "utf-8");
  return new Response(html, {
    headers: {
      "content-type": "text/html; charset=utf-8",
      "x-robots-tag": "noindex, nofollow",
    },
  });
}
