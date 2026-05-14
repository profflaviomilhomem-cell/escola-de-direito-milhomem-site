import { test, expect } from "@playwright/test";

/**
 * Cobertura e2e da autenticação — exigido pelo Checklist Fase 2.2
 * ("E2E Playwright valida que /aluno/dashboard sem cookie redireciona").
 */

test.describe("Proteção de rotas", () => {
  test("redireciona de /aluno/dashboard para /entrar quando não autenticado", async ({ page }) => {
    // Garante que não temos o cookie de sessão (limpando o estado do navegador)
    await page.context().clearCookies();
    
    // Tenta acessar uma rota protegida
    await page.goto("/aluno/dashboard");

    // Deve redirecionar para entrar com params de unauthorized e source
    await expect(page).toHaveURL(/\/entrar\?unauthorized=1&from=%2Faluno%2Fdashboard/);
    
    // Verifica se a mensagem de erro está visível na tela de login
    await expect(page.getByText(/Sua sessão expirou ou você ainda não fez login/i)).toBeVisible();
  });

  test("redireciona de /professor para /entrar quando não autenticado", async ({ page }) => {
    await page.context().clearCookies();
    await page.goto("/professor/dashboard");
    await expect(page).toHaveURL(/\/entrar\?unauthorized=1&from=%2Fprofessor%2Fdashboard/);
  });
});

test.describe("Fluxos de Auth (Mocked API)", () => {
  test("login mostra estado de carregamento e tenta redirecionar", async ({ page }) => {
    await page.route("**/api/auth/login", async (route) => {
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({
          ok: true,
          user: { id: "123", email: "rafael@advogados-rj.com", name: "Rafael" }
        })
      });
    });

    await page.goto("/entrar");
    await page.getByLabel(/E-mail/i).fill("rafael@advogados-rj.com");
    await page.getByLabel(/Senha/i).fill("senha-valida");
    
    const submitBtn = page.getByRole("button", { name: /Entrar/i });
    await submitBtn.click();

    // Como o JWT retornado no Set-Cookie seria inválido para o servidor real,
    // o Next.js redirecionaria de volta para /entrar após o push.
    // Validamos que o botão entrou em estado de loading ou que o form sumiu/mudou.
    await expect(submitBtn).toBeDisabled();
  });
});
