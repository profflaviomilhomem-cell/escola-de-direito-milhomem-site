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

const PRODUCT = {
  id: "prod_prova_digital",
  slug: "prova-digital-no-processo-penal",
  name: "Prova Digital no Processo Penal",
  tagline: "Prova digital e cadeia de custódia — perspectiva da acusação.",
  description:
    "Curso gravado com 10 aulas (vídeo editado e slides). " +
    "Módulo I: cadeia de custódia. Módulo II: prova digital no processo penal.",
  type: "COHORT",
  priceCents: 29700,
  publishStatus: "PUBLISHED",
};

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
      tagline: PRODUCT.tagline,
      description: PRODUCT.description,
      type: PRODUCT.type,
      priceCents: PRODUCT.priceCents,
      publishStatus: PRODUCT.publishStatus,
      publishedAt: new Date(),
      active: true,
    },
    update: {
      name: PRODUCT.name,
      tagline: PRODUCT.tagline,
      description: PRODUCT.description,
      priceCents: PRODUCT.priceCents,
      publishStatus: PRODUCT.publishStatus,
      publishedAt: new Date(),
      active: true,
    },
  });

  for (const entry of lessons) {
    const poster = entry.video?.poster?.path ?? null;
    await prisma.lesson.upsert({
      where: {
        productId_slug: {
          productId: PRODUCT.id,
          slug: entry.slug,
        },
      },
      create: {
        productId: PRODUCT.id,
        slug: entry.slug,
        title: entry.title,
        description: entry.title,
        coverImage: poster,
        position: entry.number,
        durationSec: 50 * 60,
        publishedAt: entry.video ? new Date() : null,
      },
      update: {
        title: entry.title,
        description: entry.title,
        coverImage: poster,
        position: entry.number,
        publishedAt: entry.video ? new Date() : undefined,
      },
    });
  }

  console.log(
    `Seed ok: "${PRODUCT.name}" (${PRODUCT.slug}) — ${lessons.length} aulas, R$ ${(PRODUCT.priceCents / 100).toFixed(2)}.`,
  );
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
