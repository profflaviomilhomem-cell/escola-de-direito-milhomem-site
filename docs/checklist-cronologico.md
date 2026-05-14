#
 Checklist cronológico de execução — Escola Flávio Milhomem

**Documento operacional · ordem de execução fase por fase**

Alinhado ao roadmap em 24 sprints do **Livro-Guia v1.2** (Cap 8.8) e ao
**Guia de Desenvolvimento Web v1.0** (Seção 21). Boas práticas embutidas:
TDD, code review, CI antes de feature, deploy progressivo,
defesa em profundidade, separação de ambientes, observabilidade.

> Cada item é um *checkbox*. Marque conforme avança.
> Itens em **negrito** são bloqueadores das fases seguintes.
> A coluna entre colchetes `[S?]` indica a sprint do roadmap.

---

## Fase 0 — Pré-requisitos (antes de qualquer linha de código)

Sem essa fase, nada das seguintes pode rodar com segurança.

### 0.1 Ambiente local

- [ ] Node.js ≥ 20 LTS instalado (`nvm install 20 && nvm use`)
- [ ] npm ≥ 10 (`npm install -g npm@latest` se precisar)
- [ ] Editor com extensões recomendadas (`.vscode/extensions.json`)
- [ ] Git configurado com nome e e-mail correto
- [ ] Acesso ao repositório privado da Orbita Labs (chave SSH cadastrada)

### 0.2 Contas externas (uma por uma, antes de qualquer integração)

- [ ] **GitHub** — repo privado criado, branch `main` protegida
- [ ] **Vercel** — time da Orbee, projeto linkado ao repo
- [ ] **Neon Postgres** — projeto criado, branch `main` + `dev`
- [ ] **Pagar.me** — cadastro CNPJ iniciado, KYC em andamento
- [ ] **Resend** — domínio verificado (SPF/DKIM/DMARC ok)
- [ ] **Cloudflare** — conta criada, Stream + R2 habilitados
- [ ] **GTM** — container `GTM-XXXXXXX` criado
- [ ] **Sentry** — projeto Next.js criado (DSN copiado)
- [ ] **Upstash Redis** — banco serverless criado (rate limiting)
- [ ] **PostHog** — VPS Hetzner provisionada (auto-hospedado)

### 0.3 Compliance institucional (paralelo ao 0.2)

- [ ] **Consulta formal ao CSMPDFT protocolada** (Cap 9.7 do livro-guia)
- [ ] Comunicação à Corregedoria do MPDFT sobre magistério arquivada
- [ ] Assessoria jurídica designada (revisa peças antes de veiculação)
- [ ] DPO nomeado (advogado externo, não o Flávio)
- [ ] Contrato de operador LGPD com cada fornecedor terceirizado

---

## Fase 1 — Fundação técnica · sprints **S1–S2** (semanas 1-4)

Objetivo: site institucional no ar com identidade, blog vazio, captura de
lead funcionando, CI verde.

### 1.1 Setup do repositório (✅ concluído nesta execução)

- [x] `npx create-next-app@latest` (Next 16.2.5 + React 19.2.4 + TS + Tailwind 4)
- [x] Stack completa do checklist mar/2026 instalada
- [x] Estrutura de pastas seguindo boas práticas (route groups, ADR, docs)
- [x] `tailwind.config.ts` + `globals.css` com tokens do Design System
- [x] Jest + React Testing Library configurados
- [x] `.editorconfig`, `.nvmrc`, `.prettierrc`, `.vscode/`
- [x] `.env.example` com todas variáveis necessárias
- [x] CI GitHub Actions (`lint, typecheck, format:check, test, audit, build`)
- [x] ADR 0001 (stack) + ADR 0002 (DS CSS-first)
- [x] Schema Prisma inicial completo
- [x] `public/llms.txt` + `public/robots.txt` (Apêndices B e C do guia)
- [x] `src/lib/auth/jwt.ts`, `password.ts`, `session.ts`
- [x] `src/proxy.ts` com proteção de `/aluno`
- [x] Layout raiz com fontes Newsreader/Inter/JetBrains via `next/font`
- [x] **Build verde** — 20 rotas geradas, typecheck e Jest passando

### 1.2 Marca e identidade visual

- [ ] Decisão final sobre domínio principal (Cap 4.12 do livro-guia)
- [ ] Registrar três variantes em Registro.br
- [ ] Logo definitivo entregue pelo design (Figma)
- [ ] Substituir foto institucional placeholder por sessão profissional
- [x] Paleta institucional navy/mostarda aplicada (commit `90c20c7`)
- [x] Fontes proprietárias subsetadas (Hiragino Maru Gothic latin + League Spartan, commits `90c20c7` e `4e9d222`)
- [x] Capa de dossiê em papel kraft real para landing institucional (commit `0d5e4e3`)
- [x] Favicon dinâmico via `src/app/icon.tsx` (32×32, ImageResponse navy/mostarda)
- [x] Apple touch icon dinâmico via `src/app/apple-icon.tsx` (180×180, monograma "FM")
- [x] `src/app/manifest.ts` aponta para `/icon` e `/apple-icon` com cores institucionais
- [x] OG default 1200×630 dinâmico via `src/app/opengraph-image.tsx` (file-based, sobrescreve manual)

### 1.3 Conteúdo institucional inicial

- [ ] Texto da home aprovado por Diana (mentoria estratégica)
- [x] Página `/sobre` com biografia placeholder (2 parágrafos com identidade navy/mostarda; 3-4 parágrafos finais aguardam aprovação editorial)
- [x] Esqueleto de Política de Privacidade em 10 seções LGPD (`src/app/(marketing)/privacidade/page.tsx`) — texto aguarda redação final pela assessoria jurídica
- [x] Esqueleto de Termos de Uso em 9 seções (`src/app/(marketing)/termos/page.tsx`)
- [x] Esqueleto de Política de Reembolso (15 dias incondicionais + pro-rata pós-prazo em `src/app/(marketing)/reembolso/page.tsx`)
- [x] Componente compartilhado `src/components/marketing/legal-page.tsx` para manter as 3 páginas em consistência editorial
- [x] Footer com links para Privacidade, Termos e Reembolso

### 1.4 Captura de lead funcional ponta a ponta

- [x] Formulário `/newsletter` com React Hook Form + Zod (`src/components/marketing/newsletter-form.tsx`) — estados idle/submitting/success/error, mensagens inline, honeypot anti-bot
- [x] Endpoint `/api/leads` com Zod servidor-side, idempotência, rate-limit Upstash (no-op em dev) e disparo do duplo opt-in
- [x] E-mail de confirmação branded em `src/lib/resend/templates/confirm-newsletter.ts` (paleta navy/mostarda, HTML + texto)
- [x] Endpoint `/api/leads/confirm` valida JWT (TTL 48h, issuer dedicado) e marca `doubleOptInAt`
- [x] Página `/newsletter/confirmado` com 4 estados (ok / inválido / não encontrado / erro)
- [ ] CRM dashboard interno mínimo: lista, filtros, exportação CSV (depende da auth admin da Fase 2)
- [x] Testes e2e (Playwright): `newsletter.spec.ts` (formulário, sucesso, 429, estados de `/newsletter/confirmado`) + `auth.spec.ts` (redirect sem cookie de `/aluno` e `/professor` para `/entrar`)

### 1.5 Tracking baseline

- [x] GTM container condicional (`@next/third-parties/google`) — ativa só se `NEXT_PUBLIC_GTM_ID` estiver presente
- [x] Helper único `src/lib/analytics/track.ts` empurra para `dataLayer` (GTM/GA4) e PostHog
- [x] Evento `lead_capture` disparado pelo formulário de newsletter ao confirmar inscrição
- [x] Meta Pixel client-side em `src/components/shared/analytics-providers.tsx` — gated por `NEXT_PUBLIC_META_PIXEL_ID`
- [x] LinkedIn Insight Tag — gated por `NEXT_PUBLIC_LINKEDIN_PARTNER_ID`
- [x] Web Vitals via `next/web-vitals` em `src/components/shared/web-vitals-reporter.tsx`, com `sendBeacon` para `/api/metrics` + push paralelo no `dataLayer` (`event: web_vital`)
- [x] PostHog client-side com autocapture/pageleave gated por `NEXT_PUBLIC_POSTHOG_KEY`
- [ ] Validação em produção com IDs reais (depende da Fase 0.2 — contas externas)
- [ ] Vercel Analytics (a habilitar quando o projeto estiver linkado no painel)

### 1.6 Disciplina de PR (vale para todas as fases seguintes)

> Boas práticas não negociáveis a partir daqui:

- [ ] Branch separada por feature (`feature/{ticket}-descricao`)
- [ ] PR com checklist preenchido + descrição clara
- [ ] CI verde antes de pedir review
- [ ] Pelo menos 1 reviewer da Orbita Labs
- [ ] Squash merge para histórico limpo
- [ ] Preview deploy testado manualmente antes do merge
- [ ] Conventional Commits em **toda** mensagem

---

## Fase 2 — Auth e plataforma do aluno (esqueleto) · **S3–S4** (semanas 5-8)

Objetivo: aluno consegue se cadastrar, fazer login, ver dashboard mock.

**Status:** fluxo principal de auth, recuperação de senha, área `/aluno` e e2e de proteção implementados no repositório. Pendência explícita: magic link opcional (Resend).

### 2.1 Cadastro e login

- [x] Endpoint `/api/auth/register` com Zod + bcrypt + rate limit Upstash
- [x] Endpoint `/api/auth/login` com bcrypt verify + JWT (`jose`)
- [x] Cookie HttpOnly + SameSite=Lax + Secure em produção (`src/lib/auth/session.ts`)
- [ ] Magic link opcional via Resend
- [x] **Validação 72 bytes** no Zod (`src/schemas/auth.ts`), em `hashPassword` (`src/lib/auth/password.ts`) e testes em `tests/unit/auth/schemas.test.ts`
- [x] Recuperação de senha: `POST /api/auth/forgot` + `POST /api/auth/reset`, páginas `/esqueci-senha` e `/recuperar-senha` (fluxo completo; e-mail depende do Resend na Fase 0.2)
- [x] Logout limpa cookie (`POST /api/auth/logout` → `clearSessionCookie`)

### 2.2 Proteção de rotas

- [x] `src/proxy.ts` redireciona não-autenticado de `/aluno/*` e `/professor/*` para `/entrar` (com `unauthorized` + `from`)
- [x] SSR também valida no `src/app/aluno/layout.tsx` (defesa em profundidade)
- [x] Testes Jest cobrem `verifySession` (token válido, expirado, adulterado, issuer/secret errado) em `tests/unit/auth/jwt.test.ts`
- [x] E2E Playwright (`tests/e2e/auth.spec.ts`) valida redirect sem cookie a partir de `/aluno/dashboard` e `/professor/dashboard`

### 2.3 Dashboard básico

- [x] Saudação personalizada (lê `session.name` em `src/app/aluno/dashboard/page.tsx`)
- [x] Cards/linhas: progresso, próxima aula, fórum em alta, anúncios (dados mock em `src/data/mock-aluno.ts`)
- [x] Componentes shadcn no dashboard — `Card`, `Button`, `Avatar`, `Progress` em `src/components/ui/`; faixa de métricas + `DashboardRow` (CTAs e setas de scroll); hero com `Progress` (init `npx shadcn@latest init -d`, deps `radix-ui`, `class-variance-authority`, `tw-animate-css`)

### 2.4 Página `/minha-conta`

- [x] Atualização de nome e e-mail (`UpdateProfileForm` + `POST /api/auth/update-profile`)
- [x] Troca de senha (`UpdatePasswordForm` + `POST /api/auth/update-password`, Zod 72 bytes)
- [x] Histórico de pedidos (lista com `mockOrders` até Pagar.me ativo)

---

## Fase 3 — Pagamento Pagar.me · **S5** (semanas 9-10)

Sprint dedicada e isolada — primeira vez da equipe com Pagar.me.

### 3.1 Pré-requisitos

- [ ] KYC Pagar.me aprovado (CNPJ verificado)
- [ ] Conta bancária de recebimento configurada
- [ ] Webhook secret em `.env.local` e na Vercel
- [ ] Sandbox testado com cartões de teste oficiais

### 3.2 Implementação

- [ ] `src/lib/pagarme/client.ts` com SDK oficial
- [ ] Endpoint `/api/orders/create` (cartão / PIX / boleto)
- [ ] Endpoint `/api/webhooks/pagarme` com **validação HMAC**
- [ ] Idempotência: tabela de eventos auditada antes de processar
- [ ] Mapping de status: `authorized → paid`, `chargedback`, `refunded`
- [ ] Reconciliação diária via cron
- [ ] Subscription: cobrança mensal, retentativa 3× com 3 dias

### 3.3 Política de reembolso

- [ ] 15 dias incondicionais (calibrado para persona Mariana)
- [ ] 90 dias com 30% do conteúdo entregue
- [ ] Endpoint `/api/orders/refund` aciona Pagar.me API
- [ ] E-mail de confirmação automático (Resend)

### 3.4 Testes

- [ ] Unit: cálculo de preço com desconto/cupom (cobertura 80%+)
- [ ] Unit: validação de webhook HMAC com payload de teste
- [ ] Integração: fluxo completo create → webhook → access granted
- [ ] E2E: compra real em sandbox, vê dashboard atualizado

---

## Fase 4 — Plataforma do aluno MVP · **S6–S7** (semanas 11-14)

### 4.1 Player de vídeo

- [ ] Cloudflare Stream provisionado, primeiro vídeo de teste
- [ ] Componente `<PlayerVideo>` custom (legenda, velocidade, +15s)
- [ ] URL assinada para aluno autenticado (token Cloudflare)
- [ ] Eventos `lesson_started`, `lesson_completed` no GA4

### 4.2 Estrutura de curso

- [ ] CRUD interno de `Product`, `Lesson` (admin dashboard)
- [ ] Página `/aluno/cursos/[slug]` lista módulos
- [ ] Página `/aluno/aulas/[slug]` carrega player + abas (resumo / PDF / fórum)
- [ ] Marcador de progresso persistido (`UserLessonProgress`)

### 4.3 Fórum aninhado

- [ ] Componente `<CommentTree>` com profundidade visual de 3
- [ ] CRUD de `Comment` com Zod (markdown sanitizado)
- [ ] Moderação: usuário novo → fila; palavras-chave → fila
- [ ] Notificação por e-mail quando o professor responde
- [ ] "Resposta do Professor" destacada

### 4.4 Certificado

- [ ] Geração via WeasyPrint ou Puppeteer (server-side)
- [ ] Schema `EducationalOccupationalCredential`
- [ ] Página pública `/certificado/{hash}` para validação
- [ ] Critério: aluno completou ≥ 90% das aulas

---

## Fase 5 — Tracking completo + UTM Builder · **S8** (semanas 15-16)

### 5.1 UTM Builder interno

- [ ] Tabela `UTMShortLink` (slug curto, destino, criador)
- [ ] UI admin para gerar links (`/admin/utm`)
- [ ] Endpoint `/api/utm/[shortCode]` registra `UTMEvent` e redireciona
- [ ] Cruzamento com `lead_capture` e `purchase_completed`

### 5.2 Server-Side GTM (Meta CAPI)

- [ ] Container server-side configurado na Vercel
- [ ] Pagar.me webhook → CAPI (recupera evento perdido por iOS/Safari)
- [ ] Hash de e-mail/CPF antes de enviar (SHA-256)
- [ ] Deduplicação client+server por `event_id`

### 5.3 Dashboard de métricas

- [ ] Visão semanal (Carlos + Diana): tráfego, leads, e-mail, erros
- [ ] Visão quinzenal (Flávio): resumo executivo em uma página
- [ ] Visão mensal: relatório PDF com análise qualitativa

---

## Fase 6 — Conteúdo, calculadora e ferramenta de funil · **S9–S10** (semanas 17-20)

### 6.1 Pipeline editorial

- [x] Migração para Prisma/DB preparada (schema + script de migração do WordPress)
- [x] UI do blog refatorada para consumir dados do Prisma com fallback mock
- [ ] Open Graph image gerada dinamicamente por artigo
- [ ] RSS feed em `/blog/feed.xml`
- [x] Schema `Article` em cada post (Apêndice D)

### 6.2 Calculadora de Pena Hipotética (S3-S6 do roadmap, finaliza aqui)

- [x] 50 tipos penais carregados em `src/lib/business/crimes.ts` — **pendente apenas a validação final por Flávio + revisor**
- [x] Wizard 3 etapas com React Hook Form + Zod (commit `ec8e079`)
- [x] API Route com lógica trifásica determinística (`/api/calculadora` + `src/lib/business/dosimetria.ts`)
- [x] **30 casos de teste Jest** cobrindo tipos comuns + edge cases da calculadora (commit `4e9d222` e `2f3a4b5`)
- [x] Bloco de explicação passo a passo (renderizado no resultado do wizard)
- [ ] PDF de exportação (WeasyPrint)
- [x] Disclaimer institucional renderizado no servidor (não removível)
- [x] Schema `WebApplication` + `FAQPage`
- [ ] Beta fechado com 10-20 usuários piloto antes do go-live
- [ ] Telemetria: `calculator_started/completed/pdf_exported`

### 6.3 Iscas e tripwires

- [ ] PDF "20 decisões do STJ que a acusação cita mais" (persona Mariana)
- [ ] PDF "Guia: 10 pontos da defesa que a acusação mais ataca" (Rafael)
- [ ] Tripwire R$ 297-497 com checkout Pagar.me

---

## Fase 7 — Pré-lançamento · **S11–S15** (semanas 21-30)

Pacote completo no ar, lista crescendo, evento aprovado.

### 7.1 Sequências de e-mail

- [ ] Sequência boas-vindas (5 e-mails / 10 dias)
- [ ] Sequência lançamento pronta e testada em staging (7 e-mails / 7 dias)
- [ ] Sequência carrinho abandonado (3 e-mails / 48h)
- [ ] Sequência pós-compra (3 e-mails / 7 dias)

### 7.2 Landing do cohort "Edição Lançamento"

- [ ] 14 blocos completos (blueprint Seção 8.4 do guia)
- [ ] Vídeo de abertura do Flávio (2-3 min)
- [ ] FAQ com 10 perguntas
- [ ] Schema `Course` (Apêndice D)
- [ ] CTA contagem de vagas real (não falso)

### 7.3 Evento âncora 11/ago/2026

- [ ] Local + buffet + streaming + filmagem contratados
- [ ] Painelistas confirmados por escrito (3 convidados)
- [ ] Landing `/eventos/dia-do-advogado-2026` com RSVP aberto
- [ ] 3 peças de divulgação publicadas em 30 dias
- [ ] Tráfego pago local DF (R$ 800-1.500 em 20 dias)

### 7.4 Tráfego pago

- [ ] Meta Ads campanhas de retargeting + lookalike pequeno
- [ ] Google Ads brand search + high-intent
- [ ] Meta CAPI server-side validado
- [ ] Linha vermelha publicitária validada peça a peça (assessoria jurídica)

### 7.5 Auditoria pré-lançamento

- [ ] **Lighthouse: Performance ≥ 95, A11y = 100, SEO = 100**
- [ ] LCP < 2s em todas as páginas críticas
- [ ] CLS < 0.1
- [ ] Validação de schemas no Rich Results Test (Google)
- [ ] Sentry sem erros críticos nos últimos 7 dias
- [ ] Rate limit testado (`/api/auth/login` resiste a 100 req/s)
- [ ] Backup do banco testado (restauração funcional)
- [ ] **Pen-test básico** (OWASP top 10) feito por colega

---

## Fase 8 — Lançamento e entrega · **S16–S24** (semanas 31-48)

### 8.1 Semana 16 — evento (11/ago/2026)

- [ ] T-5 dias: checklist do evento 100% (40 itens dos 6 blocos do livro-guia)
- [ ] Plano B em caso de incidente técnico documentado
- [ ] Streaming testado em ensaio
- [ ] Anúncio da abertura do cohort ensaiado pelo Flávio

### 8.2 Semanas 17-19 — janela de carrinho

- [ ] Carrinho abre 12-15/ago para presentes (10% extra 48h)
- [ ] Carrinho abre 15/ago para público geral
- [ ] Sequência de lançamento dispara conforme planejado
- [ ] Suporte 24h ativo (e-mail + WhatsApp)
- [ ] Carrinho fecha 22-24/ago

### 8.3 Semanas 20-24 — cohort em operação

- [ ] Início 1/set/2026
- [ ] Aulas liberadas semanalmente
- [ ] Resposta do professor no fórum em 72h (SLA)
- [ ] 4 sessões ao vivo (abertura, 2 meio, encerramento)
- [ ] NPS aplicado na semana 12
- [ ] Depoimentos coletados (template Apêndice H do livro-guia)
- [ ] Certificados emitidos ao fim

### 8.4 Pós-cohort (jan/2027)

- [ ] Retro completa do primeiro cohort (KPIs vs. metas Cap 8 do livro-guia)
- [ ] Decisão sobre continuação Gran Cursos (Cap 9.8 abordagem A vs. B)
- [ ] Segundo cohort com ticket sem fundador (R$ 2.497-2.997)
- [ ] Comunidade mensal recorrente lançada (R$ 97-147/mês)
- [ ] Avaliação de programa de mentoria premium

---

## Princípios transversais (vale para TODAS as fases)

### Boas práticas de engenharia

1. **TDD onde for crítico.** Lógica de negócio em `src/lib/business/` tem
   teste antes do código. Cobertura mínima 80%.
2. **Feature flags antes de big bangs.** Mudança grande entra atrás de
   flag, ativa para 10% → 50% → 100%.
3. **Migrations com rollback testado.** Toda migration Prisma tem plano
   de reversão documentado no PR.
4. **Logs estruturados.** JSON com `level`, `event`, `user_id`, `path`.
   Sem PII em log claro.
5. **Observabilidade antes de feature.** Cada feature nova adiciona
   evento ao GA4/PostHog **no mesmo PR** que a feature.
6. **Code review é diálogo.** Reviewer pergunta, não dita. Autor explica.
7. **Documentação como código.** ADR para decisão arquitetural.
   Comentário curto onde o "por quê" não é óbvio.

### Boas práticas de segurança

1. Toda mutação tem **Zod no servidor** (cinto + suspensório).
2. Toda senha passa por `hashPassword()` — **nunca** `bcrypt.hash()` direto.
3. Todo cookie de sessão é `HttpOnly + SameSite=Lax + Secure`.
4. Todo webhook valida **assinatura HMAC** antes de processar.
5. **Rate limit** em endpoints de auth, lead, webhook (Upstash).
6. Logs de acesso administrativo são auditados.
7. `.env.local` **nunca** é commitado.
8. CVE crítica = janela de 7 dias para patch.

### Boas práticas de produto

1. Cada landing tem **um objetivo primário** e uma métrica.
2. Cada CTA tem **um único destino** (sem links secundários competindo).
3. Cada formulário público pede **só o necessário** (LGPD: minimização).
4. Toda peça publicitária passa pela **assessoria jurídica** antes.
5. NPS aplicado ao fim de cada cohort.
6. Retros documentadas no `CHANGELOG.md`.

---

**Última atualização:** 14/05/2026 — Checklist Fase 2 reconciliado com o código
(auth register/login/logout, cookie seguro, 72 bytes, recuperação de senha,
minha conta, proxy + layout SSR, Jest JWT, Playwright newsletter + auth).
Fase 1.4: e2e Playwright do lead marcado como feito. Pendentes explícitos na
Fase 2: magic link Resend e adoção shadcn no dashboard.

**Próxima ação:** Fase 0.2/0.3 com Flávio; Fase 6.2 — suíte Jest da
dosimetria (30 casos); opcional: magic link e shadcn conforme prioridade do
sprint.
