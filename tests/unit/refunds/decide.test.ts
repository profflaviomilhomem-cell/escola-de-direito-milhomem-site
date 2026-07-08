/**
 * @jest-environment node
 */
import { PagarmeApiError } from "@/lib/pagarme/client";
import { refundPagarmeCharge } from "@/lib/pagarme/refund";
import { prisma } from "@/lib/prisma";
import {
  approveRefundRequest,
  rejectRefundRequest,
} from "@/lib/refunds/decide";

jest.mock("@/lib/prisma", () => ({
  prisma: {
    refundRequest: {
      findUnique: jest.fn(),
      update: jest.fn(),
      updateMany: jest.fn(),
    },
    order: { update: jest.fn() },
  },
}));

jest.mock("@/lib/pagarme/refund", () => ({
  refundPagarmeCharge: jest.fn(),
}));

const rrFindUnique = prisma.refundRequest.findUnique as jest.Mock;
const rrUpdate = prisma.refundRequest.update as jest.Mock;
const rrUpdateMany = prisma.refundRequest.updateMany as jest.Mock;
const orderUpdate = prisma.order.update as jest.Mock;
const refund = refundPagarmeCharge as jest.Mock;

const NOW = new Date("2026-07-07T12:00:00.000Z");

function request(overrides: Record<string, unknown> = {}) {
  return {
    id: "rr1",
    status: "REQUESTED",
    amountCents: 29700,
    order: {
      id: "o1",
      status: "PAID",
      amountCents: 29700,
      pagarmeChargeId: "ch_1",
    },
    ...overrides,
  };
}

beforeEach(() => {
  jest.clearAllMocks();
  rrUpdate.mockResolvedValue({});
  rrUpdateMany.mockResolvedValue({ count: 1 }); // claim atômico vence por padrão
  orderUpdate.mockResolvedValue({});
});

describe("approveRefundRequest", () => {
  it("executa estorno integral e transiciona PROCESSED + REFUNDED", async () => {
    rrFindUnique.mockResolvedValue(request());
    refund.mockResolvedValue({ id: "ch_1" });

    const res = await approveRefundRequest({
      refundRequestId: "rr1",
      decidedByUserId: "admin1",
      now: NOW,
    });

    expect(refund).toHaveBeenCalledWith("ch_1", undefined);
    // Claim atômico (updateMany com guarda de status), não update simples.
    expect(rrUpdateMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({ id: "rr1" }),
        data: expect.objectContaining({
          status: "PROCESSED",
          amountCents: 29700,
          decidedByUserId: "admin1",
          decidedAt: NOW,
        }),
      }),
    );
    expect(orderUpdate).toHaveBeenCalledWith({
      where: { id: "o1" },
      data: { status: "REFUNDED" },
    });
    expect(res).toMatchObject({
      ok: true,
      status: "PROCESSED",
      chargeId: "ch_1",
    });
  });

  it("recusa aprovação quando o valor elegível é 0 (política sem reembolso)", async () => {
    // Regressão bug #4: valor 0 NÃO pode virar estorno integral.
    rrFindUnique.mockResolvedValue(request({ amountCents: 0 }));
    const res = await approveRefundRequest({
      refundRequestId: "rr1",
      decidedByUserId: "admin1",
      now: NOW,
    });
    expect(res).toMatchObject({
      ok: false,
      code: "AMOUNT_NOT_REFUNDABLE",
      httpStatus: 422,
    });
    expect(refund).not.toHaveBeenCalled();
  });

  it("aborta se o claim atômico não vence (race — já em processamento)", async () => {
    // Regressão bug #5: sob concorrência, só uma aprovação estorna.
    rrFindUnique.mockResolvedValue(request());
    rrUpdateMany.mockResolvedValueOnce({ count: 0 });
    const res = await approveRefundRequest({
      refundRequestId: "rr1",
      decidedByUserId: "admin1",
      now: NOW,
    });
    expect(res).toMatchObject({ ok: false, code: "NOT_OPEN" });
    expect(refund).not.toHaveBeenCalled();
  });

  it("estorno parcial quando o valor elegível é menor que o total", async () => {
    rrFindUnique.mockResolvedValue(request({ amountCents: 20000 }));
    refund.mockResolvedValue({ id: "ch_1" });

    await approveRefundRequest({
      refundRequestId: "rr1",
      decidedByUserId: "admin1",
      now: NOW,
    });

    expect(refund).toHaveBeenCalledWith("ch_1", 20000);
  });

  it("recusa solicitação não aberta", async () => {
    rrFindUnique.mockResolvedValue(request({ status: "PROCESSED" }));
    const res = await approveRefundRequest({
      refundRequestId: "rr1",
      decidedByUserId: "admin1",
      now: NOW,
    });
    expect(res).toMatchObject({ ok: false, code: "NOT_OPEN", httpStatus: 409 });
    expect(refund).not.toHaveBeenCalled();
  });

  it("recusa pedido sem cobrança Pagar.me", async () => {
    rrFindUnique.mockResolvedValue(
      request({
        order: {
          id: "o1",
          status: "PAID",
          amountCents: 29700,
          pagarmeChargeId: null,
        },
      }),
    );
    const res = await approveRefundRequest({
      refundRequestId: "rr1",
      decidedByUserId: "admin1",
      now: NOW,
    });
    expect(res).toMatchObject({ ok: false, code: "NO_CHARGE" });
  });

  it("propaga erro do Pagar.me como PAGARME_ERROR 502", async () => {
    rrFindUnique.mockResolvedValue(request());
    refund.mockRejectedValue(new PagarmeApiError("recusado", 400, null));
    const res = await approveRefundRequest({
      refundRequestId: "rr1",
      decidedByUserId: "admin1",
      now: NOW,
    });
    expect(res).toMatchObject({
      ok: false,
      code: "PAGARME_ERROR",
      httpStatus: 502,
    });
    expect(orderUpdate).not.toHaveBeenCalled();
  });
});

describe("rejectRefundRequest", () => {
  it("transiciona para REJECTED sem estorno", async () => {
    rrFindUnique.mockResolvedValue({ id: "rr1", status: "REQUESTED" });
    const res = await rejectRefundRequest({
      refundRequestId: "rr1",
      decidedByUserId: "admin1",
      now: NOW,
    });
    expect(rrUpdate).toHaveBeenCalledWith({
      where: { id: "rr1" },
      data: { status: "REJECTED", decidedByUserId: "admin1", decidedAt: NOW },
    });
    expect(refund).not.toHaveBeenCalled();
    expect(res).toMatchObject({ ok: true, status: "REJECTED" });
  });
});
