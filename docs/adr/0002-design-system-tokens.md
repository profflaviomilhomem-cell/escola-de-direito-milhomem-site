# ADR 0002 — Design System em CSS-First com Tailwind v4 `@theme`

**Status:** Aceito
**Data:** 07/05/2026
**Referência:** Guia de Desenvolvimento Web v1.0, Apêndice A; livro-guia Cap 5

## Contexto

Tailwind v4 mudou o paradigma de configuração de tokens de
`tailwind.config.{ts,js}` para CSS-first via diretiva `@theme` em
`globals.css`. O Apêndice A do guia entrega `tailwind.config.ts` como
referência literal, mas não é obrigatório usá-lo.

## Decisão

Usar **CSS-first via `@theme`** em `src/app/globals.css` como **fonte de
verdade dos tokens**. Manter `tailwind.config.ts` na raiz por dois motivos
operacionais:

1. **shadcn/ui** ainda lê `tailwind.config.ts` para gerar componentes.
2. **Documentação cruzada** — facilita a leitura do projeto por quem chega
   pelo guia, que usa o config como referência.

Os tokens em ambos arquivos são espelhados manualmente. Quando a Tailwind
oferecer ferramenta de geração mútua, automatizar.

## Consequências

- Tema vive em CSS próximo ao consumo, sem build extra do JS.
- Re-tema (dark mode futuro) se faz por sobrescrita de variáveis CSS.
- Atenção: alterar token em apenas um dos arquivos cria drift. Toda mudança
  precisa atualizar **os dois**.
