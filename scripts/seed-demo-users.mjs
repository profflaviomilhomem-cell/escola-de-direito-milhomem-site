/**
 * Cria usuários de demonstração (aluno + professor) com senha.
 *
 * Uso:
 *   node scripts/seed-demo-users.mjs
 *   DEMO_PASSWORD="sua-senha" node scripts/seed-demo-users.mjs
 *
 * Requer DATABASE_URL em .env.local
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

const connectionString = process.env.DATABASE_URL;
if (!connectionString) {
  console.error("DATABASE_URL ausente.");
  process.exit(1);
}

const password = process.env.DEMO_PASSWORD ?? "EscolaFM2026!";
const prisma = new PrismaClient({
  adapter: new PrismaNeon({ connectionString }),
});

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

async function main() {
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
      update: {
        name: u.name,
        role: u.role,
        passwordHash,
      },
    });
    console.log(`✓ ${u.role}: ${u.email}`);
  }

  console.log("\nSenha (todos os usuários demo):", password);
  console.log("Troque em produção após o primeiro login.\n");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
