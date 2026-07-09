import { test, expect } from "@playwright/test";

/**
 * Smoke do funil público de marketing.
 *
 * Estas rotas são renderizadas a partir de dados ESTÁTICOS (`@/data/*`), sem
 * tocar o banco — por isso são seguras de rodar contra o dev server sem risco
 * de escrita. O objetivo é pegar regressão grosseira (500, página quebrada,
 * heading sumindo) em toda a superfície pública antes do lançamento.
 *
 * Rotas com dados de banco (blog, área do aluno) ficam de fora — não dá para
 * mockar fetch server-side via `page.route`, e não queremos bater no Neon.
 */

const STATIC_ROUTES = [
  { path: "/", nome: "Home" },
  { path: "/cursos", nome: "Cursos" },
  { path: "/sobre", nome: "Sobre" },
  { path: "/livros", nome: "Livros" },
  { path: "/faq", nome: "FAQ" },
  { path: "/contato", nome: "Contato" },
  { path: "/quiz-penal", nome: "Quiz penal" },
  { path: "/calculadora-de-pena", nome: "Calculadora de pena" },
  { path: "/reembolso", nome: "Reembolso" },
  { path: "/termos", nome: "Termos" },
  { path: "/privacidade", nome: "Privacidade" },
  { path: "/entrar", nome: "Entrar" },
  { path: "/cadastro", nome: "Cadastro" },
];

test.describe("Smoke do funil público", () => {
  for (const rota of STATIC_ROUTES) {
    test(`${rota.nome} (${rota.path}) carrega sem erro e com heading`, async ({
      page,
    }) => {
      const response = await page.goto(rota.path, { waitUntil: "load" });

      // Status HTTP saudável (nunca 4xx/5xx).
      expect(response, `sem resposta para ${rota.path}`).not.toBeNull();
      expect(
        response!.status(),
        `status inesperado em ${rota.path}`,
      ).toBeLessThan(400);

      // A página tem um H1 visível — prova de que renderizou conteúdo, não
      // uma casca vazia ou tela de erro.
      await expect(
        page.locator("h1").first(),
        `sem <h1> visível em ${rota.path}`,
      ).toBeVisible();

      // O <title> foi preenchido (SEO básico não quebrou).
      await expect(page).toHaveTitle(/.+/);
    });
  }
});
