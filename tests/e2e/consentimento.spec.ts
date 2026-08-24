import { test, expect } from "@playwright/test";

import { waitForHydration } from "./helpers";

/**
 * Cobertura e2e do consentimento LGPD — banner de cookies e revogação.
 *
 * Existe porque este fluxo é **invisível para verificação por HTML**: tanto o
 * banner quanto o bloco de revogação em /privacidade só renderizam depois da
 * hidratação, então `curl` no HTML servido não prova nada sobre eles. Em
 * 24/08/2026 essa cegueira quase virou um falso positivo de regressão: com a
 * aba em segundo plano (`visibilityState: "hidden"`) o React adia a hidratação
 * da subárvore, o bloco não aparecia, e a conclusão errada seria "quebrou".
 *
 * O que estes testes protegem é obrigação legal, não estética: o art. 8º, §5º
 * da LGPD exige procedimento **gratuito e facilitado** para revogar, e o guia
 * de cookies da ANPD pede que recusar seja tão fácil e visível quanto aceitar.
 *
 * Somente leitura: todo o estado vive em `localStorage`. Nenhuma escrita no
 * banco, nenhuma chamada de API.
 */

/** Espelha `ANALYTICS_CONSENT_KEY` de `src/lib/analytics/consent.ts`. */
const CONSENT_KEY = "fm-analytics-consent";

/** Semeia a escolha antes do primeiro script da página rodar. */
async function comConsentimento(
  page: import("@playwright/test").Page,
  valor: "granted" | "denied",
) {
  await page.addInitScript(
    ([chave, v]) => {
      try {
        localStorage.setItem(chave as string, v as string);
      } catch {
        /* storage bloqueado — o próprio componente tolera */
      }
    },
    [CONSENT_KEY, valor],
  );
}

const banner = (page: import("@playwright/test").Page) =>
  page.getByRole("dialog", { name: /Cookies e privacidade/i });

test.describe("Consentimento LGPD — banner de cookies", () => {
  test("visitante sem escolha vê o banner", async ({ page }) => {
    await page.goto("/privacidade");

    await expect(banner(page)).toBeVisible();
    await expect(
      page.getByText(/Cookies anal[ií]ticos opcionais/i),
    ).toBeVisible();
  });

  test("recusar é tão visível quanto aceitar (guia de cookies da ANPD)", async ({
    page,
  }) => {
    await page.goto("/privacidade");

    const recusar = page.getByRole("button", { name: /^Recusar$/i });
    const aceitar = page.getByRole("button", { name: /^Aceitar$/i });

    // Os dois precisam ser botão de verdade e estar visíveis ao mesmo tempo —
    // até 14/08/2026 "Recusar" era texto solto ao lado de um botão preenchido.
    await expect(recusar).toBeVisible();
    await expect(aceitar).toBeVisible();

    const caixaRecusar = await recusar.boundingBox();
    const caixaAceitar = await aceitar.boundingBox();
    expect(caixaRecusar).not.toBeNull();
    expect(caixaAceitar).not.toBeNull();
    // Mesma caixa: grid de duas colunas iguais. Tolerância de 2px para
    // arredondamento de layout.
    expect(Math.abs(caixaRecusar!.width - caixaAceitar!.width)).toBeLessThan(2);
    expect(Math.abs(caixaRecusar!.height - caixaAceitar!.height)).toBeLessThan(
      2,
    );
  });

  test("recusar grava a escolha e fecha o banner", async ({ page }) => {
    await page.goto("/privacidade");

    const recusar = page.getByRole("button", { name: /^Recusar$/i });
    await expect(recusar).toBeVisible();
    await waitForHydration(recusar);
    await recusar.click();

    await expect(banner(page)).toBeHidden();
    await expect
      .poll(() => page.evaluate((k) => localStorage.getItem(k), CONSENT_KEY))
      .toBe("denied");
  });

  test("aceitar grava a escolha e fecha o banner", async ({ page }) => {
    await page.goto("/privacidade");

    const aceitar = page.getByRole("button", { name: /^Aceitar$/i });
    await expect(aceitar).toBeVisible();
    await waitForHydration(aceitar);
    await aceitar.click();

    await expect(banner(page)).toBeHidden();
    await expect
      .poll(() => page.evaluate((k) => localStorage.getItem(k), CONSENT_KEY))
      .toBe("granted");
  });
});

test.describe("Consentimento LGPD — revogação em /privacidade", () => {
  test("sem escolha registrada, avisa e não oferece revogação", async ({
    page,
  }) => {
    await page.goto("/privacidade");

    await expect(
      page.getByText(/ainda n[ãa]o registrou uma escolha/i),
    ).toBeVisible();
    await expect(
      page.getByRole("button", { name: /Rever minha escolha/i }),
    ).toHaveCount(0);
  });

  test("quem recusou vê a escolha e o botão de revogar", async ({ page }) => {
    await comConsentimento(page, "denied");
    await page.goto("/privacidade");

    await expect(page.getByText(/Voc[êe] recusou os cookies/i)).toBeVisible();
    await expect(
      page.getByRole("button", { name: /Rever minha escolha/i }),
    ).toBeVisible();
  });

  test("quem aceitou vê a escolha e o botão de revogar", async ({ page }) => {
    await comConsentimento(page, "granted");
    await page.goto("/privacidade");

    await expect(page.getByText(/Voc[êe] aceitou os cookies/i)).toBeVisible();
    await expect(
      page.getByRole("button", { name: /Rever minha escolha/i }),
    ).toBeVisible();
  });

  test("revogar limpa a escolha e traz o banner de volta sem recarregar (art. 8º, §5º)", async ({
    page,
  }) => {
    await comConsentimento(page, "granted");
    await page.goto("/privacidade");

    // Com escolha registrada, o banner não aparece.
    await expect(banner(page)).toBeHidden();

    const rever = page.getByRole("button", { name: /Rever minha escolha/i });
    await expect(rever).toBeVisible();
    await waitForHydration(rever);
    await rever.click();

    // A chave sai do storage…
    await expect
      .poll(() => page.evaluate((k) => localStorage.getItem(k), CONSENT_KEY))
      .toBeNull();

    // …o bloco volta a dizer que não há escolha…
    await expect(
      page.getByText(/ainda n[ãa]o registrou uma escolha/i),
    ).toBeVisible();

    // …e o banner reaparece SEM reload. Isto é o coração do teste: o banner
    // ouve o evento `fm-analytics-consent`; sem esse listener a revogação só
    // valeria depois de recarregar a página, o que não é "facilitado".
    await expect(banner(page)).toBeVisible();
  });
});
