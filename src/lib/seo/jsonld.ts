/**
 * Dados estruturados (JSON-LD) centralizados — schema.org.
 *
 * Fonte única para Person, Organization, Course, Article, FAQPage e
 * BreadcrumbList. Centralizar evita o drift de `sameAs` entre páginas
 * apontado na auditoria SEO/AEO/GEO (docs/auditoria-seo-aeo-geo.md).
 *
 * Guia: Cap. 6.7 (AEO/GEO), 7.2 (E-E-A-T), Apêndice D (modelos de schema).
 */
import { copy } from "@/config/copy";
import { siteConfig } from "@/config/site";
import { obrasMilhomemCatalogo } from "@/data/obras-milhomem";

/** IDs estáveis para consolidação de entidade no Knowledge Graph. */
export const PROFESSOR_ID = `${siteConfig.url}/sobre#flavio-milhomem`;
export const ORG_ID = `${siteConfig.url}/#organization`;

const LOGO_URL = `${siteConfig.url}/images/brand/logo-monogram-2026-05.png`;
const PORTRAIT_URL = `${siteConfig.url}/images/professor/flavio-portrait.png`;

/** Garante URL absoluta para campos de imagem do schema. */
function absUrl(path: string): string {
  if (/^https?:\/\//.test(path)) return path;
  return `${siteConfig.url}${path.startsWith("/") ? "" : "/"}${path}`;
}

/**
 * Credenciais externas verificáveis do professor (guia 7.2 — "combustível"
 * de E-E-A-T). Inclui as fichas de catálogo das obras como prova de autoria.
 *
 * ⚖️ Desvio do guia: o Google Scholar pedido em 7.2 NÃO entra porque o
 * professor não tem perfil lá (verificado em jun/2026 — criar o perfil é
 * tarefa operacional, fase 2). No lugar, entram o site legado (equity
 * branded) e a página de docente no Gran Cursos — ambas verificáveis.
 */
export const PROFESSOR_SAME_AS: string[] = [
  siteConfig.social.linkedin,
  siteConfig.social.instagram,
  siteConfig.social.youtube,
  siteConfig.social.mpdft,
  siteConfig.social.legacySite,
  siteConfig.social.granCursos,
  ...obrasMilhomemCatalogo.map((o) => o.fichaUrl),
];

export function personLd() {
  return {
    "@context": "https://schema.org",
    "@type": "Person",
    "@id": PROFESSOR_ID,
    name: siteConfig.professor.fullName,
    jobTitle: copy.professor.schemaJobTitle,
    description: copy.professor.marketingBioShort,
    url: `${siteConfig.url}/sobre`,
    image: PORTRAIT_URL,
    alumniOf: siteConfig.professor.education.map((e) => ({
      "@type": "CollegeOrUniversity",
      name: e.institution,
    })),
    worksFor: { "@id": ORG_ID },
    sameAs: PROFESSOR_SAME_AS,
  };
}

export function organizationLd() {
  return {
    "@context": "https://schema.org",
    "@type": "EducationalOrganization",
    "@id": ORG_ID,
    name: siteConfig.name,
    url: siteConfig.url,
    description: siteConfig.description,
    logo: {
      "@type": "ImageObject",
      url: LOGO_URL,
    },
    email: siteConfig.contact.email,
    founder: { "@id": PROFESSOR_ID },
    sameAs: [
      siteConfig.social.instagram,
      siteConfig.social.linkedin,
      siteConfig.social.youtube,
    ],
    contactPoint: {
      "@type": "ContactPoint",
      email: siteConfig.contact.email,
      contactType: "customer support",
      availableLanguage: ["Portuguese"],
    },
  };
}

/**
 * Course schema da Edição Lançamento.
 * Preço e formato espelham `src/data/produtos-escola.ts` (turma fundadora).
 */
export function edicaoLancamentoCourseLd() {
  return {
    "@context": "https://schema.org",
    "@type": "Course",
    name: "Edição Lançamento — Direito Penal pela perspectiva da acusação",
    description:
      "Cohort inaugural de 12 semanas com Flávio Milhomem. Direito penal e processo penal pela perspectiva da acusação, com fórum por aula, encontros ao vivo e acesso ao professor.",
    url: `${siteConfig.url}/cursos/edicao-lancamento`,
    inLanguage: "pt-BR",
    provider: {
      "@type": "EducationalOrganization",
      "@id": ORG_ID,
      name: siteConfig.name,
      url: siteConfig.url,
    },
    author: { "@id": PROFESSOR_ID },
    offers: {
      "@type": "Offer",
      category: "Turma fundadora",
      price: "297.00",
      priceCurrency: "BRL",
      availability: "https://schema.org/PreOrder",
      url: `${siteConfig.url}/cursos/edicao-lancamento`,
    },
    hasCourseInstance: [
      {
        "@type": "CourseInstance",
        // Predominantemente online + marco presencial opcional (11/ago, Brasília)
        courseMode: "blended",
        name: "Edição Lançamento — turma fundadora",
        courseWorkload: "PT70H",
        startDate: "2026-09-01",
        inLanguage: "pt-BR",
        instructor: { "@id": PROFESSOR_ID },
      },
    ],
  };
}

type ArticleInput = {
  title: string;
  excerpt: string;
  publishedAt?: string;
  modifiedAt?: string;
  coverImage?: string;
  author: { name: string };
  tags?: string[];
};

export function articleLd(post: ArticleInput, canonicalUrl: string) {
  const isProfessor = post.author.name === siteConfig.professor.fullName;
  return {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: post.title,
    description: post.excerpt,
    inLanguage: "pt-BR",
    datePublished: post.publishedAt,
    dateModified: post.modifiedAt ?? post.publishedAt,
    image: [post.coverImage ? absUrl(post.coverImage) : LOGO_URL],
    author: isProfessor
      ? {
          "@type": "Person",
          "@id": PROFESSOR_ID,
          name: post.author.name,
          url: `${siteConfig.url}/sobre`,
          sameAs: PROFESSOR_SAME_AS,
        }
      : { "@type": "Person", name: post.author.name },
    publisher: {
      "@type": "Organization",
      "@id": ORG_ID,
      name: siteConfig.name,
      logo: { "@type": "ImageObject", url: LOGO_URL },
    },
    mainEntityOfPage: { "@type": "WebPage", "@id": canonicalUrl },
    isPartOf: { "@id": ORG_ID },
    keywords: post.tags?.length ? post.tags.join(", ") : undefined,
  };
}

export function faqPageLd(items: ReadonlyArray<{ q: string; a: string }>) {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: items.map((item) => ({
      "@type": "Question",
      name: item.q,
      acceptedAnswer: { "@type": "Answer", text: item.a },
    })),
  };
}

export function breadcrumbLd(items: ReadonlyArray<{ name: string; url: string }>) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: item.name,
      item: /^https?:\/\//.test(item.url)
        ? item.url
        : `${siteConfig.url}${item.url}`,
    })),
  };
}

/** Bibliografia (/livros) — ItemList de obras com ficha verificável. */
export function bibliografiaLd() {
  return {
    "@context": "https://schema.org",
    "@type": "ItemList",
    name: `Obras de ${siteConfig.professor.fullName}`,
    itemListElement: obrasMilhomemCatalogo.map((obra, i) => ({
      "@type": "ListItem",
      position: i + 1,
      item: {
        "@type": "Book",
        name: obra.titulo,
        author: { "@id": PROFESSOR_ID },
        isbn: obra.isbn,
        numberOfPages: obra.paginas,
        publisher: obra.editora,
        about: obra.area,
        url: obra.fichaUrl,
        image: obra.capaSrc,
        inLanguage: "pt-BR",
      },
    })),
  };
}
