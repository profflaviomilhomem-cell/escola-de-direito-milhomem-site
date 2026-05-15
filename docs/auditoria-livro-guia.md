# Auditoria site × Livro-Guia v1.2

**Data:** 15 de maio de 2026  
**Fonte:** [`adr/livro-guia-flavio.md`](./adr/livro-guia-flavio.md) (cópia no repositório; PDF oficial permanece com o cliente)  
**Escopo:** repositório `escola_de_direito_milhomem_site` — marketing, área aluno/professor, infra parcial

## Legenda de status

| Símbolo | Significado |
|--------|-------------|
| ✅ | Implementado e alinhado ao guia |
| 🟡 | Parcial — estrutura ou copy incompleta |
| 🔴 | Ausente ou bloqueador do lançamento |
| ⚪ | Previsto em fase posterior (checklist) |
| ⚖️ | Desvio intencional (decisão documentada) |

---

## Mapa página → capítulo do Livro-Guia

| Rota / superfície | Objetivo (guia) | Capítulos | Status |
|-------------------|-----------------|-----------|--------|
| `/` | PVU, prova social, lead | 1.5, 1.12, 5.8 Home | 🟡 |
| `/sobre` | Autoridade, biografia, linha do tempo | 1.2–1.3, 5.8 Sobre, Ap. D schema | 🟡 |
| `/cursos` | Vitrine de produtos | 5.8 Cursos, 3.7 jornada | 🟡 |
| `/cursos/edicao-lancamento` | Landing longa cohort fundador | 1.1, 5.8, **6.5** | 🟡 |
| `/blog`, `/blog/[slug]` | SEO, tráfego qualificado | 6.3–6.4, 7 SEO | 🟡 |
| `/newsletter` | Captura de lista (#1 prioridade) | 1.4, 5.8, 7 funil | ✅ |
| `/materiais/[slug]` | Iscas PDF + formulário | 3.2–3.3, 4.8 | 🟡 |
| `/eventos/dia-do-advogado-2026` | Marco simbólico 11/08/2026 | 1.1, 7.7, 8 evento | 🟡 |
| `/calculadora-de-pena` | Ferramenta Ap. I | Ap. I, 7 conteúdo | ✅ |
| `/contato` | Contato institucional | 5.8 | 🟡 |
| `/privacidade`, `/termos`, `/reembolso` | LGPD e transparência | 4.10, 9 | 🟡 |
| `public/llms.txt`, `robots.txt` | GEO/AEO | Ap. F | ✅ |
| `/aluno/*` | Retenção, player, fórum | 4.8, 5.9 | 🟡 |
| `/professor/*` | Gestão conteúdo e turma | 6.1 | 🟡 |
| `aluno.*` subdomínio | Área logada separada | 4.8 | ⚪ |
| `/api/webhooks/pagarme` | Checkout e pedidos | 4.7 | 🔴 |
| GTM / GA4 / pixels | Analytics com consentimento | 4.9 | 🔴 |
| Pagar.me checkout | Cohort + reembolso | 4.7, 4.10 | 🔴 |

---

## Capítulo 1 — Essência

| Requisito | Site atual | Status |
|-----------|------------|--------|
| Narrativa de **lançamento** (não escola madura) | Home com “Cohort Inaugural · 11 ago 2026” | ✅ |
| PVU curta home: *“Direito Penal ensinado por quem está no MP”* | Tagline suavizada em `copy.ts` (foco professor, MP só em `/sobre`) | ⚖️ |
| Tagline institucional footer: *“A Escola do Promotor.”* | Footer usa nome “Flávio Milhomem”, sem tagline do guia | 🟡 |
| Bio Instagram oficial (guia 1.5) | Não centralizada em `copy.ts` | 🟡 |
| Três linhas vermelhas (Cap. 9 resumidas em essência) | `InstitutionalNotice` + `copy.legal` | ✅ |
| Arquétipo Sábio + Cuidador (tom, sem exclamação) | Copy sóbria; home com manifesto forte | ✅ |
| Evento-âncora 11/08/2026 Brasília | Página existe; landing “junho” | 🟡 |
| Edição Lançamento como produto nomeado | `llms.txt` + sitemap; landing vazia | 🟡 |

**Decisão ⚖️ (copy marketing):** o guia traz PVU com “Ministério Público” no hero; o site separa captação (professor/autor) de biografia institucional (MP em `/sobre`). Manter até parecer jurídico do cliente; revisar com assessoria (Cap. 9).

---

## Capítulo 2 — Mercado

| Requisito | Site | Status |
|-----------|------|--------|
| Ticket fundador R$ 2.997–4.997 (referência) | Sem preço na vitrine/landing | 🔴 |
| Posicionamento vs. RSC Max / videoteca | Copy home (perspectiva acusação) | ✅ |
| Gap Penal Militar como módulo | Módulo 04 na home | ✅ |
| Sazonalidade (jan-fev, jul-ago) | Não refletido em UI/campanhas | ⚪ |

---

## Capítulo 3 — Personas e funil

| Requisito | Site | Status |
|-----------|------|--------|
| Prioridade Mariana + Rafael | Newsletter + blog; sem segmentação | 🟡 |
| Isca gratuita + tripwire + cohort | Materiais/newsletter ok; checkout ausente | 🔴 |
| URLs branded (`/turma-2026`, etc.) | Canonical `/cursos/edicao-lancamento` | 🟡 |

---

## Capítulo 4 — Tecnologia

| Requisito | Site | Status |
|-----------|------|--------|
| Next 16 + App Router + Prisma | Sim | ✅ |
| URLs 4.8 (lista principal) | Rotas criadas | 🟡 |
| Subdomínio `aluno.*` | Mesmo host `/aluno` | ⚪ |
| Pagar.me + webhooks + Order | Stub webhook | 🔴 |
| GTM, GA4 events (`lead_capture`, `lesson_*`) | IDs via env; gate consent ausente; `lesson_*` em API progresso | 🟡 |
| Cookie consent LGPD | Mencionado em `/privacidade`; banner não montado | 🔴 |
| Domínio definitivo (4.12) | Default `escolaflaviomilhomem.com.br` | 🟡 |
| Consulta CSMPDFT | Checklist Fase 0 — não código | ⚪ |

---

## Capítulo 5 — Design System e IA

| Requisito | Site | Status |
|-----------|------|--------|
| Paleta navy + dourado fosco | `globals.css` / tokens | ✅ |
| Newsreader + Inter + mono | `layout.tsx` fonts | ✅ |
| Nav 5 itens + CTA lista | `siteConfig.mainNav` + “Entre na lista” | ✅ |
| Footer: tagline, mapa, legais, redes | Tagline “A Escola do Promotor”; CNPJ pendente | 🟡 |
| Home blueprint (prova social, 3 áreas, últimos posts, newsletter) | Módulos + stats; blog block e depoimentos fracos | 🟡 |
| Sobre: linha do tempo, capas, **CV PDF** | Jornada zigzag ✅; obras na página; **sem download CV** | 🟡 |
| WCAG 2.1 AA | Skip link, reduced motion jornada; audit formal pendente | 🟡 |
| Figma / Storybook entregáveis | Não no repo | ⚪ |

---

## Capítulo 6 — Presença digital

| Requisito | Site | Status |
|-----------|------|--------|
| Blog SEO denso | Posts migrados WordPress | 🟡 |
| Landing cohort 14 blocos (6.5) | Placeholder | 🔴 |
| Sequência e-mail 5 msgs (Cap. 7 ref.) | Resend templates parciais | 🟡 |
| Produtos Eduzz secundários na vitrine | Vitrine vazia | 🔴 |
| CI + preview Vercel | GitHub Actions | ✅ |

---

## Capítulo 7 — Crescimento

| Requisito | Site | Status |
|-----------|------|--------|
| Lista de e-mail como métrica #1 | Newsletter + API | 🟡 (sem CRM/segmentos) |
| Evento 11/08 inscrição + captura | Página stub | 🔴 |
| Calendário editorial / UTM builder | Não no site | ⚪ |

---

## Capítulo 9 — Compliance MP

| Requisito | Site | Status |
|-----------|------|--------|
| Sem consultoria de caso / sem escritório cliente / sem patrocínio | Avisos legais | ✅ |
| Magistério separado da função | Textos `/sobre` e footnote | ✅ |
| Sem brasão MP em peças comerciais | Verificar assets marketing | 🟡 (auditar imagens) |

---

## Apêndices

| Apêndice | Site | Status |
|----------|------|--------|
| F — `llms.txt` / `robots.txt` | `public/` | ✅ |
| I — Calculadora de pena | `/calculadora-de-pena` | ✅ |
| D — Schema Person `sameAs` | Home JSON-LD parcial; falta Scholar/Amazon | 🟡 |
| H — Template depoimentos | Home sem depoimentos reais | 🔴 |
| J — Posts IG/LinkedIn | Fora do site | ⚪ |

---

## Prioridades sugeridas (ordem de execução)

### P0 — Bloqueiam lançamento (junho–agosto 2026)

1. **Landing `/cursos/edicao-lancamento`** — completar blocos 3, 8–10, vídeo, checkout (estrutura base em maio/2026).
2. ~~**Vitrine `/cursos`**~~ — cards Edição Lançamento + Eduzz (feito).
3. **Checkout Pagar.me** — webhook, Order, fluxo matrícula cohort.
4. **Evento `/eventos/dia-do-advogado-2026`** — formulário inscrição + captura e-mail.
5. **Cookie consent + GTM** — gate antes de analytics (4.9).

### P1 — Autoridade e conversão

6. **Home** — bloco últimos 3 artigos, CTA “Entre na lista”, prova social (cargo/livros sem hype).
7. **Sobre** — download CV PDF; schema Person completo (Ap. D).
8. **Footer** — tagline “A Escola do Promotor”, CNPJ quando definido.
9. **Copy** — derivar variantes curtas do guia 1.5 em `copy.ts` (bio IG, tagline footer) respeitando linha ⚖️.

### P2 — Área aluno e retenção

10. Fórum por aula (`/forum/aula/{slug}`).
11. Certificado + faturas em minha conta.
12. Depoimentos pós-primeiro cohort (Ap. H).

---

## Como usar este documento

- Marcar itens no [`checklist-cronologico.md`](./checklist-cronologico.md) conforme cada P0/P1 fechar.
- Qualquer copy nova: partir da PVU longa (guia 1.5) → `src/config/copy.ts`.
- Reauditar após sprint de landing cohort ou decisão de domínio (4.12).

**Próxima revisão recomendada:** após implementar P0.1–P0.3 ou mudança de decisão jurídica sobre hero/MP.
