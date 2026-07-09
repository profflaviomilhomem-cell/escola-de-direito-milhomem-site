import { test, expect } from "@playwright/test";

import { gotoHydratedForm } from "./helpers";

/**
 * Cobertura e2e do funil de captura — exigido pelo Checklist Fase 1.4
 * ("teste e2e Playwright cobre o fluxo completo").
 *
 * Os testes interceptam `/api/leads` para não dependerem do banco/Resend
 * em ambiente de teste; o fluxo real é coberto por testes de integração
 * server-side e por um teste opcional de smoke contra staging.
 */

test.describe("/newsletter — captura de lead", () => {
  test("renderiza headline, formulário e copy LGPD", async ({ page }) => {
    await gotoHydratedForm(page, "/newsletter");

    await expect(
      page.getByRole("heading", { level: 1, name: /B[oa]letim/i }),
    ).toBeVisible();
    await expect(page.getByLabel(/E-mail/i)).toBeVisible();
    await expect(
      page.getByRole("button", { name: /Quero receber/i }),
    ).toBeVisible();
    await expect(page.getByText(/duplo opt|confirma[çc][aã]o/i)).toBeVisible();
  });

  test("bloqueia envio sem e-mail e mostra erro Zod", async ({ page }) => {
    await gotoHydratedForm(page, "/newsletter");

    await page.getByRole("button", { name: /Quero receber/i }).click();

    await expect(page.getByText(/Informe seu e-mail/i)).toBeVisible();
  });

  test("envia o lead e mostra estado de sucesso", async ({ page }) => {
    await page.route("**/api/leads", async (route) => {
      const request = route.request();
      const body = JSON.parse(request.postData() ?? "{}") as {
        email?: string;
      };
      expect(body.email).toBe("rafael@advogados-rj.com");
      await route.fulfill({
        status: 201,
        contentType: "application/json",
        body: JSON.stringify({ ok: true }),
      });
    });

    await gotoHydratedForm(page, "/newsletter");
    await page.getByLabel(/Seu nome/i).fill("Rafael");
    await page.getByLabel(/E-mail/i).fill("rafael@advogados-rj.com");
    await page.getByRole("button", { name: /Quero receber/i }).click();

    await expect(page.getByText(/Inscri[çc][aã]o registrada/i)).toBeVisible();
    await expect(
      page.getByText(/e-mail para confirmar sua assinatura/i),
    ).toBeVisible();
  });

  test("mostra mensagem de rate limit (429)", async ({ page }) => {
    await page.route("**/api/leads", async (route) => {
      await route.fulfill({
        status: 429,
        contentType: "application/json",
        body: JSON.stringify({
          ok: false,
          error: "Muitas tentativas. Tente novamente em alguns minutos.",
        }),
      });
    });

    await gotoHydratedForm(page, "/newsletter");
    await page.getByLabel(/E-mail/i).fill("foo@bar.com");
    await page.getByRole("button", { name: /Quero receber/i }).click();

    await expect(
      page.getByRole("alert").filter({ hasText: /Muitas tentativas/i }),
    ).toBeVisible();
  });
});

test.describe("/newsletter/confirmado — feedback do duplo opt-in", () => {
  test("status=ok mostra confirmação", async ({ page }) => {
    await page.goto("/newsletter/confirmado?status=ok");
    await expect(
      page.getByRole("heading", { name: /entrou para o Bastidor/i }),
    ).toBeVisible();
  });

  test("status=invalid mostra link expirado", async ({ page }) => {
    await page.goto("/newsletter/confirmado?status=invalid");
    await expect(
      page.getByRole("heading", { name: /n[aã]o p[oô]de ser lido/i }),
    ).toBeVisible();
  });

  test("status=notfound mostra cadastro não encontrado", async ({ page }) => {
    await page.goto("/newsletter/confirmado?status=notfound");
    await expect(
      page.getByRole("heading", { name: /n[aã]o localizamos/i }),
    ).toBeVisible();
  });
});
