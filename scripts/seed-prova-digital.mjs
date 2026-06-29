/**
 * Sincroniza o curso real (manifest + arquivos em public/curso/provas-digitais)
 * para Product + Lesson no Postgres (Neon).
 *
 * Uso: npm run seed:prova-digital
 * Requer DATABASE_URL em .env.local
 */
import { readFileSync } from "node:fs";
import { resolve } from "node:path";

import { PrismaClient } from "@prisma/client";
import { PrismaNeon } from "@prisma/adapter-neon";

function loadEnv() {
  try {
    const envPath = resolve(process.cwd(), ".env.local");
    const raw = readFileSync(envPath, "utf8");
    for (const line of raw.split("\n")) {
      const t = line.trim();
      if (!t || t.startsWith("#")) continue;
      const i = t.indexOf("=");
      if (i === -1) continue;
      const key = t.slice(0, i).trim();
      let val = t.slice(i + 1).trim();
      if (
        (val.startsWith('"') && val.endsWith('"')) ||
        (val.startsWith("'") && val.endsWith("'"))
      ) {
        val = val.slice(1, -1);
      }
      if (!process.env[key]) process.env[key] = val;
    }
  } catch {
    /* .env.local opcional */
  }
}

loadEnv();

const connectionString = process.env.DATABASE_URL;
if (!connectionString) {
  console.error("DATABASE_URL ausente. Configure .env.local e tente de novo.");
  process.exit(1);
}

const prisma = new PrismaClient({
  adapter: new PrismaNeon({ connectionString }),
});

const MANIFEST_PATH = resolve(
  process.cwd(),
  "src/data/provas-digitais-manifest.json",
);

const NAVY = "#030024";
const CARBON = "#242A34";

const PRODUCT = {
  id: "prod_prova_digital",
  slug: "prova-digital-no-processo-penal",
  name: "Prova Digital no Processo Penal",
  shortTitle: "Prova Digital",
  catalogLabel: "Curso gravado · Prova Digital",
  tagline: "Prova digital e cadeia de custódia — perspectiva da acusação.",
  description:
    "Curso gravado com Flávio Milhomem: validade da prova digital, " +
    "cadeia de custódia e prática no processo penal contemporâneo.",
  coverGradient: { from: NAVY, via: "#0c0a38", to: CARBON, angle: 135 },
  type: "COHORT",
  priceCents: 29700,
  publishStatus: "PUBLISHED",
};

/** Módulos do curso (origem: src/data/provas-digitais-course.ts). */
const MODULES = [
  {
    id: "mod_pd_cadeia_custodia",
    slug: "cadeia-custodia",
    title: "I — Cadeia de custódia",
    subtitle: "Fundamentos e etapas da cadeia de custódia.",
    position: 1,
    // aulas com `number` neste intervalo entram neste módulo
    lessonRange: (n) => n <= 2,
  },
  {
    id: "mod_pd_prova_digital",
    slug: "prova-digital",
    title: "II — Prova digital no processo",
    subtitle: "Admissibilidade, mensagens, interceptação e valoração.",
    position: 2,
    lessonRange: (n) => n >= 3,
  },
];

function moduleForLesson(number) {
  return MODULES.find((m) => m.lessonRange(number)) ?? null;
}

/** Campos ricos da aula (espelha lessonFromManifest em provas-digitais-course.ts). */
function richLessonFields(entry) {
  const materials = entry.slides
    ? [
        {
          title: `Slides — Aula ${entry.number.toString().padStart(2, "0")}`,
          pages: 0,
          sizeKb: Math.round((entry.slides.bytes ?? 0) / 1024),
        },
      ]
    : [];

  const summary = entry.video
    ? `Aula ${entry.number} do curso Prova Digital no Processo Penal — vídeo editado e slides de apoio.`
    : `Aula ${entry.number} — slides disponíveis; vídeo editado pendente de entrega.`;

  const keyPoints = [
    entry.slides
      ? "Baixe os slides em Materiais antes ou depois do vídeo."
      : "Slides ainda não importados para esta aula.",
    entry.video
      ? "Vídeo editado carregado a partir do acervo do professor."
      : "Aguardando versão editada do vídeo (só gravação bruta nos arquivos originais).",
  ];

  return {
    summary,
    keyPoints,
    materials,
    videoSrc: entry.video?.path ?? null,
    posterImage: entry.video?.poster?.path ?? null,
    slidesUrl: entry.slides?.path ?? null,
  };
}

async function main() {
  const manifest = JSON.parse(readFileSync(MANIFEST_PATH, "utf8"));
  const lessons = manifest.lessons.filter((l) => l.number <= 10);

  if (lessons.length === 0) {
    console.error(
      "Manifesto sem aulas. Rode antes: npm run import:provas-digitais",
    );
    process.exit(1);
  }

  await prisma.product.upsert({
    where: { slug: PRODUCT.slug },
    create: {
      id: PRODUCT.id,
      slug: PRODUCT.slug,
      name: PRODUCT.name,
      shortTitle: PRODUCT.shortTitle,
      tagline: PRODUCT.tagline,
      catalogLabel: PRODUCT.catalogLabel,
      description: PRODUCT.description,
      coverGradient: PRODUCT.coverGradient,
      type: PRODUCT.type,
      priceCents: PRODUCT.priceCents,
      publishStatus: PRODUCT.publishStatus,
      publishedAt: new Date(),
      active: true,
    },
    update: {
      name: PRODUCT.name,
      shortTitle: PRODUCT.shortTitle,
      tagline: PRODUCT.tagline,
      catalogLabel: PRODUCT.catalogLabel,
      description: PRODUCT.description,
      coverGradient: PRODUCT.coverGradient,
      priceCents: PRODUCT.priceCents,
      publishStatus: PRODUCT.publishStatus,
      publishedAt: new Date(),
      active: true,
    },
  });

  for (const mod of MODULES) {
    await prisma.module.upsert({
      where: {
        productId_slug: { productId: PRODUCT.id, slug: mod.slug },
      },
      create: {
        id: mod.id,
        productId: PRODUCT.id,
        slug: mod.slug,
        title: mod.title,
        subtitle: mod.subtitle,
        position: mod.position,
      },
      update: {
        title: mod.title,
        subtitle: mod.subtitle,
        position: mod.position,
      },
    });
  }

  for (const entry of lessons) {
    const poster = entry.video?.poster?.path ?? null;
    const mod = moduleForLesson(entry.number);
    const rich = richLessonFields(entry);
    await prisma.lesson.upsert({
      where: {
        productId_slug: {
          productId: PRODUCT.id,
          slug: entry.slug,
        },
      },
      create: {
        productId: PRODUCT.id,
        moduleId: mod?.id ?? null,
        slug: entry.slug,
        title: entry.title,
        description: entry.title,
        summary: rich.summary,
        keyPoints: rich.keyPoints,
        materials: rich.materials,
        coverImage: poster,
        posterImage: rich.posterImage,
        videoSrc: rich.videoSrc,
        slidesUrl: rich.slidesUrl,
        position: entry.number,
        durationSec: 50 * 60,
        publishedAt: entry.video ? new Date() : null,
      },
      update: {
        moduleId: mod?.id ?? null,
        title: entry.title,
        description: entry.title,
        summary: rich.summary,
        keyPoints: rich.keyPoints,
        materials: rich.materials,
        coverImage: poster,
        posterImage: rich.posterImage,
        videoSrc: rich.videoSrc,
        slidesUrl: rich.slidesUrl,
        position: entry.number,
        publishedAt: entry.video ? new Date() : undefined,
      },
    });
  }

  console.log(
    `Seed ok: "${PRODUCT.name}" (${PRODUCT.slug}) — ${MODULES.length} módulos, ${lessons.length} aulas, R$ ${(PRODUCT.priceCents / 100).toFixed(2)}.`,
  );
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
