# Deploy na Vercel via CLI

## Por que o build falhou (maio/2026)

1. **TypeScript:** `src/data/mock-professor.ts` importava símbolos removidos de `mock-aluno` → arquivo removido (não era usado).
2. **Pré-render:** páginas `/professor/*` consultavam o banco no build sem `DATABASE_URL` → layouts aluno/professor com `dynamic = "force-dynamic"`.

Antes de deployar, confirme localmente:

```bash
npm run build
```

---

## 1. Login (uma vez)

No Terminal, na pasta do projeto:

```bash
cd "/Users/carlos/Documents/BettoOrbee/clientes /Flavio Milhomem/escola_de_direito_milhomem_site"
npx vercel login
```

Abre o browser → autorize.

Verificar:

```bash
npx vercel whoami
```

---

## 2. Vincular ao projeto GitHub já criado

```bash
npx vercel link
```

- **Set up and deploy?** → se já existe projeto na Vercel: escolha **Link to existing project**
- Selecione o time e o projeto importado do GitHub
- Confirme `./` como root

Isso cria a pasta `.vercel/` (não commitar secrets; `project.json` pode ir no git se o time usar).

---

## 3. Variáveis de ambiente pela CLI

Para cada variável (repita ou use o painel web):

```bash
npx vercel env add DATABASE_URL production
npx vercel env add AUTH_SECRET production
npx vercel env add NEXT_PUBLIC_SITE_URL production
```

Cole o valor quando pedir. Repita para **preview** se quiser PRs funcionando:

```bash
npx vercel env add DATABASE_URL preview
# ...
```

Ou puxe do painel para desenvolvimento local:

```bash
npx vercel env pull .env.local
```

**Mínimo para produção:**

| Variável | Notas |
|----------|--------|
| `DATABASE_URL` | Neon, connection pooled |
| `AUTH_SECRET` | `openssl rand -base64 48` |
| `NEXT_PUBLIC_SITE_URL` | `https://seu-projeto.vercel.app` ou domínio final |

Opcional: `RESEND_API_KEY`, `RESEND_FROM_EMAIL`.

---

## 4. Migrations no Neon (produção)

```bash
export DATABASE_URL="postgresql://..."   # mesma URL de production
npx prisma migrate deploy
```

---

## 5. Deploy

**Preview (teste):**

```bash
npx vercel
```

**Produção:**

```bash
npx vercel --prod
```

Ou: faça **commit + push** no GitHub (com `.vercel` linkado, o push dispara deploy automático).

---

## 6. Domínio

```bash
npx vercel domains add escolaflaviomilhomem.com.br
```

Siga as instruções de DNS no terminal ou no dashboard.

---

## Comandos úteis

```bash
npx vercel logs          # erros em runtime
npx vercel inspect       # último deployment
npx vercel env ls        # lista envs (sem valores)
```

---

## Não commite

- `.env`, `.env.local`
- Tokens em chat ou issues
