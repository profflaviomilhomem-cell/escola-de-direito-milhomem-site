import { newsletterSchema } from "@/schemas/newsletter";

describe("schemas/newsletter · honeypot", () => {
  it("aceita e-mail válido sem honeypot", () => {
    const r = newsletterSchema.safeParse({ email: "aluno@example.com" });
    expect(r.success).toBe(true);
  });

  it("NÃO rejeita o honeypot `website` preenchido — evita 422 que denuncia a armadilha", () => {
    // Rejeitar aqui devolveria um erro Zod apontando `website` e ensinaria o
    // bot qual campo é a isca. O descarte silencioso é responsabilidade da rota.
    const r = newsletterSchema.safeParse({
      email: "bot@example.com",
      website: "http://spam.example.com",
    });
    expect(r.success).toBe(true);
    if (r.success) expect(r.data.website).toBe("http://spam.example.com");
  });

  it("rejeita e-mail inválido (validação real segue ativa)", () => {
    const r = newsletterSchema.safeParse({ email: "não-é-email" });
    expect(r.success).toBe(false);
  });
});
