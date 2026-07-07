/**
 * @jest-environment node
 */
import { safeClickDestination } from "@/lib/email/tracking";
import { siteConfig } from "@/config/site";

describe("safeClickDestination (anti open-redirect)", () => {
  it("permite destino no próprio site", () => {
    const dest = `${siteConfig.url}/cursos/prova-digital-no-processo-penal`;
    expect(safeClickDestination(dest)).toBe(dest);
  });

  it("permite host externo da allowlist (YouTube)", () => {
    const dest = "https://www.youtube.com/watch?v=Sud0au_ogS0";
    expect(safeClickDestination(dest)).toBe(dest);
  });

  it("bloqueia host fora da allowlist (open redirect)", () => {
    expect(safeClickDestination("https://evil.example/phishing")).toBeNull();
  });

  it("bloqueia esquema não-http (javascript:)", () => {
    expect(safeClickDestination("javascript:alert(1)")).toBeNull();
  });

  it("bloqueia esquema data:", () => {
    expect(
      safeClickDestination("data:text/html,<script>alert(1)</script>"),
    ).toBeNull();
  });

  it("retorna null para entrada vazia ou inválida", () => {
    expect(safeClickDestination(null)).toBeNull();
    expect(safeClickDestination("não é uma url")).toBeNull();
  });

  it("permite o host do origin da requisição (previews Vercel)", () => {
    const dest = "https://escola-git-preview.vercel.app/cursos";
    expect(
      safeClickDestination(dest, "https://escola-git-preview.vercel.app"),
    ).toBe(dest);
  });
});
