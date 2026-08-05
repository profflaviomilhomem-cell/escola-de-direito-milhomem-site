/**
 * Jest config — Seção 3.3 do Guia de Desenvolvimento Web.
 *
 * Camadas de teste:
 *   - tests/unit/         — lógica de negócio + componentes UI
 *   - tests/integration/  — rotas API com banco descartável
 *   - tests/e2e/          — Playwright (config separado, não roda aqui)
 *
 * Cobertura-alvo: 80%+ em src/lib/business/.
 */
/**
 * FUSO DOS TESTES — UTC, de propósito.
 *
 * A produção roda na Vercel em UTC; nós desenvolvemos em America/Sao_Paulo
 * (-03). Bug de fuso é invisível na máquina de quem escreve o código: um
 * `toLocaleDateString()` sem `timeZone` acerta em Brasília e erra no servidor.
 * Rodar a suíte em UTC faz o teste falhar aqui, na bancada, em vez de falhar
 * na frente do aluno. Definido antes de `next/jest` para que os workers já
 * nasçam com o TZ certo — depois da primeira leitura de data, não adianta.
 *
 * Verificado em 05/08/2026: as 33 suites (242 testes) passam em UTC; nenhuma
 * dependia do fuso local.
 */
process.env.TZ = "UTC";

const nextJest = require("next/jest");

const createJestConfig = nextJest({ dir: "./" });

const customJestConfig = {
  testEnvironment: "jsdom",
  setupFilesAfterEnv: ["<rootDir>/jest.setup.js"],
  moduleNameMapper: {
    "^@/(.*)": "<rootDir>/src/$1",
    "\\.(css|less|scss|sass)$": "identity-obj-proxy",
  },
  testPathIgnorePatterns: ["/node_modules/", "/.next/", "/tests/e2e/"],
  testMatch: [
    "<rootDir>/tests/unit/**/*.test.{ts,tsx}",
    "<rootDir>/tests/integration/**/*.test.{ts,tsx}",
    "<rootDir>/src/**/__tests__/**/*.test.{ts,tsx}",
  ],
  collectCoverageFrom: [
    "src/lib/**/*.{ts,tsx}",
    "src/components/**/*.{ts,tsx}",
    "!**/*.d.ts",
    "!**/node_modules/**",
  ],
  coverageThreshold: {
    "src/lib/business/": {
      branches: 80,
      functions: 80,
      lines: 80,
      statements: 80,
    },
  },
};

/**
 * `next/jest` resolve sua própria `transformIgnorePatterns` que exclui
 * `node_modules` do transform. Como `jose` é ESM-only e precisa ser
 * transformado, sobrescrevemos a lista após o config ser resolvido.
 */
module.exports = async () => {
  const config = await createJestConfig(customJestConfig)();
  return {
    ...config,
    transformIgnorePatterns: [
      "/node_modules/(?!jose/)",
      "^.+\\.module\\.(css|sass|scss)$",
    ],
  };
};
