/**
 * @jest-environment node
 */
import {
  advanceDueSends,
  cancelSequence,
  enrollLead,
} from "@/lib/email/sequences";
import { prisma } from "@/lib/prisma";
import { sendEmail } from "@/lib/resend/client";

jest.mock("@/lib/prisma", () => ({
  prisma: {
    lead: { findFirst: jest.fn() },
    emailSequenceEnrollment: {
      findUnique: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      updateMany: jest.fn(),
      findMany: jest.fn(),
    },
  },
}));

jest.mock("@/lib/resend/client", () => ({
  sendEmail: jest.fn(),
}));

const leadFindFirst = prisma.lead.findFirst as jest.Mock;
const enroll = prisma.emailSequenceEnrollment as unknown as {
  findUnique: jest.Mock;
  create: jest.Mock;
  update: jest.Mock;
  updateMany: jest.Mock;
  findMany: jest.Mock;
};
const sendMock = sendEmail as jest.Mock;

const HOUR = 3_600_000;
const ORIGINAL_SECRET = process.env.AUTH_SECRET;

/** findFirst serve a dois usos: checar descadastro e buscar o nome. */
function mockLead({ unsubscribed = false, name = null as string | null } = {}) {
  leadFindFirst.mockImplementation(
    (args: { where: Record<string, unknown> }) => {
      if (args.where.unsubscribedAt) {
        return Promise.resolve(unsubscribed ? { id: "lead_1" } : null);
      }
      return Promise.resolve(name ? { name } : { name: null });
    },
  );
}

beforeAll(() => {
  process.env.AUTH_SECRET = "test-secret-com-mais-de-32-caracteres-ok!!";
});
afterAll(() => {
  process.env.AUTH_SECRET = ORIGINAL_SECRET;
});

beforeEach(() => {
  jest.clearAllMocks();
  enroll.create.mockResolvedValue({});
  enroll.update.mockResolvedValue({});
  enroll.updateMany.mockResolvedValue({ count: 0 });
  sendMock.mockResolvedValue({ ok: true, skipped: true });
});

describe("enrollLead", () => {
  it("cria inscrição no passo 0 com nextSendAt = agora (offset 0)", async () => {
    mockLead();
    enroll.findUnique.mockResolvedValue(null);
    const now = new Date("2026-07-01T00:00:00Z");

    const r = await enrollLead("WELCOME", "a@b.com", { now });

    expect(r.enrolled).toBe(true);
    expect(enroll.create).toHaveBeenCalledTimes(1);
    const data = enroll.create.mock.calls[0][0].data;
    expect(data).toMatchObject({
      leadEmail: "a@b.com",
      sequence: "WELCOME",
      currentStep: 0,
      status: "ACTIVE",
    });
    expect(new Date(data.nextSendAt).getTime()).toBe(now.getTime());
    expect(new Date(data.createdAt).getTime()).toBe(now.getTime());
  });

  it("é idempotente: inscrição ATIVA não é recriada", async () => {
    mockLead();
    enroll.findUnique.mockResolvedValue({ id: "e1", status: "ACTIVE" });

    const r = await enrollLead("WELCOME", "a@b.com", {
      now: new Date("2026-07-01T00:00:00Z"),
    });

    expect(r.enrolled).toBe(false);
    expect(r.reason).toBe("already-active");
    expect(enroll.create).not.toHaveBeenCalled();
    expect(enroll.update).not.toHaveBeenCalled();
  });

  it("bloqueia inscrição de lead descadastrado (LGPD)", async () => {
    mockLead({ unsubscribed: true });
    enroll.findUnique.mockResolvedValue(null);

    const r = await enrollLead("WELCOME", "a@b.com");

    expect(r.enrolled).toBe(false);
    expect(r.reason).toBe("unsubscribed");
    expect(enroll.create).not.toHaveBeenCalled();
  });

  it("re-arma inscrição encerrada do passo 0", async () => {
    mockLead();
    enroll.findUnique.mockResolvedValue({ id: "e1", status: "COMPLETED" });
    const now = new Date("2026-08-01T00:00:00Z");

    const r = await enrollLead("POST_PURCHASE", "a@b.com", {
      now,
      orderId: "ord_1",
    });

    expect(r.enrolled).toBe(true);
    expect(enroll.update).toHaveBeenCalledTimes(1);
    expect(enroll.update.mock.calls[0][0].data).toMatchObject({
      currentStep: 0,
      status: "ACTIVE",
      orderId: "ord_1",
    });
  });
});

describe("advanceDueSends", () => {
  const created = new Date("2026-07-01T00:00:00Z");

  function dueEnrollment(over: Record<string, unknown> = {}) {
    return {
      id: "e1",
      leadEmail: "a@b.com",
      sequence: "WELCOME",
      currentStep: 0,
      status: "ACTIVE",
      nextSendAt: created,
      createdAt: created,
      ...over,
    };
  }

  it("envia o passo atual e agenda o próximo relativo ao createdAt", async () => {
    mockLead({ name: "Ana" });
    enroll.findMany.mockResolvedValue([dueEnrollment()]);
    const now = new Date("2026-07-01T01:00:00Z");

    const summary = await advanceDueSends({ now });

    expect(sendMock).toHaveBeenCalledTimes(1);
    expect(sendMock.mock.calls[0][0].to).toBe("a@b.com");
    expect(summary.sent).toBe(1);

    const upd = enroll.update.mock.calls[0][0];
    expect(upd.data.currentStep).toBe(1);
    // Passo 1 do WELCOME = +48h do createdAt.
    expect(new Date(upd.data.nextSendAt).getTime()).toBe(
      created.getTime() + 48 * HOUR,
    );
  });

  it("cancela (sem enviar) se o lead está descadastrado", async () => {
    mockLead({ unsubscribed: true });
    enroll.findMany.mockResolvedValue([dueEnrollment()]);

    const summary = await advanceDueSends({
      now: new Date("2026-07-01T01:00:00Z"),
    });

    expect(sendMock).not.toHaveBeenCalled();
    expect(summary.canceled).toBe(1);
    expect(enroll.update.mock.calls[0][0].data).toMatchObject({
      status: "CANCELED",
    });
  });

  it("completa a inscrição no último passo", async () => {
    mockLead({ name: "Ana" });
    // WELCOME tem 5 passos (índices 0..4); currentStep 4 é o último.
    enroll.findMany.mockResolvedValue([dueEnrollment({ currentStep: 4 })]);

    const summary = await advanceDueSends({
      now: new Date("2026-07-11T00:00:00Z"),
    });

    expect(sendMock).toHaveBeenCalledTimes(1);
    expect(summary.completed).toBe(1);
    expect(enroll.update.mock.calls[0][0].data).toMatchObject({
      status: "COMPLETED",
      nextSendAt: null,
    });
  });

  it("não avança quando o envio falha (retry no próximo ciclo)", async () => {
    mockLead({ name: "Ana" });
    enroll.findMany.mockResolvedValue([dueEnrollment()]);
    sendMock.mockResolvedValue({ ok: false, error: "boom" });

    const summary = await advanceDueSends({
      now: new Date("2026-07-01T01:00:00Z"),
    });

    expect(summary.failed).toBe(1);
    expect(summary.sent).toBe(0);
    expect(enroll.update).not.toHaveBeenCalled();
  });
});

describe("cancelSequence", () => {
  it("cancela todas as sequências ativas do e-mail", async () => {
    enroll.updateMany.mockResolvedValue({ count: 2 });
    const n = await cancelSequence("a@b.com");
    expect(n).toBe(2);
    expect(enroll.updateMany.mock.calls[0][0].where).toMatchObject({
      leadEmail: "a@b.com",
      status: "ACTIVE",
    });
  });
});
