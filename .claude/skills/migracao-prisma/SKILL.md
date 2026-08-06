---
name: migracao-prisma
description: Cria e aplica migrations do Prisma neste projeto, onde `prisma migrate dev` não funciona (banco baselined, sem shadow database). Use ao alterar prisma/schema.prisma, criar tabela ou coluna, resolver erro P3005 ("database schema is not empty"), ou quando uma migration precisa ir para o banco. Contém o aviso de que DATABASE_URL local aponta para o Neon de produção.
---

# Migrations do Prisma neste projeto

Prisma **7.9.1**. A URL do banco não está no `schema.prisma` — mora em
`prisma.config.ts`, que carrega o `.env.local` via `dotenv`.

## ⛔ Antes de qualquer comando: o banco local é o de produção

`DATABASE_URL` no `.env.local` aponta para o **Neon de produção**. Não existe
banco de desenvolvimento separado neste projeto.

Consequência prática:

- `migrate deploy` altera **o banco que serve o site**.
- `migrate reset`, `db push --force-reset` e afins: **nunca**, em hipótese alguma.
- Seed que escreve: só com dado descartável e **apagando depois**.
- Antes de aplicar qualquer migration, confirmar com o Carlos.

## ⛔ `npm run prisma:migrate` não serve

Esse script é `prisma migrate dev`, que exige **shadow database** — o Neon
serverless não entrega, e o banco está **baselined**. Rodar isso quebra ou,
pior, tenta reescrever histórico.

O caminho válido é gerar o SQL manualmente e aplicar com `deploy`.

## Criar uma migration nova

### 1. Editar o schema

```bash
$EDITOR prisma/schema.prisma
```

### 2. Criar a pasta com timestamp no padrão da casa

O padrão das 9 migrations existentes é `AAAAMMDDHHMMSS_nome_em_snake_case`:

```bash
mkdir -p "prisma/migrations/$(date +%Y%m%d%H%M%S)_nome_da_mudanca"
```

### 3. Gerar o SQL — com `-o`, nunca com `>`

```bash
npx prisma migrate diff \
  --from-config-datasource \
  --to-schema prisma/schema.prisma \
  --script \
  -o prisma/migrations/<pasta>/migration.sql
```

**Por que `-o` e não `>`:** o dotenvx imprime um banner em **stdout**, não em
stderr:

```
◇ injected env (27) from .env.local // tip: ...
```

Com `>` essa linha vira a **primeira linha do `.sql`** e quebra a aplicação.
Com `-o` o arquivo sai limpo. Verificado neste repo.

Flags do Prisma 7 — `--to-schema`, não `--to-schema-datamodel` (nome antigo).

### 4. Conferir o SQL antes de aplicar

```bash
head -5 prisma/migrations/<pasta>/migration.sql   # nenhum ◇ na primeira linha
cat prisma/migrations/<pasta>/migration.sql       # ler o que vai rodar
```

Procurar `DROP`, `ALTER ... TYPE` e `NOT NULL` sem default — em banco de
produção com dado dentro, cada um desses é um incidente.

### 5. Aplicar

```bash
npx prisma migrate deploy      # ← toca o banco de produção
npx prisma generate
```

### 6. Verificar

```bash
npx prisma migrate status
npm run typecheck
```

## Erro P3005 — "database schema is not empty"

O banco já tinha as tabelas antes das migrations existirem. Marcar as quatro
primeiras como aplicadas:

```bash
npm run prisma:baseline    # scripts/baseline-prisma.mjs
npx prisma migrate deploy
```

O script resolve como `--applied`: `20260515120000_user_lesson_progress`,
`20260519190000_product_media_publish`, `20260526140000_checkout_pagarme`,
`20260526160000_manual_payment`.

## Referência rápida

| Objetivo              | Comando                                                                                    |
| --------------------- | ------------------------------------------------------------------------------------------ |
| Estado das migrations | `npx prisma migrate status`                                                                |
| Gerar SQL             | `migrate diff --from-config-datasource --to-schema prisma/schema.prisma --script -o <arq>` |
| Aplicar               | `npx prisma migrate deploy`                                                                |
| Regenerar client      | `npx prisma generate`                                                                      |
| Baseline (P3005)      | `npm run prisma:baseline`                                                                  |
| **Proibido**          | `migrate dev` · `migrate reset` · `db push --force-reset`                                  |

`npm run build` já roda `prisma generate` antes do `next build`, e o
`postinstall` também — não precisa lembrar disso em deploy.
