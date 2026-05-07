import { PrismaClient } from "@prisma/client";
import { PrismaNeon } from "@prisma/adapter-neon";

/**
 * Cliente Prisma singleton com adapter Neon serverless.
 *
 * Em ambiente serverless (Vercel), evita reabrir conexão por invocação.
 * Em dev, persiste a instância no globalThis para sobreviver ao
 * hot reload.
 *
 * NOTA DE SEGURANÇA — Neon v1.0:
 * `sql()` agora só aceita tagged template literals. Uso fora desse
 * padrão gera erro em runtime (proteção contra SQL injection).
 */

declare global {
  // eslint-disable-next-line no-var
  var prismaGlobal: PrismaClient | undefined;
}

function makePrisma(): PrismaClient {
  const connectionString = process.env.DATABASE_URL;
  if (!connectionString) {
    // Em build sem env, evitar crash — usa stub.
    // Em runtime, qualquer query lança o erro abaixo.
    return new PrismaClient();
  }

  // PrismaNeon recebe um PoolConfig (não um Pool).
  const adapter = new PrismaNeon({ connectionString });
  return new PrismaClient({ adapter });
}

export const prisma: PrismaClient =
  globalThis.prismaGlobal ?? makePrisma();

if (process.env.NODE_ENV !== "production") {
  globalThis.prismaGlobal = prisma;
}
