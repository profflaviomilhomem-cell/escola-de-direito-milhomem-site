/**
 * Seed do curso mock (Product + Lessons) e utilizador de dev opcional.
 *
 * Uso: node scripts/seed-mock-course.mjs
 * Requer DATABASE_URL em .env.local (carregado via dotenv se existir).
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

/** Espelha slugs de src/data/mock-aluno.ts (gerados por lessons()). */
const MOCK_LESSONS = [
  { module: "modulo-1-fundamentos", count: 3, startPos: 1 },
  { module: "modulo-2-provas", count: 3, startPos: 4 },
  { module: "modulo-3-tipologia", count: 3, startPos: 7 },
  { module: "modulo-4-sustentacao", count: 3, startPos: 10 },
].flatMap(({ module, count, startPos }) =>
  Array.from({ length: count }, (_, i) => ({
    slug: `${module}-aula-${i + 1}`,
    position: startPos + i,
    durationSec: 45 * 60,
    title: `Aula ${startPos + i} — ${module}`,
  })),
);

const PRODUCT = {
  id: "prod_cohort_2026_lancamento",
  slug: "direito-penal-acusatorio-lancamento",
  name: "Direito Penal Acusatório — Edição Lançamento",
  description:
    "Cohort de lançamento — seed automático a partir do mock da área do aluno.",
  type: "COHORT",
  priceCents: 0,
};

const DEV_USER = {
  id: "user_rafael_mock",
  email: "rafael@advogados-rj.com",
  name: "Rafael Andrade",
};

async function main() {
  await prisma.user.upsert({
    where: { email: DEV_USER.email },
    create: {
      id: DEV_USER.id,
      email: DEV_USER.email,
      name: DEV_USER.name,
      role: "ALUNO",
    },
    update: { name: DEV_USER.name },
  });

  await prisma.product.upsert({
    where: { slug: PRODUCT.slug },
    create: {
      id: PRODUCT.id,
      slug: PRODUCT.slug,
      name: PRODUCT.name,
      description: PRODUCT.description,
      type: PRODUCT.type,
      priceCents: PRODUCT.priceCents,
      active: true,
    },
    update: {
      name: PRODUCT.name,
      description: PRODUCT.description,
      active: true,
    },
  });

  for (const lesson of MOCK_LESSONS) {
    await prisma.lesson.upsert({
      where: {
        productId_slug: {
          productId: PRODUCT.id,
          slug: lesson.slug,
        },
      },
      create: {
        productId: PRODUCT.id,
        slug: lesson.slug,
        title: lesson.title,
        position: lesson.position,
        durationSec: lesson.durationSec,
        publishedAt: new Date(),
      },
      update: {
        title: lesson.title,
        position: lesson.position,
        durationSec: lesson.durationSec,
      },
    });
  }

  console.log(
    `Seed ok: produto "${PRODUCT.slug}" com ${MOCK_LESSONS.length} aulas; user dev ${DEV_USER.email}.`,
  );
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
