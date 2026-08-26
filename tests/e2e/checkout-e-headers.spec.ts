import { test, expect } from "@playwright/test";

/**
 * Checkout e security headers.
 *
 * POR QUE ESTE ARQUIVO EXISTE
 *
 * `area-logada.spec.ts` declarava, em 05/08/2026, que "checkout e player de
 * vídeo não entram — exigem Pagar.me e Cloudflare Stream". Aquilo estava certo
 * para o fluxo de pagamento de ponta a ponta, e continua: sem conta Pagar.me
 * não existe pagamento para testar.
 *
 * Mas boa parte do checkout **não** depende de adquirente nenhum: quem pode
 * entrar, o que a tela oferece, o que ela promete e quais headers a borda
 * manda. Era isso que estava sem cobertura, e é isso que este arquivo cobre.
 *
 * LIMITES DECLARADOS
 *
 *  1. Somente leitura. Nenhum pedido é criado — `DATABASE_URL` de dev aponta
 *     para o Neon de produção.
 *  2. O pagamento em si segue sem cobertura e vai continuar até existir conta
 *     Pagar.me em sandbox.
 *  3. Roda contra `next dev`; a CI não executa e2e.
 */

const SLUG = "prova-digital-no-processo-penal";

test.describe("security headers na borda", () => {
  test("toda resposta carrega os headers do proxy", async ({ page }) => {
    const res = await page.goto("/");
    expect(res).not.toBeNull();
    const h = res!.headers();

    expect(h["x-content-type-options"]).toBe("nosniff");
    expect(h["referrer-policy"]).toBe("strict-origin-when-cross-origin");
    expect(h["x-frame-options"]).toBe("SAMEORIGIN");
    expect(h["permissions-policy"]).toContain("camera=()");
    expect(h["permissions-policy"]).toContain("microphone=()");
  });

  test("a CSP vai em Report-Only, não bloqueando", async ({ page }) => {
    // Enquanto a política não tiver janela de tráfego real registrada em
    // /api/csp-report, promover a enforcing seria adivinhação. Este teste
    // existe para que a promoção seja uma decisão, nunca um acidente.
    const res = await page.goto("/");
    const h = res!.headers();

    expect(h["content-security-policy-report-only"]).toBeTruthy();
    expect(h["content-security-policy"]).toBeUndefined();
    expect(h["content-security-policy-report-only"]).toContain(
      "report-uri /api/csp-report",
    );
    expect(h["content-security-policy-report-only"]).toContain(
      "object-src 'none'",
    );
  });

  test("a rota de relatório aceita o formato do browser e devolve 204", async ({
    request,
  }) => {
    const res = await request.post("/api/csp-report", {
      headers: { "content-type": "application/csp-report" },
      data: JSON.stringify({
        "csp-report": {
          "document-uri": "http://localhost:3055/",
          "violated-directive": "script-src",
          "blocked-uri": "https://exemplo-terceiro.test/x.js",
        },
      }),
    });
    expect(res.status()).toBe(204);
  });

  test("corpo absurdo não derruba a rota de relatório", async ({ request }) => {
    const res = await request.post("/api/csp-report", {
      data: "x".repeat(50_000),
    });
    expect(res.status()).toBe(204);
  });
});

test.describe("checkout — quem entra", () => {
  test("deslogado é mandado para o login, com o destino preservado", async ({
    page,
  }) => {
    await page.goto(`/checkout/${SLUG}`, { waitUntil: "domcontentloaded" });
    await expect(page).toHaveURL(/\/entrar/);
    // Sem o `from`, o comprador loga e cai na home — perdendo a intenção de
    // compra que o trouxe até aqui.
    expect(page.url()).toContain("from=");
    expect(decodeURIComponent(page.url())).toContain(`/checkout/${SLUG}`);
  });

  test("produto inexistente devolve 404 de verdade, não soft 404", async ({
    page,
  }) => {
    const res = await page.goto("/checkout/curso-que-nao-existe", {
      waitUntil: "domcontentloaded",
    });
    expect(res?.status()).toBe(404);
  });
});

test.describe("status de 'não encontrado' nas rotas dinâmicas", () => {
  /**
   * Em 26/08/2026, TODAS estas rotas respondiam **200** exibindo a página de
   * "não encontrada" — soft 404, com 79 artigos de blog no ar. A causa era um
   * `loading.tsx` na raiz de `src/app`: ele abre um Suspense, o Next despacha
   * o shell com 200, e depois disso `notFound()` só troca o corpo.
   *
   * O skeleton foi movido para as áreas logadas. Estes testes são a trava
   * para ele não voltar à raiz.
   */
  const rotas = [
    "/blog/artigo-que-nao-existe",
    "/cursos/curso-inexistente",
    "/checkout/curso-que-nao-existe",
    "/rota-inexistente-qualquer",
  ];

  for (const rota of rotas) {
    test(`${rota} responde 404`, async ({ page }) => {
      const res = await page.goto(rota, { waitUntil: "domcontentloaded" });
      expect(res?.status()).toBe(404);
    });
  }

  test("resultado de pedido inexistente responde 404 (com sessão)", async ({
    page,
    context,
    baseURL,
  }) => {
    // Sem sessão esta rota redireciona para /entrar antes de olhar o pedido —
    // então o 404 só é alcançável logado.
    await context.addCookies([
      {
        name: "fm_dev_role",
        value: "aluno",
        url: baseURL ?? "http://localhost:3055",
      },
    ]);
    const res = await page.goto("/checkout/resultado/pedido-que-nao-existe", {
      waitUntil: "domcontentloaded",
    });
    expect(res?.status()).toBe(404);
  });
});

test.describe("checkout — logado", () => {
  test.beforeEach(async ({ context, baseURL }) => {
    await context.addCookies([
      {
        name: "fm_dev_role",
        value: "aluno",
        url: baseURL ?? "http://localhost:3055",
      },
    ]);
  });

  test("a tela promete exatamente as formas de pagamento que oferece", async ({
    page,
  }) => {
    const erros: string[] = [];
    page.on("console", (m) => {
      if (m.type() === "error") erros.push(m.text());
    });

    await page.goto(`/checkout/${SLUG}`, { waitUntil: "domcontentloaded" });
    const corpo = await page.locator("body").innerText();

    const prometeCartao = /cart[ãa]o de cr[ée]dito/i.test(corpo);
    const ofereceCartao = corpo.includes("CARTÃO");

    // O ponto do teste: promessa e oferta andam juntas. Sem chave pública do
    // Pagar.me, nenhuma das duas aparece; com chave, as duas aparecem. O que
    // não pode existir é a frase sem o botão — foi assim que o "garantir vaga"
    // levava a um checkout que respondia 503.
    expect(prometeCartao).toBe(ofereceCartao);

    expect(erros).toEqual([]);
  });

  test("boleto pede endereço; PIX não pede", async ({ page }) => {
    await page.goto(`/checkout/${SLUG}`, { waitUntil: "domcontentloaded" });

    const form = page.locator("form").first();
    const semForm = (await form.count()) === 0;
    // Sem chave Pagar.me a página mostra o aviso de indisponível, sem
    // formulário. É estado legítimo hoje — e o teste diz isso em vez de falhar.
    test.skip(semForm, "Pagar.me não configurado neste ambiente");

    await expect(page.getByPlaceholder("Rua, número, bairro")).toHaveCount(0);

    await page.getByRole("radio", { name: "BOLETO" }).check();
    await expect(page.getByPlaceholder("Rua, número, bairro")).toBeVisible();

    await page.getByRole("radio", { name: "PIX" }).check();
    await expect(page.getByPlaceholder("Rua, número, bairro")).toHaveCount(0);
  });
});
