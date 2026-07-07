/**
 * @jest-environment node
 */
import { renderCampaignMarkdown, sendCampaign } from "@/lib/email/campaign";
import { prisma } from "@/lib/prisma";
import { sendEmail } from "@/lib/resend/client";

jest.mock("@/lib/prisma", () => ({
  prisma: {
    lead: { findMany: jest.fn() },
    emailCampaign: { findUnique: jest.fn(), update: jest.fn() },
  },
}));

jest.mock("@/lib/resend/client", () => ({
  sendEmail: jest.fn(),
}));

const leadFindMany = prisma.lead.findMany as jest.Mock;
const campaignFindUnique = prisma.emailCampaign.findUnique as jest.Mock;
const campaignUpdate = prisma.emailCampaign.update as jest.Mock;
const sendMock = sendEmail as jest.Mock;

const ORIGINAL_SECRET = process.env.AUTH_SECRET;

beforeAll(() => {
  process.env.AUTH_SECRET = "test-secret-com-mais-de-32-caracteres-ok!!";
});
afterAll(() => {
  process.env.AUTH_SECRET = ORIGINAL_SECRET;
});

beforeEach(() => {
  jest.clearAllMocks();
  campaignUpdate.mockResolvedValue({});
  sendMock.mockResolvedValue({ ok: true, skipped: true });
});

describe("renderCampaignMarkdown", () => {
  it("converte títulos, negrito, itálico, links e listas", () => {
    const html = renderCampaignMarkdown(
      "# Título\n\nUm **forte** e *leve* com [link](https://professorflaviomilhomem.com.br/x)\n\n- item 1\n- item 2",
    );
    expect(html).toContain("<h1");
    expect(html).toContain("<strong>forte</strong>");
    expect(html).toContain("<em>leve</em>");
    expect(html).toContain('href="https://professorflaviomilhomem.com.br/x"');
    expect(html).toContain("<ul");
    expect(html).toContain("<li");
  });

  it("escapa HTML do autor — nenhuma tag <script> sobrevive", () => {
    const html = renderCampaignMarkdown("<script>alert(1)</script>");
    expect(html).not.toContain("<script>");
    expect(html).toContain("&lt;script&gt;");
  });

  it("ignora esquema não-http em links", () => {
    const html = renderCampaignMarkdown("[x](javascript:alert(1))");
    expect(html).not.toContain('href="javascript:');
  });
});

describe("sendCampaign", () => {
  const campaign = {
    id: "c1",
    slug: "edicao-01",
    name: "Bastidor #1",
    subject: "Bastidor da Acusação #1",
    bodyMarkdown: "Olá\n\nConteúdo.",
    status: "DRAFT",
  };

  it("envia só a leads confirmados e não descadastrados, deduplicados", async () => {
    campaignFindUnique.mockResolvedValue(campaign);
    leadFindMany.mockResolvedValue([
      { email: "a@b.com", name: "A" },
      { email: "a@b.com", name: "A-outra-isca" },
      { email: "c@d.com", name: null },
    ]);

    const summary = await sendCampaign("edicao-01", {
      now: new Date("2026-07-01T00:00:00Z"),
    });

    // O filtro exige duplo opt-in E não descadastrado.
    expect(leadFindMany.mock.calls[0][0].where).toMatchObject({
      doubleOptInAt: { not: null },
      unsubscribedAt: null,
    });

    expect(summary.ok).toBe(true);
    expect(summary.recipients).toBe(2); // dedup por e-mail
    expect(sendMock).toHaveBeenCalledTimes(2);
    expect(campaignUpdate).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({ status: "SENT" }),
      }),
    );
  });

  it("não reenvia campanha já enviada", async () => {
    campaignFindUnique.mockResolvedValue({ ...campaign, status: "SENT" });

    const summary = await sendCampaign("edicao-01");

    expect(summary.ok).toBe(false);
    expect(summary.skipped).toBe("already-sent");
    expect(sendMock).not.toHaveBeenCalled();
  });

  it("retorna not-found quando a campanha não existe", async () => {
    campaignFindUnique.mockResolvedValue(null);
    const summary = await sendCampaign("inexistente");
    expect(summary.ok).toBe(false);
    expect(summary.skipped).toBe("not-found");
  });

  it("contabiliza falha parcial sem abortar o lote", async () => {
    campaignFindUnique.mockResolvedValue(campaign);
    leadFindMany.mockResolvedValue([
      { email: "a@b.com", name: "A" },
      { email: "c@d.com", name: "C" },
    ]);
    sendMock
      .mockResolvedValueOnce({ ok: true })
      .mockResolvedValueOnce({ ok: false, error: "bounce" });

    const summary = await sendCampaign("edicao-01");

    expect(summary.sent).toBe(1);
    expect(summary.failed).toBe(1);
  });
});
