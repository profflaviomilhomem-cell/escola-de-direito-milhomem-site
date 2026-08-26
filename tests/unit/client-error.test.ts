import {
  normalizeClientError,
  pathOnly,
  trimStack,
  saneText,
  MAX_STACK_LINES,
} from "@/lib/observability/client-error";

describe("normalização de erro de cliente", () => {
  it("descarta query string — é onde mora token e e-mail", () => {
    // O caso concreto: o erro estoura na tela de recuperação de senha e a URL
    // carrega o token no query. Registrar a URL inteira vazaria o token no log.
    expect(pathOnly("/recuperar?token=abc123&email=a@b.com")).toBe(
      "/recuperar",
    );
    expect(pathOnly("/checkout/provas-digitais?utm_source=meta")).toBe(
      "/checkout/provas-digitais",
    );
    expect(pathOnly("/aluno/aula-01#minuto-12")).toBe("/aluno/aula-01");
  });

  it("recusa caminho que não é caminho", () => {
    expect(pathOnly("https://exemplo.com/roubado")).toBe("");
    expect(pathOnly("javascript:alert(1)")).toBe("");
    expect(pathOnly(undefined)).toBe("");
    expect(pathOnly(42)).toBe("");
  });

  it("corta a stack no número de linhas combinado", () => {
    const stack = Array.from({ length: 40 }, (_, i) => `  at fn${i}`).join(
      "\n",
    );
    const cortada = trimStack(stack);
    expect(cortada.split(" | ")).toHaveLength(MAX_STACK_LINES);
    expect(cortada).toContain("at fn0");
    expect(cortada).not.toContain("at fn30");
  });

  it("limita tamanho e achata espaço em branco", () => {
    expect(saneText("  a\n\n  b  ")).toBe("a b");
    expect(saneText("x".repeat(900)).length).toBe(500);
    expect(saneText("x".repeat(900), 64).length).toBe(64);
  });

  it("nunca devolve mensagem vazia — log sem mensagem é log inútil", () => {
    expect(normalizeClientError({}).message).toBe("(sem mensagem)");
    expect(normalizeClientError(null).message).toBe("(sem mensagem)");
    expect(normalizeClientError({ message: 123 }).message).toBe(
      "(sem mensagem)",
    );
  });

  it("normaliza o pacote inteiro que a tela de erro manda", () => {
    const r = normalizeClientError({
      message: "Cannot read properties of undefined",
      stack: "Error: x\n  at Foo\n  at Bar",
      digest: "1234567890",
      path: "/checkout/provas-digitais?cupom=SEGREDO",
    });
    expect(r).toEqual({
      message: "Cannot read properties of undefined",
      digest: "1234567890",
      path: "/checkout/provas-digitais",
      stack: "Error: x | at Foo | at Bar",
    });
    expect(JSON.stringify(r)).not.toContain("SEGREDO");
  });

  it("ignora campo extra que o cliente tente empurrar", () => {
    const r = normalizeClientError({
      message: "erro",
      senha: "hunter2",
      cookie: "session=abc",
    });
    expect(JSON.stringify(r)).not.toContain("hunter2");
    expect(JSON.stringify(r)).not.toContain("session=abc");
  });
});
