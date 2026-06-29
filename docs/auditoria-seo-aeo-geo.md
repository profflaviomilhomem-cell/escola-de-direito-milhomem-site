# Auditoria SEO · AEO · GEO × Livro-Guia

**Data:** 10 de junho de 2026
**Fonte normativa:** [`adr/livro-guia-flavio.md`](./adr/livro-guia-flavio.md) — Cap. **6.7** (AEO/GEO), **7.2–7.3** (SEO nacional e local), Apêndices **D** (schema), **F** (llms.txt/robots.txt), **I.7** (schema da calculadora).
**Escopo:** implementação técnica de descoberta — metadados, dados estruturados (JSON-LD), sitemap/robots/llms, estrutura de conteúdo para resposta direta e citabilidade por IA.
**Método:** leitura do código atual em `src/` e `public/` confrontada linha a linha com o guia. Complementa (não substitui) [`auditoria-tecnica-livro-guia.md`](./auditoria-tecnica-livro-guia.md), de 15/mai — vários itens 🔴 de lá já foram resolvidos.

## Legenda

| Símbolo | Significado                                 |
| ------- | ------------------------------------------- |
| ✅      | Implementado e alinhado ao guia             |
| 🟡      | Parcial — existe mas incompleto             |
| 🔴      | Ausente / bloqueador para o lançamento      |
| ⚪      | Previsto para fase posterior (não bloqueia) |
| ⚖️      | Desvio intencional documentado              |

---

## Placar

| Frente                    | ✅  | 🟡  | 🔴  |
| ------------------------- | --- | --- | --- |
| **SEO técnico**           | 6   | 4   | 3   |
| **AEO** (resposta direta) | 1   | 2   | 3   |
| **GEO** (citabilidade IA) | 3   | 3   | 2   |

**Veredicto:** a base técnica de SEO está **boa** (canonical, sitemap dinâmico, robots e llms.txt prontos). As maiores lacunas estão em **dados estruturados das páginas de conversão e autoridade** (`/sobre`, landing do cohort, FAQ) e em **AEO de artigo** (answer-first + FAQPage + índice). São lacunas de alto impacto e baixo esforço — recomendadas como P0 antes da abertura da lista de espera (08/jul).

---

## 1. SEO técnico

### 1.1 Metadados e indexação — ✅ sólido

| Item (guia 7.2)                                                       | Estado | Evidência                                                          |
| --------------------------------------------------------------------- | ------ | ------------------------------------------------------------------ |
| `metadataBase`, title template, description                           | ✅     | `src/app/layout.tsx:99-150`                                        |
| `robots: index/follow` + `max-image-preview:large` + `max-snippet:-1` | ✅     | `layout.tsx:140-149`                                               |
| OpenGraph + Twitter card `summary_large_image`                        | ✅     | `layout.tsx:123-139` + `app/opengraph-image.tsx`                   |
| OG image dinâmica (home + blog)                                       | ✅     | `app/opengraph-image.tsx`, `blog/[slug]/opengraph-image.tsx`       |
| `alternates.canonical` por página                                     | ✅     | home, sobre\*, cursos, blog, calculadora, termos, etc.             |
| Keywords nacionais                                                    | 🟡     | 10 termos em `layout.tsx:110`; faltam clusters long-tail (ver 1.4) |
| `themeColor` / viewport                                               | ✅     | `layout.tsx:92-97`                                                 |

> \* **Atenção:** `/sobre` tem `canonical` mas **não tem JSON-LD** — ver 1.3.

### 1.2 Sitemap, robots e PWA — ✅ (resolvido desde a auditoria de maio)

- **Sitemap dinâmico** ✅ — `src/app/sitemap.ts` já inclui páginas estáticas + materiais + **posts do blog** puxados de `getPublishedBlogListPosts()`. (Era 🔴 "estático" na auditoria de 15/mai.)
- **robots.txt** ✅ — `public/robots.txt` cobre buscadores tradicionais, **libera bots de IA legítimos** (GPTBot, ClaudeBot, OAI-SearchBot, PerplexityBot, Google-Extended, Applebot-Extended…) e **bloqueia predatórios** (CCBot, etc.). Mais completo que o Apêndice F do guia.
- **manifest.ts** ✅ — `src/app/manifest.ts` (PWA).
- 🟡 **`lastModified` das páginas estáticas** usa `new Date()` (data do build), não a data real de edição — sinal de frescor fraco para estáticas. Baixa prioridade.
- 🟡 **`changeFrequency`** não declarado em nenhuma entrada do sitemap.

### 1.3 Dados estruturados (JSON-LD) — 🔴 lacunas críticas

Tipos hoje presentes: `Person` (home, calculadora), `Organization` (home), `WebApplication`+`Offer` (calculadora), `Article` (blog). **Faltam** os schemas das páginas de maior valor:

| Schema (guia App. D)                                    | Onde o guia manda                            | Estado                                                                              |
| ------------------------------------------------------- | -------------------------------------------- | ----------------------------------------------------------------------------------- |
| `Person` completo na **/sobre**                         | App. D + 7.2 (E-E-A-T)                       | 🔴 **ausente** — está na home e na calculadora, mas **não na página de autoridade** |
| `Course` na **landing do cohort**                       | App. D ("Course — página do cohort")         | 🔴 **ausente** em `/cursos/edicao-lancamento` (sem nenhum JSON-LD)                  |
| `FAQPage`                                               | 6.7 + 7.2                                    | 🔴 **ausente** (FAQ existe como UI, sem markup) — ver 2.2                           |
| `BreadcrumbList`                                        | 7.2 ("Breadcrumbs com schema")               | 🔴 **ausente** em todo o site                                                       |
| `EducationalOrganization` (+logo, contactPoint, sameAs) | 7.2                                          | 🟡 hoje é `Organization` genérico, sem `logo`, `sameAs` nem `contactPoint`          |
| `Person.sameAs` completo                                | 7.2 (MPDFT, Scholar, Amazon/livro, LinkedIn) | 🟡 **incompleto e inconsistente** — ver 1.4                                         |

### 1.4 `sameAs` e autoridade do autor — 🟡

- Home (`page.tsx:40`): `sameAs` = LinkedIn, Instagram, YouTube. **Falta MPDFT, Google Scholar e ficha do livro** (Martins Fontes / Alumnus), todos exigidos em 7.2.
- Calculadora (`calculadora-de-pena/page.tsx:36`): `sameAs` = MPDFT + LinkedIn apenas.
- **Inconsistência:** o mesmo `Person` aparece com `sameAs` diferentes em páginas diferentes → enfraquece a consolidação de entidade no Knowledge Graph. Centralizar um único objeto `personLd` em `src/config/site.ts` e reusar.
- As fichas dos livros já existem em `src/data/obras-milhomem.ts` (`fichaUrl`) — são `sameAs`/`author.url` prontos para uso, hoje desperdiçados.

### 1.5 Clusters de conteúdo e SEO local — 🟡 / ⚪

- 🟡 **Arquitetura hub-and-spoke** (7.2): há ~79 artigos migrados, mas sem artigos-pilar de 4.000+ palavras nem linkagem interna por cluster (STF/STJ, dogmática, processo/prova, penal militar, Lei Anticrime, carreiras MP).
- ⚪ **SEO local DF** (7.3): Google Business Profile, página `/eventos/...-brasilia` e citations são conteúdo/operação, não bloqueiam o código.

### 1.6 Performance (Core Web Vitals) — ✅ monitorado

- `WebVitalsReporter` ativo (`layout.tsx:182`); fontes com `display:swap` e `preload:false` calibrado. Metas do guia (LCP<2s, CLS<0.1, INP<200ms) **a medir em produção** com dados reais (Search Console / CrUX).

---

## 2. AEO — Answer Engine Optimization

> Guia 6.7: _"Cada artigo inicia com parágrafo de resposta sintética (2-4 frases respondendo à pergunta-título), seguido por desenvolvimento. Tabela de conteúdo semântica (H2/H3). FAQ schema em páginas com perguntas frequentes."_

### 2.1 Resposta sintética (answer-first) — 🔴

- Não há nenhum padrão de **parágrafo-resposta no topo do artigo**. O corpo (`blog/[slug]/page.tsx`) renderiza HTML migrado direto, sem bloco de resposta destacado. Muitos títulos já são perguntas ("Quando um cabo de vassoura vira arma branca?") — encaixe perfeito para answer-first, hoje não aproveitado.

### 2.2 FAQPage — 🔴

- FAQ existe como **UI** em `edicao-lancamento-landing.tsx` e link no `footer.tsx`, mas **sem `FAQPage` JSON-LD** → não vira rich result nem é lido por answer engines.
- A auditoria de maio pedia FAQ de 10 perguntas; hoje há 4 itens. **Faltam 6** e o markup.
- O `/faq` institucional citado no Apêndice F.1 do guia **não existe** como rota.

### 2.3 Índice / TOC semântico — 🔴

- Sem componente de **tabela de conteúdo** (H2/H3) nos artigos. Nenhum `table-of-contents`/`tableOfContents` no código. A auditoria de maio já marcava "TOC parcial".

### 2.4 Completude do `Article` — 🟡

`articleLd` em `blog/[slug]/page.tsx:56-64` tem `headline`, `description`, `datePublished`, `author.name`, `keywords`. **Faltam:**

| Campo ausente                              | Por que importa (AEO/GEO)                                                          |
| ------------------------------------------ | ---------------------------------------------------------------------------------- |
| `dateModified`                             | Sinal de **frescor** — answer engines priorizam conteúdo atualizado (App. D exige) |
| `publisher` (Organization + logo)          | Exigido no App. D; necessário para rich result de Article                          |
| `author.url` + `author.sameAs`             | 6.7 GEO exige **autor completo**, não só nome                                      |
| `image`                                    | Rich result de artigo / preview em IA                                              |
| `mainEntityOfPage`, `inLanguage` (`pt-BR`) | Desambiguação de entidade e idioma                                                 |

---

## 3. GEO — Generative Engine Optimization

> Guia 6.7: LLMs citam fontes (1) específicas no tema, (2) coerentes no tom, (3) com autor verificável. Lavras: `llms.txt`, schema de autor com `sameAs` institucional, citação de fontes primárias com link.

### 3.1 `llms.txt` — ✅ (com 1 desvio e 1 lacuna)

- ✅ `public/llms.txt` existe, bem estruturado: resumo, sobre a Escola, sobre o professor, cursos, conteúdo gratuito, compliance, contato.
- ⚖️ **Tom suavizado** vs. Apêndice F.1: o guia abre com "Promotor de Justiça do MPDFT… Ouvidor-Geral"; o arquivo atual põe o cargo no fim e enfatiza "professor e autor". **Coerente com a decisão de compliance** de não usar o cargo como isca (Cap. 9 + 7.5). Manter.
- 🟡 **Faltam dois blocos** que o guia traz e que são alavancas GEO legítimas:
  - "**Recursos para citação por IA**" (links para /sobre, /faq, bibliografia) — o /sobre existe; faltam /faq e /livros.
  - "**Citações sugeridas para IAs generativas**" — pode ser reescrito em tom compliance-safe (sem "compre porque é Promotor"), mantendo a caracterização de diferencial único.

### 3.2 Autor verificável / `sameAs` — 🟡

- Ver 1.4: o `Person` não consolida MPDFT + Scholar + ficha de livro de forma única e consistente. Esta é **a principal alavanca GEO** subaproveitada — Flávio tem credenciais externas verificáveis (o "combustível" descrito em 7.2) que hoje não estão totalmente expostas em schema.

### 3.3 Páginas de citabilidade — 🔴 / 🟡

| Recurso GEO (guia)                 | Estado                                                                                                |
| ---------------------------------- | ----------------------------------------------------------------------------------------------------- |
| `/sobre` (biografia + credenciais) | 🟡 existe, mas **sem `Person` schema** (1.3)                                                          |
| `/faq` institucional               | 🔴 **não existe** como rota                                                                           |
| `/livros` (bibliografia)           | 🔴 **não existe** — dados já prontos em `obras-milhomem.ts`, faltam página + `Book`/`ItemList` schema |

### 3.4 Fontes primárias linkadas — 🟡

- Guia 6.7/7.2: cada artigo deve **linkar fonte primária** (lei no Planalto, acórdão STF/STJ, informativo). Não há padrão garantindo isso no conteúdo migrado — verificar e padronizar no pipeline editorial (6.8, Etapa 6).

### 3.5 Índices externos (Wikipedia, Knowledge Graph, Scholar) — ⚪

- Fase 2/3 do roadmap (6.7). Não bloqueia. O schema correto no site (3.2) é pré-requisito para alimentar o Knowledge Graph.

---

## 4. Checklist priorizado — o que falta

### 🔴 P0 — antes da lista de espera (alvo: 08/jul) · alto impacto, baixo esforço

- [ ] **`Person` schema completo na `/sobre`** com `jobTitle`, `alumniOf`, e `sameAs` = MPDFT + LinkedIn + Instagram + YouTube + **Google Scholar** + **ficha do livro** (`obras-milhomem.ts`).
- [ ] **Centralizar `personLd` em `src/config/site.ts`** e reusar em home, /sobre e calculadora (elimina a inconsistência de `sameAs` — 1.4).
- [ ] **`Course` schema em `/cursos/edicao-lancamento`** (`name`, `description`, `provider`, `hasCourseInstance` com `startDate`/`courseMode: blended`, `offers` R$ 297).
- [ ] **`FAQPage` JSON-LD** na landing do cohort + **completar de 4 → 10 perguntas** (App. D / 6.7).
- [ ] **Completar o `Article` do blog**: `dateModified`, `publisher` (Organization+logo), `author.url`+`sameAs`, `image`, `inLanguage:"pt-BR"`, `mainEntityOfPage`.
- [ ] **`BreadcrumbList` schema** em blog, cursos e páginas internas.

### 🟡 P1 — janela de lançamento (jul–ago) · constrói AEO/GEO

- [ ] **Bloco answer-first** (2–4 frases) no topo de cada artigo — começar pelos posts com título-pergunta.
- [ ] **Componente de TOC** (H2/H3) nos artigos longos.
- [ ] **Upgrade `Organization` → `EducationalOrganization`** com `logo`, `contactPoint`, `sameAs`.
- [ ] **Página `/livros`** (bibliografia) com schema `Book`/`ItemList` — dados já existem em `obras-milhomem.ts`.
- [ ] **Página `/faq` institucional** + reintroduzir no `llms.txt` o bloco "Recursos para citação por IA".
- [ ] **Reintroduzir "Citações sugeridas para IAs"** no `llms.txt`, em redação compliance-safe.
- [ ] **`changeFrequency`** no sitemap e `lastModified` real para estáticas.

### ⚪ P2 — sustentação (set+) · conteúdo e off-site

- [ ] Arquitetura **hub-and-spoke** (artigos-pilar 4.000+ por cluster, linkagem interna).
- [ ] Padronizar **link de fonte primária** (Planalto/STF/STJ) em todo artigo.
- [ ] **SEO local DF** — Google Business Profile, `/eventos/...-brasilia`, citations (7.3).
- [ ] Medir **Core Web Vitals** reais (Search Console/CrUX) vs. metas do guia.
- [ ] Índices externos: **Google Scholar, Knowledge Graph**, avaliar notabilidade Wikipedia (6.7).

---

## Apêndice — arquivos inspecionados

`src/app/layout.tsx` · `src/app/sitemap.ts` · `src/app/manifest.ts` · `src/app/opengraph-image.tsx` · `src/app/(marketing)/page.tsx` · `src/app/(marketing)/sobre/page.tsx` · `src/app/(marketing)/cursos/[slug]/page.tsx` · `src/app/(marketing)/blog/[slug]/page.tsx` · `src/app/(marketing)/calculadora-de-pena/page.tsx` · `public/robots.txt` · `public/llms.txt` · `src/config/site.ts` · `src/config/copy.ts` · `src/data/obras-milhomem.ts`.
