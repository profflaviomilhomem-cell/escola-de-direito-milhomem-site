import {
  FUSO_BR,
  dataCalendarioBR,
  formatarDataBR,
  formatarDataComOpcoesBR,
  formatarDataCurtaBR,
  formatarDataHoraBR,
  formatarDataLongaBR,
  saudacaoBR,
} from "@/lib/data-br";

/**
 * Estes testes existem porque o bug é invisível na máquina do desenvolvedor:
 * em Brasília tudo "funciona", e só quebra no servidor da Vercel, que roda em
 * UTC. Por isso cada caso é ancorado num instante UTC explícito.
 */
describe("data-br", () => {
  it("fixa o fuso do público", () => {
    expect(FUSO_BR).toBe("America/Sao_Paulo");
  });

  describe("virada de dia (o bug real do blog)", () => {
    // 06/08/2026 00:30 UTC == 05/08/2026 21:30 em Brasília.
    const viraOdia = new Date("2026-08-06T00:30:00Z");

    it("formata o dia de Brasília, não o do servidor", () => {
      expect(formatarDataBR(viraOdia)).toBe("05/08/2026");
      expect(formatarDataCurtaBR(viraOdia)).toBe("05/08/26");
      expect(formatarDataLongaBR(viraOdia)).toContain("agosto de 2026");
      expect(formatarDataLongaBR(viraOdia)).toContain("05");
    });

    it("difere do que um formatador sem fuso produziria em UTC", () => {
      const semFuso = new Intl.DateTimeFormat("pt-BR", {
        timeZone: "UTC",
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
      }).format(viraOdia);
      expect(semFuso).toBe("06/08/2026");
      expect(formatarDataBR(viraOdia)).not.toBe(semFuso);
    });
  });

  describe("hora (o bug real do fórum)", () => {
    it("mostra a hora de Brasília, 3h atrás do UTC", () => {
      // 17:32 UTC == 14:32 em Brasília.
      const t = new Date("2026-08-05T17:32:00Z");
      const saida = formatarDataHoraBR(t);
      expect(saida).toContain("14:32");
      expect(saida).not.toContain("17:32");
    });
  });

  describe("dataCalendarioBR", () => {
    it("trata AAAA-MM-DD como data de calendário, sem andar um dia", () => {
      // `new Date("2026-08-15")` é meia-noite UTC = 21h do dia 14 no Brasil.
      expect(formatarDataBR(new Date("2026-08-15"))).toBe("14/08/2026");
      expect(formatarDataBR(dataCalendarioBR("2026-08-15"))).toBe("15/08/2026");
    });

    it("deixa passar intantes completos sem mexer", () => {
      const iso = "2026-08-15T23:00:00Z";
      expect(dataCalendarioBR(iso).toISOString()).toBe(
        new Date(iso).toISOString(),
      );
    });
  });

  describe("saudacaoBR", () => {
    it.each([
      ["03:00Z", "2026-08-06T03:00:00Z", "Bom dia"], // 00h BRT
      ["11:00Z", "2026-08-06T11:00:00Z", "Bom dia"], // 08h BRT
      ["14:59Z", "2026-08-06T14:59:00Z", "Bom dia"], // 11h59 BRT
      ["15:00Z", "2026-08-06T15:00:00Z", "Boa tarde"], // 12h BRT
      ["20:59Z", "2026-08-06T20:59:00Z", "Boa tarde"], // 17h59 BRT
      ["21:00Z", "2026-08-06T21:00:00Z", "Boa noite"], // 18h BRT
      ["23:00Z", "2026-08-06T23:00:00Z", "Boa noite"], // 20h BRT
    ])("às %s devolve %s", (_rotulo, iso, esperado) => {
      expect(saudacaoBR(new Date(iso))).toBe(esperado);
    });

    it("não devolve 'Boa noite' à meia-noite de Brasília (armadilha do h24)", () => {
      // Se o ciclo de hora resolvesse para h24, meia-noite viraria "24" e
      // cairia no ramo de "Boa noite".
      expect(saudacaoBR(new Date("2026-08-06T03:00:00Z"))).toBe("Bom dia");
    });
  });

  describe("formatarDataComOpcoesBR", () => {
    it("injeta o fuso mesmo quando o chamador não pensa nisso", () => {
      const t = new Date("2026-08-06T00:30:00Z"); // 05/08 21:30 BRT
      expect(
        formatarDataComOpcoesBR(t, { day: "2-digit", month: "2-digit" }),
      ).toBe("05/08");
    });

    it("aceita string e número, não só Date", () => {
      const iso = "2026-08-06T00:30:00Z";
      expect(formatarDataBR(iso)).toBe("05/08/2026");
      expect(formatarDataBR(new Date(iso).getTime())).toBe("05/08/2026");
    });
  });
});
