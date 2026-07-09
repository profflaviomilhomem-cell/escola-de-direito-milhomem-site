import { test, expect } from "@playwright/test";

import { gotoHydratedForm } from "./helpers";

/**
 * Cobertura e2e do cadastro (`/cadastro` → `RegisterForm` → `/api/auth/register`).
 * A API é interceptada para não depender do banco; validamos o comportamento do
 * componente client em cada resposta (validação Zod, 409, 429, sucesso).
 */

test.describe("/cadastro — criação de conta", () => {
  test("renderiza campos e CTA", async ({ page }) => {
    await gotoHydratedForm(page, "/cadastro");

    await expect(
      page.getByRole("heading", { level: 1, name: /Sua conta na/i }),
    ).toBeVisible();
    await expect(page.getByLabel(/Seu nome/i)).toBeVisible();
    await expect(page.getByLabel(/E-mail/i)).toBeVisible();
    await expect(page.getByLabel(/Senha/i)).toBeVisible();
    await expect(
      page.getByRole("button", { name: /Criar conta/i }),
    ).toBeVisible();
  });

  test("bloqueia submit com senha curta (validação Zod client)", async ({
    page,
  }) => {
    let apiCalled = false;
    await page.route("**/api/auth/register", async (route) => {
      apiCalled = true;
      await route.fulfill({ status: 201, body: "{}" });
    });

    await gotoHydratedForm(page, "/cadastro");
    await page.getByLabel(/E-mail/i).fill("rafael@advogados-rj.com");
    await page.getByLabel(/Senha/i).fill("123"); // < 8 caracteres
    await page.getByRole("button", { name: /Criar conta/i }).click();

    await expect(page.getByText(/pelo menos 8 caracteres/i)).toBeVisible();
    // Validação client barra antes de chamar a API.
    expect(apiCalled).toBe(false);
  });

  test("e-mail inválido mostra erro e não chama a API", async ({ page }) => {
    let apiCalled = false;
    await page.route("**/api/auth/register", async (route) => {
      apiCalled = true;
      await route.fulfill({ status: 201, body: "{}" });
    });

    await gotoHydratedForm(page, "/cadastro");
    await page.getByLabel(/E-mail/i).fill("não-é-email");
    await page.getByLabel(/Senha/i).fill("senha-bem-longa");
    await page.getByRole("button", { name: /Criar conta/i }).click();

    await expect(page.getByText(/E-mail inv[aá]lido/i)).toBeVisible();
    expect(apiCalled).toBe(false);
  });

  test("e-mail duplicado (409) mostra alerta orientando login", async ({
    page,
  }) => {
    await page.route("**/api/auth/register", async (route) => {
      await route.fulfill({
        status: 409,
        contentType: "application/json",
        body: JSON.stringify({
          ok: false,
          error: "Este e-mail já está cadastrado. Use a página de entrar.",
        }),
      });
    });

    await gotoHydratedForm(page, "/cadastro");
    await page.getByLabel(/Seu nome/i).fill("Rafael");
    await page.getByLabel(/E-mail/i).fill("rafael@advogados-rj.com");
    await page.getByLabel(/Senha/i).fill("senha-bem-longa");
    await page.getByRole("button", { name: /Criar conta/i }).click();

    await expect(
      page.getByRole("alert").filter({ hasText: /j[aá] est[aá] cadastrado/i }),
    ).toBeVisible();
    // Continua na página de cadastro (não redireciona no erro).
    await expect(page).toHaveURL(/\/cadastro/);
  });

  test("rate limit (429) mostra alerta", async ({ page }) => {
    await page.route("**/api/auth/register", async (route) => {
      await route.fulfill({
        status: 429,
        contentType: "application/json",
        body: JSON.stringify({ ok: false, error: "Muitas tentativas." }),
      });
    });

    await gotoHydratedForm(page, "/cadastro");
    await page.getByLabel(/Seu nome/i).fill("Rafael");
    await page.getByLabel(/E-mail/i).fill("rafael@advogados-rj.com");
    await page.getByLabel(/Senha/i).fill("senha-bem-longa");
    await page.getByRole("button", { name: /Criar conta/i }).click();

    await expect(
      page.getByRole("alert").filter({ hasText: /Muitas tentativas/i }),
    ).toBeVisible();
  });

  test("sucesso: envia o payload correto à API e não mostra erro", async ({
    page,
  }) => {
    await page.route("**/api/auth/register", async (route) => {
      await route.fulfill({
        status: 201,
        contentType: "application/json",
        body: JSON.stringify({
          ok: true,
          user: { id: "u1", email: "novo@aluno.com", name: "Novo" },
        }),
      });
    });

    await gotoHydratedForm(page, "/cadastro");
    await page.getByLabel(/Seu nome/i).fill("Novo");
    await page.getByLabel(/E-mail/i).fill("novo@aluno.com");
    await page.getByLabel(/Senha/i).fill("senha-bem-longa");

    // Ancoramos na requisição POST: prova que o JS assumiu o submit (nada de
    // GET nativo) e mandou o payload certo. NÃO assertamos o redirect final
    // para /aluno/dashboard→/entrar: navegar para uma rota protegida ainda não
    // compilada pelo `next dev` estoura timeout de forma não-determinística —
    // a proteção de rota já é coberta por `auth.spec.ts`.
    const registerCall = page.waitForRequest(
      (req) =>
        req.url().includes("/api/auth/register") && req.method() === "POST",
    );
    await page.getByRole("button", { name: /Criar conta/i }).click();

    const req = await registerCall;
    const body = JSON.parse(req.postData() ?? "{}") as {
      email?: string;
      name?: string;
      password?: string;
    };
    expect(body.email).toBe("novo@aluno.com");
    expect(body.name).toBe("Novo");
    expect(body.password).toBe("senha-bem-longa");

    // Caminho de sucesso: nenhum alerta de erro é exibido.
    await expect(page.getByRole("alert")).toHaveCount(0);
  });
});
