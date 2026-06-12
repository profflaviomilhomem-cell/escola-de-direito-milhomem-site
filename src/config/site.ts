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
import { CURSO_PRINCIPAL_PATH } from "@/data/produtos-escola";

export const siteConfig = {
  name: "Escola Flávio Milhomem",
  shortName: "Escola Flávio Milhomem",
  tagline: copy.site.tagline,
  taglineInstitucional: copy.guia.taglineInstitucional,
  pvuShort: copy.site.pvuShort,
  description: copy.site.description,
  url:
    process.env.NEXT_PUBLIC_SITE_URL ?? "https://escolaflaviomilhomem.com.br",
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
    email: "contato@escolaflaviomilhomem.com.br",
    privacyEmail: "privacidade@escolaflaviomilhomem.com.br",
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
    { label: "Calculadora", href: "/calculadora-de-pena" },
    { label: "FAQ", href: `${CURSO_PRINCIPAL_PATH}#faq` },
  ],
  /** Links secundários (footer e menu mobile “Mais”) */
  secondaryNav: [
    { label: "Eventos", href: "/eventos/dia-do-advogado-2026" },
    { label: "Contato", href: "/contato" },
  ],
} as const;

export type SiteConfig = typeof siteConfig;
