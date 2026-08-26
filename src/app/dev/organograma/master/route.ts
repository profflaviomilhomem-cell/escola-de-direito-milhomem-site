import fs from "node:fs";
import path from "node:path";

/**
 * Serve o organograma MESTRE (`organograma-checklist.html`, ~308 nós gerados
 * do livro-guia) como HTML cru, para ser exibido num <iframe> pela página
 * `/dev/organograma`. Ferramenta interna de desenvolvimento (no-index).
 *
 * Lê o arquivo de `docs/` em tempo de request (estado vivo).
 *
 * 26/08/2026 — guarda de ambiente acrescentada junto com a da página. Hoje esta
 * rota já devolve 404 em produção porque `docs/` saiu do versionamento; a
 * guarda existe para o dia em que o arquivo voltar, para que a volta dele não
 * publique o roteiro interno do negócio sem que ninguém perceba.
 */
export const dynamic = "force-dynamic";

const MASTER_PATH = path.join(
  process.cwd(),
  "docs",
  "organograma-checklist.html",
);

export function GET() {
  if (process.env.NODE_ENV === "production") {
    return new Response("Not found", { status: 404 });
  }

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
