import {
  isNewsletterAutoOpenSuppressed,
  isNewsletterPopupExcluded,
} from "@/lib/newsletter-popup";

describe("isNewsletterPopupExcluded", () => {
  it("exclui páginas que já têm captura/auth como CTA principal", () => {
    for (const path of [
      "/newsletter",
      "/newsletter/confirmado",
      "/eventos/dia-do-advogado-2026-brasilia",
      "/calculadora-de-pena",
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

  it("exclui o checkout — nada disputa atenção durante o pagamento", () => {
    for (const path of [
      "/checkout/prova-digital-no-processo-penal",
      "/checkout/resultado/abc123",
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

describe("isNewsletterAutoOpenSuppressed", () => {
  it("não abre o modal sozinho na página de venda", () => {
    for (const path of ["/cursos", "/cursos/prova-digital-no-processo-penal"]) {
      expect(isNewsletterAutoOpenSuppressed(path)).toBe(true);
      // a pílula continua disponível — só a interrupção some
      expect(isNewsletterPopupExcluded(path)).toBe(false);
    }
  });

  it("segue abrindo nas páginas editoriais", () => {
    for (const path of ["/", "/blog", "/blog/algum-post", "/sobre", "/faq"]) {
      expect(isNewsletterAutoOpenSuppressed(path)).toBe(false);
    }
  });
});
