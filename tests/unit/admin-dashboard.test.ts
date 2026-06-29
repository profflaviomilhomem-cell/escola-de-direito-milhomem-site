import { confirmRatePct } from "@/lib/admin/dashboard-metrics";

describe("confirmRatePct", () => {
  it("retorna 0 quando não há leads", () => {
    expect(confirmRatePct({ total: 0, confirmados: 0 })).toBe(0);
  });

  it("calcula o percentual de confirmação arredondado", () => {
    expect(confirmRatePct({ total: 200, confirmados: 50 })).toBe(25);
    expect(confirmRatePct({ total: 3, confirmados: 1 })).toBe(33);
  });

  it("nunca passa de 100%", () => {
    expect(confirmRatePct({ total: 10, confirmados: 10 })).toBe(100);
  });
});
