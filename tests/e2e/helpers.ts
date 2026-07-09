import type { Page, Locator } from "@playwright/test";

/**
 * Espera o React hidratar o elemento antes de interagir.
 *
 * Contra `next dev` sob carga, o JS pode ainda não ter anexado os handlers
 * quando o Playwright clica — aí um `<button type="submit">` dispara o submit
 * GET nativo do formulário em vez do `onSubmit` client (bug clássico de corrida
 * de hidratação, só em teste). `networkidle` não resolve: hidratar é trabalho de
 * CPU DEPOIS da rede aquietar.
 *
 * Sinal confiável: o React anexa chaves `__reactProps$…`/`__reactFiber$…` ao nó
 * do DOM assim que hidrata. Esperamos por elas antes de liberar a interação.
 */
export async function waitForHydration(locator: Locator): Promise<void> {
  await locator.evaluate(
    (el) =>
      new Promise<void>((resolve) => {
        const isHydrated = (node: Element) =>
          Object.keys(node).some(
            (k) =>
              k.startsWith("__reactProps$") || k.startsWith("__reactFiber$"),
          );
        if (isHydrated(el)) return resolve();
        const start = Date.now();
        const tick = () => {
          if (isHydrated(el) || Date.now() - start > 15_000) return resolve();
          requestAnimationFrame(tick);
        };
        tick();
      }),
  );
}

/** Vai até a rota e espera o formulário hidratar (submit seguro em seguida). */
export async function gotoHydratedForm(
  page: Page,
  path: string,
): Promise<Locator> {
  await page.goto(path, { waitUntil: "domcontentloaded" });
  const form = page.locator("form").first();
  await form.waitFor({ state: "visible" });
  await waitForHydration(form);
  return form;
}
