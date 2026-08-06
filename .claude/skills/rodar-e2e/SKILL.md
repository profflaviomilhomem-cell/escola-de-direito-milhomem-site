---
name: rodar-e2e
description: Roda e interpreta a suíte de testes deste projeto — 48 testes e2e do Playwright e a suíte Jest. Use ao rodar testes, investigar teste que falha, escrever teste novo de e2e, ou antes de um deploy. Cobre as três armadilhas específicas daqui — o Chromium do Playwright não baixa nesta máquina, `playwright test` sai 0 mesmo com teste falhando, e o Jest quebra sozinho sob paralelismo.
---

# Testes deste projeto

Duas suítes: **Playwright** (48 testes e2e, 5 arquivos) e **Jest** (unidade).

## ⛔ A suíte e2e é somente leitura

`DATABASE_URL` aponta para o **Neon de produção**. Os testes navegam e leem;
**nenhum escreve**. Ao criar teste novo, manter a regra: nada de cadastro que
persista, pedido, upload ou mutação. Se o cenário exigir escrita, parar e
combinar com o Carlos antes.

## Rodar

```bash
npm run test:e2e            # 48 testes
npm run test:e2e:ui         # modo UI, para investigar
npx playwright test --list  # listar sem executar
npx playwright test tests/e2e/area-logada.spec.ts
npx playwright test -g "trecho do nome"
```

Não precisa subir servidor: o `webServer` do `playwright.config.ts` levanta
`npm run dev` na **3055** com `NEXT_OPEN=0`. Se já houver dev rodando na 3055,
ele reaproveita (`reuseExistingServer` fora de CI).

## ⛔ Ler o resultado, não o exit code

`playwright test` já saiu **0 com 29 testes falhando** neste projeto. Pior:
mandar para um pipe (`| tail`) substitui `$?` pelo status do último comando e
mascara a falha de vez.

Ler sempre a **linha de sumário** — `N passed`, `N failed` — e conferir se
`N passed` bate com o total esperado (**48**). Só declarar verde com o número
na mão.

## As três armadilhas da casa

### 1. Chromium do Playwright não baixa nesta máquina

O CDN entrega ~1,5 MB e trava — isso deixou a suíte parada de 31/07 a 05/08/2026.
O `playwright.config.ts` contorna: fora de CI, se
`/Applications/Google Chrome.app` existir, usa o **Chrome do sistema** via
`channel: "chrome"`. Em CI, o `playwright install chromium` roda normal.

Se der erro de browser ausente, **não** insistir em `npx playwright install` —
conferir se o Chrome do sistema está no caminho esperado.

### 2. Corrida de hidratação em formulário

Contra `next dev`, o Playwright pode clicar antes do React anexar os handlers;
aí o `<button type="submit">` dispara o **submit GET nativo** e o teste falha
por um bug que só existe em teste. `networkidle` não resolve — hidratar é CPU
depois da rede aquietar.

Usar sempre os helpers de `tests/e2e/helpers.ts`:

```ts
import { gotoHydratedForm, waitForHydration } from "./helpers";

const form = await gotoHydratedForm(page, "/cadastro");
```

Eles esperam as chaves `__reactProps$`/`__reactFiber$` no nó do DOM.

### 3. Jest quebra sozinho sob paralelismo

`npm test` sai 1 com **SIGSEGV** em worker, e **a suíte que falha muda a cada
run** — passa isolada. Não é o código.

```bash
npm test -- --runInBand    # ← árbitro. 242/242 verde em 05/08/2026
```

Só tratar falha de Jest como real se ela sobreviver ao `--runInBand`.

A suíte roda em **`TZ=UTC` de propósito** — a Vercel renderiza em UTC e o
público lê em `America/Sao_Paulo`. Teste de data/hora que rode no fuso de quem
escreve não testa fuso. Datas passam por `src/lib/data-br.ts`.

## Testar área logada

Cookie dev-only `fm_dev_role` (`src/lib/auth/dev-session.ts`), desligado quando
`NODE_ENV === "production"`:

| Valor                  | Sessão                               |
| ---------------------- | ------------------------------------ |
| `aluno` ou `1`         | Rafael Andrade — `user_rafael_mock`  |
| `professor` ou `admin` | Flávio Milhomem — `user_flavio_mock` |

```ts
await context.addCookies([
  { name: "fm_dev_role", value: "aluno", url: "http://localhost:3055" },
]);
```

Os usuários são **fake**: não existem no banco. `PATCH` de progresso devolve
**503** por FK — isso é esperado, não é bug.

Guard: aluno que entra em `/professor` é mandado para `/aluno/dashboard`, **de
propósito** — não é falha de segurança. Asserção que espera `/entrar` está errada.

## Escrever teste novo

- Arquivo em `tests/e2e/*.spec.ts`; formulário sempre via `gotoHydratedForm`.
- Rota repetitiva vira **loop parametrizado** — é assim que 23 blocos `test()`
  literais viram 48 testes.
- Nunca escrever no banco.
- Rodar `--list` depois, e conferir que o total subiu como esperado.

## Antes de declarar verde

```bash
npm run typecheck
npm run lint
npm test -- --runInBand
npm run test:e2e
```

Colar o sumário de cada um. Sem número, não é verde — é esperança.
