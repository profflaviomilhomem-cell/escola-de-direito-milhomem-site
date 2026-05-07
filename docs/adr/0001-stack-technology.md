# ADR 0001 — Escolha da Stack Tecnológica

**Status:** Aceito
**Data:** 07/05/2026
**Decisores:** Carlos (Orbita Labs), Diana (Orbita Labs)
**Referência:** Guia de Desenvolvimento Web v1.0, Seção 3 (Checklist de Tecnologias mar/2026)

## Contexto

A Escola Flávio Milhomem é o primeiro lançamento absoluto de uma escola digital
de Direito Penal pela perspectiva da acusação, com cohort fundador previsto
para setembro de 2026 e evento-âncora em 11 de agosto de 2026.

A operação precisa rodar em três camadas: site institucional + plataforma de
curso autenticada + backend/CRM próprio. Sem lock-in em SaaS terceirizado.

## Decisão

Adotamos integralmente o **CHECKLIST DE TECNOLOGIAS — ATUALIZADO 2026** da
Orbita Labs, alinhado a:

- **Next.js 16.2.x** (App Router) — pós CVE-2025-29927 e CVE-2025-66478
- **React 19.2.4+** — pós CVE-2025-55182 (CVSS 10.0) e CVE-2026-23864
- **TypeScript 5.8** + **Tailwind 4.1** + **shadcn/ui**
- **Jest + React Testing Library** (não Vitest) — alinhamento com checklist
- **Zustand** para estado, **React Hook Form + Zod** para formulários
- **Prisma 7.5 + Neon PostgreSQL serverless** (driver v1.0+ com SQL-injection
  guard)
- **`jose` 6.2.2+ + `bcryptjs` 3.0.3** para auth — não Auth.js/NextAuth
- **`@next/third-parties` (GoogleTagManager)** — não react-gtm-module legado
- **lucide-react** (não react-icons), **sonner** (toasts), **recharts**
- **WeasyPrint ou Puppeteer** para PDF (calculadora de pena)

## Consequências

### Positivas

- Stack 100% moderna, sem CVEs conhecidos críticos.
- Padrão Orbita capitalizado — equipe não precisa aprender ferramentas novas.
- SSR + ISR nativos do Next.js 16 = SEO/Core Web Vitals no chão desde o
  primeiro deploy.
- Auth com `jose` é portável e não amarra a Auth.js (que tem release cycle
  mais lento).
- Banco serverless via Neon escala automaticamente; ideal para tráfego
  irregular de cohort + pico de evento.

### Negativas / riscos

- **Pagar.me sprint dedicada** (S5) — primeira vez da equipe com a API.
- **bcryptjs trunca senhas > 72 bytes** — mitigado por validação Zod
  obrigatória no formulário e no servidor (ver `src/lib/auth/password.ts`).
- **Tailwind 4** ainda jovem — alguns plugins de ecossistema podem precisar
  de ajustes (compensa pela performance e CSS-first via `@theme`).
- **Neon `sql()` só aceita tagged templates** — proteção contra SQL injection,
  mas exige educação da equipe.

## Alternativas consideradas

- **Auth.js (NextAuth) v5** — descartado por overhead em uso simples
  (e-mail+senha + magic link). `jose` direto é menor, mais auditável e
  alinha com o checklist da Orbita.
- **Vitest** — preterido em favor de Jest + RTL para alinhar com o checklist.
- **WordPress + Elementor** (stack dominante dos concorrentes) — descartado.
  Auditoria do livro-guia (Seção 2.3.1) mostra que sair desse padrão é
  diferencial competitivo verificável (LCP, CLS, TTI).
