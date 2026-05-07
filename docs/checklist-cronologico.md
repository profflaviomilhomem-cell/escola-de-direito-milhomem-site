# Checklist cronológico de execução — Escola Flávio Milhomem

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
- [ ] **Vercel** — time da Orbita, projeto linkado ao repo
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
- [ ] Favicon + Apple touch icon + ícones do `manifest.ts`
- [ ] OG image padrão `/public/og-default.png` (1200×630)

### 1.3 Conteúdo institucional inicial

- [ ] Texto da home aprovado por Diana (mentoria estratégica)
- [ ] Página `/sobre` com biografia completa (3-4 parágrafos)
- [ ] Política de Privacidade redigida pela assessoria jurídica
- [ ] Termos de Uso redigidos
- [ ] Política de Reembolso (15 dias incondicionais para cohort)

### 1.4 Captura de lead funcional ponta a ponta

- [ ] Formulário `/newsletter` com React Hook Form + Zod
- [ ] Endpoint `/api/leads` com duplo opt-in (Resend)
- [ ] E-mail de confirmação branded
- [ ] CRM dashboard interno mínimo: lista, filtros, exportação CSV
- [ ] Teste e2e (Playwright) cobre o fluxo completo

### 1.5 Tracking baseline

- [ ] GTM container plugado em produção
- [ ] GA4 com eventos customizados (`lead_capture`, `page_view`)
- [ ] Meta Pixel client-side ativo
- [ ] LinkedIn Insight Tag instalado
- [ ] Web Vitals reportados (próprio + Vercel Analytics)
- [ ] PostHog capturando navegação

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

### 2.1 Cadastro e login

- [ ] Endpoint `/api/auth/register` com Zod + bcrypt + rate limit Upstash
- [ ] Endpoint `/api/auth/login` com bcrypt verify + JWT (`jose`)
- [ ] Cookie HttpOnly + SameSite=Lax + Secure em produção
- [ ] Magic link opcional via Resend
- [ ] **Validação 72 bytes** no Zod e no servidor (testes cobrem)
- [ ] Recuperação de senha (`/api/auth/forgot` + `/reset-password`)
- [ ] Logout limpa cookie

### 2.2 Proteção de rotas

- [ ] `src/proxy.ts` redireciona não-autenticado de `/aluno/*` para `/`
- [ ] SSR também valida no `(aluno)/layout.tsx` (defesa em profundidade)
- [ ] Testes Jest cobrem `verifySession` em todos os caminhos
- [ ] E2E Playwright valida que `/aluno/dashboard` sem cookie redireciona

### 2.3 Dashboard básico

- [ ] Saudação personalizada (lê `session.name`)
- [ ] Cards: progresso, próxima aula, atividade recente, anúncios
- [ ] Componentes shadcn (`Card`, `Button`, `Avatar`)

### 2.4 Página `/minha-conta`

- [ ] Atualização de nome e e-mail
- [ ] Troca de senha (com revalidação Zod 72 bytes)
- [ ] Histórico de pedidos (vazio até Pagar.me ativo)

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

- [ ] CMS leve (Markdown/MDX em `/content/blog/`) ou Contentlayer
- [ ] Pelo menos 5 artigos publicados antes do pré-lançamento
- [ ] Open Graph image gerada dinamicamente por artigo
- [ ] RSS feed em `/blog/feed.xml`
- [ ] Schema `Article` em cada post (Apêndice D)

### 6.2 Calculadora de Pena Hipotética (S3-S6 do roadmap, finaliza aqui)

- [ ] 50 tipos penais carregados (validação Flávio + revisor)
- [ ] Wizard 3 etapas com React Hook Form + Zod
- [ ] API Route com lógica trifásica determinística
- [ ] **30 casos de teste Jest** cobrindo tipos comuns + edge cases
- [ ] Bloco de explicação passo a passo
- [ ] PDF de exportação (WeasyPrint)
- [ ] Disclaimer institucional renderizado no servidor (não removível)
- [ ] Schema `WebApplication` + `FAQPage`
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

**Última atualização:** 07/05/2026 (sprint 1 concluída — fundação técnica
do repositório).

**Próxima ação:** revisar Fase 0.2 (contas externas) e Fase 0.3 (compliance)
em reunião com Flávio.
