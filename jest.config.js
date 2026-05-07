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

module.exports = createJestConfig(customJestConfig);
