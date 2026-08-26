import {
  buildContentSecurityPolicy,
  buildSecurityHeaders,
  CSP_REPORT_PATH,
} from "@/lib/security/headers";

/**
 * O proxy aplicava três headers escritos à mão e não tinha teste nenhum sobre
 * eles. Estes testes cobrem o que quebra em silêncio: um header que some, uma
 * diretiva de CSP esquecida, ou a política indo a enforcing sem querer.
 */
describe("security headers", () => {
  it("mantém os três headers que já existiam antes de 26/08", () => {
    const h = buildSecurityHeaders();
    expect(h["X-Content-Type-Options"]).toBe("nosniff");
    expect(h["Referrer-Policy"]).toBe("strict-origin-when-cross-origin");
    expect(h["X-Frame-Options"]).toBe("SAMEORIGIN");
  });

  it("aplica HSTS de 2 anos sobre HTTPS, e nunca com preload", () => {
    const h = buildSecurityHeaders({ isSecure: true });
    expect(h["Strict-Transport-Security"]).toBe(
      "max-age=63072000; includeSubDomains",
    );
    // `preload` é praticamente irreversível e o domínio ainda vai migrar.
    expect(h["Strict-Transport-Security"]).not.toContain("preload");
  });

  it("omite HSTS fora de HTTPS", () => {
    const h = buildSecurityHeaders({ isSecure: false });
    expect(h["Strict-Transport-Security"]).toBeUndefined();
  });

  it("desliga câmera, microfone e geolocalização", () => {
    const pp = buildSecurityHeaders()["Permissions-Policy"];
    expect(pp).toContain("camera=()");
    expect(pp).toContain("microphone=()");
    expect(pp).toContain("geolocation=()");
  });

  it("entra em Report-Only por padrão e só bloqueia quando pedido", () => {
    const relatorio = buildSecurityHeaders();
    expect(relatorio["Content-Security-Policy-Report-Only"]).toBeDefined();
    expect(relatorio["Content-Security-Policy"]).toBeUndefined();

    const bloqueando = buildSecurityHeaders({ reportOnly: false });
    expect(bloqueando["Content-Security-Policy"]).toBeDefined();
    expect(bloqueando["Content-Security-Policy-Report-Only"]).toBeUndefined();
  });

  it("não manda upgrade-insecure-requests em report-only", () => {
    // O browser ignora a diretiva em report-only E registra erro de console.
    // Quinze testes e2e de área logada afirmam "sem erro de console" — foi
    // assim que este defeito apareceu.
    expect(buildContentSecurityPolicy(false)).not.toContain(
      "upgrade-insecure-requests",
    );
    expect(buildContentSecurityPolicy(true)).toContain(
      "upgrade-insecure-requests",
    );
    expect(
      buildSecurityHeaders()["Content-Security-Policy-Report-Only"],
    ).not.toContain("upgrade-insecure-requests");
    expect(
      buildSecurityHeaders({ reportOnly: false })["Content-Security-Policy"],
    ).toContain("upgrade-insecure-requests");
  });

  describe("conteúdo da política", () => {
    const csp = buildContentSecurityPolicy();

    it("fecha o que não deve ser aberto", () => {
      expect(csp).toContain("default-src 'self'");
      expect(csp).toContain("object-src 'none'");
      expect(csp).toContain("base-uri 'self'");
      // form-action 'self' impede que um XSS redirecione POST de login/checkout
      // para um domínio de terceiro.
      expect(csp).toContain("form-action 'self'");
      expect(csp).toContain("frame-ancestors 'self'");
    });

    it("aponta o report-uri para a rota que existe", () => {
      expect(csp).toContain(`report-uri ${CSP_REPORT_PATH}`);
      expect(CSP_REPORT_PATH).toBe("/api/csp-report");
    });

    it("libera as origens que o site realmente carrega", () => {
      expect(csp).toContain("https://fonts.googleapis.com");
      expect(csp).toContain("https://fonts.gstatic.com");
      expect(csp).toContain("https://us.i.posthog.com");
      expect(csp).toContain("https://connect.facebook.net");
      expect(csp).toContain("https://snap.licdn.com");
      expect(csp).toContain("https://martinsfontespaulista.vteximg.com.br");
      expect(csp).toContain("https://*.public.blob.vercel-storage.com");
    });

    it("libera o Pagar.me — sem isso, enforcing mata o cartão", () => {
      // O browser tokeniza falando direto com api.pagar.me. Esta linha é a
      // diferença entre "promover a CSP" e "derrubar o checkout".
      expect(csp).toContain("https://api.pagar.me");
      const connect = csp.split("; ").find((d) => d.startsWith("connect-src"));
      expect(connect).toContain("https://api.pagar.me");
    });

    it("libera o Cloudflare Stream antes do dia do upload", () => {
      // O videoId das 10 aulas está vazio esperando a conta do Flávio. Quando
      // o primeiro vídeo subir, a CSP não pode ser a surpresa do dia.
      expect(csp).toContain("https://embed.cloudflarestream.com");
      expect(csp).toContain("https://iframe.videodelivery.net");
      expect(csp).toContain("https://*.videodelivery.net");
    });

    it("libera o YouTube, que é onde o vídeo de abertura vive hoje", () => {
      expect(csp).toContain("https://www.youtube.com");
      expect(csp).toContain("https://www.youtube-nocookie.com");
    });
  });
});
