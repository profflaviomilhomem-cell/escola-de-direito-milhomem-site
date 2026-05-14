/**
 * Configuração central do site.
 *
 * Single source of truth para metadata, URLs canônicas,
 * informações institucionais e canais.
 *
 * NÃO duplique strings deste arquivo em outros lugares —
 * sempre importe daqui. Isso evita drift entre páginas.
 */

export const siteConfig = {
  name: "Escola Flávio Milhomem",
  shortName: "Escola Flávio Milhomem",
  tagline: "A Escola do Promotor",
  pvuShort:
    "Direito Penal ensinado por quem está no Ministério Público — o lado que decide o que vira denúncia.",
  description:
    "Escola digital de Direito Penal pela perspectiva da acusação, dirigida por Flávio Milhomem, Promotor de Justiça do MPDFT desde 1996, Ouvidor-Geral do MPDFT (2025-2027), professor há 25 anos.",
  url:
    process.env.NEXT_PUBLIC_SITE_URL ?? "https://escolaflaviomilhomem.com.br",
  locale: "pt-BR",
  // OG image gerada por `app/opengraph-image.tsx` (file-based).

  professor: {
    fullName: "Flávio Milhomem",
    role: "Promotor de Justiça — MPDFT · Ouvidor-Geral do MPDFT (2025-2027)",
    careerYears: 30,
    teachingYears: 25,
    education: [
      {
        institution: "Universidade Católica Portuguesa",
        program: "Mestrado em Ciências Jurídico-Criminais",
      },
      {
        institution: "École Nationale de la Magistrature (França)",
        program: "Especialização",
      },
    ],
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
    /** Linha secundária no chip do footer (LinkedIn) */
    linkedinFooterLabel: "/in/professorflaviomilhomem",
    mpdft: "https://www.mpdft.mp.br/",
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

  // Navegação principal — máximo 5 itens (Seção 8.1 do guia)
  mainNav: [
    { label: "Sobre", href: "/sobre" },
    { label: "Cursos", href: "/cursos" },
    { label: "Blog", href: "/blog" },
    { label: "Eventos", href: "/eventos/dia-do-advogado-2026" },
    { label: "Contato", href: "/contato" },
  ],
} as const;

export type SiteConfig = typeof siteConfig;
