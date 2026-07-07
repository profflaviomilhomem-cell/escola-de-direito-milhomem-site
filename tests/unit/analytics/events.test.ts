import {
  ANALYTICS_EVENTS,
  AUTH_SIGN_UP_EVENT,
  type AnalyticsEvent,
} from "@/lib/analytics/events";

describe("taxonomia de eventos (Livro-Guia 8.5)", () => {
  it("contém exatamente os 15 nomes do guia", () => {
    expect(Object.values(ANALYTICS_EVENTS).sort()).toEqual(
      [
        "page_view",
        "content_viewed",
        "lead_capture",
        "lead_capture_source",
        "sequence_opened",
        "sequence_clicked",
        "cart_viewed",
        "cart_initiated",
        "purchase_completed",
        "lesson_started",
        "lesson_completed",
        "forum_comment_posted",
        "forum_reply_received",
        "certificate_issued",
        "subscription_canceled",
      ].sort(),
    );
  });

  it("todo nome é snake_case", () => {
    for (const name of Object.values(ANALYTICS_EVENTS)) {
      expect(name).toMatch(/^[a-z]+(_[a-z]+)*$/);
    }
  });

  it("usa cart_initiated (não begin_checkout) para início de checkout", () => {
    expect(ANALYTICS_EVENTS.CART_INITIATED).toBe("cart_initiated");
    expect(Object.values(ANALYTICS_EVENTS)).not.toContain("begin_checkout");
  });

  it("mantém sign_up fora da taxonomia (evento de auth)", () => {
    expect(AUTH_SIGN_UP_EVENT).toBe("sign_up");
    expect(Object.values(ANALYTICS_EVENTS)).not.toContain("sign_up");
  });

  it("o union type aceita qualquer valor do objeto", () => {
    const evt: AnalyticsEvent = ANALYTICS_EVENTS.PURCHASE_COMPLETED;
    expect(evt).toBe("purchase_completed");
  });
});
