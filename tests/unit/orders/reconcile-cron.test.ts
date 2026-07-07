/**
 * @jest-environment node
 */
import type { NextRequest } from "next/server";

import { GET } from "@/app/api/cron/reconcile-pagarme/route";
import { reconcilePendingOrders } from "@/lib/orders/reconcile";
import { isPagarmeConfigured } from "@/lib/pagarme/config";

jest.mock("@/lib/orders/reconcile", () => ({
  reconcilePendingOrders: jest.fn(),
}));

jest.mock("@/lib/pagarme/config", () => ({
  isPagarmeConfigured: jest.fn(),
}));

const reconcile = reconcilePendingOrders as jest.Mock;
const configured = isPagarmeConfigured as jest.Mock;

function reqWithAuth(auth?: string): NextRequest {
  return {
    headers: {
      get: (k: string) => (k === "authorization" ? (auth ?? null) : null),
    },
  } as unknown as NextRequest;
}

const ORIGINAL_SECRET = process.env.CRON_SECRET;

afterEach(() => {
  jest.clearAllMocks();
  if (ORIGINAL_SECRET === undefined) delete process.env.CRON_SECRET;
  else process.env.CRON_SECRET = ORIGINAL_SECRET;
});

describe("GET /api/cron/reconcile-pagarme", () => {
  it("401 sem CRON_SECRET configurado", async () => {
    delete process.env.CRON_SECRET;
    const res = await GET(reqWithAuth("Bearer x"));
    expect(res.status).toBe(401);
    expect(reconcile).not.toHaveBeenCalled();
  });

  it("401 com bearer errado", async () => {
    process.env.CRON_SECRET = "s3cr3t";
    const res = await GET(reqWithAuth("Bearer errado"));
    expect(res.status).toBe(401);
    expect(reconcile).not.toHaveBeenCalled();
  });

  it("no-op 200 {skipped} sem PAGARME_SECRET_KEY", async () => {
    process.env.CRON_SECRET = "s3cr3t";
    configured.mockReturnValue(false);
    const res = await GET(reqWithAuth("Bearer s3cr3t"));
    expect(res.status).toBe(200);
    await expect(res.json()).resolves.toMatchObject({ skipped: true });
    expect(reconcile).not.toHaveBeenCalled();
  });

  it("roda a reconciliação com secret e chave presentes", async () => {
    process.env.CRON_SECRET = "s3cr3t";
    configured.mockReturnValue(true);
    reconcile.mockResolvedValue({
      scanned: 3,
      updated: 1,
      paid: 1,
      refused: 0,
      errors: 0,
    });
    const res = await GET(reqWithAuth("Bearer s3cr3t"));
    expect(res.status).toBe(200);
    await expect(res.json()).resolves.toMatchObject({ ok: true, paid: 1 });
    expect(reconcile).toHaveBeenCalledTimes(1);
  });
});
