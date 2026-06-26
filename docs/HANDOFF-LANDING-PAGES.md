# Handoff — Landing pages · Escola Flávio Milhomem

**Para:** equipe de conteúdo / design (continuidade das landings)  
**De:** desenvolvimento (repositório `escola_de_direito_milhomem_site`)  
**Data:** 27/05/2026  
**Produção:** https://escola-de-direito-milhomem-site.vercel.app

---

## 1. O que é este projeto

Site institucional + vitrine + checkout do cohort inaugural **Edição Lançamento**, em Next.js 16 (App Router), Tailwind v4 com tokens em CSS (`globals.css`), textos centralizados em `src/config/copy.ts`.

**Tom de voz:** Sábio + Cuidador — erudito acessível, segunda pessoa com o aluno, sem linguagem de infomarketing. A Escola em primeiro plano; Flávio como professor/autor (sem explorar cargo institucional no hero de captação).

**Taglines de referência**

| Uso                   | Texto                                                                                             |
| --------------------- | ------------------------------------------------------------------------------------------------- |
| Site / SEO            | Direito criminal pela perspectiva da acusação                                                     |
| Institucional (redes) | A Escola do Promotor.                                                                             |
| Manifesto (home)      | A maioria dos cursos de direito criminal ensina para a prova. Este foi construído para a prática. |

**Aviso legal** (obrigatório em landings de venda): ver `copy.legal.marketingFootnote` — componente `InstitutionalNotice`.

---

## 2. Design system (visual interativo)

Abra no navegador (com o site rodando localmente ou em produção):

| Ambiente              | URL                                                                         |
| --------------------- | --------------------------------------------------------------------------- |
| Local (`npm run dev`) | http://localhost:3000/design-system/index.html                              |
| Produção              | https://escola-de-direito-milhomem-site.vercel.app/design-system/index.html |

O HTML em `public/design-system/index.html` documenta:

- Paleta **carbon** `#030024`, **amber** `#F1BB41`, **paper** `#E0E0E0`
- Tipografia (Clash Display, Hiragino, JetBrains Mono)
- Botões e cards de marketing
- Tabela dos **14 blocos** da landing cohort com status
- Regras do que fazer / evitar (ex.: não pintar `bg-carbon` na `<section>` inteira)

**Fonte de verdade dos tokens:** `src/app/globals.css` (`@theme`). ADR: `docs/adr/0002-design-system-tokens.md`.

---

## 3. Onde editar cada coisa

| O quê                                 | Arquivo                                                                               |
| ------------------------------------- | ------------------------------------------------------------------------------------- |
| Textos de todas as páginas            | `src/config/copy.ts`                                                                  |
| URLs, e-mail, redes, ID vídeo YouTube | `src/config/site.ts`                                                                  |
| Logo / versão cache                   | `src/config/brand.ts` + `public/images/brand/`                                        |
| Landing **Edição Lançamento**         | `src/components/marketing/edicao-lancamento-landing.tsx`                              |
| Rota da landing                       | `src/app/(marketing)/cursos/edicao-lancamento/page.tsx` (ou alias em `cursos/[slug]`) |
| Ementa pública (módulos/aulas)        | `src/data/curso-prova-digital-publico.ts`                                             |
| Home institucional                    | `src/app/(marketing)/page.tsx`                                                        |
| Depoimentos turma fundadora           | `src/data/turma-fundadora-avaliacoes.ts`                                              |
| Estratégia / blueprint 14 blocos      | `docs/adr/livro-guia-flavio.md` § 6.5                                                 |

**Regra de ouro:** não duplicar strings em JSX — sempre adicionar chaves em `copy.ts` e importar.

---

## 4. Landing principal: `/cursos/edicao-lancamento`

### Objetivo

Converter visitante em **lista de espera** ou **checkout** do cohort **Prova Digital no Processo Penal** (slug produto: `prova-digital-no-processo-penal`; checkout também aceita alias `edicao-lancamento`).

### Preço em produção (maio/2026)

- Exibido na landing: **R$ 297,00** (turma fundadora)
- Guia estratégico (6.5) cita referência histórica R$ 1.997 / parcelas — **não alterar copy sem alinhamento comercial**

CTA checkout: `/checkout/edicao-lancamento`  
CTA lista: `/newsletter?source=edicao-lancamento`

### Mapa dos 14 blocos (Livro-Guia 6.5)

| #   | Bloco              | Status | Observação para design/copy                                        |
| --- | ------------------ | ------ | ------------------------------------------------------------------ |
| 1   | Acima da dobra     | ✅     | Falta CTA “Baixar ementa PDF” se for requisito do guia             |
| 2   | Três pilares       | ✅     | Textos em `copy.edicaoLancamento.pilares`                          |
| 3   | Sobre Flávio       | 🟡     | Hoje só link no lead; guia pede mini-bio + foto + credenciais      |
| 4   | Para quem é        | ✅     | Incluir personas Mariana/Rafael se quiser aderência total ao guia  |
| 5   | Ementa             | ✅     | 2 módulos, 10 aulas (dados reais do curso)                         |
| 6   | Cronograma         | ✅     | Início 01/09/2026, marco 11/08 Brasília                            |
| 7   | Como funciona      | ✅     |                                                                    |
| 8   | Convidados         | ➖     | Omitir no lançamento (OK pelo guia)                                |
| 9   | Materiais inclusos | ✅     |                                                                    |
| 10  | Depoimentos        | ✅     | `TestimonialsSection variant="edicao"`                             |
| 11  | Investimento       | ✅     | Card âmbar; link checkout ativo                                    |
| 12  | FAQ                | 🟡     | 7 perguntas; guia sugere 10 + accordion                            |
| 13  | Garantia dedicada  | 🟡     | Texto existe no bloco 11; pode virar seção própria                 |
| 14  | CTA final          | 🟡     | Hoje leva à newsletter; guia pede CTA compra + contador vagas real |

### Padrões visuais (copiar da home / landing)

```tsx
// Eyebrow
<p className="text-amber fm-mono text-[11px] uppercase tracking-[0.22em]">{eyebrow}</p>

// Título com ênfase
<h1 className="fm-title-fluid mt-4 font-serif leading-[1.02]" style={fmTitleClamp("40px", "5vw", "64px")}>
  Título <em className="text-amber italic">ênfase</em>
</h1>

// CTA primário
<a className="bg-amber text-paper inline-block px-6 py-3 font-mono text-[12px] uppercase tracking-[0.16em]">
  Texto
</a>

// Card pilar
<li className="border-paper-100 rounded-xl border bg-carbon-elevated/30 p-5">...</li>

// Bloco investimento
<section id="investimento" className="border-amber/30 scroll-mt-28 rounded-xl border bg-amber/[0.06] p-8">
```

**Layout:** página longa usa `className="fm-site-page py-page"` no `<article>` (padding + max-width 1400px).

---

## 5. Outras landings previstas

| Rota                            | Objetivo                             | Estado                              |
| ------------------------------- | ------------------------------------ | ----------------------------------- |
| `/`                             | Institucional + cohort + calculadora | ✅ estrutura rica                   |
| `/cursos`                       | Vitrine Prisma                       | ✅                                  |
| `/eventos/dia-do-advogado-2026` | RSVP evento 11/08                    | 🟡 ver `copy.evento`                |
| `/newsletter`                   | Captura lead                         | ✅                                  |
| `/checkout/[slug]`              | Pagamento Pagar.me                   | ✅ técnico; validar copy pós-compra |
| Isças `/materiais/[slug]`       | Lead magnets                         | Parcial                             |

Checklist geral do projeto: `docs/CHECKLIST-FASES.md` e `docs/checklist-cronologico.md` (Fase 7 — pré-lançamento).

---

## 6. Fluxo de trabalho sugerido para você

1. **Ler** o design system HTML e a landing atual em produção (`/cursos/edicao-lancamento`).
2. **Redigir** alterações em Google Doc ou direto em `copy.ts` (se tiver acesso ao repo).
3. **Priorizar** blocos 3, 12, 13 e 14 (gap vs guia).
4. **Assets:** fotos em `public/images/professor/`; marca em `public/images/brand/` — pedir export PNG/WebP otimizado ao design.
5. **Revisão jurídica** em qualquer menção a MPDFT, garantia, certificado e preço.
6. **QA:** mobile, contraste, links de CTA, formulário newsletter com `?source=` correto para analytics.

---

## 7. Métricas e CRO (futuro)

Quando houver volume, testar (guia 6.5 / cap. 8):

- Headline da landing (2 variantes)
- Texto do CTA (“Entrar na lista” vs “Quero a ementa”)
- Posição do preço (alto vs bloco 11 atual)

Eventos: configurar via GTM quando banner de cookies estiver ativo (`docs/checklist-cronologico.md`).

---

## 8. Contatos técnicos

| Item                   | Valor                                                                |
| ---------------------- | -------------------------------------------------------------------- |
| Repositório            | GitHub — branch ativa `feature/aluno-area` (pode divergir de `main`) |
| Deploy                 | Vercel — projeto `escola-de-direito-milhomem-site`                   |
| E-mail institucional   | contato@escolaflaviomilhomem.com.br                                  |
| Domínio canônico (env) | `NEXT_PUBLIC_SITE_URL` → escolaflaviomilhomem.com.br                 |

---

## 9. Checklist rápido antes de publicar copy nova

- [ ] Textos adicionados em `copy.ts`, não soltos no JSX
- [ ] `InstitutionalNotice` no rodapé da landing de venda
- [ ] Preço e garantia conferidos com política `/reembolso`
- [ ] CTAs com `source` UTM/query para newsletter
- [ ] Sem promessa de aprovação em concurso
- [ ] Vídeo YouTube: ID em `siteConfig.social.edicaoLancamentoVideoId`
- [ ] Revisão em mobile (hero não quebra; logo header OK)

---

_Documento gerado para handoff interno. Dúvidas de implementação: ver também `docs/auditoria-tecnica-livro-guia.md` (tabela landing 6.5)._
