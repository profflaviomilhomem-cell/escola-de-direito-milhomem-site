import {
  extractPagarmeSubscriptionId,
  mapPagarmeSubscriptionStatus,
  mapSubscriptionEventType,
} from "@/lib/pagarme/map-subscription";

describe("mapPagarmeSubscriptionStatus", () => {
  it("mapeia active para ACTIVE", () => {
    expect(mapPagarmeSubscriptionStatus("active")).toBe("ACTIVE");
  });

  it("mapeia canceled para CANCELED", () => {
    expect(mapPagarmeSubscriptionStatus("canceled")).toBe("CANCELED");
  });

  it("retorna null para status desconhecido", () => {
    expect(mapPagarmeSubscriptionStatus("trialing")).toBeNull();
  });
});

describe("mapSubscriptionEventType", () => {
  it("subscription.canceled sempre cancela", () => {
    expect(
      mapSubscriptionEventType("subscription.canceled", { status: "active" }),
    ).toBe("CANCELED");
  });

  it("subscription.created pendente vira PAUSED", () => {
    expect(
      mapSubscriptionEventType("subscription.created", { status: "pending" }),
    ).toBe("PAUSED");
  });
});

describe("extractPagarmeSubscriptionId", () => {
  it("extrai sub_ do id quando for assinatura", () => {
    expect(extractPagarmeSubscriptionId({ id: "sub_abc123" })).toBe("sub_abc123");
  });

  it("ignora charge id em data.id", () => {
    expect(
      extractPagarmeSubscriptionId({
        id: "ch_abc123",
        subscription_id: "sub_xyz",
      }),
    ).toBe("sub_xyz");
  });
});
