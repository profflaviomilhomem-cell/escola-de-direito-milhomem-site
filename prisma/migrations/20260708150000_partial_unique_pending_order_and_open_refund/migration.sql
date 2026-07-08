-- Índice único parcial: no máximo 1 pedido PENDING por (usuário, produto).
-- Backstop atômico contra cobrança dupla — o dedup por findFirst em
-- create-checkout.ts não é atômico (duas requisições concorrentes passavam
-- ambas e geravam duas cobranças no Pagar.me). Quando o pedido sai de PENDING
-- (PAID/REFUSED/etc.) o índice deixa de se aplicar, permitindo nova tentativa.
CREATE UNIQUE INDEX "Order_userId_productId_pending_key"
  ON "Order" ("userId", "productId")
  WHERE "status" = 'PENDING';

-- Índice único parcial: no máximo 1 solicitação de reembolso EM ABERTO por
-- Order. Garante no banco o invariante que o schema documentava como
-- "garantido em código" (o findFirst em request.ts não era atômico).
CREATE UNIQUE INDEX "RefundRequest_orderId_open_key"
  ON "RefundRequest" ("orderId")
  WHERE "status" IN ('REQUESTED', 'APPROVED');
