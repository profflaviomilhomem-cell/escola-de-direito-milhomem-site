import { z } from "zod";

/**
 * Desliga o JIT do Zod **no navegador**, e só nele.
 *
 * ## O que estava acontecendo
 *
 * A CSP em Report-Only registrava, em **17 de 17 rotas de produção**, a mesma
 * violação: *"Evaluating a string as JavaScript violates … 'unsafe-eval' is not
 * an allowed source"*. A origem, rastreada pela localização da mensagem de
 * console até o chunk servido, é o **Zod** (4.4.3): ele compila os schemas com
 * o construtor `Function` para ganhar velocidade, e antes disso **sonda** se a
 * página permite, com um `try { new Function("") } catch {}`.
 *
 * O `catch` engole a exceção — o site nunca quebrou e não quebraria sob CSP
 * bloqueando: o Zod cai sozinho no caminho interpretado. Mas o browser dispara
 * `securitypolicyviolation` **antes** do `catch`, então a sonda gera um
 * relatório por página, para sempre. O próprio fonte do Zod diz isso:
 * *"Skip the probe under `jitless`: strict CSPs report the caught
 * `new Function`"* (`v4/core/util.cjs`).
 *
 * ## Por que só no cliente
 *
 * `jitless` custa performance de validação. No **servidor** não há CSP, o JIT
 * funciona e o ganho é real — desligar lá seria pagar sem receber nada. No
 * **navegador**, sob a CSP, o JIT nunca ia funcionar de qualquer forma: a
 * escolha é entre cair no caminho lento em silêncio ou cair no caminho lento
 * gritando. Escolhemos o silêncio.
 *
 * ## Consequência prática
 *
 * Com isto, `/api/csp-report` deixa de receber a única violação recorrente da
 * política — o que transforma "promover a CSP a enforcing" de aposta em
 * decisão com evidência.
 *
 * Importado por `client-providers.tsx`, que envolve todas as páginas.
 */
if (typeof window !== "undefined") {
  z.config({ jitless: true });
}
