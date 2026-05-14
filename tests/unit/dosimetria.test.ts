import { calcular, formatarPena } from "../../src/lib/business/dosimetria";
import { crimes } from "../../src/lib/business/crimes";

describe("Dosimetria - Lógica de Cálculo Trifásico", () => {
  const ANO = 365;
  const MES = 30;

  describe("Formatação de Pena", () => {
    test("deve formatar dias em anos, meses e dias", () => {
      expect(formatarPena(ANO)).toBe("1 ano");
      expect(formatarPena(2 * ANO)).toBe("2 anos");
      expect(formatarPena(MES)).toBe("1 mês");
      expect(formatarPena(3 * MES)).toBe("3 meses");
      expect(formatarPena(1)).toBe("1 dia");
      expect(formatarPena(15)).toBe("15 dias");
      expect(formatarPena(ANO + MES + 1)).toBe("1 ano, 1 mês, 1 dia");
      expect(formatarPena(2 * ANO + 6 * MES + 10)).toBe("2 anos, 6 meses, 10 dias");
    });

    test("deve lidar com 0 dias", () => {
      expect(formatarPena(0)).toBe("0 dias");
    });

    test("deve arredondar dias decimais", () => {
      expect(formatarPena(1.4)).toBe("1 dia");
      expect(formatarPena(1.6)).toBe("2 dias");
    });
  });

  describe("Fase 1 - Pena-base (Art. 59)", () => {
    const furtoSimples = {
      minDias: 1 * ANO,
      maxDias: 4 * ANO,
    };

    test("deve fixar no mínimo se não houver desfavoráveis", () => {
      const result = calcular({
        minDias: furtoSimples.minDias,
        maxDias: furtoSimples.maxDias,
        desfavoraveis: [],
        agravantes: 0,
        atenuantes: 0,
        causasAumento: [],
        causasDiminuicao: [],
      });
      expect(result.penaBaseDias).toBe(furtoSimples.minDias);
      expect(result.formatado.penaBase).toBe("1 ano");
    });

    test("deve aumentar 1/8 do intervalo para cada desfavorável", () => {
      // Intervalo = 3 anos (1095 dias). 1/8 = 136.875 dias.
      const result = calcular({
        minDias: furtoSimples.minDias,
        maxDias: furtoSimples.maxDias,
        desfavoraveis: ["culpabilidade"],
        agravantes: 0,
        atenuantes: 0,
        causasAumento: [],
        causasDiminuicao: [],
      });
      const esperado = furtoSimples.minDias + (furtoSimples.maxDias - furtoSimples.minDias) / 8;
      expect(result.penaBaseDias).toBe(esperado);
    });

    test("deve atingir o máximo se todas as 8 forem desfavoráveis", () => {
      const result = calcular({
        minDias: furtoSimples.minDias,
        maxDias: furtoSimples.maxDias,
        desfavoraveis: [
          "culpabilidade", "antecedentes", "condutaSocial", "personalidade",
          "motivos", "circunstancias", "consequencias", "comportamentoVitima"
        ],
        agravantes: 0,
        atenuantes: 0,
        causasAumento: [],
        causasDiminuicao: [],
      });
      expect(result.penaBaseDias).toBe(furtoSimples.maxDias);
      expect(result.formatado.penaBase).toBe("4 anos");
    });

    test("não deve ultrapassar o máximo na Fase 1 mesmo com duplicatas (size check)", () => {
      const result = calcular({
        minDias: furtoSimples.minDias,
        maxDias: furtoSimples.maxDias,
        desfavoraveis: ["culpabilidade", "culpabilidade"] as any,
        agravantes: 0,
        atenuantes: 0,
        causasAumento: [],
        causasDiminuicao: [],
      });
      const esperado = furtoSimples.minDias + (furtoSimples.maxDias - furtoSimples.minDias) / 8;
      expect(result.penaBaseDias).toBe(esperado);
    });
  });

  describe("Fase 2 - Pena Intermediária (Agravantes e Atenuantes)", () => {
    const penaBase = 6 * ANO; // 2190 dias
    const limites = { minDias: 4 * ANO, maxDias: 12 * ANO };

    test("deve aumentar 1/6 da pena-base por agravante", () => {
      const result = calcular({
        ...limites,
        desfavoraveis: [], // Força a pena-base a ser minDias se não passar minDias/maxDias manualmente
        minDias: penaBase, // Mockando penaBase como min para facilitar
        agravantes: 1,
        atenuantes: 0,
        causasAumento: [],
        causasDiminuicao: [],
      });
      // PenaBase = 6 anos. Agravante = +1 ano. Total = 7 anos.
      expect(result.penaIntermediariaDias).toBe(penaBase + penaBase / 6);
    });

    test("deve reduzir 1/6 da pena-base por atenuante", () => {
      const result = calcular({
        minDias: 2 * ANO,
        maxDias: 12 * ANO,
        desfavoraveis: ["culpabilidade", "antecedentes", "condutaSocial", "personalidade"], // Pena-base: 2 + (10/8)*4 = 7 anos
        agravantes: 0,
        atenuantes: 1,
        causasAumento: [],
        causasDiminuicao: [],
      });
      // PenaBase = 7 anos (2555 dias). Atenuante = -7/6 anos (-425.83 dias).
      // 2555 - 425.83 = 2129.16 dias.
      expect(result.penaIntermediariaDias).toBeCloseTo(2555 - 2555 / 6);
    });

    test("deve lidar com múltiplas agravantes", () => {
      const result = calcular({
        minDias: 1 * ANO,
        maxDias: 10 * ANO,
        desfavoraveis: [], // Pena-base = 1 ano
        agravantes: 2,
        atenuantes: 0,
        causasAumento: [],
        causasDiminuicao: [],
      });
      // 1 ano + 2/6 = 1.333 anos
      expect(result.penaIntermediariaDias).toBeCloseTo(ANO + (2 * ANO) / 6);
    });

    test("deve lidar com múltiplas atenuantes", () => {
      const result = calcular({
        minDias: 1 * ANO,
        maxDias: 20 * ANO,
        desfavoraveis: [
          "culpabilidade", "antecedentes", "condutaSocial", "personalidade",
          "motivos", "circunstancias", "consequencias", "comportamentoVitima"
        ], // Pena-base = 20 anos
        agravantes: 0,
        atenuantes: 2,
        causasAumento: [],
        causasDiminuicao: [],
      });
      // 20 anos - 2/6 de 20 anos = 20 - 6.66 = 13.33 anos
      expect(result.penaIntermediariaDias).toBeCloseTo(20 * ANO - (2 * 20 * ANO) / 6);
    });

    test("Súmula 231/STJ: não deve reduzir abaixo do mínimo legal", () => {
      const result = calcular({
        minDias: 2 * ANO,
        maxDias: 5 * ANO,
        desfavoraveis: [], // Pena-base = 2 anos (mínimo)
        agravantes: 0,
        atenuantes: 1,
        causasAumento: [],
        causasDiminuicao: [],
      });
      expect(result.penaIntermediariaDias).toBe(2 * ANO);
    });

    test("não deve aumentar acima do máximo legal (simetria didática)", () => {
      const result = calcular({
        minDias: 2 * ANO,
        maxDias: 5 * ANO,
        desfavoraveis: [
          "culpabilidade", "antecedentes", "condutaSocial", "personalidade",
          "motivos", "circunstancias", "consequencias", "comportamentoVitima"
        ], // Pena-base = 5 anos (máximo)
        agravantes: 1,
        atenuantes: 0,
        causasAumento: [],
        causasDiminuicao: [],
      });
      expect(result.penaIntermediariaDias).toBe(5 * ANO);
    });

    test("deve compensar agravantes e atenuantes", () => {
      const result = calcular({
        minDias: 6 * ANO,
        maxDias: 20 * ANO,
        agravantes: 1,
        atenuantes: 1,
        desfavoraveis: [],
        causasAumento: [],
        causasDiminuicao: [],
      });
      expect(result.penaIntermediariaDias).toBe(6 * ANO);
    });
  });

  describe("Fase 3 - Pena Definitiva (Causas de Aumento e Diminuição)", () => {
    test("deve aplicar frações variadas (1/6, 1/4, 2/3)", () => {
      const base = 6 * ANO;
      const r1 = calcular({ minDias: 1, maxDias: 20 * ANO, desfavoraveis: [], agravantes: 0, atenuantes: 0, causasAumento: [1/6], causasDiminuicao: [], minDias: 1, maxDias: 20 * ANO });
      // Forçando pena intermediaria a ser 'base' é chato com a API atual. 
      // Vou usar input direto.
      const r1_fix = calcular({ minDias: base, maxDias: 20 * ANO, desfavoraveis: [], agravantes: 0, atenuantes: 0, causasAumento: [1/6], causasDiminuicao: [] });
      expect(r1_fix.penaFinalDias).toBeCloseTo(base * (7/6));

      const r2 = calcular({ minDias: base, maxDias: 20 * ANO, desfavoraveis: [], agravantes: 0, atenuantes: 0, causasAumento: [1/4], causasDiminuicao: [] });
      expect(r2.penaFinalDias).toBeCloseTo(base * (1.25));

      const r3 = calcular({ minDias: base, maxDias: 20 * ANO, desfavoraveis: [], agravantes: 0, atenuantes: 0, causasAumento: [], causasDiminuicao: [2/3] });
      expect(r3.penaFinalDias).toBeCloseTo(base * (1/3));
    });

    test("deve aplicar múltiplas causas de aumento sequencialmente", () => {
      const result = calcular({
        minDias: 6 * ANO,
        maxDias: 30 * ANO,
        desfavoraveis: [],
        agravantes: 0,
        atenuantes: 0,
        causasAumento: [1/3, 1/2],
        causasDiminuicao: [],
      });
      // 6 * 1.333 = 8. 8 * 1.5 = 12 anos.
      expect(result.penaFinalDias).toBeCloseTo(12 * ANO);
    });

    test("deve aplicar múltiplas causas de diminuição sequencialmente", () => {
      const result = calcular({
        minDias: 1 * ANO,
        maxDias: 30 * ANO,
        desfavoraveis: ["culpabilidade", "antecedentes", "condutaSocial", "personalidade", "motivos", "circunstancias", "consequencias", "comportamentoVitima"], // 30 anos
        agravantes: 0,
        atenuantes: 2, // 30 - 2/6*30 = 20 anos
        causasAumento: [],
        causasDiminuicao: [1/2, 1/5], // 20 -> 10 -> 8 anos
      });
      expect(result.penaFinalDias).toBeCloseTo(8 * ANO);
    });

    test("pode ultrapassar o máximo legal na Fase 3", () => {
      const result = calcular({
        minDias: 10 * ANO,
        maxDias: 30 * ANO,
        desfavoraveis: [
           "culpabilidade", "antecedentes", "condutaSocial", "personalidade",
          "motivos", "circunstancias", "consequencias", "comportamentoVitima"
        ], // Pena-base = 30 anos
        agravantes: 0,
        atenuantes: 0,
        causasAumento: [1/3],
        causasDiminuicao: [],
      });
      // 30 anos + 1/3 = 40 anos
      expect(result.penaFinalDias).toBeCloseTo(40 * ANO);
    });

    test("pode reduzir abaixo do mínimo legal na Fase 3", () => {
      const result = calcular({
        minDias: 6 * ANO,
        maxDias: 20 * ANO,
        desfavoraveis: [], // Pena-base = 6 anos
        agravantes: 0,
        atenuantes: 0,
        causasAumento: [],
        causasDiminuicao: [2/3],
      });
      // 6 anos - 2/3 = 2 anos
      expect(result.penaFinalDias).toBeCloseTo(2 * ANO);
    });
  });

  describe("Integração com Crimes Reais", () => {
    test("Homicídio Qualificado com uma agravante e uma causa de aumento", () => {
      const result = calcular({
        crimeSlug: "homicidio-qualificado", // 12 a 30 anos
        desfavoraveis: [], // 12 anos
        agravantes: 1, // 12 + 2 = 14 anos
        atenuantes: 0,
        causasAumento: [1/3], // 14 + 4.66 = 18.66 anos
        causasDiminuicao: [],
      });

      expect(result.crime.nome).toBe("Homicídio qualificado");
      expect(result.penaBaseDias).toBe(12 * ANO);
      expect(result.penaIntermediariaDias).toBe(14 * ANO);
      expect(result.penaFinalDias).toBeCloseTo(18.666 * ANO, 0);
    });

    test("Tráfico de Drogas com privilégio (causa de diminuição)", () => {
      const result = calcular({
        crimeSlug: "trafico-drogas", // 5 a 15 anos
        desfavoraveis: [], // 5 anos
        agravantes: 0,
        atenuantes: 0,
        causasAumento: [],
        causasDiminuicao: [2/3], // Redução máxima do tráfico privilegiado
      });

      // 5 anos = 1825 dias. 1825 * (1/3) = 608.33 dias
      // 1 ano (365) + 8 meses (240) + 3 dias = 608 dias
      expect(result.penaFinalDias).toBeCloseTo(5 * ANO * (1/3), 0);
      expect(result.formatado.penaFinal).toBe("1 ano, 8 meses, 3 dias");
    });

    test("Furto Simples (1 a 4 anos) com 1 desfavorável e 1 atenuante", () => {
      const result = calcular({
        crimeSlug: "furto-simples",
        desfavoraveis: ["antecedentes"], // 1 + 3/8 = 1.375 anos
        agravantes: 0,
        atenuantes: 1, // 1.375 - 1.375/6 = 1.1458 anos
        causasAumento: [],
        causasDiminuicao: [],
      });
      expect(result.penaBaseDias).toBe(ANO + (3 * ANO) / 8);
      expect(result.penaIntermediariaDias).toBeCloseTo(1.375 * ANO - (1.375 * ANO) / 6);
    });

    test("Latrocínio (20 a 30 anos) no máximo legal", () => {
      const result = calcular({
        crimeSlug: "latrocinio",
        desfavoraveis: [
           "culpabilidade", "antecedentes", "condutaSocial", "personalidade",
          "motivos", "circunstancias", "consequencias", "comportamentoVitima"
        ],
        agravantes: 2,
        atenuantes: 0,
        causasAumento: [],
        causasDiminuicao: [],
      });
      // Fase 1 chega a 30 anos. Fase 2 trava em 30 anos.
      expect(result.penaFinalDias).toBe(30 * ANO);
      expect(result.formatado.penaFinal).toBe("30 anos");
    });

    test("Latrocínio com redução máxima (Fase 3 ignora mínimo legal)", () => {
       const result = calcular({
        crimeSlug: "latrocinio", // 20 anos min
        desfavoraveis: [], // 20 anos
        agravantes: 0,
        atenuantes: 0,
        causasAumento: [],
        causasDiminuicao: [2/3, 1/2], // 20 -> 6.66 -> 3.33 anos
      });
      expect(result.penaFinalDias).toBeCloseTo(20 * ANO * (1/3) * (1/2));
      expect(result.formatado.penaFinal).toBe("3 anos, 4 meses, 2 dias");
    });

    test("Crime customizado (Outro) com limites arbitrários", () => {
      const result = calcular({
        minDias: 100,
        maxDias: 200,
        desfavoraveis: ["culpabilidade", "antecedentes"], // 100 + (100/8)*2 = 125 dias
        agravantes: 0,
        atenuantes: 0,
        causasAumento: [1/5], // 125 * 1.2 = 150 dias
        causasDiminuicao: [],
      });
      expect(result.penaFinalDias).toBe(150);
      expect(result.formatado.penaFinal).toBe("5 meses");
    });

    test("Homicídio Simples (6 a 20 anos) com 2 desfavoráveis", () => {
      const result = calcular({
        crimeSlug: "homicidio-simples",
        desfavoraveis: ["culpabilidade", "circunstancias"],
        agravantes: 0,
        atenuantes: 0,
        causasAumento: [],
        causasDiminuicao: [],
      });
      // Intervalo = 14 anos. 14/8 = 1.75 anos por desfavorável.
      // 6 + 2 * 1.75 = 6 + 3.5 = 9.5 anos.
      // 9.5 * 365 = 3467.5 -> 3468 dias.
      // 3468 / 365 = 9 anos e 183 dias.
      // 183 / 30 = 6 meses e 3 dias.
      expect(result.penaFinalDias).toBeCloseTo(9.5 * ANO);
      expect(result.formatado.penaFinal).toBe("9 anos, 6 meses, 3 dias");
    });
  });


  describe("Formatação de Pena - Casos Adicionais", () => {
    test("deve formatar penas longas (40+ anos)", () => {
      expect(formatarPena(40 * ANO)).toBe("40 anos");
      expect(formatarPena(100 * ANO)).toBe("100 anos");
    });

    test("deve formatar penas curtas (dias apenas)", () => {
      expect(formatarPena(15)).toBe("15 dias");
      expect(formatarPena(29)).toBe("29 dias");
      expect(formatarPena(45)).toBe("1 mês, 15 dias");
    });
  });



  describe("Erros e Validações", () => {
    test("deve lançar erro para limites inválidos", () => {
      expect(() => calcular({
        minDias: 100,
        maxDias: 50,
        desfavoraveis: [],
        agravantes: 0,
        atenuantes: 0,
        causasAumento: [],
        causasDiminuicao: [],
      })).toThrow("Limites legais inválidos.");
    });

    test("deve lançar erro se min ou max forem zero", () => {
      expect(() => calcular({
        minDias: 0,
        maxDias: 100,
        desfavoraveis: [],
        agravantes: 0,
        atenuantes: 0,
        causasAumento: [],
        causasDiminuicao: [],
      })).toThrow("Limites legais inválidos.");
    });
  });
});
