/**
 * Configuração central do site.
 *
 * Single source of truth para metadata, URLs canônicas,
 * informações institucionais e canais.
 *
 * Textos de marketing e tom de voz: `src/config/copy.ts`.
 * NÃO duplique strings deste arquivo em outros lugares —
 * sempre importe daqui. Isso evita drift entre páginas.
 */

import { copy } from "./copy";

export const siteConfig = {
  name: "Escola Flávio Milhomem",
  shortName: "Escola Flávio Milhomem",
  tagline: copy.site.tagline,
  taglineInstitucional: copy.guia.taglineInstitucional,
  pvuShort: copy.site.pvuShort,
  description: copy.site.description,
  // Domínio definitivo (decisão 12/jun/2026): mantém o registrado com equity.
  url:
    process.env.NEXT_PUBLIC_SITE_URL ??
    "https://professorflaviomilhomem.com.br",
  locale: "pt-BR",
  // OG image gerada por `app/opengraph-image.tsx` (file-based).

  /** Arte institucional (ponte JK) — hero da área do aluno e vitrines de curso. */
  brand: {
    courseHeroBanner: "/images/brand/elementos_marca-18.png",
  },

  professor: {
    fullName: copy.professor.fullName,
    role: copy.professor.marketingTitle,
    bioRoleLine: copy.professor.bioRoleLine,
    careerYears: copy.professor.careerYears,
    teachingYears: copy.professor.teachingYears,
    education: copy.professor.education,
  },

  contact: {
    /**
     * E-mail oficial do professor. Os anteriores (`contato@` e `privacidade@`
     * em `escolaflaviomilhomem.com.br`) apontavam para um domínio que NÃO ESTÁ
     * REGISTRADO — verificado no registro.br em 01/08/2026 —, então quem
     * escrevesse levava bounce, inclusive no canal de LGPD, que é obrigatório.
     *
     * Este endereço é para RECEBER e para exibição. O remetente técnico dos
     * e-mails transacionais NÃO pode ser ele: o Resend só envia de domínio
     * verificado por DKIM, e gmail.com não é nosso. Ver `lib/resend/client.ts`.
     */
    email: "prof.flaviomilhomem@gmail.com",
    privacyEmail: "prof.flaviomilhomem@gmail.com",
  },

  social: {
    instagram: "https://instagram.com/prof.flaviomilhomem",
    instagramHandle: "@prof.flaviomilhomem",
    linkedin: "https://linkedin.com/in/professorflaviomilhomem",
    /** Canal oficial (URL ASCII — evita problemas em mailers e alguns browsers) */
    youtube: "https://www.youtube.com/@professorflaviomilhomem",
    /** Linha secundária no chip do footer (YouTube) */
    youtubeFooterLabel: "Professor Flávio Milhomem",
    /**
     * Vídeo de abertura — Edição Lançamento (canal @professorflaviomilhomem).
     * Metodologia: videoaulas + PDFs (~4 min). Trocar quando houver vídeo da edição.
     */
    edicaoLancamentoVideoId: "Sud0au_ogS0",
    /** Linha secundária no chip do footer (LinkedIn) */
    linkedinFooterLabel: "/in/professorflaviomilhomem",
    mpdft: "https://www.mpdft.mp.br/",
    /** Site legado — equity branded preservado (guia 7.2, auditoria de domínio). */
    legacySite: "https://professorflaviomilhomem.com.br/",
    /** Página de professor no Gran Cursos — credencial de docência verificável. */
    granCursos:
      "https://www.grancursosonline.com.br/cursos/professor/flavio-milhomem",
  },

  // IDs de tracking — preencher via .env quando criar conta.
  // Cada bloco é renderizado/inicializado SOMENTE se o ID estiver
  // presente, então o site funciona sem credenciais em dev/CI.
  tracking: {
    gtmId: process.env.NEXT_PUBLIC_GTM_ID ?? "",
    metaPixelId: process.env.NEXT_PUBLIC_META_PIXEL_ID ?? "",
    linkedinPartnerId: process.env.NEXT_PUBLIC_LINKEDIN_PARTNER_ID ?? "",
    posthogKey: process.env.NEXT_PUBLIC_POSTHOG_KEY ?? "",
    posthogHost:
      process.env.NEXT_PUBLIC_POSTHOG_HOST ?? "https://us.i.posthog.com",
  },

  // Navegação principal do header + CTA lista (6 itens — Calculadora e FAQ no topo).
  // Sem link "Entrar" de propósito: acesso à área do aluno só por convite/e-mail
  // (magic link ou URL direta), para não expor o login no site público.
  mainNav: [
    { label: "Início", href: "/" },
    { label: "Sobre", href: "/sobre" },
    { label: "Cursos", href: "/cursos" },
    { label: "Blog", href: "/blog" },
    // 24/08/2026: a Calculadora saiu do menu principal a pedido do Flávio
    // ("se já tá implantada, então pode deixar; mas não vamos explorar este
    // tema" — a Escola não trata de execução penal). Continua no ar e no menu
    // secundário; deixa de ser vitrine.
    { label: "FAQ", href: "/faq" },
  ],
  /** Links secundários (footer e menu mobile “Mais”) */
  secondaryNav: [
    { label: "Calculadora", href: "/calculadora-de-pena" },
    { label: "Eventos", href: "/eventos/dia-do-advogado-2026-brasilia" },
    { label: "Contato", href: "/contato" },
  ],
} as const;
