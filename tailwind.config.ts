import type { Config } from "tailwindcss";

/**
 * Design System — Escola Flávio Milhomem
 *
 * Tokens derivados do Apêndice A do Guia de Desenvolvimento Web (v1.0).
 * Arquétipo: Sábio + Cuidador. Tom erudito acessível.
 * Paleta: tinta (azul-tinta) + dourado fosco + slate quente.
 *
 * NÃO altere as cores-base sem aprovação da Diana (mentoria estratégica).
 * Cada decisão visual aqui responde a uma decisão de essência do livro-guia.
 */
export default {
  content: [
    "./src/app/**/*.{ts,tsx,mdx}",
    "./src/components/**/*.{ts,tsx}",
    "./content/**/*.{md,mdx}",
  ],
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        // === Azul-tinta — cor primária institucional ===
        // Inspiração: tinta de caneta-tinteiro de cartório.
        // Uso: títulos, links, CTAs primários, footer institucional.
        tinta: {
          50: "#f3f5fa",
          100: "#e3e8f3",
          200: "#c1cce4",
          300: "#94a7d0",
          400: "#637bb6",
          500: "#3f5a9e",
          600: "#2a4485", // ← cor primária default
          700: "#1f3268",
          800: "#16234c",
          900: "#0f1734",
        },
        // === Dourado — cor de acento institucional ===
        // Inspiração: detalhe de capa de livro jurídico clássico.
        // Uso: separadores, ênfases, destaque editorial, ornamento de capa.
        dourado: {
          50: "#fdf9ec",
          100: "#faefcb",
          200: "#f5dd8e",
          300: "#efc650",
          400: "#e6ad26",
          500: "#cb8d12", // ← cor de acento default
          600: "#a36c0c",
          700: "#7e510b",
          800: "#5d3b0d",
          900: "#3f280c",
        },
        // === Slate — escala de cinza para corpo de texto ===
        // Tons mais quentes que slate Tailwind padrão; melhor leitura
        // em bloco longo de prosa jurídica.
        slate: {
          50: "#f8f8f6",
          100: "#eeede8",
          200: "#dcdacf",
          300: "#bdbaaa",
          400: "#94907d",
          500: "#6f6c5a",
          600: "#54513f",
          700: "#3e3b2e",
          800: "#28261e",
          900: "#15140f", // ← corpo de texto default
        },
        // === Vermelho institucional — somente para alerta/erro ===
        alerta: {
          400: "#ef6b73",
          500: "#dc4a52",
          600: "#b8323a",
        },
        // === Verde institucional — sucesso/confirmação ===
        sucesso: {
          400: "#7cd992",
          500: "#5dba73",
          600: "#3d9a55",
        },
        // === Aliases semânticos ===
        primary: "#2a4485",
        accent: "#cb8d12",
        background: "#fafaf7",
        foreground: "#15140f",
        muted: "#6f6c5a",
        border: "#dcdacf",
      },
      fontFamily: {
        // Newsreader — serifa de títulos e citações.
        // Família variável (peso 200-800), feita para tela.
        serif: [
          "var(--font-newsreader)",
          "Newsreader",
          "Source Serif 4",
          "Georgia",
          "Times New Roman",
          "serif",
        ],
        // Inter — sans para corpo, UI, microcopy.
        sans: [
          "var(--font-inter)",
          "Inter",
          "system-ui",
          "-apple-system",
          "BlinkMacSystemFont",
          "Segoe UI",
          "Helvetica",
          "Arial",
          "sans-serif",
        ],
        // JetBrains Mono — código jurídico (artigo, inciso, número).
        mono: [
          "var(--font-jetbrains-mono)",
          "JetBrains Mono",
          "Menlo",
          "Consolas",
          "monospace",
        ],
      },
      fontSize: {
        // Escala modular ratio 1.25 (terça menor)
        "display-1": [
          "clamp(2.5rem, 4vw + 1rem, 4rem)",
          { lineHeight: "1.1", letterSpacing: "-0.02em", fontWeight: "700" },
        ],
        "display-2": [
          "clamp(2rem, 3vw + 1rem, 3rem)",
          { lineHeight: "1.15", letterSpacing: "-0.015em", fontWeight: "700" },
        ],
        "heading-1": [
          "2.25rem",
          { lineHeight: "1.2", letterSpacing: "-0.01em", fontWeight: "700" },
        ],
        "heading-2": [
          "1.75rem",
          { lineHeight: "1.3", letterSpacing: "-0.005em", fontWeight: "700" },
        ],
        "heading-3": ["1.375rem", { lineHeight: "1.35", fontWeight: "600" }],
        "heading-4": ["1.125rem", { lineHeight: "1.4", fontWeight: "600" }],
        "body-lg": ["1.125rem", { lineHeight: "1.7" }],
        body: ["1rem", { lineHeight: "1.7" }],
        "body-sm": ["0.9375rem", { lineHeight: "1.65" }],
        caption: ["0.8125rem", { lineHeight: "1.5", letterSpacing: "0.01em" }],
        overline: [
          "0.75rem",
          {
            lineHeight: "1.4",
            letterSpacing: "0.08em",
            textTransform: "uppercase",
            fontWeight: "700",
          },
        ],
      },
      spacing: {
        // Tokens semânticos para arquitetura editorial.
        gutter: "1.5rem",
        stack: "2rem",
        section: "5rem",
        page: "8rem",
      },
      borderRadius: {
        sm: "0.25rem",
        md: "0.5rem",
        lg: "0.75rem",
        xl: "1rem",
        "2xl": "1.5rem",
        card: "0.75rem",
        pill: "9999px",
      },
      boxShadow: {
        subtle:
          "0 1px 2px 0 rgba(15, 23, 52, 0.04), 0 1px 3px 0 rgba(15, 23, 52, 0.06)",
        card: "0 4px 6px -1px rgba(15, 23, 52, 0.06), 0 2px 4px -2px rgba(15, 23, 52, 0.04)",
        elev: "0 10px 15px -3px rgba(15, 23, 52, 0.08), 0 4px 6px -4px rgba(15, 23, 52, 0.05)",
        modal: "0 25px 50px -12px rgba(15, 23, 52, 0.18)",
        "inset-focus": "inset 0 0 0 2px rgba(203, 141, 18, 0.5)",
      },
      maxWidth: {
        prose: "68ch",
        "prose-wide": "76ch",
        container: "1200px",
      },
      screens: {
        xs: "475px",
        sm: "640px",
        md: "768px",
        lg: "1024px",
        xl: "1280px",
        "2xl": "1536px",
      },
    },
  },
  plugins: [],
} satisfies Config;
