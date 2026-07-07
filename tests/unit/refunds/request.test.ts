/**
 * @jest-environment node
 */
import { getContentConsumedPct } from "@/lib/lessons/progress";
import { prisma } from "@/lib/prisma";
import { createRefundRequest } from "@/lib/refunds/request";

jest.mock("@/lib/prisma", () => ({
  prisma: {
    order: { findFirst: jest.fn() },
    refundRequest: { findFirst: jest.fn(), create: jest.fn() },
  },
}));

jest.mock("@/lib/lessons/progress", () => ({
  getContentConsumedPct: jest.fn(),
}));

const orderFindFirst = prisma.order.findFirst as jest.Mock;
const rrFindFirst = prisma.refundRequest.findFirst as jest.Mock;
const rrCreate = prisma.refundRequest.create as jest.Mock;
const consumedPct = getContentConsumedPct as jest.Mock;

const NOW = new Date("2026-07-07T12:00:00.000Z");
const daysAgo = (d: number) => new Date(NOW.getTime() - d * 86_400_000);

function order(overrides: Record<string, unknown> = {}) {
  return {
    id: "o1",
    status: "PAID",
    amountCents: 29700,
    createdAt: daysAgo(5),
    product: { slug: "prova-digital-no-processo-penal" },
    ...overrides,
  };
}

beforeEach(() => {
  jest.clearAllMocks();
  rrFindFirst.mockResolvedValue(null);
  rrCreate.mockResolvedValue({ id: "rr1", status: "REQUESTED" });
  consumedPct.mockResolvedValue(0);
});

describe("createRefundRequest", () => {
  it("recusa pedido inexistente / de outro usuário", async () => {
    orderFindFirst.mockResolvedValue(null);
    const res = await createRefundRequest({
      userId: "u1",
      orderId: "o1",
      now: NOW,
    });
    expect(res).toMatchObject({ ok: false, code: "ORDER_NOT_FOUND" });
  });

  it("recusa pedido não PAID", async () => {
    orderFindFirst.mockResolvedValue(order({ status: "PENDING" }));
    const res = await createRefundRequest({
      userId: "u1",
      orderId: "o1",
      now: NOW,
    });
    expect(res).toMatchObject({ ok: false, code: "NOT_PAID" });
    expect(rrCreate).not.toHaveBeenCalled();
  });

  it("recusa duplicata em aberto", async () => {
    orderFindFirst.mockResolvedValue(order());
    rrFindFirst.mockResolvedValue({ id: "rr_open" });
    const res = await createRefundRequest({
      userId: "u1",
      orderId: "o1",
      now: NOW,
    });
    expect(res).toMatchObject({ ok: false, code: "DUPLICATE_OPEN" });
    expect(rrCreate).not.toHaveBeenCalled();
  });

  it("dentro de 15 dias: elegível integral", async () => {
    orderFindFirst.mockResolvedValue(order({ createdAt: daysAgo(5) }));
    const res = await createRefundRequest({
      userId: "u1",
      orderId: "o1",
      now: NOW,
    });
    expect(res).toMatchObject({ ok: true, eligibleAmountCents: 29700 });
    expect(rrCreate).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          amountCents: 29700,
          status: "REQUESTED",
        }),
      }),
    );
  });

  it("16–90 dias: proporcional ao conteúdo consumido", async () => {
    orderFindFirst.mockResolvedValue(
      order({ amountCents: 1000, createdAt: daysAgo(30) }),
    );
    consumedPct.mockResolvedValue(45); // 30–60% → 40%
    const res = await createRefundRequest({
      userId: "u1",
      orderId: "o1",
      now: NOW,
    });
    expect(res).toMatchObject({ ok: true, eligibleAmountCents: 400 });
  });
});
