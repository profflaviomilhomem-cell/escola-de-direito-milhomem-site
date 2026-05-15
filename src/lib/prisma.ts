import { PrismaClient } from "@prisma/client";
import { PrismaNeon } from "@prisma/adapter-neon";

/**
 * Cliente Prisma singleton com adapter Neon serverless.
 *
 * Em ambiente serverless (Vercel), evita reabrir conexão por invocação.
 * Em dev, persiste a instância no globalThis para sobreviver ao
 * hot reload.
 *
 * Construção é **lazy**: o cliente só é instanciado na primeira query.
 * Isso evita que o build (page data collection) explodisse quando
 * `DATABASE_URL` está vazia em CI/preview — a checagem fica para o
 * runtime, não para o import do módulo.
 *
 * NOTA DE SEGURANÇA — Neon v1.0:
 * `sql()` agora só aceita tagged template literals. Uso fora desse
 * padrão gera erro em runtime (proteção contra SQL injection).
 */

declare global {
  var prismaGlobal: PrismaClient | undefined;
}

function makePrisma(): PrismaClient {
  const connectionString = process.env.DATABASE_URL;
  if (!connectionString) {
    throw new Error(
      "DATABASE_URL ausente — configure em .env.local ou nas envs da Vercel.",
    );
  }
  const adapter = new PrismaNeon({ connectionString });
  return new PrismaClient({ adapter });
}

function getPrisma(): PrismaClient {
  if (globalThis.prismaGlobal) return globalThis.prismaGlobal;
  const client = makePrisma();
  if (process.env.NODE_ENV !== "production") {
    globalThis.prismaGlobal = client;
  }
  return client;
}

export const prisma: PrismaClient = new Proxy({} as PrismaClient, {
  get(_target, prop, receiver) {
    const client = getPrisma();
    const value = Reflect.get(client, prop, receiver);
    return typeof value === "function" ? value.bind(client) : value;
  },
});
