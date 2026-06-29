/**
 * Cria ou atualiza o perfil "Aluno Demonstração" e libera acesso aos cohorts publicados.
 *
 * Uso:
 *   node scripts/create-aluno-demonstracao.mjs
 *   DEMO_PASSWORD="sua-senha" node scripts/create-aluno-demonstracao.mjs
 *
 * Requer DATABASE_URL em .env.local (Neon / produção).
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
      if (!process.env[key]) process.env[key] = val;
    }
  } catch {
    /* opcional */
  }
}

loadEnv();

const connectionString = process.env.DATABASE_URL?.trim();
if (!connectionString) {
  console.error(
    "DATABASE_URL ausente. Cole a URL do Neon em .env.local e rode de novo.",
  );
  process.exit(1);
}

const DEMO_EMAIL = "aluno@escolaflaviomilhomem.com.br";
const DEMO_NAME = "Aluno Demonstração";
const password = process.env.DEMO_PASSWORD ?? "EscolaFM2026!";

const prisma = new PrismaClient({
  adapter: new PrismaNeon({ connectionString }),
});

async function main() {
  const passwordHash = await bcrypt.hash(password, 12);

  const user = await prisma.user.upsert({
    where: { email: DEMO_EMAIL },
    create: {
      email: DEMO_EMAIL,
      name: DEMO_NAME,
      role: "ALUNO",
      passwordHash,
    },
    update: {
      name: DEMO_NAME,
      role: "ALUNO",
      passwordHash,
    },
    select: { id: true, email: true, name: true, role: true },
  });

  const products = await prisma.product.findMany({
    where: { active: true, publishStatus: { in: ["PUBLISHED", "SCHEDULED"] } },
    select: { id: true, slug: true, type: true, priceCents: true },
  });

  let orders = 0;
  for (const p of products) {
    if (p.type !== "COHORT") continue;

    const existing = await prisma.order.findFirst({
      where: { userId: user.id, productId: p.id },
      select: { id: true, status: true },
    });

    if (existing) {
      if (existing.status !== "PAID") {
        await prisma.order.update({
          where: { id: existing.id },
          data: { status: "PAID" },
        });
      }
      continue;
    }

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
          note: "Perfil Aluno Demonstração",
        },
      },
    });
    orders += 1;
  }

  console.log("Perfil criado/atualizado:");
  console.log("  Nome:", user.name);
  console.log("  E-mail:", user.email);
  console.log("  Papel:", user.role);
  console.log("  Pedidos PAID novos:", orders);
  console.log("\nLogin: https://escola-de-direito-milhomem-site.vercel.app/entrar");
  console.log("Senha:", password);
  console.log("Painel: /aluno/dashboard\n");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
