/**
 * Ambiente demo completo: curso publicado + professor + aluno matriculado.
 *
 * Uso local (com DATABASE_URL em .env.local):
 *   npm run bootstrap:demo
 *
 * Uso com env de produção na Vercel:
 *   npx vercel env run production -- npm run bootstrap:demo
 */
import { readFileSync } from "node:fs";
import { resolve } from "node:path";

import bcrypt from "bcryptjs";
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
      const cur = process.env[key];
      if (cur == null || String(cur).trim() === "") {
        process.env[key] = val;
      }
    }
  } catch {
    /* optional */
  }
}

loadEnv();

const connectionString = process.env.DATABASE_URL?.trim();
if (!connectionString) {
  console.error("DATABASE_URL ausente.");
  process.exit(1);
}

const password = process.env.DEMO_PASSWORD ?? "EscolaFM2026!";
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

const USERS = [
  {
    email: "aluno@escolaflaviomilhomem.com.br",
    name: "Aluno Demonstração",
    role: "ALUNO",
  },
  {
    email: "professor@escolaflaviomilhomem.com.br",
    name: "Professor Demonstração",
    role: "ADMIN",
  },
];

async function seedProduct() {
  const manifest = JSON.parse(readFileSync(MANIFEST_PATH, "utf8"));
  const lessons = manifest.lessons.filter((l) => l.number <= 10);

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

  console.log(`✓ Curso publicado: ${PRODUCT.slug} (${lessons.length} aulas)`);
}

async function seedUsers() {
  const passwordHash = await bcrypt.hash(password, 12);
  for (const u of USERS) {
    await prisma.user.upsert({
      where: { email: u.email },
      create: {
        email: u.email,
        name: u.name,
        role: u.role,
        passwordHash,
      },
      update: { name: u.name, role: u.role, passwordHash },
    });
    console.log(`✓ Usuário ${u.role}: ${u.email}`);
  }
}

async function enrollAluno() {
  const user = await prisma.user.findUnique({
    where: { email: "aluno@escolaflaviomilhomem.com.br" },
    select: { id: true },
  });
  if (!user) throw new Error("Aluno demo não encontrado");

  const product = await prisma.product.findUnique({
    where: { slug: PRODUCT.slug },
    select: { id: true, priceCents: true },
  });
  if (!product) throw new Error("Produto não encontrado");

  const existing = await prisma.order.findFirst({
    where: { userId: user.id, productId: product.id },
    select: { id: true, status: true },
  });

  const payload = {
    source: "bootstrap_demo",
    grantedAt: new Date().toISOString(),
    note: "Bootstrap ambiente demo",
  };

  if (existing) {
    await prisma.order.update({
      where: { id: existing.id },
      data: {
        status: "PAID",
        amountCents: product.priceCents,
        paymentMethod: "MANUAL",
        paymentPayload: payload,
      },
    });
  } else {
    await prisma.order.create({
      data: {
        userId: user.id,
        productId: product.id,
        status: "PAID",
        amountCents: product.priceCents,
        paymentMethod: "MANUAL",
        paymentPayload: payload,
      },
    });
  }

  console.log(`✓ Matrícula PAID: aluno → ${PRODUCT.slug}`);
}

async function main() {
  await seedProduct();
  await seedUsers();
  await enrollAluno();

  console.log("\n--- Ambiente demo pronto ---");
  console.log("Professor: https://escola-de-direito-milhomem-site.vercel.app/professor/dashboard");
  console.log("  E-mail: professor@escolaflaviomilhomem.com.br");
  console.log("Aluno:     https://escola-de-direito-milhomem-site.vercel.app/aluno/dashboard");
  console.log("  E-mail: aluno@escolaflaviomilhomem.com.br");
  console.log("Senha (ambos):", password);
  console.log("Curso ativo slug:", PRODUCT.slug);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
