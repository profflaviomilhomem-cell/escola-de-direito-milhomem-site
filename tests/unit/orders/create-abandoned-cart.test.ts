/**
 * @jest-environment node
 */
import { POST } from "@/app/api/orders/create/route";
import { enrollLead } from "@/lib/email/sequences";
import { createCheckoutOrder } from "@/lib/orders/create-checkout";
import { prisma } from "@/lib/prisma";

/**
 * Gatilho de ENTRADA do carrinho abandonado (guia 6.13), ligado em 24/08/2026.
 *
 * O que estes testes travam é a regra de negócio, não o encanamento: só PIX
 * inscreve. Boleto compensa em 1 a 3 dias úteis, então um PENDING de boleto é
 * pagamento em aberto legítimo — inscrevê-lo faria o e-mail de +1h dizer "sua
 * inscrição ficou pela metade" para quem já concluiu e está com o documento na
 * mão. É o tipo de e-mail errado que não se manda em peça assinada por
 * Promotor de Justiça em atividade.
 *
 * A saída (compra concluída cancela a sequência) é coberta pelos testes de
 * `orders/settle`.
 */

jest.mock("@/lib/auth/session", () => ({
  getSessionFromCookies: jest.fn(),
}));
jest.mock("@/lib/upstash/rate-limit", () => ({
  rateLimit: jest.fn(),
}));
jest.mock("@/lib/orders/create-checkout", () => ({
  createCheckoutOrder: jest.fn(),
}));
jest.mock("@/lib/email/sequences", () => ({
  enrollLead: jest.fn(),
}));
jest.mock("@/lib/analytics/utm-event", () => ({
  recordUtmEvent: jest.fn(),
}));
jest.mock("@/lib/prisma", () => ({
  prisma: {
    product: { findFirst: jest.fn() },
    user: { findUnique: jest.fn() },
  },
}));

const { getSessionFromCookies } = jest.requireMock("@/lib/auth/session") as {
  getSessionFromCookies: jest.Mock;
};
const { rateLimit } = jest.requireMock("@/lib/upstash/rate-limit") as {
  rateLimit: jest.Mock;
};
const createOrder = createCheckoutOrder as unknown as jest.Mock;
const enroll = enrollLead as unknown as jest.Mock;
const productFindFirst = prisma.product.findFirst as unknown as jest.Mock;
const userFindUnique = prisma.user.findUnique as unknown as jest.Mock;

const EMAIL = "aluno@exemplo.com.br";

function payload(paymentMethod: "PIX" | "BOLETO") {
  return {
    productSlug: "prova-digital-no-processo-penal",
    paymentMethod,
    document: "39053344705",
    phone: "61999998888",
    ...(paymentMethod === "BOLETO"
      ? {
          billingLine1: "SQN 100 Bloco A",
          billingZipCode: "70000000",
          billingCity: "Brasília",
          billingState: "DF",
        }
      : {}),
  };
}

function req(body: unknown) {
  return {
    json: async () => body,
    headers: new Headers(),
    // `utmFromRequest` lê a query string para atribuição de campanha.
    nextUrl: new URL("https://exemplo.test/api/orders/create"),
  } as unknown as Parameters<typeof POST>[0];
}

beforeEach(() => {
  jest.clearAllMocks();
  getSessionFromCookies.mockResolvedValue({ sub: "user_1" });
  rateLimit.mockResolvedValue({ success: true });
  productFindFirst.mockResolvedValue({
    id: "prod_1",
    slug: "prova-digital-no-processo-penal",
  });
  userFindUnique.mockResolvedValue({
    id: "user_1",
    email: EMAIL,
    name: "Aluno",
  });
  createOrder.mockResolvedValue({
    ok: true,
    orderId: "order_1",
    status: "PENDING",
    payment: {},
    redirectTo: "/checkout/obrigado",
  });
  enroll.mockResolvedValue({ enrolled: true });
});

describe("POST /api/orders/create — entrada do carrinho abandonado", () => {
  it("PIX pendente inscreve na sequência ABANDONED_CART, com o pedido junto", async () => {
    const res = await POST(req(payload("PIX")));

    expect(res.status).toBe(200);
    expect(enroll).toHaveBeenCalledTimes(1);
    expect(enroll).toHaveBeenCalledWith("ABANDONED_CART", EMAIL, {
      orderId: "order_1",
    });
  });

  it("boleto NÃO inscreve — pendente ali é pagamento em aberto, não abandono", async () => {
    const res = await POST(req(payload("BOLETO")));

    expect(res.status).toBe(200);
    expect(enroll).not.toHaveBeenCalled();
  });

  it("pedido que falhou não inscreve ninguém", async () => {
    createOrder.mockResolvedValue({
      ok: false,
      message: "Pagamento online indisponível.",
      code: "PAGARME_OFF",
      status: 503,
    });

    const res = await POST(req(payload("PIX")));

    expect(res.status).toBe(503);
    expect(enroll).not.toHaveBeenCalled();
  });

  it("falha ao inscrever não derruba a compra", async () => {
    enroll.mockRejectedValue(new Error("resend fora do ar"));
    const erro = jest.spyOn(console, "error").mockImplementation(() => {});

    const res = await POST(req(payload("PIX")));

    expect(res.status).toBe(200);
    await new Promise((r) => setImmediate(r));
    expect(erro).toHaveBeenCalled();
    erro.mockRestore();
  });
});
