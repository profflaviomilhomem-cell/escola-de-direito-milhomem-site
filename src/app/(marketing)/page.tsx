import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";

import { siteConfig } from "@/config/site";
import { Dossie3D } from "@/components/marketing/animation/dossie-3d";

export const metadata: Metadata = {
  title: `${siteConfig.name} — ${siteConfig.tagline}`,
  description: siteConfig.description,
  alternates: { canonical: "/" },
};

const stats = [
  { val: "30", label: "Anos de Carreira no MPDFT" },
  { val: "25", label: "Anos de Docência Superior" },
  { val: "IV", label: "Obras Publicadas" },
  { val: "24k", label: "Juristas Formados" },
];

const modules = [
  {
    id: "01",
    title: "Teoria da Acusação",
    desc: "Construção da denúncia, tipicidade sob a ótica do MP e estratégia acusatória com base em jurisprudência atualizada.",
  },
  {
    id: "02",
    title: "Tribunal do Júri",
    desc: "Oratória forense, réplica, tréplica e construção de teses acusatórias em crimes dolosos contra a vida.",
  },
  {
    id: "03",
    title: "Prova Penal",
    desc: "Cadeia de custódia, prova digital e técnicas de produção probatória na perspectiva do Ministério Público.",
  },
  {
    id: "04",
    title: "Direito Penal Militar",
    desc: "Especialização exclusiva: competência da Justiça Militar e procedimentos — campo em que Flávio é referência nacional.",
  },
  {
    id: "05",
    title: "Dosimetria Real",
    desc: "A técnica trifásica aplicada: como o MP calcula a pena e como sustentar a dosimetria em plenário.",
  },
  {
    id: "06",
    title: "Investigação e Compliance",
    desc: "Programas de integridade, responsabilidade penal corporativa e investigação defensiva sob o crivo ministerial.",
  },
];

export default function HomePage() {
  const personLd = {
    "@context": "https://schema.org",
    "@type": "Person",
    name: siteConfig.professor.fullName,
    jobTitle: siteConfig.professor.role,
    alumniOf: siteConfig.professor.education.map((e) => ({
      "@type": "CollegeOrUniversity",
      name: e.institution,
    })),
    sameAs: [
      siteConfig.social.mpdft,
      siteConfig.social.linkedin,
      siteConfig.social.instagram,
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

      {/* === Hero === */}
      <section className="relative flex min-h-screen items-center overflow-hidden px-[5%] pt-32 md:pt-20">
        {/* Numeral romano gigante decorativo */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute left-1/2 top-1/2 z-0 -translate-x-1/2 -translate-y-1/2 font-serif"
          style={{
            fontSize: "80vh",
            lineHeight: 1,
            color: "rgba(221, 173, 12, 0.08)",
          }}
        >
          I
        </div>

        <div className="mx-auto grid w-full max-w-[1200px] gap-20 lg:grid-cols-[1.2fr_1fr]">
          <div className="relative z-10 flex flex-col justify-center">
            <p className="fm-hero-fade fm-hero-fade--eyebrow text-amber mb-6 font-mono text-[10px] uppercase tracking-[0.2em]">
              Cohort Inaugural · 11 de Agosto 2026
            </p>
            <h1
              className="fm-hero-fade fm-hero-fade--title mb-8 font-serif leading-[0.9]"
              style={{ fontSize: "clamp(50px, 8vw, 100px)" }}
            >
              A <em className="text-amber italic">Escola</em> do
              <br />
              <em className="text-amber italic">Promotor</em>
            </h1>
            <p className="fm-hero-fade fm-hero-fade--tagline text-paper-800 mb-10 max-w-xl text-2xl italic">
              Direito Penal pela{" "}
              <em className="text-amber not-italic">
                perspectiva da acusação
              </em>{" "}
              — pelo Promotor que está no Tribunal, não no manual.
            </p>
            <p className="fm-hero-fade fm-hero-fade--bio text-paper-700 mb-10 max-w-xl text-base">
              <strong className="text-paper">Flávio Milhomem</strong> —
              Promotor de Justiça do MPDFT há 30 anos. Ouvidor-Geral 2025–2027.
              Mestre pela Católica de Portugal e Especialista pela ENM França.
              Professor que ensina o que pratica.
            </p>
            <div className="fm-hero-fade fm-hero-fade--cta flex gap-6">
              <Link
                href="#cohort"
                className="bg-paper text-carbon hover:bg-amber hover:text-paper inline-flex items-center gap-2 px-8 py-4 font-mono text-[11px] uppercase tracking-[0.2em] transition-colors"
              >
                Reservar Vaga →
              </Link>
            </div>
          </div>

          <div className="fm-hero-fade fm-hero-fade--dossie relative z-10 hidden lg:block">
            <Dossie3D />
          </div>
        </div>
      </section>

      {/* === Stats === */}
      <section className="relative z-10 px-[5%] py-32">
        <div className="mx-auto max-w-[1200px]">
          <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-4">
            {stats.map((stat) => (
              <div
                key={stat.label}
                data-reveal
                className="border-amber/20 border bg-white/[0.02] p-10 backdrop-blur-sm"
              >
                <div className="text-amber mb-3 font-serif text-6xl leading-none">
                  {stat.val}
                </div>
                <div className="text-paper-600 font-mono text-[10px] uppercase tracking-[0.2em]">
                  {stat.label}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* === Manifesto teaser === */}
      <section className="relative z-10 px-[5%] py-32">
        <div className="mx-auto max-w-[800px] text-center">
          <h2
            data-reveal
            className="mb-10 font-serif leading-[1.1]"
            style={{ fontSize: "clamp(48px, 6vw, 88px)" }}
          >
            O Promotor que te ensina o que o{" "}
            <em className="text-amber italic">Promotor vê</em>.
          </h2>
          <p
            data-reveal
            className="text-paper-800 mb-10 leading-[1.7]"
          >
            Quase todo curso de Direito Penal ensina pela ótica da defesa ou da
            abstração acadêmica. A perspectiva do Ministério Público — de quem
            sustenta a ação e defende a sociedade — é sistematicamente ignorada.
            A nossa escola existe para corrigir esse déficit.
          </p>
          <Link
            data-reveal
            href="/sobre"
            className="border-amber text-paper hover:text-amber inline-block border-b font-mono text-[11px] uppercase tracking-[0.2em] transition-colors"
          >
            Ler o Manifesto Completo →
          </Link>
        </div>
      </section>

      {/* === Programa (módulos) === */}
      <section
        id="programa"
        className="bg-amber/[0.02] relative z-10 px-[5%] py-32"
      >
        <div className="mx-auto max-w-[1200px]">
          <h2
            data-reveal
            className="mb-16 font-serif leading-[1.1]"
            style={{ fontSize: "clamp(40px, 5vw, 72px)" }}
          >
            O que você vai <em className="text-amber italic">dominar</em>
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
              Ver Ementa Detalhada
            </Link>
          </div>
        </div>
      </section>

      {/* === Bio do professor === */}
      <section id="professor" className="relative z-10 px-[5%] py-32">
        <div className="mx-auto max-w-[1200px]">
          <div className="grid items-center gap-20 md:grid-cols-[1fr_1.5fr]">
            <div
              data-reveal
              className="border-amber/30 relative aspect-[3/4] overflow-hidden border"
            >
              <Image
                src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=1974&auto=format&fit=crop"
                alt={`Retrato de ${siteConfig.professor.fullName}`}
                fill
                sizes="(max-width: 768px) 100vw, 480px"
                className="object-cover"
                style={{ filter: "grayscale(1) contrast(1.1)" }}
                priority={false}
              />
            </div>
            <div>
              <h2
                data-reveal
                className="mb-10 font-serif leading-[1.1]"
                style={{ fontSize: "clamp(40px, 5vw, 72px)" }}
              >
                Flávio <em className="text-amber italic">Milhomem</em>
              </h2>
              <p data-reveal className="text-paper-800 mb-7 text-lg leading-[1.8]">
                Promotor de Justiça do MPDFT desde 1996. Atualmente exerce o
                cargo de{" "}
                <strong className="text-paper">
                  Ouvidor-Geral do Ministério Público
                </strong>{" "}
                (biênio 2025–2027). Mestre pela Universidade Católica
                Portuguesa e Especialista pela Escola Nacional da Magistratura
                Francesa.
              </p>
              <p data-reveal className="text-paper-800 mb-10 text-lg leading-[1.8]">
                Com mais de 25 anos de docência, Flávio transformou a prática
                de quem decide o que vira denúncia em um método de ensino
                voltado para quem busca a excelência no Direito Criminal.
              </p>
              <Link
                data-reveal
                href="/sobre"
                className="bg-paper text-carbon hover:bg-amber hover:text-paper inline-flex items-center gap-2 px-8 py-4 font-mono text-[11px] uppercase tracking-[0.2em] transition-colors"
              >
                Conhecer Trajetória
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* === CTA Cohort === */}
      <section id="cohort" className="relative z-10 px-[5%] py-32">
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
              Edição de Lançamento
            </p>
            <h2
              className="mt-6 font-serif leading-[1.1]"
              style={{ fontSize: "clamp(40px, 5vw, 72px)" }}
            >
              Cohort <em className="text-amber italic">Inaugural 2026</em>
            </h2>
            <div className="font-serif text-7xl my-8">
              <span className="text-paper">1.997</span>
              <small className="text-amber text-2xl">,00</small>
            </div>
            <p className="text-paper-600 mb-10 text-base">
              Vagas limitadas para acompanhamento direto.
            </p>
            <Link
              href="/newsletter"
              className="bg-amber text-paper hover:bg-amber-soft inline-flex items-center gap-2 px-16 py-5 font-mono text-[11px] uppercase tracking-[0.2em] transition-colors"
            >
              Garantir Minha Vaga na Estreia
            </Link>
            <div className="text-paper-600 mt-10 flex flex-wrap justify-center gap-10 font-mono text-[10px] uppercase tracking-[0.2em]">
              <span>Sessões ao Vivo</span>
              <span>Suporte Direto</span>
              <span>Certificação MP</span>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
