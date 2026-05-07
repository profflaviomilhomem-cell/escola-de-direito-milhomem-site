# Contribuindo

## Branches

- `main` — protegido, sempre deployable
- `feature/{ticket}-descricao`
- `fix/{ticket}-descricao`
- `hotfix/{ticket}-descricao`

## Commits

Usamos **Conventional Commits**:

```
feat: cadastra calculadora de pena (3 etapas wizard)
fix: corrige escape de markdown no fórum
docs: atualiza ADR 0001
refactor: extrai LeadForm para componente compartilhado
test: cobre password com 72 bytes exatos
chore: bump deps de dev
```

## Pull Requests

Antes de abrir PR:

```bash
npm run lint
npm run typecheck
npm run format:check
npm test
npm run build
```

Toda PR exige:

1. Revisão de um colega da Orbita Labs
2. CI verde (workflow `.github/workflows/ci.yml`)
3. Preview deployment funcional na Vercel

Merge via **squash** para histórico limpo.

## Testes

Disciplina em três camadas (Seção 18 do guia):

- `tests/unit/` — Jest + RTL · lógica de negócio + componentes
- `tests/integration/` — Jest + Postgres descartável · rotas API
- `tests/e2e/` — Playwright · fluxos críticos do usuário

Cobertura mínima de **80%** em `src/lib/business/`.

## Regras não negociáveis

- Validação Zod **server + client** em todo formulário público
- Senha sempre passa por `hashPassword()` de `src/lib/auth/password.ts`
- Nunca remover a validação de 72 bytes
- Nunca commitar `.env`/secrets
- Nunca fazer query com `sql()` fora de tagged template literal (Neon v1.0)
- Auditar deps quinzenalmente (`npm audit`)
