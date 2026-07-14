import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  {
    files: [
      "jest.config.js",
      "jest.setup.js",
      "tests/**/*.{js,ts}",
      "scripts/**/*.{js,mjs,ts}",
    ],
    rules: {
      "@typescript-eslint/no-require-imports": "off",
    },
  },
  {
    files: ["scripts/migrate-blog.ts"],
    rules: {
      "@typescript-eslint/no-explicit-any": "off",
    },
  },
  {
    rules: {
      "@typescript-eslint/no-unused-vars": [
        "warn",
        {
          argsIgnorePattern: "^_",
          varsIgnorePattern: "^_",
          caughtErrorsIgnorePattern: "^_",
        },
      ],
    },
  },
  // Override default ignores of eslint-config-next.
  globalIgnores([
    // Default ignores of eslint-config-next:
    ".next/**",
    "out/**",
    "build/**",
    "next-env.d.ts",
    // Protótipos de dev — gitignored, trabalho local descartável (não lintar).
    "src/app/dev/mockups/**",
  ]),
]);

export default eslintConfig;
