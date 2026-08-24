/**
 * Registra os matchers do jest-dom (`toBeInTheDocument`, `toBeDisabled`, …)
 * para o TypeScript.
 *
 * O `jest.setup.js` já faz `require("@testing-library/jest-dom")` em tempo de
 * execução — por isso os testes PASSAM. Mas ele é um arquivo `.js` que o
 * compilador nunca lê, então, para o `tsc`, `expect(...)` continuava sem esses
 * matchers e o typecheck quebrava no primeiro teste de componente do projeto
 * (24/08/2026, o painel de iniciar lançamento).
 *
 * Este import existe só pelo efeito colateral: o pacote declara os matchers no
 * namespace global do Jest. Sem ele, todo teste de componente novo precisaria
 * repetir o import — e o erro só apareceria no `tsc`, não no Jest, que é a
 * pior combinação para descobrir tarde.
 */
import "@testing-library/jest-dom";
