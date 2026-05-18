import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";

import { InstitutionalNotice } from "@/components/marketing/institutional-notice";
import { siteConfig } from "@/config/site";
import { copy } from "@/config/copy";
import { Dossie3D } from "@/components/marketing/animation/dossie-3d";
import { BlogSection } from "@/components/marketing/blog-section";
import { TestimonialsSection } from "@/components/marketing/testimonials-section";
import { HomeStatsSection } from "@/components/marketing/home-stats-section";

export const metadata: Metadata = {
  title: `${siteConfig.name} — ${siteConfig.tagline}`,
  description: siteConfig.description,
  alternates: { canonical: "/" },
};

export default function HomePage() {
  const {
    hero,
    stats,
    manifesto,
    programa,
    modules,
    professorSection,
    cohort,
  } = copy.home;

  const personLd = {
    "@context": "https://schema.org",
    "@type": "Person",
    name: siteConfig.professor.fullName,
    jobTitle: copy.professor.schemaJobTitle,
    alumniOf: siteConfig.professor.education.map((e) => ({
      "@type": "CollegeOrUniversity",
      name: e.institution,
    })),
    sameAs: [
      siteConfig.social.linkedin,
      siteConfig.social.instagram,
      siteConfig.social.youtube,
    ],
  };

  const organizationLd = {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: siteConfig.name,
    url: siteConfig.url,
    description: siteConfig.description,
    founder: { "@type": "Person", name: siteConfig.professor.fullName },
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(personLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationLd) }}
      />

      <section className="relative overflow-hidden px-[5%] pb-10 pt-28 md:pb-14 md:pt-20 lg:flex lg:min-h-screen lg:items-center lg:pb-0">
        <div
          aria-hidden="true"
          className="pointer-events-none absolute left-1/2 top-1/2 z-0 -translate-x-1/2 -translate-y-1/2 font-serif"
          style={{
            fontSize: "80vh",
            lineHeight: 1,
            color: "rgba(241, 187, 65, 0.08)",
          }}
        >
          I
        </div>

        <div className="mx-auto grid w-full max-w-[1200px] grid-cols-1 gap-6 lg:grid-cols-[1.2fr_1fr] lg:gap-20">
          <div className="relative z-10 flex flex-col justify-center lg:col-start-1 lg:row-start-1">
            <p className="fm-hero-fade fm-hero-fade--eyebrow text-amber mb-6 font-mono text-[10px] uppercase tracking-[0.32em]">
              {hero.eyebrow}
            </p>
            <h1
              className="fm-hero-fade fm-hero-fade--title mb-0 font-serif leading-[1.02] tracking-[0.055em] md:tracking-[0.065em] lg:mb-8"
              style={{ fontSize: "clamp(50px, 8vw, 100px)" }}
            >
              {hero.titleLine1}{" "}
              <em className="text-amber italic">{hero.titleEmphasis1}</em>
              <br />
              {hero.titleLine2}{" "}
              <em className="text-amber italic">{hero.titleEmphasis2}</em>
            </h1>
          </div>

          <div className="fm-hero-fade fm-hero-fade--dossie relative z-10 mx-auto mb-4 w-full max-w-[280px] shrink-0 overflow-visible pb-8 py-1 lg:col-start-2 lg:row-start-1 lg:row-span-2 lg:mb-0 lg:max-w-none lg:overflow-visible lg:pb-0 lg:py-0 lg:self-center">
            <div className="lg:hidden">
              <Dossie3D compact />
            </div>
            <div className="hidden lg:block">
              <Dossie3D />
            </div>
          </div>

          <div className="relative z-20 flex flex-col justify-center lg:col-start-1 lg:row-start-2">
            <p className="fm-hero-fade fm-hero-fade--tagline text-paper-800 mb-6 max-w-xl text-xl italic leading-relaxed tracking-[0.03em] md:mb-10 md:text-2xl">
              {hero.tagline}
            </p>
            <p className="fm-hero-fade fm-hero-fade--bio text-paper-700 mb-8 max-w-xl text-base leading-relaxed tracking-[0.025em] md:mb-10">
              {hero.bio}
            </p>
            <div className="fm-hero-fade fm-hero-fade--cta flex flex-col gap-2.5 sm:flex-row sm:flex-wrap sm:gap-3">
              <Link
                href="#cohort"
                className="bg-paper text-carbon hover:bg-amber hover:text-paper inline-flex w-full items-center justify-center gap-2 px-6 py-3.5 font-mono text-[10px] uppercase tracking-[0.18em] transition-colors sm:w-auto sm:px-8 sm:py-4 sm:text-[11px] sm:tracking-[0.2em]"
              >
                {hero.ctaPrimary} →
              </Link>
              <Link
                href="/newsletter"
                className="border-amber/35 text-paper hover:border-amber hover:bg-amber/5 inline-flex w-full items-center justify-center gap-2 border bg-white/[0.03] px-6 py-3.5 font-mono text-[10px] uppercase tracking-[0.18em] backdrop-blur-sm transition-colors sm:w-auto sm:px-8 sm:py-4 sm:text-[11px] sm:tracking-[0.2em]"
              >
                {hero.ctaSecondary}
              </Link>
              <Link
                href="/calculadora-de-pena"
                className="text-paper-600 hover:text-amber inline-flex w-full items-center justify-center gap-2 py-2 font-mono text-[10px] uppercase tracking-[0.16em] transition-colors sm:w-auto sm:px-2 sm:py-4 sm:text-[11px]"
              >
                {hero.ctaCalculadora} →
              </Link>
            </div>
          </div>
        </div>
      </section>

      <HomeStatsSection stats={stats} />

      <section className="relative z-10 px-[5%] py-16 lg:py-32">
        <div className="mx-auto max-w-[800px] text-center">
          <h2
            data-reveal
            className="mb-10 font-serif leading-[1.12] tracking-[0.05em] md:tracking-[0.06em]"
            style={{ fontSize: "clamp(48px, 6vw, 88px)" }}
          >
            {manifesto.title}{" "}
            <em className="text-amber italic">{manifesto.titleEmphasis}</em>{" "}
            {manifesto.titleEnd}
          </h2>
          <p data-reveal className="text-paper-800 mb-10 leading-[1.7]">
            {manifesto.body}
          </p>
          <Link
            data-reveal
            href="/sobre"
            className="border-amber text-paper hover:text-amber inline-block border-b font-mono text-[11px] uppercase tracking-[0.2em] transition-colors"
          >
            {manifesto.linkLabel} →
          </Link>
        </div>
      </section>

      <section
        id="programa"
        className="bg-amber/[0.02] relative z-10 px-[5%] py-16 lg:py-32"
      >
        <div className="mx-auto max-w-[1200px]">
          <h2
            data-reveal
            className="mb-16 font-serif leading-[1.1]"
            style={{ fontSize: "clamp(40px, 5vw, 72px)" }}
          >
            {programa.sectionTitle}{" "}
            <em className="text-amber italic">{programa.sectionEmphasis}</em>
          </h2>
          <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
            {modules.map((m) => (
              <article
                key={m.id}
                data-reveal
                className="hover:border-amber hover:bg-amber/5 border border-white/10 p-10 transition-colors"
              >
                <span className="text-amber mb-5 block font-mono text-xs tracking-[0.2em]">
                  MÓDULO {m.id}
                </span>
                <h3 className="mb-5 font-serif text-3xl">{m.title}</h3>
                <p className="text-paper-700 leading-relaxed">{m.desc}</p>
              </article>
            ))}
          </div>
          <div data-reveal className="mt-16 text-center">
            <Link
              href="/cursos"
              className="bg-paper text-carbon hover:bg-amber hover:text-paper inline-flex items-center gap-2 px-8 py-4 font-mono text-[11px] uppercase tracking-[0.2em] transition-colors"
            >
              {programa.ctaLabel}
            </Link>
          </div>
        </div>
      </section>

      <BlogSection />

      <TestimonialsSection />

      <section
        className="relative z-10 px-[5%] py-24"
        aria-labelledby="calc-band-title"
      >
        <div className="border-amber/25 mx-auto flex max-w-[1200px] flex-col items-start justify-between gap-8 border bg-white/[0.02] p-10 md:flex-row md:items-center">
          <div>
            <p className="text-amber font-mono text-[10px] uppercase tracking-[0.2em]">
              {copy.home.calculadoraBand.eyebrow}
            </p>
            <h2
              id="calc-band-title"
              className="mt-3 font-serif text-3xl leading-tight md:text-4xl"
            >
              {copy.home.calculadoraBand.title}{" "}
              <em className="text-amber italic">
                {copy.home.calculadoraBand.titleEmphasis}
              </em>
            </h2>
            <p className="text-paper-700 mt-3 max-w-xl text-base leading-relaxed">
              {copy.home.calculadoraBand.lead}
            </p>
          </div>
          <Link
            href="/calculadora-de-pena"
            className="bg-amber text-paper hover:bg-amber-soft shrink-0 px-8 py-4 font-mono text-[11px] uppercase tracking-[0.2em] transition-colors"
          >
            {copy.home.calculadoraBand.cta}
          </Link>
        </div>
      </section>

      <section id="professor" className="relative z-10 px-[5%] py-16 lg:py-32">
        <div className="mx-auto max-w-[1200px]">
          <div className="grid items-center gap-20 md:grid-cols-[1fr_1.5fr]">
            <div
              data-reveal
              className="border-amber/30 relative aspect-[3/4] overflow-hidden border"
            >
              <Image
                src="/images/professor/flavio-hero.png"
                alt={`Retrato de ${siteConfig.professor.fullName}, professor de Direito Penal`}
                fill
                sizes="(max-width: 768px) 100vw, 480px"
                className="object-cover object-top"
                priority={false}
              />
            </div>
            <div>
              <p
                data-reveal
                className="text-amber mb-4 font-mono text-[10px] uppercase tracking-[0.2em]"
              >
                {professorSection.eyebrow}
              </p>
              <h2
                data-reveal
                className="mb-10 font-serif leading-[1.1]"
                style={{ fontSize: "clamp(40px, 5vw, 72px)" }}
              >
                {professorSection.titleLine1}{" "}
                <em className="text-amber italic">{professorSection.titleEmphasis}</em>
              </h2>
              <p data-reveal className="text-paper-800 mb-7 text-lg leading-[1.8]">
                {professorSection.lead}
              </p>
              <p data-reveal className="text-paper-800 mb-10 text-lg leading-[1.8]">
                {professorSection.body}
              </p>
              <Link
                data-reveal
                href="/sobre"
                className="bg-paper text-carbon hover:bg-amber hover:text-paper inline-flex items-center gap-2 px-8 py-4 font-mono text-[11px] uppercase tracking-[0.2em] transition-colors"
              >
                {professorSection.ctaLabel}
              </Link>
            </div>
          </div>
        </div>
      </section>

      <section id="cohort" className="relative z-10 px-[5%] py-16 lg:py-32">
        <div className="mx-auto max-w-[1200px]">
          <div
            data-reveal
            className="border-amber/30 relative my-12 border px-10 py-24 text-center"
            style={{
              background:
                "radial-gradient(circle at center, rgba(156,91,30,0.15), transparent)",
            }}
          >
            <p className="text-amber font-mono text-[10px] uppercase tracking-[0.2em]">
              {cohort.eyebrow}
            </p>
            <h2
              className="mt-6 font-serif leading-[1.1]"
              style={{ fontSize: "clamp(40px, 5vw, 72px)" }}
            >
              {cohort.title}{" "}
              <em className="text-amber italic">{cohort.titleEmphasis}</em>
            </h2>
            <div className="font-serif text-7xl my-8">
              <span className="text-paper">{cohort.priceDisplay}</span>
              <small className="text-amber text-2xl">{cohort.priceSuffix}</small>
            </div>
            <p className="text-paper-600 mb-10 text-base">
              {cohort.note}
            </p>
            <Link
              href="/newsletter"
              className="bg-amber text-paper hover:bg-amber-soft inline-flex items-center gap-2 px-16 py-5 font-mono text-[11px] uppercase tracking-[0.2em] transition-colors"
            >
              {cohort.cta}
            </Link>
            <div className="text-paper-600 mt-10 flex flex-wrap justify-center gap-10 font-mono text-[10px] uppercase tracking-[0.2em]">
              {cohort.chips.map((chip) => (
                <span key={chip}>{chip}</span>
              ))}
            </div>
            <InstitutionalNotice className="mx-auto mt-12 max-w-2xl text-center" />
          </div>
        </div>
      </section>
    </>
  );
}
