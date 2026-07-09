import { sanitizeBlogHtml } from "@/lib/blog/sanitize-html";

describe("lib/blog/sanitize-html · sanitizeBlogHtml", () => {
  it("preserva formatação de prosa (strong, em, listas, links, blockquote)", () => {
    const html =
      "<p>Análise do <strong>art. 121</strong> do <em>CP</em>.</p>" +
      "<blockquote>STJ, HC 123.456</blockquote>" +
      "<ul><li>ponto</li></ul>" +
      '<a href="https://stj.jus.br">fonte</a>';
    const out = sanitizeBlogHtml(html);
    expect(out).toContain("<strong>art. 121</strong>");
    expect(out).toContain("<em>CP</em>");
    expect(out).toContain("<blockquote>");
    expect(out).toContain("<li>ponto</li>");
    expect(out).toContain('href="https://stj.jus.br"');
  });

  it("remove <script> e handlers on* (XSS armazenado)", () => {
    expect(
      sanitizeBlogHtml("<p>ok</p><script>alert(1)</script>"),
    ).not.toContain("script");
    const evtImg = sanitizeBlogHtml('<img src="x" onerror="alert(1)">');
    expect(evtImg).not.toContain("onerror");
  });

  it("mantém iframe do YouTube (embed legítimo)", () => {
    const yt =
      '<figure><iframe src="https://www.youtube.com/embed/abc123" allowfullscreen></iframe></figure>';
    const out = sanitizeBlogHtml(yt);
    expect(out).toContain("youtube.com/embed/abc123");
    expect(out).toContain("<iframe");
  });

  it("remove iframe de host não permitido", () => {
    const evil = '<iframe src="https://evil.example.com/pwn"></iframe>';
    const out = sanitizeBlogHtml(evil);
    // O src do host não permitido é removido (resta, no máximo, uma casca
    // <iframe> vazia e inerte — sem src não carrega nada).
    expect(out).not.toContain("evil.example.com");
    expect(out).not.toContain("src=");
  });

  it("reforça rel=noopener em links target=_blank", () => {
    const out = sanitizeBlogHtml(
      '<a href="https://x.com" target="_blank">x</a>',
    );
    expect(out).toContain('rel="noopener noreferrer"');
  });

  it("descarta atributo style inline (defesa em profundidade)", () => {
    const out = sanitizeBlogHtml('<p style="position:fixed;top:0">texto</p>');
    expect(out).not.toContain("style=");
    expect(out).toContain("texto");
  });
});
