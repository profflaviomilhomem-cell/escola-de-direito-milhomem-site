/**
 * @jest-environment node
 */
import { reconcilePendingOrders } from "@/lib/orders/reconcile";
import { ordersBecomingPaid, settleOrdersPaid } from "@/lib/orders/settle";
import { getPagarmeCharge, getPagarmeOrder } from "@/lib/pagarme/client";
import { prisma } from "@/lib/prisma";

jest.mock("@/lib/prisma", () => ({
  prisma: {
    order: { findMany: jest.fn(), updateMany: jest.fn() },
  },
}));

jest.mock("@/lib/orders/settle", () => ({
  ordersBecomingPaid: jest.fn(),
  settleOrdersPaid: jest.fn(),
}));

jest.mock("@/lib/pagarme/client", () => ({
  getPagarmeCharge: jest.fn(),
  getPagarmeOrder: jest.fn(),
}));

const findMany = prisma.order.findMany as jest.Mock;
const updateMany = prisma.order.updateMany as jest.Mock;
const becomingPaid = ordersBecomingPaid as jest.Mock;
const settle = settleOrdersPaid as jest.Mock;
const getCharge = getPagarmeCharge as jest.Mock;
const getOrder = getPagarmeOrder as jest.Mock;

const NOW = new Date("2026-07-07T12:00:00.000Z");
const hoursAgo = (h: number) => new Date(NOW.getTime() - h * 3_600_000);
const daysAgo = (d: number) => new Date(NOW.getTime() - d * 86_400_000);

function candidate(overrides: Record<string, unknown> = {}) {
  return {
    id: "o1",
    createdAt: hoursAgo(1),
    pagarmeChargeId: "ch_1",
    pagarmeOrderId: null,
    paymentPayload: null,
    ...overrides,
  };
}

beforeEach(() => {
  jest.clearAllMocks();
  updateMany.mockResolvedValue({ count: 1 });
  becomingPaid.mockResolvedValue([]);
});

describe("reconcilePendingOrders", () => {
  it("PENDING→PAID quando o Pagar.me diz paid, com settle uma vez", async () => {
    const paidOrder = { id: "o1", amountCents: 29700 };
    findMany.mockResolvedValue([candidate()]);
    getCharge.mockResolvedValue({ status: "paid" });
    becomingPaid.mockResolvedValue([paidOrder]);

    const summary = await reconcilePendingOrders({ now: NOW });

    expect(getCharge).toHaveBeenCalledWith("ch_1");
    expect(updateMany).toHaveBeenCalledWith({
      where: { id: "o1", status: { not: "PAID" } },
      data: { status: "PAID" },
    });
    expect(settle).toHaveBeenCalledTimes(1);
    expect(settle).toHaveBeenCalledWith([paidOrder]);
    expect(summary).toMatchObject({
      scanned: 1,
      updated: 1,
      paid: 1,
      errors: 0,
    });
  });

  it("aplica a janela olderThanMinutes na query (ignora recém-criados)", async () => {
    findMany.mockResolvedValue([]);
    await reconcilePendingOrders({ now: NOW, olderThanMinutes: 15 });

    const where = findMany.mock.calls[0][0].where;
    expect(where.status).toBe("PENDING");
    expect(where.createdAt.lt).toEqual(new Date(NOW.getTime() - 15 * 60_000));
  });

  it("expira PENDING antigo ainda não pago → REFUSED", async () => {
    findMany.mockResolvedValue([candidate({ createdAt: daysAgo(4) })]);
    getCharge.mockResolvedValue({ status: "pending" });

    const summary = await reconcilePendingOrders({ now: NOW });

    expect(updateMany).toHaveBeenCalledWith({
      where: { id: "o1", status: "PENDING" },
      data: { status: "REFUSED" },
    });
    expect(settle).not.toHaveBeenCalled();
    expect(summary).toMatchObject({ scanned: 1, refused: 1, paid: 0 });
  });

  it("não expira PENDING recente que segue pendente no Pagar.me", async () => {
    findMany.mockResolvedValue([candidate({ createdAt: hoursAgo(2) })]);
    getCharge.mockResolvedValue({ status: "pending" });

    const summary = await reconcilePendingOrders({ now: NOW });

    expect(updateMany).not.toHaveBeenCalled();
    expect(summary).toMatchObject({ scanned: 1, updated: 0, errors: 0 });
  });

  it("marca REFUNDED sem liquidar acesso", async () => {
    findMany.mockResolvedValue([candidate()]);
    getCharge.mockResolvedValue({ status: "refunded" });

    const summary = await reconcilePendingOrders({ now: NOW });

    expect(updateMany).toHaveBeenCalledWith({
      where: { id: "o1", status: { not: "REFUNDED" } },
      data: { status: "REFUNDED" },
    });
    expect(settle).not.toHaveBeenCalled();
    expect(summary).toMatchObject({ updated: 1, paid: 0, refused: 0 });
  });

  it("usa getPagarmeOrder quando só há pagarmeOrderId", async () => {
    findMany.mockResolvedValue([
      candidate({ pagarmeChargeId: null, pagarmeOrderId: "or_1" }),
    ]);
    getOrder.mockResolvedValue({ charges: [{ status: "paid" }] });
    becomingPaid.mockResolvedValue([{ id: "o1" }]);

    const summary = await reconcilePendingOrders({ now: NOW });

    expect(getOrder).toHaveBeenCalledWith("or_1");
    expect(summary).toMatchObject({ paid: 1 });
  });

  it("erro num pedido não derruba o lote", async () => {
    findMany.mockResolvedValue([
      candidate({ id: "o1" }),
      candidate({ id: "o2", pagarmeChargeId: "ch_2" }),
    ]);
    getCharge
      .mockRejectedValueOnce(new Error("timeout"))
      .mockResolvedValueOnce({ status: "paid" });
    becomingPaid.mockResolvedValue([{ id: "o2" }]);

    const summary = await reconcilePendingOrders({ now: NOW });

    expect(summary).toMatchObject({ scanned: 2, errors: 1, paid: 1 });
  });
});
