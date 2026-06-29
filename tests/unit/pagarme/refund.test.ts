import {
  refundableAmountCents,
  refundPagarmeCharge,
} from "@/lib/pagarme/refund";

describe("pagarme/refund · refundableAmountCents", () => {
  const base = { amountCents: 29700, contentConsumedPct: 0 };

  it("até 15 dias: integral incondicional", () => {
    expect(refundableAmountCents({ ...base, daysSincePurchase: 0 })).toBe(
      29700,
    );
    expect(refundableAmountCents({ ...base, daysSincePurchase: 15 })).toBe(
      29700,
    );
  });

  it("16–90 dias: proporcional ao conteúdo consumido", () => {
    expect(
      refundableAmountCents({
        amountCents: 1000,
        daysSincePurchase: 30,
        contentConsumedPct: 10,
      }),
    ).toBe(700); // <30% → 70%
    expect(
      refundableAmountCents({
        amountCents: 1000,
        daysSincePurchase: 30,
        contentConsumedPct: 45,
      }),
    ).toBe(400); // 30–60% → 40%
    expect(
      refundableAmountCents({
        amountCents: 1000,
        daysSincePurchase: 30,
        contentConsumedPct: 80,
      }),
    ).toBe(0); // >60% → 0%
  });

  it("após 90 dias: zero (fora do automático)", () => {
    expect(refundableAmountCents({ ...base, daysSincePurchase: 91 })).toBe(0);
  });

  it("pedido sem valor: zero", () => {
    expect(
      refundableAmountCents({
        amountCents: 0,
        daysSincePurchase: 0,
        contentConsumedPct: 0,
      }),
    ).toBe(0);
  });
});

describe("pagarme/refund · refundPagarmeCharge (validação, sem rede)", () => {
  it("rejeita chargeId vazio", async () => {
    await expect(refundPagarmeCharge("")).rejects.toThrow(/chargeId/);
  });

  it("rejeita amountCents inválido", async () => {
    await expect(refundPagarmeCharge("ch_1", -5)).rejects.toThrow(
      /amountCents/,
    );
    await expect(refundPagarmeCharge("ch_1", 1.5)).rejects.toThrow(
      /amountCents/,
    );
  });

  it("sem PAGARME_SECRET_KEY, lança erro de configuração", async () => {
    const prev = process.env.PAGARME_SECRET_KEY;
    delete process.env.PAGARME_SECRET_KEY;
    await expect(refundPagarmeCharge("ch_1")).rejects.toThrow(
      /PAGARME_SECRET_KEY/,
    );
    if (prev !== undefined) process.env.PAGARME_SECRET_KEY = prev;
  });
});
