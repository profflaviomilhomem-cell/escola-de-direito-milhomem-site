import { NextResponse, type NextRequest } from "next/server";
import { z } from "zod";

import { recordUtmEvent } from "@/lib/analytics/utm-event";
import { getSessionFromCookies } from "@/lib/auth/session";
import { enrollLead } from "@/lib/email/sequences";
import { createCheckoutOrder } from "@/lib/orders/create-checkout";
import { mergeUtm, utmFromBody, utmFromRequest } from "@/lib/orders/utm";
import { prisma } from "@/lib/prisma";
import { rateLimit } from "@/lib/upstash/rate-limit";
import { createOrderSchema } from "@/schemas/order";

/**
 * POST /api/orders/create — cria Order PENDING e cobrança no Pagar.me.
 */
export async function POST(req: NextRequest) {
  const session = await getSessionFromCookies();
  if (!session) {
    return NextResponse.json(
      { ok: false, error: "Faça login para concluir a compra." },
      { status: 401 },
    );
  }

  const rl = await rateLimit({
    prefix: "orders:create",
    max: 8,
    window: "10 m",
    key: session.sub,
  });
  if (!rl.success) {
    return NextResponse.json(
      { ok: false, error: "Muitas tentativas. Aguarde alguns minutos." },
      { status: 429 },
    );
  }

  let raw: unknown;
  try {
    raw = await req.json();
  } catch {
    return NextResponse.json(
      { ok: false, error: "Payload inválido." },
      { status: 400 },
    );
  }

  const parsed = createOrderSchema.safeParse(raw);
  if (!parsed.success) {
    return NextResponse.json(
      { ok: false, errors: z.flattenError(parsed.error) },
      { status: 422 },
    );
  }

  const product = await prisma.product.findFirst({
    where: {
      slug: parsed.data.productSlug,
      publishStatus: "PUBLISHED",
      active: true,
    },
  });

  if (!product) {
    return NextResponse.json(
      { ok: false, error: "Produto não encontrado ou indisponível." },
      { status: 404 },
    );
  }

  const user = await prisma.user.findUnique({
    where: { id: session.sub },
    select: { id: true, email: true, name: true },
  });

  if (!user) {
    return NextResponse.json(
      { ok: false, error: "Usuário não encontrado." },
      { status: 404 },
    );
  }

  const utm = mergeUtm(utmFromBody(raw), utmFromRequest(req));

  const result = await createCheckoutOrder(user, product, parsed.data, utm);

  if (!result.ok) {
    return NextResponse.json(
      { ok: false, error: result.message, code: result.code },
      { status: result.status },
    );
  }

  // Carrinho abandonado (guia 6.13) — gatilho de ENTRADA da sequência.
  //
  // Só PIX. A nota anterior neste arquivo dizia que `PENDING` conflita com
  // "pagamento legitimamente em aberto", e conflita mesmo — mas só para
  // boleto, que leva de 1 a 3 dias úteis para compensar. Inscrever um boleto
  // recém-emitido faria o e-mail de +1h dizer "sua inscrição ficou pela
  // metade" para quem já concluiu e está com o documento na mão: e-mail
  // errado, em peça assinada por Promotor de Justiça. O PIX expira em minutos,
  // então PENDING de PIX depois de uma hora é abandono de verdade — que é
  // exatamente a cadência que a sequência foi desenhada para atender
  // (+1h / +12h / +36h).
  //
  // A SAÍDA já estava ligada desde sempre: `settle.ts` cancela ABANDONED_CART
  // quando o pedido vira PAID, então quem pagar no meio do caminho para de
  // receber. `enrollLead` é idempotente por (email, sequência).
  //
  // Não cobre quem abre /checkout e vai embora sem criar pedido — esse sinal
  // (`cart_initiated`) só existe no cliente e precisaria de persistência
  // própria no servidor. Fica registrado como o pedaço que falta.
  if (parsed.data.paymentMethod === "PIX") {
    void enrollLead("ABANDONED_CART", user.email, {
      orderId: result.orderId,
    }).catch((err) => {
      console.error(
        "[orders/create] falha ao inscrever em ABANDONED_CART:",
        err,
      );
    });
  }

  // Funil de compra por campanha (best-effort).
  void recordUtmEvent({
    userId: user.id,
    destination: `/checkout/${product.slug}`,
    utmSource: utm.utmSource,
    utmMedium: utm.utmMedium,
    utmCampaign: utm.utmCampaign,
    ip:
      req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ??
      req.headers.get("x-real-ip"),
    userAgent: req.headers.get("user-agent"),
  });

  return NextResponse.json({
    ok: true,
    orderId: result.orderId,
    status: result.status,
    payment: result.payment,
    redirectTo: result.redirectTo,
  });
}
