/**
 * @jest-environment node
 */
import { siteConfig } from "@/config/site";
import { WELCOME_TEMPLATES } from "@/lib/resend/templates/welcome";
import { LAUNCH_TEMPLATES } from "@/lib/resend/templates/launch";
import { ABANDONED_CART_TEMPLATES } from "@/lib/resend/templates/abandoned-cart";
import { POST_PURCHASE_TEMPLATES } from "@/lib/resend/templates/post-purchase";
import type { SequenceEmailInput } from "@/lib/resend/templates/types";

const UNSUB = "https://site.test/api/email/unsubscribe?token=abc.def.ghi";

const input: SequenceEmailInput = {
  ctx: {
    baseUrl: "https://site.test",
    email: "aluno@exemplo.com",
    sequence: "welcome",
    step: 0,
  },
  name: "Ana",
  unsubscribeUrl: UNSUB,
};

const ALL = [
  ["WELCOME", WELCOME_TEMPLATES],
  ["LAUNCH", LAUNCH_TEMPLATES],
  ["ABANDONED_CART", ABANDONED_CART_TEMPLATES],
  ["POST_PURCHASE", POST_PURCHASE_TEMPLATES],
] as const;

describe("templates de sequência", () => {
  it("são 18 no total (5 + 7 + 3 + 3)", () => {
    const total = ALL.reduce((n, [, arr]) => n + arr.length, 0);
    expect(total).toBe(18);
  });

  it.each(ALL)(
    "%s: cada template rende subject/html/text e carrega tagline + descadastro",
    (_name, templates) => {
      for (const template of templates) {
        const r = template(input);
        expect(r.subject.trim().length).toBeGreaterThan(0);
        expect(r.html.trim().length).toBeGreaterThan(0);
        expect(r.text.trim().length).toBeGreaterThan(0);

        // Tagline institucional obrigatória na assinatura (guia 1.11).
        expect(r.html).toContain(siteConfig.taglineInstitucional);
        expect(r.text).toContain(siteConfig.taglineInstitucional);

        // Link de descadastro no rodapé (LGPD).
        expect(r.html).toContain(UNSUB);
        expect(r.text).toContain(UNSUB);

        // Endereço institucional (guia 6.14).
        expect(r.html).toContain(siteConfig.contact.email);
      }
    },
  );

  it("embrulha os CTAs no rastreador de clique (sequence_clicked)", () => {
    const r = WELCOME_TEMPLATES[0](input);
    expect(r.html).toContain("/api/email/track/click?u=");
    // E o pixel de abertura (sequence_opened).
    expect(r.html).toContain("/api/email/track/open?e=");
  });
});
