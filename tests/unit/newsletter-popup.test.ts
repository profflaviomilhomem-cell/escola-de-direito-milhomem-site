import { isNewsletterPopupExcluded } from "@/lib/newsletter-popup";

describe("isNewsletterPopupExcluded", () => {
  it("exclui páginas que já têm captura/auth como CTA principal", () => {
    for (const path of [
      "/newsletter",
      "/newsletter/confirmado",
      "/eventos/dia-do-advogado-2026",
      "/entrar",
      "/cadastro",
      "/esqueci-senha",
      "/recuperar-senha",
      "/aluno/dashboard",
      "/professor/aulas",
    ]) {
      expect(isNewsletterPopupExcluded(path)).toBe(true);
    }
  });

  it("mantém o FAB em páginas de conteúdo", () => {
    for (const path of ["/", "/blog", "/sobre", "/cursos", "/faq", "/livros"]) {
      expect(isNewsletterPopupExcluded(path)).toBe(false);
    }
  });
});
