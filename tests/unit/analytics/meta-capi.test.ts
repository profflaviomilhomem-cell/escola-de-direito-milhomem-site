/**
 * @jest-environment node
 */
import { createHash } from "node:crypto";

import {
  buildMetaCapiPayload,
  hashSha256,
  normalizePhone,
  sendMetaCapi,
} from "@/lib/analytics/meta-capi";

const EMAIL = "Aluno@Example.com ";
const EMAIL_HASH = createHash("sha256")
  .update("aluno@example.com")
  .digest("hex");

describe("hashSha256", () => {
  it("normaliza (trim + minúsculas) antes do hash, conforme spec Meta", () => {
    expect(hashSha256(EMAIL)).toBe(EMAIL_HASH);
    expect(hashSha256("aluno@example.com")).toBe(EMAIL_HASH);
  });
});

describe("normalizePhone", () => {
  it("mantém só dígitos e prefixa 55 em número BR de 11 dígitos", () => {
    expect(normalizePhone("(61) 99999-8888")).toBe("5561999998888");
  });

  it("não duplica código do país quando já presente", () => {
    expect(normalizePhone("+55 61 99999-8888")).toBe("5561999998888");
  });

  it("rejeita valor curto demais", () => {
    expect(normalizePhone("123")).toBeNull();
  });
});

describe("buildMetaCapiPayload", () => {
  it("monta Purchase com user_data hasheado e custom_data", () => {
    const payload = buildMetaCapiPayload("Purchase", {
      eventId: "order_123",
      email: EMAIL,
      value: 1997,
      currency: "BRL",
      contentIds: ["prova-digital-no-processo-penal"],
      contentName: "Prova Digital no Processo Penal",
      eventTime: 1700000000,
    });

    expect(payload).toEqual({
      data: [
        {
          event_name: "Purchase",
          event_time: 1700000000,
          event_id: "order_123",
          action_source: "website",
          user_data: { em: [EMAIL_HASH] },
          custom_data: {
            value: 1997,
            currency: "BRL",
            content_ids: ["prova-digital-no-processo-penal"],
            content_name: "Prova Digital no Processo Penal",
          },
        },
      ],
    });
  });

  it("retorna null sem nenhum parâmetro de user_data (Meta exige ao menos um)", () => {
    expect(buildMetaCapiPayload("Lead", { eventId: "x" })).toBeNull();
  });
});

describe("sendMetaCapi (gate por env)", () => {
  const OLD_ENV = process.env;
  let fetchSpy: jest.SpyInstance;

  beforeEach(() => {
    process.env = { ...OLD_ENV };
    fetchSpy = jest
      .spyOn(globalThis, "fetch")
      .mockResolvedValue(new Response("{}", { status: 200 }));
  });

  afterEach(() => {
    process.env = OLD_ENV;
    fetchSpy.mockRestore();
  });

  it("é no-op sem META_CAPI_ACCESS_TOKEN", async () => {
    delete process.env.META_CAPI_ACCESS_TOKEN;
    process.env.NEXT_PUBLIC_META_PIXEL_ID = "123";

    await sendMetaCapi("Lead", { eventId: "x", email: EMAIL });
    expect(fetchSpy).not.toHaveBeenCalled();
  });

  it("é no-op sem pixel id", async () => {
    process.env.META_CAPI_ACCESS_TOKEN = "token";
    delete process.env.META_CAPI_PIXEL_ID;
    delete process.env.NEXT_PUBLIC_META_PIXEL_ID;

    await sendMetaCapi("Lead", { eventId: "x", email: EMAIL });
    expect(fetchSpy).not.toHaveBeenCalled();
  });

  it("envia para a Graph API quando configurado", async () => {
    process.env.META_CAPI_ACCESS_TOKEN = "token";
    process.env.META_CAPI_PIXEL_ID = "999";

    await sendMetaCapi("Purchase", {
      eventId: "order_1",
      email: EMAIL,
      value: 10,
      currency: "BRL",
    });

    expect(fetchSpy).toHaveBeenCalledTimes(1);
    const [url, init] = fetchSpy.mock.calls[0] as [string, RequestInit];
    expect(url).toContain("graph.facebook.com/v21.0/999/events");
    expect(url).toContain("access_token=token");
    const body = JSON.parse(String(init.body)) as {
      data: Array<{ event_id: string; user_data: { em: string[] } }>;
    };
    expect(body.data[0].event_id).toBe("order_1");
    expect(body.data[0].user_data.em).toEqual([EMAIL_HASH]);
  });

  it("nunca lança, mesmo com falha de rede", async () => {
    process.env.META_CAPI_ACCESS_TOKEN = "token";
    process.env.META_CAPI_PIXEL_ID = "999";
    fetchSpy.mockRejectedValue(new Error("rede caiu"));
    const errorSpy = jest.spyOn(console, "error").mockImplementation(() => {});

    await expect(
      sendMetaCapi("Lead", { eventId: "x", email: EMAIL }),
    ).resolves.toBeUndefined();

    errorSpy.mockRestore();
  });
});
