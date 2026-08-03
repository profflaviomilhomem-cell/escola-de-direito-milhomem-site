/**
 * @jest-environment node
 */
import { NextRequest } from "next/server";

import { proxy } from "@/proxy";

/**
 * O proxy é o guard de segurança de todas as áreas logadas e **não tinha teste
 * nenhum** até 03/08/2026 — foi exatamente por aí que passou o furo do
 * `/admin`: o matcher alcançava a rota, mas o prefixo não constava das listas,
 * e `/admin/dashboard` respondia 200 sem sessão enquanto `/aluno` dava 307.
 *
 * Estes testes fixam o contrato: toda área logada redireciona sem sessão, e
 * nenhuma rota pública é bloqueada por engano.
 */
const req = (path: string) =>
  new NextRequest(new URL(`https://exemplo.test${path}`));

describe("proxy · guard das áreas logadas", () => {
  describe("sem sessão, redireciona para /entrar", () => {
    it.each([
      "/aluno",
      "/aluno/dashboard",
      "/professor",
      "/professor/dashboard",
      "/admin",
      "/admin/dashboard",
    ])("%s", async (path) => {
      const res = await proxy(req(path));
      expect(res.status).toBe(307);
      const destino = new URL(res.headers.get("location") ?? "");
      expect(destino.pathname).toBe("/entrar");
      expect(destino.searchParams.get("from")).toBe(path);
      expect(destino.searchParams.get("unauthorized")).toBe("1");
    });
  });

  describe("rotas públicas passam", () => {
    it.each([
      "/",
      "/sobre",
      "/cursos",
      "/blog",
      "/contato",
      "/materiais",
      "/newsletter",
    ])("%s", async (path) => {
      const res = await proxy(req(path));
      expect(res.status).toBe(200);
      expect(res.headers.get("location")).toBeNull();
    });
  });

  it("não confunde prefixo com rota de nome parecido", async () => {
    // `/administrativo` não é `/admin` — startsWith cru pegaria.
    const res = await proxy(req("/administrativo"));
    expect(res.status).toBe(200);
  });

  it("aplica os headers de segurança nas respostas que passam", async () => {
    const res = await proxy(req("/"));
    expect(res.headers.get("X-Content-Type-Options")).toBe("nosniff");
    expect(res.headers.get("Referrer-Policy")).toBe(
      "strict-origin-when-cross-origin",
    );
    expect(res.headers.get("X-Frame-Options")).toBe("SAMEORIGIN");
  });
});
