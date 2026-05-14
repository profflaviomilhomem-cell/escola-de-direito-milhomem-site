import {
  loginSchema,
  registerSchema,
  forgotPasswordSchema,
  resetPasswordSchema,
  updateProfileSchema,
  updatePasswordSchema,
} from "@/schemas/auth";

describe("schemas/auth — forgotPasswordSchema", () => {
  it("aceita e-mail válido", () => {
    const result = forgotPasswordSchema.safeParse({ email: "x@y.com" });
    expect(result.success).toBe(true);
  });

  it("rejeita e-mail inválido", () => {
    const result = forgotPasswordSchema.safeParse({ email: "nao-e-email" });
    expect(result.success).toBe(false);
  });
});

describe("schemas/auth — resetPasswordSchema", () => {
  it("aceita payload válido", () => {
    const result = resetPasswordSchema.safeParse({
      token: "algum-jwt-aqui",
      password: "nova-senha-forte-1",
    });
    expect(result.success).toBe(true);
  });

  it("rejeita sem token", () => {
    const result = resetPasswordSchema.safeParse({
      password: "nova-senha-forte-1",
    });
    expect(result.success).toBe(false);
  });

  it("rejeita senha curta", () => {
    const result = resetPasswordSchema.safeParse({
      token: "tok",
      password: "curta",
    });
    expect(result.success).toBe(false);
  });
});

describe("schemas/auth — updateProfileSchema", () => {
  it("aceita payload válido (nome + email)", () => {
    const result = updateProfileSchema.safeParse({
      name: "Novo Nome",
      email: "novo@e.com",
    });
    expect(result.success).toBe(true);
  });

  it("aceita apenas e-mail (nome opcional)", () => {
    const result = updateProfileSchema.safeParse({ email: "novo@e.com" });
    expect(result.success).toBe(true);
  });
});

describe("schemas/auth — updatePasswordSchema", () => {
  it("aceita payload válido", () => {
    const result = updatePasswordSchema.safeParse({
      currentPassword: "senha-atual",
      newPassword: "nova-senha-forte-8",
    });
    expect(result.success).toBe(true);
  });

  it("rejeita sem senha atual", () => {
    const result = updatePasswordSchema.safeParse({
      newPassword: "nova-senha-forte-8",
    });
    expect(result.success).toBe(false);
  });
});

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
