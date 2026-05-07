# Changelog

Formato baseado em [Keep a Changelog](https://keepachangelog.com/pt-BR/1.1.0/).

## [Não publicado]

### Adicionado — Sprint 1 · Fundação

- Scaffold Next.js 16.2.5 + React 19.2.4 + TS 5.8 + Tailwind 4.1
- Stack completa do checklist mar/2026 (Zustand, RHF+Zod, Prisma+Neon
  serverless, jose+bcryptjs, lucide, sonner, recharts, web-vitals,
  date-fns, @next/third-parties)
- Jest + React Testing Library configurados (TDD)
- Design System em CSS-first (`@theme` em `globals.css`) + tokens espelhados
  em `tailwind.config.ts`
- Estrutura de route groups `(marketing)` e `(aluno)`
- Páginas placeholder: home, sobre, cursos, blog, newsletter, contato,
  evento Dia do Advogado 2026, calculadora de pena, privacidade, materiais,
  dashboard, aulas, fórum, minha conta, certificados
- API Routes: `/api/leads` (com Zod), `/api/webhooks/pagarme` (stub)
- `src/lib/auth/jwt.ts` (jose), `src/lib/auth/password.ts` (bcrypt + 72 bytes)
- `src/lib/prisma.ts` com adapter Neon serverless
- `src/middleware.ts` com proteção de rotas + security headers
- Schema Prisma completo (User, Product, Order, Subscription, Lesson,
  Comment, LeadMagnet, Lead, EmailCampaign, UTMEvent)
- `public/llms.txt` (AEO/GEO) + `public/robots.txt`
- Sitemap dinâmico + Web App Manifest
- ADR 0001 (stack) + ADR 0002 (DS CSS-first)
- CI GitHub Actions: lint, typecheck, format check, test, audit, build
- README, CONTRIBUTING, CHANGELOG, .editorconfig, .nvmrc, .prettierrc,
  .vscode (settings + extensions recomendadas)
- `.env.example` com todas variáveis necessárias
