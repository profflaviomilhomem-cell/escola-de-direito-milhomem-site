import { completionRatePct, formatBRL } from "@/lib/professor/metrics";

describe("professor/metrics · completionRatePct", () => {
  it("calcula % sobre o universo alunos × aulas", () => {
    expect(completionRatePct({ conclusoes: 50, alunos: 10, aulas: 10 })).toBe(
      50,
    );
    expect(completionRatePct({ conclusoes: 30, alunos: 3, aulas: 10 })).toBe(
      100,
    );
  });

  it("retorna 0 quando não há alunos ou aulas (evita divisão por zero)", () => {
    expect(completionRatePct({ conclusoes: 5, alunos: 0, aulas: 10 })).toBe(0);
    expect(completionRatePct({ conclusoes: 5, alunos: 10, aulas: 0 })).toBe(0);
  });

  it("arredonda para inteiro", () => {
    expect(completionRatePct({ conclusoes: 1, alunos: 1, aulas: 3 })).toBe(33);
  });
});

describe("professor/metrics · formatBRL", () => {
  it("formata centavos como moeda brasileira", () => {
    expect(formatBRL(29700).replace(/ /g, " ")).toBe("R$ 297,00");
    expect(formatBRL(0).replace(/ /g, " ")).toBe("R$ 0,00");
    expect(formatBRL(123456).replace(/ /g, " ")).toBe("R$ 1.234,56");
  });
});
