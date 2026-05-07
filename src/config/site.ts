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
  ogImage: "/og-default.png",

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
    youtube: "https://youtube.com/@PROFESSORFLÁVIOMILHOMEM",
    mpdft: "https://www.mpdft.mp.br/",
  },

  // IDs de tracking — preencher via .env quando criar conta
  tracking: {
    gtmId: process.env.NEXT_PUBLIC_GTM_ID ?? "",
    metaPixelId: process.env.NEXT_PUBLIC_META_PIXEL_ID ?? "",
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
