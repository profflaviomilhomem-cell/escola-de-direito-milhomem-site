import { sanitizePlainText } from "@/lib/sanitize";

describe("lib/sanitize · sanitizePlainText", () => {
  it("remove tags HTML, preservando o texto", () => {
    expect(sanitizePlainText("Olá <b>mundo</b>")).toBe("Olá mundo");
  });

  it("neutraliza payload de XSS armazenado", () => {
    expect(sanitizePlainText("<script>alert(1)</script>oi")).toBe("oi");
    expect(sanitizePlainText('<img src=x onerror="alert(1)">texto')).toBe(
      "texto",
    );
  });

  it("remove zero-width e overrides bidirecionais (Trojan Source)", () => {
    const ZWSP = String.fromCharCode(0x200b); // zero-width space
    const RLO = String.fromCharCode(0x202e); // right-to-left override
    const BOM = String.fromCharCode(0xfeff); // byte order mark
    const trojan = `a${ZWSP}b${RLO}c${BOM}d`;
    expect(sanitizePlainText(trojan)).toBe("abcd");
  });

  it("remove caracteres de controle, mantendo TAB e quebra de linha", () => {
    const NUL = String.fromCharCode(0x00);
    const BEL = String.fromCharCode(0x07);
    expect(sanitizePlainText(`a${NUL}b${BEL}c`)).toBe("abc");
    expect(sanitizePlainText("linha1\nlinha2")).toBe("linha1\nlinha2");
    expect(sanitizePlainText("col1\tcol2")).toBe("col1\tcol2");
  });

  it("normaliza CRLF e colapsa linhas em branco excessivas", () => {
    expect(sanitizePlainText("a\r\n\r\n\r\n\r\nb")).toBe("a\n\nb");
  });

  it("apara espaços nas bordas e no fim das linhas", () => {
    expect(sanitizePlainText("  oi   \n  tudo bem  ")).toBe("oi\n  tudo bem");
  });

  it("texto comum passa intacto", () => {
    const txt = "Dúvida sobre o art. 121 do CP: qual a pena-base?";
    expect(sanitizePlainText(txt)).toBe(txt);
  });

  it("conteúdo só de markup vira string vazia", () => {
    expect(sanitizePlainText("<b></b>")).toBe("");
  });
});
