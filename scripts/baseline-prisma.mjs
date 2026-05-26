/**
 * Marca migrations como aplicadas quando o banco já tem schema (erro P3005).
 *
 * Uso: node scripts/baseline-prisma.mjs
 */
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { execSync } from "node:child_process";

function loadEnv() {
  try {
    const raw = readFileSync(resolve(process.cwd(), ".env.local"), "utf8");
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
    /* */
  }
}

loadEnv();

const migrations = [
  "20260515120000_user_lesson_progress",
  "20260519190000_product_media_publish",
];

for (const name of migrations) {
  console.log(`→ resolve --applied ${name}`);
  execSync(`npx prisma migrate resolve --applied ${name}`, {
    stdio: "inherit",
    env: process.env,
  });
}

console.log("\nBaseline concluído. Rode: npx prisma migrate deploy");
