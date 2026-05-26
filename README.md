# Escola Flávio Milhomem — site

Repositório do site institucional, vitrine de cursos e plataforma do aluno
da **Escola Flávio Milhomem** — escola de direito criminal. Direito criminal pela perspectiva da acusação.

> *"O Promotor que te ensina o que o Promotor vê."*

Stack alinhada ao **Guia de Desenvolvimento Web v1.0** (Orbita Labs) e ao
**Checklist de Tecnologias mar/2026**:
Next.js 16.2 · React 19.2.4 · TypeScript 5.8 · Tailwind 4.1 · shadcn/ui ·
Prisma 7.5 · Neon serverless · jose + bcryptjs · Jest + RTL ·
Pagar.me · Resend · Cloudflare Stream · Vercel.

---

## Pré-requisitos

- **Node.js ≥ 20.x LTS** (definido em `.nvmrc`)
- **npm ≥ 10.x**

```bash
nvm use      # respeita .nvmrc
node -v      # confirme >= 20
```

---

## Setup inicial

```bash
# 1. Instalar dependências
npm install

# 2. Configurar variáveis de ambiente
cp .env.example .env.local
# preencha DATABASE_URL, AUTH_SECRET, etc.

# 3. Gerar cliente Prisma (lê schema.prisma)
npm run prisma:generate

# 4. Quando tiver banco Neon provisionado:
npm run prisma:migrate
```

`AUTH_SECRET` mínimo 32 chars — gerar com:

```bash
openssl rand -base64 48
```

---

## Scripts npm

| Script                 | Função                                            |
|------------------------|---------------------------------------------------|
| `npm run dev`          | Dev server (Next.js)                              |
| `npm run build`        | Build de produção                                 |
| `npm run start`        | Servir build de produção                          |
| `npm run lint`         | ESLint                                            |
| `npm run lint:fix`     | ESLint com autofix                                |
| `npm run typecheck`    | `tsc --noEmit`                                    |
| `npm run format`       | Prettier write                                    |
| `npm run format:check` | Prettier check (CI)                               |
| `npm test`             | Jest (unit + integration)                         |
| `npm run test:watch`   | Jest watch                                        |
| `npm run test:coverage`| Jest com coverage                                 |
| `npm run prisma:*`     | generate / migrate / studio                       |

---

## Estrutura de pastas

```
.
├── .github/workflows/ci.yml    CI (lint, typecheck, test, build, audit)
├── .vscode/                    Settings + extensions recomendadas
├── docs/
│   ├── README.md               Índice da documentação interna
│   └── adr/                    Architecture Decision Records
├── prisma/
│   ├── schema.prisma           Modelo de dados completo
│   └── migrations/             (geradas pelo Prisma)
├── public/
│   ├── llms.txt                AEO/GEO — Apêndice B do guia
│   ├── robots.txt              Apêndice C
│   └── images/                 (assets)
├── src/
│   ├── app/
│   │   ├── (marketing)/        Site institucional (route group)
│   │   ├── (aluno)/            Área logada (route group)
│   │   ├── api/                API Routes (auth, leads, orders, webhooks…)
│   │   ├── layout.tsx          Root layout + fontes + GTM
│   │   ├── globals.css         @theme com tokens do Design System
│   │   ├── error.tsx           Erro global
│   │   ├── not-found.tsx       404
│   │   ├── loading.tsx         Loading global
│   │   ├── sitemap.ts          Sitemap dinâmico
│   │   └── manifest.ts         Web App Manifest (PWA)
│   ├── components/
│   │   ├── ui/                 shadcn (auto-gerado)
│   │   ├── marketing/          Site institucional
│   │   ├── aluno/              Área logada
│   │   └── shared/             Header, Footer, etc.
│   ├── config/site.ts          Single source of truth de metadata
│   ├── hooks/                  React hooks customizados
│   ├── lib/
│   │   ├── prisma.ts           Cliente Prisma + adapter Neon
│   │   ├── auth/               jose JWT + bcryptjs
│   │   ├── pagarme/            Cliente Pagar.me (S5)
│   │   ├── resend/             E-mail transacional (S2)
│   │   ├── analytics/          Eventos GA4/PostHog
│   │   ├── business/           Lógica de negócio testável (cobertura 80%+)
│   │   └── utils.ts            Helpers genéricos (cn, slugify…)
│   ├── schemas/                Schemas Zod compartilhados
│   ├── stores/                 Stores Zustand
│   ├── styles/                 CSS extras
│   ├── types/                  Tipos compartilhados
│   └── middleware.ts           Auth + security headers
├── tests/
│   ├── unit/                   Jest + RTL
│   ├── integration/            Jest com Postgres descartável
│   └── e2e/                    Playwright (config separado)
├── tailwind.config.ts          Referência (tokens espelhados em @theme)
├── jest.config.js              + jest.setup.js
├── tsconfig.json
├── eslint.config.mjs
├── .editorconfig + .nvmrc + .prettierrc.json
└── .env.example                Variáveis necessárias
```

---

## Compliance e linhas vermelhas

Esta aplicação **suporta** uma operação que precisa observar três linhas
vermelhas absolutas (Cap 9 do livro-guia):

1. **Sem consultoria individual remunerada** — apenas aulas e mentorias
   coletivas didáticas.
2. **Sem escritório de advocacia como cliente, patrocinador ou parceiro
   comercial direto.**
3. **Sem patrocínio corporativo de entidade regulada/litigante em matéria
   criminal.**

Toda copy, landing, formulário, e-mail e peça de tráfego pago precisa passar
pela revisão da assessoria jurídica antes da veiculação. Não há atalhos.

---

## Segurança crítica em destaque

- **CVE-2025-29927 (Next.js < 16.0.7):** bypass de middleware. Projeto usa
  16.2.5 (mínimo seguro).
- **bcrypt trunca senhas > 72 bytes:** validação Zod obrigatória em
  `src/lib/auth/password.ts`. Nunca remova essa validação.
- **Neon `sql()` exige tagged templates:** SQL injection guard automático.
- **`AUTH_SECRET` mínimo 32 chars** — falha rápido se ausente.

---

## Próximos passos

Ver `docs/checklist-cronologico.md` (sprints S1–S24 do roadmap) — fundação,
pré-lançamento e lançamento.

---

## Links úteis

- Site (futuro): https://escolaflaviomilhomem.com.br
- Livro-Guia v1.2 (interno): [`docs/adr/livro-guia-flavio.md`](docs/adr/livro-guia-flavio.md)
- Guia Dev Web v1.0 (interno): `../docs/dev/guia-desenvolvimento-web.md`
