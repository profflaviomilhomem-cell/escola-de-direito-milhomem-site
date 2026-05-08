import { loginSchema, registerSchema } from "@/schemas/auth";

describe("schemas/auth — registerSchema", () => {
  it("aceita payload mínimo válido (sem nome)", () => {
    const result = registerSchema.safeParse({
      email: "rafael@advogados-rj.com",
      password: "senha-forte-12",
    });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.name).toBeUndefined();
      expect(result.data.email).toBe("rafael@advogados-rj.com");
    }
  });

  it("normaliza e-mail (trim + lowercase)", () => {
    const result = registerSchema.safeParse({
      email: "  Rafael@Advogados-RJ.COM ",
      password: "senha-forte-12",
    });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.email).toBe("rafael@advogados-rj.com");
    }
  });

  it("trata nome vazio como undefined", () => {
    const result = registerSchema.safeParse({
      name: "",
      email: "x@y.com",
      password: "senha-forte-12",
    });
    expect(result.success).toBe(true);
    if (result.success) expect(result.data.name).toBeUndefined();
  });

  it("rejeita senha com menos de 8 caracteres", () => {
    const result = registerSchema.safeParse({
      email: "x@y.com",
      password: "curta1",
    });
    expect(result.success).toBe(false);
  });

  it("aceita senha exatamente no limite de 72 bytes", () => {
    const result = registerSchema.safeParse({
      email: "x@y.com",
      password: "a".repeat(72),
    });
    expect(result.success).toBe(true);
  });

  it("rejeita senha com 73 bytes ASCII", () => {
    const result = registerSchema.safeParse({
      email: "x@y.com",
      password: "a".repeat(73),
    });
    expect(result.success).toBe(false);
  });

  it("rejeita senha que estoura 72 bytes via emoji (4 bytes cada)", () => {
    // 19 emojis de 4 bytes = 76 bytes > 72
    const password = "🦊".repeat(19);
    const result = registerSchema.safeParse({
      email: "x@y.com",
      password,
    });
    expect(result.success).toBe(false);
  });

  it("rejeita e-mail inválido", () => {
    const result = registerSchema.safeParse({
      email: "nao-tem-arroba",
      password: "senha-forte-12",
    });
    expect(result.success).toBe(false);
  });
});

describe("schemas/auth — loginSchema", () => {
  it("aceita payload válido", () => {
    const result = loginSchema.safeParse({
      email: "x@y.com",
      password: "qualquer-coisa-1",
    });
    expect(result.success).toBe(true);
  });

  it("não exige tamanho mínimo de senha (compatibilidade com cadastros antigos)", () => {
    const result = loginSchema.safeParse({
      email: "x@y.com",
      password: "1",
    });
    expect(result.success).toBe(true);
  });

  it("rejeita senha além de 72 bytes (não daria match no bcrypt mesmo)", () => {
    const result = loginSchema.safeParse({
      email: "x@y.com",
      password: "a".repeat(73),
    });
    expect(result.success).toBe(false);
  });

  it("rejeita e-mail vazio", () => {
    const result = loginSchema.safeParse({
      email: "",
      password: "qualquer",
    });
    expect(result.success).toBe(false);
  });
});
