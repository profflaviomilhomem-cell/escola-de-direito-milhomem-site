import "dotenv/config";
import { defineConfig } from "prisma/config";

/**
 * Configuração Prisma 7 — connection URL fora do schema.
 *
 * No runtime usamos `PrismaClient({ adapter: PrismaNeon(...) })` em
 * `src/lib/prisma.ts`. Aqui só configuramos o caminho do schema e a
 * URL para o CLI rodar migrations.
 *
 * Vide https://pris.ly/d/prisma7-client-config
 */
export default defineConfig({
  schema: "./prisma/schema.prisma",
  migrations: {
    path: "./prisma/migrations",
  },
});
