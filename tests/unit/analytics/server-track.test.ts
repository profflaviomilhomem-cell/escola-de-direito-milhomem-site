/**
 * @jest-environment node
 */
import { ANALYTICS_EVENTS } from "@/lib/analytics/events";
import { trackServerEvent } from "@/lib/analytics/server-track";
import { prisma } from "@/lib/prisma";

jest.mock("@/lib/prisma", () => ({
  prisma: {
    uTMEvent: { create: jest.fn() },
  },
}));

const createMock = prisma.uTMEvent.create as jest.Mock;

describe("trackServerEvent", () => {
  const OLD_ENV = process.env;
  let fetchSpy: jest.SpyInstance;

  beforeEach(() => {
    process.env = { ...OLD_ENV };
    delete process.env.POSTHOG_API_KEY;
    createMock.mockReset().mockResolvedValue({});
    fetchSpy = jest
      .spyOn(globalThis, "fetch")
      .mockResolvedValue(new Response("{}", { status: 200 }));
  });

  afterEach(() => {
    process.env = OLD_ENV;
    fetchSpy.mockRestore();
  });

  it("persiste no UTMEvent com destination event:<nome> e UTM do caller", async () => {
    await trackServerEvent(ANALYTICS_EVENTS.PURCHASE_COMPLETED, {
      userId: "user_1",
      utmSource: "instagram",
      utmCampaign: "lancamento",
      order_id: "order_1",
      value: 1997,
    });

    expect(createMock).toHaveBeenCalledTimes(1);
    expect(createMock.mock.calls[0][0]).toMatchObject({
      data: {
        userId: "user_1",
        destination: "event:purchase_completed",
        utmSource: "instagram",
        utmCampaign: "lancamento",
      },
    });
  });

  it("não persiste sem sinal (nem UTM nem userId) — padrão do utm-event", async () => {
    await trackServerEvent(ANALYTICS_EVENTS.CONTENT_VIEWED, {});
    expect(createMock).not.toHaveBeenCalled();
  });

  it("não chama o PostHog sem POSTHOG_API_KEY", async () => {
    await trackServerEvent(ANALYTICS_EVENTS.CERTIFICATE_ISSUED, {
      userId: "user_1",
    });
    expect(fetchSpy).not.toHaveBeenCalled();
  });

  it("envia ao PostHog quando POSTHOG_API_KEY existe, com dimensões extras", async () => {
    process.env.POSTHOG_API_KEY = "phk_test";

    await trackServerEvent(ANALYTICS_EVENTS.SUBSCRIPTION_CANCELED, {
      userId: "user_2",
      subscription_id: "sub_1",
      product_slug: "comunidade",
    });

    expect(fetchSpy).toHaveBeenCalledTimes(1);
    const [url, init] = fetchSpy.mock.calls[0] as [string, RequestInit];
    expect(url).toContain("/capture/");
    const body = JSON.parse(String(init.body)) as {
      api_key: string;
      event: string;
      distinct_id: string;
      properties: Record<string, unknown>;
    };
    expect(body.api_key).toBe("phk_test");
    expect(body.event).toBe("subscription_canceled");
    expect(body.distinct_id).toBe("user_2");
    expect(body.properties.subscription_id).toBe("sub_1");
    expect(body.properties.product_slug).toBe("comunidade");
  });

  it("nunca lança — banco fora e PostHog fora não derrubam o caller", async () => {
    process.env.POSTHOG_API_KEY = "phk_test";
    createMock.mockRejectedValue(new Error("db down"));
    fetchSpy.mockRejectedValue(new Error("rede caiu"));

    await expect(
      trackServerEvent(ANALYTICS_EVENTS.FORUM_REPLY_RECEIVED, {
        userId: "user_3",
      }),
    ).resolves.toBeUndefined();
  });
});
