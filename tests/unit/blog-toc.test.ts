import { anchorHeadingsAndExtractToc, isQuestionTitle } from "@/lib/blog/toc";

describe("anchorHeadingsAndExtractToc", () => {
  it("injeta ids nos headings sem id e extrai o índice", () => {
    const { html, toc } = anchorHeadingsAndExtractToc(
      "<h2>Cadeia de custódia</h2><p>…</p><h3>Fontes primárias</h3>",
    );
    expect(toc).toEqual([
      { id: "cadeia-de-custodia", text: "Cadeia de custódia", level: 2 },
      { id: "fontes-primarias", text: "Fontes primárias", level: 3 },
    ]);
    expect(html).toContain('<h2 id="cadeia-de-custodia">');
    expect(html).toContain('<h3 id="fontes-primarias">');
  });

  it("preserva id existente e o reaproveita no índice", () => {
    const { html, toc } = anchorHeadingsAndExtractToc(
      '<h2 id="ja-tem">Seção</h2>',
    );
    expect(toc[0].id).toBe("ja-tem");
    expect(html).toBe('<h2 id="ja-tem">Seção</h2>');
  });

  it("mantém índice e HTML sincronizados quando há ids duplicados", () => {
    const { html, toc } = anchorHeadingsAndExtractToc(
      '<h2 id="faq">Primeira</h2><h2 id="faq">Segunda</h2>',
    );
    expect(toc.map((t) => t.id)).toEqual(["faq", "faq-2"]);
    // O segundo heading é reescrito para o id único do índice.
    expect(html).toContain('<h2 id="faq">Primeira</h2>');
    expect(html).toContain('<h2 id="faq-2">Segunda</h2>');
  });

  it("não colide id gerado com id existente de mesmo texto", () => {
    const { html, toc } = anchorHeadingsAndExtractToc(
      "<h2>Resumo</h2><h2>Resumo</h2>",
    );
    expect(toc.map((t) => t.id)).toEqual(["resumo", "resumo-2"]);
    expect(html).toContain('<h2 id="resumo">');
    expect(html).toContain('<h2 id="resumo-2">');
  });

  it("detecta atributo ID em maiúsculas (não injeta id duplicado)", () => {
    const { html, toc } = anchorHeadingsAndExtractToc(
      '<h2 ID="maiusculo">Seção</h2>',
    );
    expect(toc[0].id).toBe("maiusculo");
    // Não deve haver um segundo atributo id no mesmo tag.
    expect(html.match(/id=/gi)).toHaveLength(1);
  });
});

describe("isQuestionTitle", () => {
  it("identifica títulos-pergunta", () => {
    expect(isQuestionTitle("O que é cadeia de custódia?")).toBe(true);
    expect(isQuestionTitle("Cadeia de custódia no CPP")).toBe(false);
  });
});
