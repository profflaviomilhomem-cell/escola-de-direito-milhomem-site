/**
 * @jest-environment node
 */
import type { NextRequest } from "next/server";

import {
  GET as adminGET,
  POST as adminPOST,
} from "@/app/api/admin/refunds/route";
import { POST as alunoPOST } from "@/app/api/aluno/refunds/route";
import { getSessionFromCookies } from "@/lib/auth/session";

jest.mock("@/lib/auth/session", () => ({
  getSessionFromCookies: jest.fn(),
}));

const getSession = getSessionFromCookies as jest.Mock;

const dummyReq = {} as unknown as NextRequest;

afterEach(() => jest.clearAllMocks());

describe("gate de autenticação das rotas de reembolso", () => {
  it("GET /api/admin/refunds → 401 sem sessão", async () => {
    getSession.mockResolvedValue(null);
    const res = await adminGET();
    expect(res.status).toBe(401);
  });

  it("GET /api/admin/refunds → 403 para não-admin", async () => {
    getSession.mockResolvedValue({ sub: "u1", email: "a@a", role: "aluno" });
    const res = await adminGET();
    expect(res.status).toBe(403);
  });

  it("POST /api/admin/refunds → 403 para não-admin", async () => {
    getSession.mockResolvedValue({ sub: "u1", email: "a@a", role: "aluno" });
    const res = await adminPOST(dummyReq);
    expect(res.status).toBe(403);
  });

  it("POST /api/aluno/refunds → 401 sem sessão", async () => {
    getSession.mockResolvedValue(null);
    const res = await alunoPOST(dummyReq);
    expect(res.status).toBe(401);
  });
});
