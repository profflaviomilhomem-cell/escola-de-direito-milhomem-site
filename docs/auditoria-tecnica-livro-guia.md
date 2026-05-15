# Auditoria técnica e de produto — site × Livro-Guia v1.2

**Data:** 15 de maio de 2026  
**Fonte:** [`adr/livro-guia-flavio.md`](./adr/livro-guia-flavio.md)  
**Repositório:** `escola_de_direito_milhomem_site`

## Escopo desta auditoria

### Incluído

- Rotas, sitemap e objetivo de cada página
- Arquitetura (Next, Prisma, APIs, integrações)
- Funil de produto (lead → tripwire → cohort → área aluno)
- Compliance **estrutural** (páginas legais, avisos, separação institucional)
- SEO/AEO técnico (schema, sitemap, `llms.txt`, robots)
- Engenharia (CI, testes, auth, rate limit)

### Excluído (por decisão do projeto)

- **Identidade visual** — paleta, tipografia, logo, fotografia, motion estético, Figma/Storybook (Cap. 5.1–5.6, 5.10–5.13)
- **Copy e tom de voz** — PVU no hero, taglines, arquétipo Sábio/Cuidador na redação, variantes Instagram (Caps. 1.5, 1.7–1.8, 1.11 e textos de marketing já calibrados em `src/config/copy.ts`)

---

## Resumo executivo

| Dimensão | ✅ Pronto / sólido | 🟡 Parcial | 🔴 Ausente / bloqueador |
|----------|-------------------|------------|-------------------------|
| Stack e repo | 8 | 2 | 1 |
| Marketing (rotas + função) | 6 | 7 | 4 |
| Comercial (pagamentos) | 1 | 0 | 5 |
| Área aluno / LMS | 5 | 6 | 3 |
| CRM / e-mail | 3 | 2 | 4 |
| Analytics / LGPD técnico | 2 | 2 | 3 |
| SEO / AEO | 4 | 3 | 2 |

**Leitura:** a base de engenharia está madura para um lançamento em *seed*; o que impede vender o cohort é a **camada comercial** (checkout Pagar.me, produto no banco, iscas operacionais) e a **operação do evento-âncora** (inscrição + lista). A área aluno é um **protótipo funcional** (mock + progresso real parcial), não a plataforma final com Stream e fórum persistido.

---

## Cap. 1 — Essência (só produto e arquitetura)

| Requisito (guia) | Implementação | Status |
|------------------|---------------|--------|
| Escola em estado de **lançamento** (cohort inaugural, não “escola madura”) | Produto nomeado, datas 11/08 e set/2026 na landing e home | ✅ |
| Edição Lançamento como oferta principal | Rota `/cursos/edicao-lancamento`, vitrine, `llms.txt`, sitemap priority 1 | ✅ |
| Evento-âncora 11/08/2026 | Rota `/eventos/dia-do-advogado-2026` | 🟡 |
| Cinco superfícies do sitemap conceitual (1.12) | Home, Sobre, vitrine, blog, área aluno — todas existem | ✅ |
| Três linhas vermelhas (Cap. 9) como barreira de produto | `InstitutionalNotice`, páginas legais, sem fluxo de consultoria no site | ✅ |

---

## Cap. 3 — Personas e funil (mecânica, não copy)

| Etapa (guia 3.7) | Site | Status |
|------------------|------|--------|
| Isca gratuita + captura e-mail | `/newsletter`, `/calculadora-de-pena`, `/materiais/[slug]` | 🟡 |
| Tripwire R$ 297–497 | Sem produto/rota/checkout | 🔴 |
| Cohort Edição Lançamento | Landing + lista de espera; **sem checkout** | 🟡 |
| Comunidade recorrente R$ 97–147 | `ProductType.COMUNIDADE` + `Subscription` no Prisma; sem billing | 🔴 |
| UTM em captura | `POST /api/leads` grava `utmSource/Medium/Campaign` | ✅ |
| Segmentação por persona | Sem tags/segmentos no CRM | 🔴 |

**`/materiais/[slug]`:** placeholder — não liga a `LeadMagnet` no banco nem entrega PDF.

---

## Cap. 4 — Tecnologia e infraestrutura

### 4.1–4.2 Stack e arquitetura

| Item | Status |
|------|--------|
| Next.js App Router + TypeScript + Tailwind | ✅ |
| Prisma + Neon (schema completo) | ✅ |
| Auth JWT + cookies HttpOnly (`session.ts`, `proxy.ts`) | ✅ |
| CI (lint, typecheck, test, build) | ✅ |
| Route groups `(marketing)`, `(auth)`, `aluno`, `professor` | ✅ |

### 4.3 Player e vídeo

| Item | Status |
|------|--------|
| `Lesson.videoId` (Cloudflare Stream UID) no schema | ✅ |
| Player real Stream | 🔴 (`PlayerVideoMock`) |
| R2 para materiais frios | 🔴 (env preparado, sem uso) |

### 4.4 Fórum

| Item | Guia 4.8 / 5.9 | Site | Status |
|------|----------------|------|--------|
| Fórum geral | `/forum` | `/aluno/forum` | 🟡 mock |
| Fórum por aula | `/forum/aula/{slug}` | Aba “Fórum” na página da aula (mesma URL `/aluno/aulas/[slug]`) | 🟡 |
| Comentários aninhados persistidos | `Comment` + `parentId` no Prisma | UI mock; sem API de post | 🔴 |
| Moderação | `ModerationStatus` no schema | Não exposto | 🔴 |

### 4.5 Eduzz

| Item | Status |
|------|--------|
| Ponte transitória / produtos legados | Links genéricos `https://eduzz.com` na vitrine | 🔴 |
| `EDUZZ_API_KEY` no `.env.example` | ✅ preparado |

### 4.6 UTM Builder interno

| Item | Status |
|------|--------|
| Modelo `UTMEvent` | ✅ |
| UI/API para gerar links curtos | 🔴 |

### 4.7 Pagar.me

| Item | Status |
|------|--------|
| Variáveis `PAGARME_*` | ✅ `.env.example` |
| Checkout (cartão, PIX, boleto, 3DS) | 🔴 |
| Webhook → `Order` | 🔴 stub em `/api/webhooks/pagarme` |
| Assinatura recorrente | 🔴 schema only |
| Reembolso self-service área logada | 🔴 |
| Página `/checkout` (robots já prevê) | 🔴 |

### 4.8 URLs

| Rota (guia) | Existe | Observação |
|-------------|--------|------------|
| `/` | ✅ | |
| `/sobre` | ✅ | Linha do tempo, obras; **sem download CV PDF** |
| `/cursos` | ✅ | Vitrine estática |
| `/cursos/edicao-lancamento` | ✅ | ~10/14 blocos estruturais (6.5) |
| `/blog`, `/blog/{slug}` | ✅ | JSON migrado + Prisma opcional |
| `/eventos/dia-do-advogado-2026` | ✅ | Stub |
| `/newsletter` | ✅ | Duplo opt-in |
| `/materiais/{slug}` | 🟡 | Placeholder |
| `/contato` | 🟡 | E-mail/redes; **sem formulário** |
| `aluno.*/` subdomínio | ⚪ | `/aluno/*` no mesmo host (aceitável fase 1) |
| `/aluno`, `/cursos/{slug}`, `/aulas/{slug}` | ✅ | Paths `aulas` vs guia `aulas` alinhados |
| `/forum`, `/forum/aula/{slug}` | 🟡 | Fórum agregado + aba na aula |
| `/minha-conta`, `/certificados` | ✅ | Mock |
| `/certificado/[hash]` validação pública | 🔴 | Citado na UI, rota inexistente |

### 4.9 Tracking

| Item | Status |
|------|--------|
| GTM (`@next/third-parties`) | 🟡 carrega se `NEXT_PUBLIC_GTM_ID` — **sem gate de consentimento** |
| GA4 eventos (`lead_capture`, `cohort_purchase`, `lesson_*`) | 🟡 `lesson_*` na API de progresso; funil de compra ausente |
| Meta Pixel + LinkedIn + PostHog | 🟡 gated por env; sem consent |
| Meta CAPI server-side | 🔴 env preparado, não ligado ao webhook |
| Banner LGPD antes de analytics | 🔴 (privacidade descreve, UI não implementa) |

### 4.10 Segurança e LGPD

| Item | Status |
|------|--------|
| `/privacidade`, `/termos`, `/reembolso` | ✅ |
| Rate limit (Upstash) em login, register, leads, progress | ✅ |
| Prisma prepared statements | ✅ |
| Canal `privacidade@` em `siteConfig` | ✅ |
| Fluxo titular (exportar/apagar dados) | 🔴 |

---

## Cap. 5 — IA e blueprints (estrutura, sem visual)

### 5.7 Navegação

| Item | Status |
|------|--------|
| 5 itens: Sobre, Cursos, Blog, Eventos, Contato | ✅ `siteConfig.mainNav` |
| CTA “Entre na lista” | ✅ → `/newsletter` |

### 5.8 Páginas-chave (conteúdo estrutural)

| Página | Blocos do guia | Status |
|--------|----------------|--------|
| **Home** | PVU, prova social, 3 áreas, últimos artigos, newsletter, depoimentos | 🟡 `BlogSection` existe; depoimentos reais ausentes |
| **Sobre** | Biografia, linha do tempo, galeria livros, **CV PDF** | 🟡 sem PDF |
| **Cursos** | Edição destacada + Eduzz secundários | 🟡 Eduzz não linkados de verdade |
| **Edição Lançamento** (6.5) | 14 blocos | 🟡 ver tabela abaixo |
| **Blog** | Listagem, categorias, busca | 🟡 listagem; busca/filtro fracos |
| **Artigo** (6.4) | Article schema, OG, TOC | 🟡 Article JSON-LD; TOC parcial |
| **Evento** (7.7) | Programação, inscrição, streaming | 🔴 stub |
| **Newsletter** | Captura dedicada, duplo opt-in | ✅ |
| **Contato** | Formulário + prazo resposta | 🟡 sem form |

#### Landing cohort — 14 blocos (guia 6.5)

| # | Bloco | Status |
|---|--------|--------|
| 1 | Hero + vídeo + CTAs | 🟡 sem vídeo embed |
| 2 | Três pilares | ✅ |
| 3 | Sobre Flávio (mini) | 🟡 link para `/sobre` apenas |
| 4 | Para quem é / não é | ✅ |
| 5 | Ementa accordion | 🟡 lista, não accordion |
| 6 | Cronograma | ✅ |
| 7 | Como funciona | ✅ |
| 8 | Convidados | ⚪ N/A lançamento (guia) |
| 9 | Materiais inclusos | 🔴 |
| 10 | Depoimentos / pares | 🔴 |
| 11 | Investimento + checkout | 🟡 preços; sem pagamento |
| 12 | FAQ (10 perguntas) | 🟡 4 itens |
| 13 | Garantia reforçada | 🟡 dentro do bloco 11 |
| 14 | CTA final + vagas reais | 🟡 lista de espera; sem contador real |

### 5.9 Área do aluno

| Recurso | Status |
|---------|--------|
| Dashboard (progresso, próxima aula, fórum recente) | 🟡 mock |
| Curso com módulos e status da aula | 🟡 mock |
| Player + abas resumo/materiais/fórum | 🟡 mock player |
| Progresso persistido | ✅ `UserLessonProgress` + API |
| Minha conta (dados, faturas, assinaturas) | 🟡 mock |
| Certificado emitido + validação pública | 🔴 UI mock; rota `/certificado/[hash]` ausente |

---

## Cap. 6 — Presença digital (engenharia)

| Item | Status |
|------|--------|
| Repo privado + PR + CI | ✅ (assumido GitHub) |
| Testes unitários (`lesson-progress`, auth, dosimetria) | 🟡 |
| Testes e2e Playwright | 🔴 pasta `.gitkeep` |
| Blog migrado WordPress → JSON/Prisma | ✅ |
| Calculadora Ap. I + captura opcional | ✅ |
| Pipeline e-mail 5 mensagens (7 / guia) | 🔴 só confirmação newsletter |
| `EmailCampaign` no Prisma | ✅ sem disparador |
| Atendimento / SLA 3 dias (6.14) | 🟡 e-mail estático em contato |

---

## Cap. 7 — Crescimento (o que vive no site)

| Item | Status |
|------|--------|
| Lista de e-mail como ativo #1 | ✅ infra leads |
| Landing evento + inscrição gratuita | 🔴 |
| Sitemap com posts dinâmicos | 🔴 estático |
| SEO local DF | ⚪ conteúdo, não feature |
| Consulta CSMPDFT | ⚪ processo, não código |

---

## Cap. 8 — Métricas

| Item | Status |
|------|--------|
| PostHog / product analytics | 🟡 client init |
| Web Vitals reporter | ✅ |
| Funil compra mensurável | 🔴 |
| Dashboard métricas professor | 🟡 página mock |

---

## Cap. 9 — Compliance (estrutural)

| Requisito | Status |
|-----------|--------|
| Sem consultoria de caso / sem escritório cliente / sem patrocínio | ✅ avisos + ausência de fluxos |
| Escola ≠ MP na operação (páginas legais + notice) | ✅ |
| Magistério separado (texto institucional em `/sobre`) | ✅ |
| Revisão jurídica de peças | ⚪ processo |

---

## Apêndices técnicos

| Apêndice | Status |
|----------|--------|
| **F** — `llms.txt`, `robots.txt` | ✅ alinhados ao guia |
| **I** — Calculadora de pena | ✅ + API |
| **D** — Schema Person/Article | 🟡 Person na home; Article no blog; `sameAs` incompleto (Scholar/Amazon) |
| **G** — tokens Tailwind | ✅ (fora do escopo desta auditoria) |
| **H** — Template depoimentos | 🔴 |

---

## Matriz de prioridades (somente técnico/produto)

### P0 — Bloqueia receita e lançamento

1. **Checkout Pagar.me** — página, criação de `Order`, webhook, acesso ao curso pós-`PAID`
2. **Seed `Product` `edicao-lancamento`** no Prisma (preço, slug, tipo `COHORT`)
3. **Landing evento** — formulário inscrição → `/api/leads` + confirmação
4. **Cookie consent** antes de GTM/Pixel/PostHog (4.9 + LGPD)
5. **Iscas `/materiais/*`** — `LeadMagnet` no DB + download pós opt-in

### P1 — Completa o funil e a plataforma

6. Completar blocos 9–12 da landing cohort (materiais, FAQ 10, vídeo)
7. **Cloudflare Stream** no player (substituir mock)
8. API de **comentários** no fórum (Prisma `Comment`)
9. **Sitemap dinâmico** com slugs do blog
10. **Formulário `/contato`** com persistência ou e-mail via Resend
11. Rota pública **`/certificado/[hash]`**
12. Sequência Resend pós opt-in (5 e-mails — guia 7)

### P2 — Escala pós-lançamento

13. UTM Builder (UI + `UTMEvent`)
14. Assinatura comunidade (Pagar.me subscription)
15. Tripwire como `ProductType.TRIPWIRE`
16. Meta CAPI no webhook
17. E2e Playwright (login, lead, compra sandbox)
18. Links Eduzz reais ou migração de catálogo

---

## Referência cruzada

- Auditoria anterior (incluía copy/visual): [`auditoria-livro-guia.md`](./auditoria-livro-guia.md)  
- Checklist operacional: [`checklist-cronologico.md`](./checklist-cronologico.md)  
- Livro-Guia: [`adr/livro-guia-flavio.md`](./adr/livro-guia-flavio.md)

**Próxima revisão:** após fechar P0.1–P0.3 ou integração Pagar.me em sandbox.
