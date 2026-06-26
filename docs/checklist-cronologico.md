#

Checklist cronológico de execução — Escola Flávio Milhomem

**Documento operacional · ordem de execução fase por fase**

Alinhado ao roadmap em 24 sprints do **Livro-Guia v1.2** (Cap 8.8) e ao
**Guia de Desenvolvimento Web v1.0** (Seção 21). Boas práticas embutidas:
TDD, code review, CI antes de feature, deploy progressivo,
defesa em profundidade, separação de ambientes, observabilidade.

> Cada item é um _checkbox_. Marque conforme avança.
> Itens em **negrito** são bloqueadores das fases seguintes.
> A coluna entre colchetes `[S?]` indica a sprint do roadmap.

> **Revisão de cobertura (23/jun/2026):** varredura cirúrgica capítulo a capítulo do
> Livro-Guia v1.2 (caps 1-9 + Apêndices A-J) contra este checklist. Itens que estavam
> só no guia e não apareciam aqui foram incorporados, com referência ao capítulo de
> origem entre parênteses. As divergências deliberadas de Design System (paleta 2026,
> Clash Display/Hiragino em vez do rascunho Newsreader/Inter do guia) foram mantidas
> por serem decisão de marca posterior ao guia — não são lacunas.
>
> **2ª varredura (23/jun/2026):** auditoria independente capítulo a capítulo confirmou
> cobertura ~90-95% dos itens acionáveis. As lacunas remanescentes (páginas comparativas
> de concorrente, protocolo de crise reputacional, rituais de monitoramento normativo +
> comunicação anual ao CSMPDFT, séries editoriais por persona, programa de embaixadores,
> ferramentas interativas de backlog, cofre de credenciais, plano B de cohort menor)
> foram incorporadas abaixo com a referência de capítulo. Outras divergências deliberadas
> de **implementação** (também não-lacunas): auth próprio (JWT/`jose`) em vez de
> Auth.js/NextAuth v5 + Google OAuth (Cap 4.2); Jest em vez de Vitest; blog via Prisma em
> vez de Contentlayer (Cap 6).

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
- [ ] **PostHog** — VPS Hetzner provisionada e PostHog auto-hospedado instalado/configurado (Apêndice C)
- [ ] **Cloudflare R2** — bucket criado (separado do Stream): MP4 mestre, apostilas PDF, materiais, legendas SRT; credenciais e política de URL assinada (Cap 4.3)
- [ ] **Eduzz API** — credenciais obtidas e autenticação testada (ponte de transição; Cap 4.5)
- [ ] Domínio encurtado **`flm.br`** registrado (UTM Builder; Cap 4.6)
- [ ] Caixa `contato@flaviomilhomem.com.br` criada (atendimento institucional; Cap 6.14)
- [ ] Ferramenta de agendamento social (Later/Metricool) + Notion de pautas (Cap 6.10)
- [ ] Cofre de credenciais compartilhado com Flávio (1Password ou Bitwarden) para segredos do projeto (Apêndice C)
- [ ] **Orçamento mensal de infraestrutura aprovado** (~R$ 750-1.100/mês) e serviços contratados (Cap 4.13)

### 0.3 Compliance institucional (paralelo ao 0.2)

- [ ] **Consulta formal ao CSMPDFT protocolada** (Cap 9.7 do livro-guia)
- [ ] Comunicação à Corregedoria do MPDFT sobre magistério arquivada
- [ ] Assessoria jurídica designada (revisa peças antes de veiculação)
- [ ] DPO nomeado (advogado externo, não o Flávio)
- [ ] Contrato de operador LGPD com cada fornecedor terceirizado
- [ ] **Protocolo de comunicação de crise reputacional pré-escrito** + assessoria de imprensa pronta para acionamento (risco 5, Cap 8.10)

#### 0.3.1 Assessoria e peça da consulta ao CSMPDFT (Cap 9.7)

- [ ] **Assessor jurídico identificado por nome** — especializado em compliance MP/CNMP, contrato assinado; protocolo de revisão definido (responsáveis, prazos, escalonamento) (Apêndice C; Cap 9.5)
- [ ] **Protocolar a consulta na 1ª semana de maio/2026**, antes de qualquer comunicação comercial expressiva (Cap 8.11)
- [ ] Peça redigida na estrutura do Cap 9.7: preâmbulo (consulente + cargo), exposição da atividade (Escola, modelo, produtos, carga horária, divulgação), enumeração das normas (CF 128 §5º II, LC 75/93, LONMP 8.625/93, Res. CNMP 73/2011, 224/2021, 273/2023, Rec. CN-CNMP 1/2016), análise de compatibilidade item a item, pedido objetivo
- [ ] Comunicar à lista interna que a consulta foi protocolada (narrativa institucional, sem alarmismo) (Cap 7.10)
- [ ] Follow-up agendado se não houver resposta em 90 dias
- [ ] Monitoramento de alteração normativa: Google Alerts para CNMP/CSMPDFT/corregedoria ("resolução CNMP", "corregedoria MPDFT magistério") (ritual 2, Cap 9.10)
- [ ] Comunicação formal **anual** ao CSMPDFT com relato da atividade da Escola (carga horária efetiva, produtos, alterações) (ritual 3, Cap 9.10)

#### 0.3.2 Checklist de compliance vivo — 15 itens (Cap 9.11)

> Controle permanente, não só pré-lançamento. Revisado a cada trimestre (ver Princípios transversais).

- [ ] 1. Consulta formal ao CSMPDFT protocolada e ativa (ver 0.3.1)
- [ ] 2. Comunicação à Corregedoria sobre magistério privado arquivada
- [ ] 3. **Carga horária da Escola dentro do teto semanal declarado** (Res. CNMP 73/2011, ~20h; Cap 9.4)
- [ ] 4. **Zero atividade da Escola em horário de expediente do MP** — gravações e sessões ao vivo fora do expediente (noites ≥ 19h ou sábados) (Cap 9.4)
- [ ] 5. **Nenhum caso concreto analisado em produto pago** — só aula e mentoria coletiva; ementa revisada pela assessoria (Cap 9.3, linha 1)
- [ ] 6. **Nenhum escritório de advocacia como cliente, patrocinador ou parceiro comercial** — inclui vetar advogado como afiliado/revendedor (Cap 9.3, linha 2)
- [ ] 7. **Nenhum patrocínio corporativo de entidade regulada/litigante em matéria criminal** (Cap 9.3, linha 3)
- [ ] 8. Nenhuma peça publicitária com brasão oficial ou identificação institucional do MPDFT (Cap 9.5)
- [ ] 9. Nenhum texto com promessa de resultado ("garantimos aprovação", "você vai passar") (Cap 9.5)
- [ ] 10. Política de privacidade publicada, atualizada e acessível (esqueleto pronto; texto final pela assessoria)
- [ ] 11. DPO nomeado, com contato publicado
- [ ] 12. Contrato de operador LGPD assinado com **cada** fornecedor (Resend, PostHog, Vercel, Neon, Pagar.me, Cloudflare, Sentry, Upstash) — verificar todos
- [ ] 13. Assessoria jurídica revisa peças comerciais antes da veiculação
- [ ] 14. Perfil em rede social mantém decoro, sem juízo sobre processo em curso sensível; separação clara entre perfil pessoal e institucional (Cap 9.6)
- [ ] 15. Ritual trimestral de revisão de compliance documentado em ata (ver Princípios transversais)

#### 0.3.3 LGPD reforçada por cargo público (Cap 9.9)

- [ ] Processo de resposta a titular em **até 15 dias** (acesso, correção, exclusão, portabilidade) com canal publicado (`privacidade@…`)
- [ ] CPF armazenado com hash ou segmentação — nunca em claro (Cap 4.10)
- [ ] Criptografia em trânsito (SSL) e em repouso (Neon nativo), com auditoria anual (Cap 9.9)
- [ ] Cada peça de conteúdo/comunicação cruzada com Res. CNMP 224/2021 (redes) e 273/2023 (conduta digital) (Apêndice E)

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
- [x] Layout raiz com fontes Clash Display / Hiragino / JetBrains via `next/font`
- [x] `prisma.config.ts` alinhado ao Prisma 7 (`datasource.url`)
- [x] **Build verde** — rotas geradas, typecheck, ESLint e Jest passando
- [x] Schema `Person` em `/sobre` (jobTitle, alumniOf, `sameAs` → MPDFT, LinkedIn, Instagram) (Apêndice D; Cap 7.2)
- [x] Schema `Organization` (name, url, logo, contactPoint, sameAs, founder) — emitido em home/`/sobre`/`/faq` via `organizationLd()` (Apêndice D)
- [ ] Schema `BreadcrumbList` em blog, páginas legais, área do aluno e calculadora (Cap 7.2)
- [ ] Validação em produção de `llms.txt` e `robots.txt` (conteúdo literal do Apêndice F): bots de IA legítimos (GPTBot/ClaudeBot/PerplexityBot) liberados, scrapers predatórios (AhrefsBot/SemrushBot/MJ12bot) com 403, áreas privadas bloqueadas
- [ ] Plugins Tailwind `@tailwindcss/typography` + `@tailwindcss/forms` instalados e validados (Apêndice G)
- [ ] Convenção de branches obrigatória: `feature/{ticket}-descricao`, `fix/{ticket}`, `hotfix/{ticket}` (Cap 6.1)
- [ ] Testes de integração (banco Postgres descartável em CI) para rotas críticas: lead, compra, cancelamento, certificado (Cap 6.2)

### 1.2 Marca e identidade visual

- [ ] Decisão final sobre domínio principal (Cap 4.12 do livro-guia)
- [ ] Registrar três variantes em Registro.br
- [x] Logo definitivo entregue pelo design (Figma) — monograma oficial em `public/images/brand/`, ligado via `src/config/brand.ts`
- [x] Substituir foto institucional placeholder por sessão profissional — retratos reais em `public/images/professor/` (hero, portrait, avatar)
- [x] Paleta institucional 2026 aplicada: `#030024` · `#242A34` · `#F1BB41` · `#E0E0E0` (`globals.css`, OG, manifest, e-mail)
- [x] **Clash Display** como fonte principal (títulos/marca) + **Hiragino Maru Gothic** corpo (secundária) + JetBrains Mono labels
- [x] `src/lib/blog/prisma-posts.ts` — mapeadores tipados Prisma → blog (sem `any` legado)
- [x] Capa de dossiê em papel kraft real para landing institucional (commit `0d5e4e3`)
- [x] Favicon dinâmico via `src/app/icon.tsx` (32×32, ImageResponse navy/mostarda)
- [x] Apple touch icon dinâmico via `src/app/apple-icon.tsx` (180×180, monograma "FM")
- [x] `src/app/manifest.ts` aponta para `/icon` e `/apple-icon` com cores institucionais
- [x] OG default 1200×630 dinâmico via `src/app/opengraph-image.tsx` (file-based, sobrescreve manual)
- [ ] **Registrar as 3 variantes em Registro.br** (`flaviomilhomem.com.br`, `escolaflaviomilhomem.com.br`, `escoladopromotor.com.br`) como reserva, independente da decisão de canônico (Cap 4.12)
- [ ] Definir canônico único + redirect 301 das variantes não-primárias; notificar Google Search Console (Cap 4.8 / 4.12)
- [ ] `docs/sitemap-conceitual.md` — cada página com objetivo primário + métrica (home=lead, sobre=autoridade, vitrine=cliente, blog=tráfego, aluno=retenção) (Cap 1.12)
- [ ] `docs/matriz-moore.md` — matriz 2×2 (conteúdo × entrega) com a Escola em "especialista-experiência" e os 10 concorrentes mapeados; consultada na revisão de copy (Cap 1.9 / 2.4)
- [ ] Logo em 5 variantes (horizontal, empilhada, apenas-tipográfica, fundo claro, fundo escuro) + variante institucional "Escola Flávio Milhomem"; elemento geométrico sutil, sem balança/coluna (Cap 5.10)
- [ ] **3 sessões fotográficas de Flávio** (institucional / editorial-biblioteca / dia a dia), resolução 6000px+, tratamento profissional (Cap 5.11)
- [ ] Diretrizes de fotografia de contexto e de ilustração documentadas (vetorial sóbria, paleta de marca; evitar brasões/símbolos do MP) (Cap 5.11)
- [ ] Diretrizes de motion: transições 200-300ms ease-in-out, hover eleva sombra 4-8px, modal fade+slide, spinner calmo; **evitar** paralaxe pesada, auto-play com áudio, carrossel > 4s/slide (Cap 5.12)
- [ ] Entregável Figma: todas as páginas (desktop + mobile), biblioteca de componentes, paleta, tipografia, espaçamentos (Cap 5.13)
- [ ] Storybook (opcional, S3) em `design.flaviomilhomem.com.br` com componentes em estados (Cap 5.13)
- [ ] Navegação principal com no máx. 5 itens (Sobre, Cursos, Blog, Eventos, Contato) + CTA destacado ("Entre na lista"/"Acessar Escola") + menu mobile hamburger (Cap 5.7)
- [ ] Footer em 3 blocos (institucional com tagline "A Escola do Promotor" + navegação + contato com IG/LinkedIn/YouTube) + linha inferior (copyright, CNPJ, links legais) (Cap 5.7)

### 1.3 Conteúdo institucional inicial

- [ ] Texto da home aprovado por Diana (mentoria estratégica)
- [x] `src/config/copy.ts` — tom Sábio+Cuidador; home, sobre, newsletter, landing cohort, avisos legais
- [x] Página `/sobre` com biografia + **jornada animada** (`CareerJourneyPath`, `src/data/career-journey.ts`); copy final aguarda aprovação editorial
- [x] Esqueleto de Política de Privacidade em 10 seções LGPD (`src/app/(marketing)/privacidade/page.tsx`) — texto aguarda redação final pela assessoria jurídica
- [x] Esqueleto de Termos de Uso em 9 seções (`src/app/(marketing)/termos/page.tsx`)
- [x] Esqueleto de Política de Reembolso (15 dias incondicionais + pro-rata pós-prazo em `src/app/(marketing)/reembolso/page.tsx`)
- [x] Componente compartilhado `src/components/marketing/legal-page.tsx` para manter as 3 páginas em consistência editorial
- [x] Footer com links para Privacidade, Termos e Reembolso
- [ ] 3 variantes curtas oficiais da PVU em circulação e consistentes: home above-the-fold, bio Instagram, tagline "A Escola do Promotor" (footer/assinatura) (Cap 1.5 / 1.11)
- [ ] `docs/tom-de-voz.md` — 5 atributos com FAZER / NÃO FAZER, consultado antes de qualquer publicação (Cap 1.8.1)
- [ ] `docs/personas.md` — 5 personas (Mariana, Rafael, Otávio, Luísa, Paulo) com drama, canal de entrada, ticket, gatilho, jornada (Cap 3.2-3.7)
- [ ] Home — blueprint completo: above-the-fold (nome + PVU + foto + CTA primário/secundário), 3 blocos de prova social, "O que a Escola ensina" (Penal / Processo Penal / Penal e Processo Militar), depoimentos (placeholder pré-lançamento), "Últimos artigos" (Cap 5.8)
- [ ] Página `/sobre` — estrutura: biografia narrativa, linha do tempo visual, galeria de capas de livros, download de CV em PDF (Cap 5.8)
- [x] Rota `/contato` — formulário mínimo (nome, e-mail, assunto, mensagem) + canais alternativos + prazo de resposta (até 3 dias úteis) (Cap 4.8 / 5.8)
- [x] Rota `/materiais/{slug}` — landings de iscas gratuitas com captura de lead (Cap 4.8)

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
- [x] **Banner de consentimento de cookies (LGPD Art. 7º)** — opt-in explícito para analytics/marketing antes de GTM/Pixel; essenciais (auth/segurança) dispensam consentimento (Cap 4.9)
- [ ] Taxonomia completa de eventos (Cap 8.5) implementada: `page_view`, `content_viewed`, `lead_capture`, `lead_capture_source`, `sequence_opened`, `sequence_clicked`, `cart_viewed`, `cart_initiated`, `purchase_completed`, `lesson_started`, `lesson_completed`, `forum_comment_posted`, `forum_reply_received`, `certificate_issued`, `subscription_canceled`
- [ ] Dimensões customizadas no GA4: origem UTM, tipo de produto, segmento de persona, cohort (Cap 8.5)
- [ ] Segmentação de tráfego por canal (Google orgânico, IG/LinkedIn/YouTube referral, direto) (Cap 8.2)

### 1.7 Acessibilidade e layout transversal (✅ commit `271fb8b` — 18/05/2026)

- [x] Menu de acessibilidade no header (`header-accessibility-menu.tsx`) — tema claro/escuro, visão (padrão, alto contraste, mono, apoio leitura), tamanho de texto (Normal / Grande / Muito grande)
- [x] Preferências persistidas (`localStorage`) + bootstrap no `<head>` antes da hidratação (`layout.tsx`, `accessibility-preferences.ts`)
- [x] Escala de texto global via `font-size` em `<html>` (100% / 112,5% / 125%); chrome e dossiê com compensação (`.fm-a11y-chrome`, `.fm-a11y-no-scale`)
- [x] Helper `fm-title-clamp.ts` + `.fm-title-fluid` para títulos com clamp que escalam sem quebrar layout
- [x] `main id="conteudo"` nos layouts marketing, aluno e professor
- [x] Depoimentos e labels `10px`/`11px` ajustados para escalar com a preferência
- [x] Dossiê 3D: legibilidade de **"INÍCIO 11 AGO"** no modo claro (`text-[#1a0f05]` fixo no cartão bege, não `text-carbon`)
- [x] Páginas marketing/aluno/professor alinhadas a `.fm-site-section` / `.fm-site-container`
- [x] Auditoria final: `fontSize: clamp(...)` inline migrado para `fmTitleClamp` + `.fm-title-fluid` (blog, legal, calculadora, aluno, professor, etc. — maio/2026)
- [ ] Labels `text-[10px]`/`text-[11px]` fora de `#conteudo`/footer (header, auth, calculadora mobile) — revisar se precisam escalar
- [ ] Lighthouse A11y = 100 em páginas críticas (meta Fase 7.5)

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
- [ ] Antecipação de recebível negociada e configurada (taxa + dias) (Cap 4.7)
- [ ] SDK `@pagar.me/pagarme-nodejs-sdk` (versão estável, auditada) instalado (Cap 4.11)
- [ ] **Plano B documentado: Stripe em paralelo como fallback** + reserva de 5 dias no cronograma (risco 1, Cap 8.10)

### 3.2 Implementação

- [ ] `src/lib/pagarme/client.ts` com SDK oficial
- [x] Endpoint `/api/orders/create` (cartão / PIX / boleto)
- [x] Endpoint `/api/webhooks/pagarme` com **validação HMAC**
- [x] Idempotência: tabela de eventos auditada antes de processar
- [x] Mapping de status: `authorized → paid`, `chargedback`, `refunded`
- [ ] Reconciliação diária via cron
- [ ] Subscription: cobrança mensal, retentativa 3× com 3 dias
- [ ] **3DS ativado para cartões com ticket ≥ R$ 500**; fluxo testado em sandbox (Cap 4.7)
- [ ] Webhook Pagar.me dispara Meta CAPI server-side no `purchase_completed` (Cap 4.9)

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
- [ ] Teste de chargeback simulado em sandbox; webhook `chargedback` acionado corretamente (Cap 4.7)

---

## Fase 4 — Plataforma do aluno MVP · **S6–S7** (semanas 11-14)

### 4.1 Player de vídeo

- [ ] Cloudflare Stream provisionado, primeiro vídeo de teste
- [ ] Componente `<PlayerVideo>` custom (legenda, velocidade, +15s)
- [ ] URL assinada para aluno autenticado (token Cloudflare)
- [x] Eventos `lesson_started`, `lesson_completed` via `track()` no `PlayerVideoMock` (GTM/dataLayer + PostHog; conclusão manual no mock até Stream + progresso real)
- [ ] MP4 mestre, apostilas e materiais em R2 com URL assinada (Cap 4.3)
- [ ] Legendas SRT/VTT em R2, carregadas no player (acessibilidade — meta A11y Fase 7.5) (Cap 4.3 / 5.6)

### 4.2 Estrutura de curso

- [ ] CRUD interno de `Product`, `Lesson` (admin dashboard)
- [x] Página `/aluno/cursos/[slug]` lista módulos (mock `mockCourse` em `src/data/mock-aluno.ts`)
- [x] Página `/aluno/aulas/[slug]` carrega player + abas Resumo / Materiais / Fórum (`LessonTabs`, `CommentTree` filtrado)
- [x] Marcador de progresso persistido (`UserLessonProgress` + `PATCH /api/aluno/lessons/progress`; seed `npm run seed:mock-course`)
- [ ] Routing completo do aluno especificado: `/aluno/forum`, `/aluno/forum/aula/{slug}`, `/aluno/certificados` (Cap 4.8)
- [ ] Progresso em formato "Você concluiu X de Y aulas" + página de aula com player em 60-70% da largura e abas à direita (Cap 5.9)

### 4.3 Fórum aninhado

- [x] Componente `<CommentTree>` com profundidade visual de 3 (UI mock; persistência na Fase 4.3)
- [ ] CRUD de `Comment` com Zod (markdown sanitizado)
- [ ] Profundidade máxima de 3 níveis visíveis; 4+ entram em "ver respostas" (Cap 4.4)
- [ ] Reações por emoji limitadas (coração e joinha) com contador (Cap 4.4)
- [ ] Moderação: usuário novo → fila; palavras-chave → fila
- [ ] Fila de moderação assíncrona + dashboard interno (lista, aprovar/rejeitar, log) (Cap 4.4)
- [ ] Notificação por e-mail quando o professor responde
- [x] "Resposta do Professor" destacada

### 4.4 Certificado

- [ ] Geração via WeasyPrint ou Puppeteer (server-side)
- [ ] Schema `EducationalOccupationalCredential`
- [ ] Página pública `/certificado/{hash}` para validação
- [ ] Critério: aluno completou ≥ 90% das aulas

### 4.5 Integração Eduzz — ponte de transição (Cap 4.5)

- [ ] Autenticação via API token testada
- [ ] Leitura read-only de vendas passadas dos 2 produtos legados
- [ ] Leitura de leads capturados na Eduzz
- [ ] Catálogo legado opcionalmente listado na vitrine do site
- [ ] Decisão documentada de quando descontinuar a Eduzz

---

## Fase 5 — Tracking completo + UTM Builder · **S8** (semanas 15-16)

### 5.1 UTM Builder interno

- [ ] Tabela `UTMShortLink` (slug curto, destino, criador)
- [ ] UI admin para gerar links (`/admin/utm`)
- [ ] Endpoint `/api/utm/[shortCode]` registra `UTMEvent` e redireciona
- [ ] `UTMEvent` captura timestamp, user_agent, IP (hash), geolocalização, origem UTM, destino (Cap 4.6)
- [ ] Cruzamento com `lead_capture` e `purchase_completed`

### 5.2 Server-Side GTM (Meta CAPI)

- [ ] Container server-side configurado na Vercel
- [ ] Pagar.me webhook → CAPI (recupera evento perdido por iOS/Safari)
- [ ] Hash de e-mail/CPF antes de enviar (SHA-256)
- [ ] Deduplicação client+server por `event_id`

### 5.3 Dashboard de métricas (`/admin/dashboard`, Cap 8.6)

- [ ] Visão semanal (Carlos + Diana): tráfego, leads, pauta editorial, abertura de e-mail, erros Sentry, falhas de pagamento — **reunião interna toda sexta**
- [ ] Visão quinzenal (Flávio): resumo executivo em 1 página (tráfego, lista, redes, KPIs de lançamento, alertas de compliance) — **reunião quinzenal Flávio + Diana**
- [ ] Visão mensal: relatório formal apresentável com análise qualitativa — entregue no 1º dia útil do mês
- [ ] Ciclo de revisão estratégica **trimestral** (roadmap, recalibragem de metas, priorização) (Cap 8.6)

### 5.3.1 Metas de KPI acompanhadas (Cap 8.2-8.4)

> Cada métrica precisa de fonte de coleta validada (GA4 / PostHog / CRM / Pagar.me / Resend).

- [ ] Aquisição: tráfego 8-15k sessões/mês no mês 3; orgânico 55-70% no mês 6; KW Top 10 (12-20 marca + 8-15 informacionais no mês 6, 40-70 no mês 12); lista de e-mail (800-1.5k mês 3 · 3-5k mês 6 · 10-15k mês 12); CPL R$ 1,80-4,50 (pago) / R$ 0,70-1,80 (orgânico)
- [ ] Ativação/conversão: visita→lead 3-6% (site) e 15-35% (landing de isca); abertura e-mail 28-42% / clique 3-8%; sequência de lançamento 2-5% da lista; ticket médio R$ 2.000-2.300; receita 1º cohort R$ 60-125k; receita ano 1 R$ 250-500k (conservador 150-250k)
- [ ] Retenção/satisfação: conclusão de cohort 55-75%; NPS ≥ 60; engajamento de fórum 60-80% (≥ 3 posts); 1ª resposta do professor ≤ 48h úteis; recompra 25-40% em 12 meses

### 5.4 CRO — testes A/B (a partir do mês 4-5, Cap 8.7)

- [ ] Setup de testes via GTM (cookie split) + verificação cruzada GA4 (sem VWO/Optimizely no 1º ano)
- [ ] Teste: headline da landing do cohort (2 variações 50/50, 2 semanas)
- [ ] Teste: CTA do formulário de newsletter ("Entre na lista" vs. "Quero receber as análises" vs. "Começar agora")
- [ ] Teste: posição do preço na landing (alto vs. meio vs. final)
- [ ] Teste: formato da isca (PDF longo vs. mini-curso 5 dias vs. vídeo-aula única)

---

## Fase 6 — Conteúdo, calculadora e ferramenta de funil · **S9–S10** (semanas 17-20)

### 6.1 Pipeline editorial

- [x] Migração para Prisma/DB preparada (schema + script de migração do WordPress)
- [x] UI do blog refatorada para consumir dados do Prisma com fallback mock
- [x] Open Graph image gerada dinamicamente por artigo
- [x] RSS feed em `/blog/feed.xml`
- [x] Schema `Article` em cada post (Apêndice D)
- [ ] Cadência e tipos definidos: Tipo 1 análise de decisão (1.500-2.500 palavras), Tipo 2 dogmática aplicada (2.000-3.500, quinzenal), Tipo 3 comentário atual (800-1.500); meta 4-5 artigos/mês escalando a 6-8 (Cap 6.3)
- [ ] Por artigo: meta description 150-160 car., OG 1200×630, carrossel IG, post LinkedIn, resumo de 3 parágrafos para newsletter (Cap 6.3)
- [ ] Template de artigo: blockquote dourado, bloco monoespaçado para lei/código, pull quote; fim com CTA "Entre na lista" + mini-bio do autor + 3 artigos relacionados + comentários (Cap 6.4)
- [ ] AEO: cada artigo abre com parágrafo de resposta sintética (2-4 frases) + tabela de conteúdo semântica (H2/H3) (Cap 6.7)
- [ ] GEO: schema `Author` completo com `sameAs` + `Article` com `dateModified` + links para fontes primárias (lei/acórdão/informativo) (Cap 6.7)
- [ ] `docs/clusters-conteudo.md` — 6 clusters temáticos (STF/STJ recentes, dogmática penal, processo penal, penal militar, Lei Anticrime, carreiras MP) (Cap 7.2)
- [ ] Estrutura hub-and-spoke por cluster: 1 artigo-pilar (4.000+ palavras) + 8-12 satélites (1.500-2.500), com links internos (Cap 7.2)
- [ ] Páginas comparativas honestas por concorrente principal ("Escola vs RSC Max", "vs Gabriel Habib") — critérios: formato, perspectiva, ticket, comunidade; sem ataque direto (Cap 3.8.1 arquétipo 4 / Cap 1.6)
- [ ] Séries editoriais de topo por persona: "Pelo lado de cá" (10 artigos, Mariana) + "Do outro lado da mesa" (8 artigos, Rafael) (Cap 3.9)
- [ ] `docs/estrategia-seo.md` — 50 palavras-chave classificadas (topo/meio/fundo) + 5 arquétipos de SERP com postura recomendada (Cap 3.8 / 3.8.1)
- [ ] Pipeline editorial de 8 etapas operacionalizado: reunião quinzenal de ideação (4-6 pautas), pesquisa, escrita, revisão editorial, **revisão técnica por 2º leitor jurídico**, diagramação/SEO, publicação, **análise 7 dias após** (visitas, tempo, scroll, CTA, conversão) (Cap 6.8)
- [ ] Setup de ferramentas SEO: GSC, Google Trends, AnswerThePublic; Ahrefs/Semrush/Ubersuggest a partir do mês 6 (Cap 7.2)
- [ ] Calendário editorial sazonal anual (jan-fev pico / mar-abr vale / mai-jun pré-edital / jul-ago 2º pico + evento) (Cap 2.6)

### 6.2 Calculadora de Pena Hipotética (S3-S6 do roadmap, finaliza aqui)

- [x] 50 tipos penais carregados em `src/lib/business/crimes.ts` — **pendente apenas a validação final por Flávio + revisor**
- [x] Wizard 3 etapas com React Hook Form + Zod (commit `ec8e079`)
- [x] API Route com lógica trifásica determinística (`/api/calculadora` + `src/lib/business/dosimetria.ts`)
- [x] **30 casos de teste Jest** cobrindo tipos comuns + edge cases da calculadora (commit `4e9d222` e `2f3a4b5`)
- [x] Bloco de explicação passo a passo (renderizado no resultado do wizard)
- [ ] PDF de exportação (WeasyPrint)
- [x] Disclaimer institucional renderizado no servidor (não removível)
- [x] Schema `WebApplication` + `FAQPage`
- [ ] FAQ com 8-10 perguntas de dosimetria do Google PAA (Featured Snippet) (Apêndice I.7)
- [ ] Captura de lead em 3 pontos: modal pré-cálculo (checkbox pré-marcado falso), CTA pós-resultado, formulário no export de PDF (e-mail obrigatório) — integrado a `/api/leads` + Resend (Apêndice I.6)
- [ ] 5 limitações documentadas no rodapé + FAQ (multa, concurso de tipos, medidas socioeducativas, hediondos, prescrição) (Apêndice I.9)
- [ ] Testes de acessibilidade WCAG AA + performance (LCP < 2s) na calculadora (Apêndice I.8)
- [ ] Beta fechado com 10-20 usuários piloto antes do go-live
- [ ] Telemetria: `calculator_started/completed/pdf_exported/newsletter_signup`

### 6.3 Iscas e tripwires

- [ ] PDF "20 decisões do STJ que a acusação cita mais" (persona Mariana)
- [ ] PDF "Guia: 10 pontos da defesa que a acusação mais ataca" (Rafael)
- [ ] Tripwire R$ 297-497 com checkout Pagar.me

---

## Fase 7 — Pré-lançamento · **S11–S15** (semanas 21-30)

Pacote completo no ar, lista crescendo, evento aprovado.

### 7.1 E-mail e sequências (Cap 6.13)

- [ ] Decisão de stack de automação: Resend nativo (Node) vs. Loops.so híbrido (decisão na S2)
- [ ] Newsletter quinzenal "Bastidor da Acusação" (quartas): 4-6 blocos (Análise da semana / Informativo comentado / Dica de leitura / Destaque da Escola / Fecho), 800-1.500 palavras
- [ ] Segmentação da lista em 4 públicos: concurseiro, advogado, servidor, acadêmico
- [ ] Sequência boas-vindas (5 e-mails / 10 dias): #1 boas-vindas + isca · #2 quem é Flávio + vídeo 3min · #3 por que o lado da acusação importa · #4 o que é a Edição Lançamento · #5 convite p/ lista de espera
- [ ] Sequência lançamento pronta e **testada em staging** (7 e-mails / 7 dias): abertura + storytelling + prova + FAQ + objeção + escassez real + fechamento (sem gatilho falso)
- [ ] Sequência carrinho abandonado (3 e-mails / 48h) — foco em objeção e garantia
- [ ] Sequência pós-compra (3 e-mails / 7 dias): boas-vindas ao cohort, instruções de acesso, convite p/ grupo de alunos, primeira tarefa

### 7.2 Landing do cohort "Edição Lançamento" (blueprint Cap **6.5** — 14 blocos)

- [x] Bloco 1 — Above-the-fold: título, subtítulo, **vídeo 2-3 min do Flávio convidando**, CTA primário "Entrar para a Edição Lançamento" + CTA secundário "Baixar a ementa (PDF)"
- [x] Bloco 2 — 3 pilares (perspectiva de Promotor ativo · cohort com acesso ao professor · trilha certificada em 12 semanas)
- [ ] Bloco 3 — Sobre Flávio: mini-bio (3 parágrafos) + foto + credenciais + link p/ `/sobre`
- [x] Bloco 4 — Para quem é: personas Mariana e Rafael + corte claro ("é para você se… / não é para você se…")
- [x] Bloco 5 — Ementa por módulo: 6 módulos de 2 semanas, 3-5 aulas cada, em accordion
- [x] Bloco 6 — Cronograma: início 1/set/2026, 12 semanas, término, carga horária 60-80h
- [x] Bloco 7 — Como funciona: aulas semanais, **fórum com resposta do professor em até 72h**, 4 sessões ao vivo, **acesso à plataforma por 12 meses após o fim** (termo contratual)
- [ ] Bloco 8 — Professores convidados (vazio no MVP, foco em Flávio)
- [x] Bloco 9 — Materiais inclusos: apostila por módulo, mapa mental, caderno de questões, decisões anotadas, certificado 60h
- [ ] Bloco 10 — Depoimentos de **pares** (professores/promotores), resenhas de livros, capas acadêmicas (sem depoimento de aluno no 1º lançamento)
- [x] Bloco 11 — Investimento: **R$ 1.997** à vista ou **12x R$ 199**; **PIX R$ 1.797 (10% off)**; selo "Vaga de fundador — turma inaugural"; garantia 15 dias + 90 dias com 30% do conteúdo
- [x] Bloco 12 — FAQ: 10 perguntas (acesso, prazo, reembolso, certificação, NF, compatibilidade, horas/semana, suporte, acesso futuro, pagamento)
- [ ] Bloco 13 — Garantia e risco zero (reforço dos 15 dias, calibrado p/ Mariana)
- [x] Bloco 14 — CTA final + rodapé: "vagas limitadas a 50 alunos", **contador de vagas real (não falso)**
- [x] Schema `Course` (Apêndice D) — `edicaoLancamentoCourseLd()` em `/cursos/[slug]`

### 7.3 Evento âncora 11/ago/2026 (Cap 7.7)

- [ ] Formato definido: híbrido 3-4h, 80-150 pessoas + transmissão ao vivo; local neutro (OAB-DF, IDP ou privado — **não MPDFT**)
- [ ] Local + buffet + streaming + filmagem contratados
- [ ] Orçamento detalhado aprovado: espaço R$ 5-12k · coquetel R$ 3-6k · filmagem R$ 3-6k · gráfica R$ 1-2k · streaming R$ 1,5-3k (total R$ 13,5-29k)
- [ ] Programação (6 blocos): abertura 15min · painel 60min · intervalo 30min · aula inaugural 45min · anúncio + apresentação 30min · coquetel 60min
- [ ] Painelistas confirmados por escrito (3 convidados) + contrato de cessão de imagem
- [ ] Landing `/eventos/dia-do-advogado-2026` com RSVP/inscrição gratuita e **opt-in** (segmento de alto valor) + schema `Event` (Apêndice D)
- [ ] 3 peças de divulgação publicadas em 30 dias
- [ ] Tráfego pago local DF (R$ 800-1.500 em 20 dias)
- [ ] Plano de reaproveitamento: gravação editada, aula inaugural como isca, painel como episódio de podcast, fotos para landing (ativo reutilizável 12+ meses)

### 7.4 Tráfego pago (Cap 7.5)

- [ ] Pré-lançamento (abr-jul): **Meta Ads boost R$ 50-150/post** apenas em conteúdo orgânico de alto engajamento (sem tráfego frio)
- [ ] Meta Ads campanhas de retargeting + lookalike pequeno
- [ ] **Defesa de marca no Google Ads desde o dia 1** (brand search) + high-intent + Discovery no blog
- [ ] Estrutura de sustentação (set+): retargeting R$ 1,5-3,5k/mês · lead R$ 2-4k/mês · Google Ads marca R$ 800-1,5k/mês
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

### 7.6 Hierarquia de canais e calendário editorial (Cap 7.1 / 7.4)

- [ ] Hierarquia de canais formalizada em 4 anéis: primários (IG, LinkedIn, e-mail, blog) · secundários (YouTube, evento) · experimentais (Meta/Google Ads, TikTok, X) · adiados (podcast, afiliados)
- [ ] Calendário editorial por dia da semana (seg LinkedIn · ter artigo+carrossel+Reel · qua Reel · qui newsletter · sex Reel+LinkedIn · sáb Story) em planilha/Notion compartilhado com Flávio
- [ ] Plano de conteúdo diário durante a janela do evento (10-24 ago): abertura de carrinho, sequência de lançamento, prova, anúncios

### 7.7 SEO local — DF/Brasília (Cap 7.3)

- [ ] Google Business Profile criado (categoria, endereço comercial, fotos, descrição, horários) + postagens semanais
- [ ] Citations em diretórios locais (OAB-DF, agenda de eventos jurídicos, Metrópoles Jurídico, Correio Braziliense)
- [ ] Página local `/eventos/dia-do-advogado-2026-brasilia` com recorte geográfico

### 7.8 Link building e autoridade externa (Cap 7.6)

- [ ] Agenda de publicação em revistas acadêmicas indexadas (Revista do MPDFT, RBCC, Revista dos Tribunais) — backlinks de alta autoridade
- [ ] Coluna mensal em portal jurídico (Conjur/Jota/Migalhas) — conteúdo analítico genuíno, sem publicidade (compliance)
- [ ] Agenda de 6-10 participações em eventos/painéis (2026-2027)
- [ ] Presença em índices que LLMs leem: Wikipedia (se notabilidade demonstrável, fase 2-3), Google Knowledge Graph (Cap 6.7)

### 7.9 Redes sociais — bateria inicial e cadência (Cap 6.10-6.12 / Apêndice J)

- [ ] Bio do Instagram reformulada + landing adaptada a tráfego IG (Cap 6.10)
- [ ] Publicar a bateria do Apêndice J: 12 posts Instagram (IG-01 a IG-12) + 8 posts LinkedIn (LI-01 a LI-08)
- [ ] Gravar os 4 Reels (IG-02/05/08/11) conforme roteiro e cenário do Apêndice J
- [ ] Seguir o calendário de 4 semanas (Apêndice J.3) + republicação em Stories
- [ ] **Compliance check (15 itens, Cap 9.11) em cada peça antes de publicar**, com aprovação registrada
- [ ] Cadência sustentável: IG (1-2 carrosséis/sem + Story diário + live quinzenal) · LinkedIn (1-2 textos/sem + 1 artigo nativo/mês + estratégia de +50 conexões/sem) · YouTube (1-2 aulas longas/mês + 2-3 Shorts/sem, descrição 300-500 palavras com timestamps)

### 7.10 Atendimento e suporte (Cap 6.14)

- [ ] SLA: e-mail institucional 48h úteis · WhatsApp institucional 24h úteis (número não pessoal de Flávio)
- [ ] Equipe de suporte alocada (1-2 pessoas, não Flávio)
- [ ] Decisão registrada: **sem chatbot de IA** no atendimento comercial no 1º lançamento (tom humano + risco reputacional)

### 7.11 Produção pedagógica do cohort (Cap 6.5 / 6.9)

- [ ] Gravação dos módulos: câmera 4K + lavalier + softbox, legenda CC, aulas de 20-35min decompostas em blocos de 5-10min
- [ ] **Gravar com 3-4 semanas de antecedência** (margem de contingência, risco 4 Cap 8.10)
- [ ] Apostilas por módulo (PDF 50-80 págs cada), mapa mental do programa, caderno de questões comentadas, decisões anotadas em PDF
- [ ] Parcerias editoriais com compliance: critérios definidos (coautoria, podcast co-marketing, painel, intercâmbio de alunos) (Cap 7.8)

---

## Fase 8 — Lançamento e entrega · **S16–S24** (semanas 31-48)

### 8.1 Semana 16 — evento (11/ago/2026)

- [ ] T-5 dias: checklist do evento 100% — 6 blocos / 40 itens (Cap 8.9):
  - [ ] Bloco A (local/produção): contrato de espaço, layout de montagem, buffet briefado, streaming/filmagem briefados, iluminação e som checados, plano B técnico
  - [ ] Bloco B (convidados/painéis): painelistas confirmados por escrito + cessão de imagem, briefing 10 dias antes, roteiro 3 dias antes, mediador alinhado
  - [ ] Bloco C (divulgação/inscrição): landing no ar 30 dias antes, 3 peças IG/LinkedIn/newsletter, tráfego pago local DF (R$ 800-1.500), lista VIP convidada individualmente
  - [ ] Bloco D (materiais): programa impresso 100-200un, nametags, banner institucional, slides com identidade da Escola, gift (livro do Flávio com dedicatória)
  - [ ] Bloco E (abertura do cohort): anúncio com condição p/ presentes (10% extra 48h, código no nametag), texto ensaiado pelo Flávio, página de carrinho pronta
  - [ ] Bloco F (pós-evento): gravação editada em 10 dias, e-mail de agradecimento em 48h, fotos profissionais selecionadas em 5 dias
- [ ] Plano B em caso de incidente técnico documentado
- [ ] Streaming testado em ensaio
- [ ] Anúncio da abertura do cohort ensaiado pelo Flávio

### 8.2 Semanas 17-19 — janela de carrinho

- [ ] Carrinho abre 12-15/ago para presentes (10% extra 48h)
- [ ] Carrinho abre 15/ago para público geral
- [ ] Sequência de lançamento dispara conforme planejado
- [ ] Suporte 24h ativo (e-mail + WhatsApp)
- [ ] Carrinho fecha 22-24/ago
- [ ] **Plano B documentado: lançar cohort menor (20-30 alunos) em vez de cancelar** se a meta de lista não for atingida (risco 3, Cap 8.10)

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
- [ ] Programa de embaixadores / alunos pioneiros (≠ afiliados, sem comissão): depoimento em troca de bônus, contrato de cessão de imagem, máx. 10 por cohort (Cap 7.9)
- [ ] Backlog de ferramentas interativas de captação: Quiz "Qual é seu nível em Direito Penal?", Buscador de informativos anotados, Cronograma personalizado de estudos (Cap 6.6)

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

**Última atualização:** 18/05/2026 — Menu de acessibilidade (escala global, visão, tema), layout
`.fm-site-*`, depoimentos/dossiê (contraste modo claro), commit `271fb8b` em
`feature/aluno-area`. Handoff: [`handoff-sessao-2026-05-18.md`](./handoff-sessao-2026-05-18.md).

---

## Panorama rápido (o que falta de verdade)

| Fase                         | Status                       | Bloqueadores principais                                                                                                                                                            |
| ---------------------------- | ---------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **0** Pré-requisitos         | 🔴 Não iniciada no checklist | Contas externas (Neon, Pagar.me, Resend, GTM…), compliance CSMPDFT/LGPD                                                                                                            |
| **1** Fundação               | 🟡 ~90% código               | Domínio; marca residual (5 variantes do logo aplicadas + 3 sessões foto); home aprovada; CRM admin; IDs reais; auditoria a11y residual                                             |
| **2** Auth / aluno esqueleto | 🟡 ~95%                      | Magic link Resend                                                                                                                                                                  |
| **3** Pagar.me               | 🟡 núcleo no código          | Feito: `/api/orders/create`, webhook HMAC, idempotência, mapping de status. Falta: SDK oficial, `/api/orders/refund`, 3DS, Meta CAPI no webhook, reconciliação cron, KYC (externo) |
| **4** LMS MVP                | 🟡 ~40%                      | Stream real, CRUD aulas, fórum persistido, certificado PDF                                                                                                                         |
| **5** UTM + CAPI             | 🔴                           | UTM builder, Meta CAPI server-side                                                                                                                                                 |
| **6** Conteúdo / calculadora | 🟡 ~75%                      | PDF calculadora; iscas PDF; tripwire checkout                                                                                                                                      |
| **7** Pré-lançamento         | 🟡 landing ~70%              | Landing cohort: 10/14 blocos feitos + Schema Course (faltam blocos 3/8/10/13); cookie consent ✅. Falta: sequências de e-mail, schema Event, logística do evento 11/08             |
| **8** Lançamento             | 🔴                           | Operação cohort + carrinho ago/2026                                                                                                                                                |

**Próximas ações sugeridas (ordem):**

0. **Continuidade** — Ler [`handoff-sessao-2026-05-18.md`](./handoff-sessao-2026-05-18.md) ao abrir novo chat
1. **Fase 0.2** — Vercel + Neon linkados; `DATABASE_URL` em preview/prod; `prisma migrate deploy` + `npm run seed:mock-course`
2. **Fase 3** — Pagar.me sandbox (checkout + webhook) — desbloqueia cohort e tripwire
3. **Fase 4.1** — Cloudflare Stream + `<PlayerVideo>` real
4. **Fase 7** — Banner consentimento cookies antes de GTM/Pixel; fechar 14 blocos `/cursos/edicao-lancamento`
