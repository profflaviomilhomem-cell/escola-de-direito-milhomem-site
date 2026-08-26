/**
 * @jest-environment node
 */
import crypto from "node:crypto";

import { POST } from "@/app/api/webhooks/pagarme/route";
import { prisma } from "@/lib/prisma";
import { ordersBecomingPaid, settleOrdersPaid } from "@/lib/orders/settle";

/**
 * Máquina de estados do webhook do Pagar.me.
 *
 * Estes testes existem por causa de três defeitos encontrados na auditoria de
 * segurança de 26/08/2026. Nenhum era explorável no dia — todos exigem evento
 * com assinatura válida —, mas os três são do tipo que vira vulnerabilidade
 * quando alguém mexe no código ao lado.
 */

jest.mock("@/lib/prisma", () => ({
  prisma: {
    order: { updateMany: jest.fn() },
    pagarmeWebhookEvent: { create: jest.fn(), findUnique: jest.fn() },
  },
}));

jest.mock("@/lib/orders/settle", () => ({
  ordersBecomingPaid: jest.fn(),
  settleOrdersPaid: jest.fn(),
}));

const updateMany = prisma.order.updateMany as unknown as jest.Mock;
const becoming = ordersBecomingPaid as jest.Mock;
const settle = settleOrdersPaid as jest.Mock;
const criarEvento = prisma.pagarmeWebhookEvent.create as unknown as jest.Mock;

const SEGREDO = "segredo-de-teste";

function requisicao(body: unknown) {
  const raw = Buffer.from(JSON.stringify(body));
  const assinatura =
    "sha256=" + crypto.createHmac("sha256", SEGREDO).update(raw).digest("hex");
  return {
    headers: {
      get: (k: string) =>
        k.toLowerCase() === "x-hub-signature-256" ? assinatura : null,
    },
    arrayBuffer: async () =>
      raw.buffer.slice(raw.byteOffset, raw.byteOffset + raw.byteLength),
  } as unknown as Parameters<typeof POST>[0];
}

const ANTES = process.env.PAGARME_WEBHOOK_SECRET;

beforeEach(() => {
  jest.clearAllMocks();
  process.env.PAGARME_WEBHOOK_SECRET = SEGREDO;
  becoming.mockResolvedValue([]);
  updateMany.mockResolvedValue({ count: 1 });
  criarEvento.mockResolvedValue({});
  (
    prisma.pagarmeWebhookEvent.findUnique as unknown as jest.Mock
  ).mockResolvedValue(null);
});

afterAll(() => {
  if (ANTES === undefined) delete process.env.PAGARME_WEBHOOK_SECRET;
  else process.env.PAGARME_WEBHOOK_SECRET = ANTES;
});

describe("webhook — guarda de transição de estado", () => {
  it("PAID só é aplicado a pedido que ainda pode ser pago", async () => {
    // O defeito: o updateMany era cego. Um `charge.paid` sobrescrevia QUALQUER
    // estado — inclusive REFUNDED — e reconcedia acesso ao curso pago.
    await POST(
      requisicao({
        id: "evt_1",
        type: "charge.paid",
        data: { id: "ch_1", payment_method: "pix" },
      }),
    );

    expect(updateMany).toHaveBeenCalled();
    const where = updateMany.mock.calls[0][0].where;
    expect(where.status).toBeDefined();
    expect(where.status.in).toEqual(
      expect.arrayContaining(["PENDING", "AUTHORIZED"]),
    );
    // O que não pode estar lá: estornado não volta a pago.
    expect(where.status.in).not.toContain("REFUNDED");
    expect(where.status.in).not.toContain("CHARGEDBACK");
  });

  it("estorno não ganha guarda — REFUNDED se aplica a qualquer estado", async () => {
    await POST(
      requisicao({
        id: "evt_2",
        type: "charge.refunded",
        data: { id: "ch_2", payment_method: "pix" },
      }),
    );
    const where = updateMany.mock.calls[0][0].where;
    expect(where.status).toBeUndefined();
  });

  it("não liquida quando o update não transicionou nada", async () => {
    // Replay: o pedido já estava PAID, count=0. Liquidar de novo duplicaria
    // e-mail de pós-compra e evento de conversão.
    updateMany.mockResolvedValue({ count: 0 });
    becoming.mockResolvedValue([{ id: "ord_1" }]);

    await POST(
      requisicao({
        id: "evt_3",
        type: "charge.paid",
        data: { id: "ch_3", payment_method: "pix" },
      }),
    );

    expect(settle).not.toHaveBeenCalled();
  });
});

describe("webhook — método de pagamento", () => {
  it("não inventa CARD quando o evento não diz o método", async () => {
    // O defeito: o default era "CARD", então um `order.refunded` sem `charges`
    // sobrescrevia o método de um pedido PIX. Ninguém perde acesso — o
    // relatório de receita por método é que passa a mentir.
    await POST(
      requisicao({
        id: "evt_4",
        type: "charge.refunded",
        data: { id: "ch_4" },
      }),
    );
    const data = updateMany.mock.calls[0][0].data;
    expect(data.paymentMethod).toBeUndefined();
    expect(data.status).toBe("REFUNDED");
  });

  it("reconhece PIX, boleto e cartão quando o evento diz", async () => {
    for (const [entrada, esperado] of [
      ["pix", "PIX"],
      ["boleto", "BOLETO"],
      ["credit_card", "CARD"],
    ] as const) {
      jest.clearAllMocks();
      updateMany.mockResolvedValue({ count: 1 });
      becoming.mockResolvedValue([]);
      criarEvento.mockResolvedValue({});
      (
        prisma.pagarmeWebhookEvent.findUnique as unknown as jest.Mock
      ).mockResolvedValue(null);
      await POST(
        requisicao({
          id: `evt_${entrada}`,
          type: "charge.refunded",
          data: { id: "ch_x", payment_method: entrada },
        }),
      );
      expect(updateMany.mock.calls[0][0].data.paymentMethod).toBe(esperado);
    }
  });
});

describe("webhook — deduplicação", () => {
  it("evento sem id não colide com outro evento sem id", async () => {
    // O defeito: o fallback era o literal "unknown". O primeiro evento sem id
    // gravava essa linha e TODOS os seguintes viravam duplicata para sempre —
    // o comprador paga e não recebe, em silêncio.
    await POST(requisicao({ type: "charge.paid", data: { id: "ch_A" } }));
    const primeiro = criarEvento.mock.calls[0][0].data.id;

    jest.clearAllMocks();
    updateMany.mockResolvedValue({ count: 1 });
    becoming.mockResolvedValue([]);
    criarEvento.mockResolvedValue({});

    await POST(requisicao({ type: "charge.paid", data: { id: "ch_B" } }));
    const segundo = criarEvento.mock.calls[0][0].data.id;

    expect(primeiro).not.toBe("unknown");
    expect(primeiro).not.toBe(segundo);
  });
});
