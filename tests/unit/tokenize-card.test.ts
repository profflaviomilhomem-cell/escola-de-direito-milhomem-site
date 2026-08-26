import {
  isValidCardNumber,
  normalizeExpYear,
  isExpired,
  validateCard,
  onlyDigits,
  tokenizeCard,
} from "@/lib/pagarme/tokenize-card";

/** 2026-08-26, para não depender do relógio de quem roda a suíte. */
const HOJE = new Date(2026, 7, 26);

describe("validação de cartão (antes de gastar rede)", () => {
  it("aceita números de teste válidos por Luhn", () => {
    expect(isValidCardNumber("4111 1111 1111 1111")).toBe(true);
    expect(isValidCardNumber("5555555555554444")).toBe(true);
  });

  it("recusa dígito trocado", () => {
    expect(isValidCardNumber("4111111111111112")).toBe(false);
  });

  it("recusa comprimento fora da faixa", () => {
    expect(isValidCardNumber("411111")).toBe(false);
    expect(isValidCardNumber("41111111111111111111")).toBe(false);
  });

  it("normaliza ano de dois dígitos", () => {
    expect(normalizeExpYear("26")).toBe("2026");
    expect(normalizeExpYear("2026")).toBe("2026");
    expect(normalizeExpYear("")).toBe("");
  });

  it("cartão vale até o último dia do mês impresso", () => {
    // Agosto/2026 ainda é válido em 26/08/2026.
    expect(isExpired("08", "26", HOJE)).toBe(false);
    // Julho/2026 já venceu.
    expect(isExpired("07", "26", HOJE)).toBe(true);
    expect(isExpired("12", "2026", HOJE)).toBe(false);
  });

  it("recusa mês impossível", () => {
    expect(isExpired("13", "2027", HOJE)).toBe(true);
    expect(isExpired("00", "2027", HOJE)).toBe(true);
  });

  it("valida o conjunto e explica o que está errado", () => {
    const bom = {
      number: "4111111111111111",
      holderName: "FLAVIO MILHOMEM",
      expMonth: "12",
      expYear: "2027",
      cvv: "123",
    };
    expect(validateCard(bom, HOJE)).toBeNull();
    expect(validateCard({ ...bom, number: "4111111111111112" }, HOJE)).toMatch(
      /Número/,
    );
    expect(validateCard({ ...bom, holderName: "FM" }, HOJE)).toMatch(/nome/);
    expect(validateCard({ ...bom, cvv: "12" }, HOJE)).toMatch(/CVV/);
    expect(
      validateCard({ ...bom, expMonth: "07", expYear: "26" }, HOJE),
    ).toMatch(/vencido/);
  });

  it("onlyDigits tira máscara", () => {
    expect(onlyDigits("4111 1111-1111.1111")).toBe("4111111111111111");
  });
});

describe("tokenização", () => {
  const cartao = {
    number: "4111111111111111",
    holderName: "FLAVIO MILHOMEM",
    expMonth: "12",
    expYear: "2027",
    cvv: "123",
  };

  // `jest.spyOn(global, "fetch")` não funciona neste ambiente jsdom — a
  // propriedade não é configurável. Trocar por atribuição direta, guardando o
  // original para restaurar.
  const fetchOriginal = global.fetch;
  afterEach(() => {
    global.fetch = fetchOriginal;
    delete process.env.NEXT_PUBLIC_PAGARME_PUBLIC_KEY;
  });

  it("sem chave pública, recusa sem vazar detalhe de configuração", async () => {
    delete process.env.NEXT_PUBLIC_PAGARME_PUBLIC_KEY;

    const r = await tokenizeCard(cartao, HOJE);
    expect(r.ok).toBe(false);
    if (!r.ok) {
      expect(r.error).toBe("Pagamento no cartão indisponível no momento.");
      // A tela do comprador não é lugar de nome de variável de ambiente.
      expect(r.error).not.toMatch(/PAGARME|env|chave/i);
    }
  });

  it("valida antes de chamar a rede", async () => {
    process.env.NEXT_PUBLIC_PAGARME_PUBLIC_KEY = "pk_test_fake";
    const chamou = jest.fn();
    global.fetch = chamou as unknown as typeof fetch;

    const r = await tokenizeCard(
      { ...cartao, number: "4111111111111112" },
      HOJE,
    );
    expect(r.ok).toBe(false);
    expect(chamou).not.toHaveBeenCalled();
  });

  it("não repassa a mensagem do adquirente ao comprador", async () => {
    process.env.NEXT_PUBLIC_PAGARME_PUBLIC_KEY = "pk_test_fake";
    global.fetch = jest.fn(async () => ({
      ok: false,
      json: async () => ({ message: "card holder JOAO DA SILVA blocked" }),
    })) as unknown as typeof fetch;

    const r = await tokenizeCard(cartao, HOJE);
    expect(r.ok).toBe(false);
    if (!r.ok) {
      expect(r.error).not.toMatch(/JOAO DA SILVA/);
      expect(r.error).toMatch(/Confira os dados/);
    }
  });

  it("devolve o token quando o Pagar.me aceita", async () => {
    process.env.NEXT_PUBLIC_PAGARME_PUBLIC_KEY = "pk_test_fake";
    const chamou = jest.fn(async (_url: string, _init?: RequestInit) => ({
      ok: true,
      json: async () => ({ id: "token_abc123" }),
    }));
    global.fetch = chamou as unknown as typeof fetch;

    const r = await tokenizeCard(cartao, HOJE);
    expect(r).toEqual({ ok: true, token: "token_abc123" });

    // O número do cartão vai para o Pagar.me, nunca para o nosso servidor.
    const url = String(chamou.mock.calls[0][0]);
    expect(url).toContain("api.pagar.me");
    expect(url).not.toContain("/api/orders");
  });

  it("rede fora não vira erro genérico sem explicação", async () => {
    process.env.NEXT_PUBLIC_PAGARME_PUBLIC_KEY = "pk_test_fake";
    global.fetch = jest.fn(async () => {
      throw new Error("network down");
    }) as unknown as typeof fetch;

    const r = await tokenizeCard(cartao, HOJE);
    expect(r).toEqual({
      ok: false,
      error: "Sem conexão para validar o cartão.",
    });
  });
});
