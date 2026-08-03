import { contactSchema } from "@/schemas/contact";

/**
 * O formulário de contato não tinha teste nenhum até 03/08/2026 — a auditoria
 * contra o Livro-Guia (cap. 5.8) pegou a falta do campo `subject` e, ao
 * corrigir, ficou claro que nada protegia o schema.
 */
const valido = {
  name: "Rafael Andrade",
  email: "rafael@example.com",
  subject: "Dúvida sobre a Edição Lançamento",
  message: "Gostaria de saber se há material de apoio em PDF por módulo.",
};

describe("schemas/contact", () => {
  it("aceita um envio completo", () => {
    expect(contactSchema.safeParse(valido).success).toBe(true);
  });

  it("exige o assunto — é ele que dá triagem a quem recebe", () => {
    const { subject: _omitido, ...semAssunto } = valido;
    expect(contactSchema.safeParse(semAssunto).success).toBe(false);
  });

  it("rejeita assunto curto demais para significar algo", () => {
    const r = contactSchema.safeParse({ ...valido, subject: "oi" });
    expect(r.success).toBe(false);
  });

  it("rejeita assunto acima de 150 caracteres (cabeçalho de e-mail)", () => {
    const r = contactSchema.safeParse({ ...valido, subject: "a".repeat(151) });
    expect(r.success).toBe(false);
  });

  it("aceita assunto exatamente no limite de 150", () => {
    const r = contactSchema.safeParse({ ...valido, subject: "a".repeat(150) });
    expect(r.success).toBe(true);
  });

  it("mantém as validações que já existiam", () => {
    expect(
      contactSchema.safeParse({ ...valido, email: "não-é-email" }).success,
    ).toBe(false);
    expect(contactSchema.safeParse({ ...valido, name: "R" }).success).toBe(
      false,
    );
    expect(
      contactSchema.safeParse({ ...valido, message: "curta" }).success,
    ).toBe(false);
  });

  it("aceita o honeypot `website` vazio e recusa preenchido", () => {
    expect(contactSchema.safeParse({ ...valido, website: "" }).success).toBe(
      true,
    );
    expect(
      contactSchema.safeParse({ ...valido, website: "http://spam.example.com" })
        .success,
    ).toBe(false);
  });
});
