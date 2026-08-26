/**
 * `toLocaleString("pt-BR", { currency: "BRL" })` separa "R$" do número com
 * espaço **não-quebrável** (U+00A0). É a tipografia correta e fica assim na
 * tela — mas quebra comparação literal, então o teste normaliza.
 */
const semNbsp = (s: string) => s.replace(/\u00A0/g, " ");

import {
  buildInstallmentPlan,
  totalFromOption,
  MAX_INSTALLMENTS,
} from "@/lib/pagarme/installments";

/** Preço da Edição Lançamento em centavos. */
const PRECO = 29700;

describe("plano de parcelas", () => {
  it("não perde nem cria centavo em nenhuma quantidade de parcelas", () => {
    // A regressão que este teste existe para pegar: dividir e arredondar cada
    // parcela faz 7 × 4243 = 29701 — um centavo a mais do que o comprador
    // aceitou pagar.
    for (const opcao of buildInstallmentPlan(PRECO)) {
      expect(totalFromOption(opcao)).toBe(PRECO);
    }
  });

  it("distribui o resto na primeira parcela, nunca nas últimas", () => {
    const sete = buildInstallmentPlan(PRECO).find((o) => o.installments === 7)!;
    // 29700 / 7 = 4242,857…
    expect(sete.restCents).toBe(4242);
    expect(sete.firstCents).toBe(4248);
    expect(sete.firstCents).toBeGreaterThan(sete.restCents);
  });

  it("divide exato quando divide exato", () => {
    const doze = buildInstallmentPlan(PRECO).find(
      (o) => o.installments === 12,
    )!;
    expect(doze.firstCents).toBe(2475);
    expect(doze.restCents).toBe(2475);
    expect(semNbsp(doze.label)).toBe("12× de R$ 24,75 sem juros");
  });

  it("oferece as 12 parcelas para o preço de R$ 297", () => {
    const plano = buildInstallmentPlan(PRECO);
    expect(plano).toHaveLength(12);
    expect(plano[0].installments).toBe(1);
    expect(plano[0].label).toContain("À vista");
  });

  it("não parcela abaixo do piso de R$ 5", () => {
    // R$ 30,00: 6× de R$ 5,00 passa; 7× daria R$ 4,28 e é cortado.
    const plano = buildInstallmentPlan(3000);
    expect(plano[plano.length - 1].installments).toBe(6);
    expect(plano.every((o) => o.restCents >= 500)).toBe(true);
  });

  it("sem juros: o total não muda com o número de parcelas", () => {
    const totais = new Set(
      buildInstallmentPlan(PRECO).map((o) => o.totalCents),
    );
    expect(totais).toEqual(new Set([PRECO]));
  });

  it("respeita o teto do schema de pedido", () => {
    // O zod aceita no máximo 12; pedir 24 não pode furar isso.
    const plano = buildInstallmentPlan(500_000, 24);
    expect(plano.length).toBeLessThanOrEqual(MAX_INSTALLMENTS);
  });

  it("devolve vazio para valor inválido", () => {
    expect(buildInstallmentPlan(0)).toEqual([]);
    expect(buildInstallmentPlan(-100)).toEqual([]);
    expect(buildInstallmentPlan(10.5)).toEqual([]);
  });

  it("valor pequeno só sai à vista", () => {
    const plano = buildInstallmentPlan(400);
    expect(plano).toHaveLength(1);
    expect(plano[0].installments).toBe(1);
    expect(totalFromOption(plano[0])).toBe(400);
  });
});
