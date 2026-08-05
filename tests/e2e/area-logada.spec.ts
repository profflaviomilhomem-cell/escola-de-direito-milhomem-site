import { test, expect, type Page } from "@playwright/test";

/**
 * Cobertura e2e das áreas logadas (aluno · professor · admin).
 *
 * POR QUE ESTE ARQUIVO EXISTE
 *
 * Até 05/08/2026 a suíte e2e cobria só o funil público: nenhuma página
 * renderizada **com sessão** tinha sido verificada uma única vez. A BGB já
 * tinha ensinado o custo disso — lá o painel respondia `200` a `curl` em todas
 * as rotas e mesmo assim o cliente não conseguia entrar, porque o defeito
 * morava no clique e não no protocolo.
 *
 * COMO A SESSÃO É OBTIDA
 *
 * Pelo cookie dev-only `fm_dev_role` (`src/lib/auth/dev-session.ts`), que
 * devolve uma sessão falsa de aluno ou de professor/admin. Ele é inerte em
 * `NODE_ENV=production` — `resolveDevFakeSession` retorna `null` — então isto
 * não abre porta nenhuma no site publicado. Como a suíte roda contra
 * `next dev`, funciona aqui e não vaza para lá.
 *
 * LIMITES DECLARADOS — leia antes de confiar
 *
 *  1. **Somente leitura.** Nenhum teste aqui escreve. O `DATABASE_URL` de
 *     desenvolvimento aponta para o **Neon de produção**; escrever a partir de
 *     teste sujaria dados do cliente. Fluxo de escrita logado segue SEM
 *     cobertura.
 *  2. O usuário da sessão falsa (`user_rafael_mock`) **não existe no banco**.
 *     Por isso as asserções são estruturais — a página renderiza, tem heading,
 *     não estoura no cliente — e não sobre dados. Estado vazio é resultado
 *     legítimo enquanto o produto não lançou.
 *  3. Estes testes **não rodam na CI** (o workflow não instala browser nem tem
 *     `DATABASE_URL`). São gate local, não gate de merge.
 *  4. Rotas dinâmicas (`/aluno/aulas/[slug]`, `/professor/cursos/[slug]/editar`
 *     e afins) ficam de fora: dependem de slug existente no banco.
 *  5. Checkout e player de vídeo não entram — exigem Pagar.me e Cloudflare
 *     Stream, ausentes das envs de produção em 05/08/2026.
 */

type Papel = "aluno" | "professor";

/** Vai à rota com sessão falsa e devolve os erros de console capturados. */
async function abrirComSessao(
  page: Page,
  papel: Papel,
  rota: string,
): Promise<string[]> {
  const erros: string[] = [];
  page.on("console", (m) => {
    if (m.type() === "error") erros.push(m.text());
  });
  page.on("pageerror", (e) => erros.push(`pageerror: ${String(e)}`));

  await page.context().addCookies([
    {
      name: "fm_dev_role",
      value: papel,
      url: "http://localhost:3055",
    },
  ]);
  await page.goto(rota, { waitUntil: "domcontentloaded" });
  return erros;
}

/**
 * Erros de console que não são do nosso código e aparecem só em `next dev`.
 * Filtrar aqui, e não afrouxar a asserção, mantém o sinal utilizável.
 */
function errosRelevantes(erros: string[]): string[] {
  const ruido = /favicon|Download the React DevTools/i;
  return erros.filter((e) => !ruido.test(e));
}

const ROTAS_ALUNO = [
  { rota: "/aluno/dashboard", heading: /Prova Digital|Meus cursos|Dashboard/i },
  { rota: "/aluno/cursos", heading: /Cursos/i },
  { rota: "/aluno/certificados", heading: /Certificados/i },
  { rota: "/aluno/forum", heading: /Fórum/i },
  { rota: "/aluno/minha-conta", heading: /Minha conta/i },
] as const;

const ROTAS_PROFESSOR = [
  { rota: "/professor/dashboard", heading: /Bom dia|Boa tarde|Boa noite/i },
  { rota: "/professor/alunos", heading: /Alunos/i },
  { rota: "/professor/cursos", heading: /cursos/i },
  { rota: "/professor/aulas", heading: /aulas|Módulos/i },
  { rota: "/professor/blog", heading: /Blog/i },
  { rota: "/professor/metricas", heading: /Métricas/i },
  { rota: "/professor/reembolsos", heading: /reembolsos/i },
  { rota: "/professor/anuncios", heading: /Anúncios/i },
  { rota: "/professor/forum", heading: /Fórum/i },
  { rota: "/admin/dashboard", heading: /Painel/i },
] as const;

test.describe("Área do aluno — renderiza com sessão", () => {
  for (const { rota, heading } of ROTAS_ALUNO) {
    test(`${rota} renderiza com heading e sem erro de console`, async ({
      page,
    }) => {
      const erros = await abrirComSessao(page, "aluno", rota);

      // Não caiu no guard: sessão foi aceita.
      await expect(page).not.toHaveURL(/\/entrar/);

      const h1 = page.locator("h1").first();
      await expect(h1).toBeVisible();
      await expect(h1).toHaveText(heading);

      expect(errosRelevantes(erros)).toEqual([]);
    });
  }
});

test.describe("Área do professor e admin — renderiza com sessão", () => {
  for (const { rota, heading } of ROTAS_PROFESSOR) {
    test(`${rota} renderiza com heading e sem erro de console`, async ({
      page,
    }) => {
      const erros = await abrirComSessao(page, "professor", rota);

      await expect(page).not.toHaveURL(/\/entrar/);

      const h1 = page.locator("h1").first();
      await expect(h1).toBeVisible();
      await expect(h1).toHaveText(heading);

      expect(errosRelevantes(erros)).toEqual([]);
    });
  }
});

test.describe("Separação de papéis", () => {
  /**
   * Aluno em rota de admin NÃO cai em /entrar: o guard (`src/proxy.ts`)
   * devolve para `/aluno/dashboard` de propósito — mandar para o login alguém
   * que está logado seria mentira de UX. A primeira versão deste teste
   * assertava `/entrar` e falhou; o errado era a asserção, não o guard.
   */
  test("sessão de aluno é desviada do painel do professor", async ({
    page,
  }) => {
    await abrirComSessao(page, "aluno", "/professor/dashboard");
    await expect(page).toHaveURL(/\/aluno\/dashboard/);
  });

  test("sessão de aluno é desviada do painel de admin", async ({ page }) => {
    await abrirComSessao(page, "aluno", "/admin/dashboard");
    await expect(page).toHaveURL(/\/aluno\/dashboard/);
  });

  test("sem sessão, rota de admin vai para /entrar", async ({ page }) => {
    await page.context().clearCookies();
    await page.goto("/admin/dashboard");
    await expect(page).toHaveURL(/\/entrar\?unauthorized=1/);
  });
});

test.describe("Regressão — saudação do painel do professor", () => {
  /**
   * `Bom dia, Flávio.` estava escrito à mão no JSX (corrigido em 05/08/2026):
   * o professor lia "Bom dia" às 23h. Este teste calcula o período esperado no
   * fuso de Brasília — o mesmo contrato de `saudacaoBR` — e compara. Cravar o
   * fuso aqui importa porque em produção quem renderiza é o servidor, em UTC.
   */
  test("saudação corresponde ao período do dia em Brasília", async ({
    page,
  }) => {
    await abrirComSessao(page, "professor", "/professor/dashboard");

    const hora = Number(
      new Intl.DateTimeFormat("pt-BR", {
        timeZone: "America/Sao_Paulo",
        hour: "2-digit",
        hourCycle: "h23",
      }).format(new Date()),
    );
    const esperada =
      hora < 12 ? "Bom dia" : hora < 18 ? "Boa tarde" : "Boa noite";

    await expect(page.locator("h1").first()).toContainText(esperada);
  });
});
