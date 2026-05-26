/**
 * Seed de Orders para destravar a Fase 1.4 (gate de acesso).
 *
 * Cria um Order PAID para o usuário demo aluno para os products que existirem.
 *
 * Uso:
 *   node scripts/seed-demo-orders.mjs
 *
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
      let val = t.slice(i + 1).trim().replace(/^["']|["']$/g, "");
      if (!process.env[key]) process.env[key] = val;
    }
  } catch {
    /* optional */
  }
}

loadEnv();

const connectionString = process.env.DATABASE_URL;
if (!connectionString) {
  console.error("DATABASE_URL ausente.");
  process.exit(1);
}

const prisma = new PrismaClient({
  adapter: new PrismaNeon({ connectionString }),
});

const DEMO_USER = {
  email: "aluno@escolaflaviomilhomem.com.br",
};

async function main() {
  const user = await prisma.user.findUnique({
    where: { email: DEMO_USER.email },
    select: { id: true, email: true },
  });
  if (!user) {
    console.error(`Usuário demo não encontrado: ${DEMO_USER.email}`);
    process.exit(1);
  }

  const products = await prisma.product.findMany({
    where: { active: true, publishStatus: { in: ["PUBLISHED", "SCHEDULED"] } },
    select: { id: true, slug: true, type: true, priceCents: true },
  });

  let created = 0;
  for (const p of products) {
    // Apenas COHORT desbloqueia hoje (gate da Fase 1.4).
    if (p.type !== "COHORT") continue;

    const existing = await prisma.order.findFirst({
      where: { userId: user.id, productId: p.id },
      select: { id: true },
    });

    if (!existing) {
      await prisma.order.create({
        data: {
          userId: user.id,
          productId: p.id,
          status: "PAID",
          amountCents: p.priceCents,
          paymentMethod: "MANUAL",
          paymentPayload: {
            source: "manual_grant",
            grantedByUserId: "seed",
            grantedAt: new Date().toISOString(),
            note: "Seed demo — Fase 1.4",
          },
        },
      });
      created += 1;
    } else {
      await prisma.order.updateMany({
        where: { userId: user.id, productId: p.id },
        data: {
          status: "PAID",
          amountCents: p.priceCents,
          paymentMethod: "MANUAL",
          paymentPayload: {
            source: "manual_grant",
            grantedByUserId: "seed",
            grantedAt: new Date().toISOString(),
            note: "Seed demo — Fase 1.4",
          },
        },
      });
    }

    console.log(`✓ Order demo ${p.slug} → PAID`);
  }

  console.log(`\nSeed concluído. Orders criadas/atualizadas: ${created}`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());

