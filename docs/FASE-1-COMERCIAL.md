# Fase 1 — Comercial (regras de negócio)

> Documento de referência para checkout, webhook e matrícula.  
> Código espelhado em `src/lib/business/commercial-rules.ts`.

## Tipos de produto (`Product.type`)

| Tipo         | Modelo                               | Acesso liberado quando                                                     | Tabela         |
| ------------ | ------------------------------------ | -------------------------------------------------------------------------- | -------------- |
| `COHORT`     | Compra única (turma / curso gravado) | `Order.status` ∈ `PAID`, `AUTHORIZED`                                      | `Order`        |
| `TRIPWIRE`   | Compra pontual (masterclass)         | Mesmo que `COHORT`                                                         | `Order`        |
| `COMUNIDADE` | Assinatura recorrente                | `Subscription.status` = `ACTIVE`                                           | `Subscription` |
| `EBOOK`      | Legado Eduzz                         | **Sem acesso automático no MVP** — tratar manualmente ou integração futura | —              |

## Validade do acesso (“acesso até”)

**Decisão MVP (maio/2026):** não usar campo `accessExpiresAt` na Fase 1.

- Matrícula **COHORT** com `Order PAID` = acesso **sem data de expiração** no gate atual.
- Prazo de “12 meses na plataforma” (Edição Lançamento) fica como **regra comercial/contratual**; campo no banco entra na **Fase 2** se o cliente exigir bloqueio automático.

## Meios de pagamento no MVP

| Meio       | Checkout                          | Webhook                      | Status   |
| ---------- | --------------------------------- | ---------------------------- | -------- |
| **PIX**    | Sim (`/checkout/[slug]`)          | `order.paid` / `charge.paid` | Ativo    |
| **Boleto** | Sim (exige endereço)              | idem                         | Ativo    |
| **Cartão** | Próximo passo (token JS Pagar.me) | idem                         | Pendente |

Fluxo comum:

1. Aluno logado → `POST /api/orders/create` → `Order` `PENDING` no Neon.
2. API Pagar.me cria cobrança; salvamos `pagarmeOrderId`, `pagarmeChargeId`, `paymentPayload` (QR, boleto).
3. Aluno paga → webhook atualiza `Order` → `PAID`.
4. `userHasAccess()` libera `/aluno/cursos/*` e `/aluno/aulas/*`.

## UTM

- Captura no `sessionStorage` (`fm_utm`) nas páginas marketing.
- Enviado no body do checkout → gravado em `Order.utmSource`, `utmMedium`, `utmCampaign`.

## Variáveis de ambiente

| Variável                 | Uso                                  |
| ------------------------ | ------------------------------------ |
| `PAGARME_SECRET_KEY`     | API REST (criar pedido)              |
| `PAGARME_WEBHOOK_SECRET` | Validar HMAC do webhook              |
| `PAGARME_PUBLIC_KEY`     | Tokenização de cartão (passo futuro) |

Webhook de produção: `POST https://<domínio>/api/webhooks/pagarme`

## Acesso manual (turma fundadora)

**Implementado (Passo 2):** professor/admin em `/professor/alunos` ou `POST /api/professor/enrollments`.

- Cria `Order` `PAID` com `paymentMethod = MANUAL` e `paymentPayload.source = manual_grant`.
- Produtos `COMUNIDADE` criam `Subscription` `ACTIVE` com `pagarmeSubId` prefixado `manual_`.
- O aluno precisa ter conta existente (mesmo e-mail do cadastro).
- Pedidos pendentes/recusados do mesmo produto são promovidos a `PAID` manual.

## Área do aluno (Passo 3)

Dashboard, certificados e biblioteca de cursos usam `getEnrolledCourses(userId)` — só exibem conteúdo com matrícula real (`Order`/`Subscription`). Sem matrícula: empty state + link para `/cursos`.

## Webhook assinatura (Passo 4)

Eventos tratados:

| Evento                                          | Ação                                                   |
| ----------------------------------------------- | ------------------------------------------------------ |
| `subscription.created` / `subscription.updated` | Upsert `Subscription` (metadata `userId`, `productId`) |
| `subscription.canceled`                         | `CANCELED` + `canceledAt`                              |
| `charge.paid` (com `subscription_id`)           | `ACTIVE`                                               |
| `invoice.paid` / `invoice.payment_failed`       | Ativa ou `PAST_DUE`                                    |

Checkout `COMUNIDADE`: API `/subscriptions` (boleto ou cartão; **sem PIX**). Registro local `Subscription` com `code` = id interno.

Eventos recomendados no painel Pagar.me: `subscription.*`, `charge.paid`, `invoice.paid`, `order.*`.

## Critério “Fase 1 fechada”

- [ ] Pagamento sandbox PIX ou boleto → `Order PAID` → aluno abre o player.
- [ ] Sem matrícula: redirect para vitrine `/cursos/[slug]`.
- [ ] Cartão OU acesso manual documentado e testado.
- [ ] Dashboard aluno lista cursos só com matrícula real (Passo 3).
