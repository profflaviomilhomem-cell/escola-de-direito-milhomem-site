/**
 * @jest-environment node
 */
import { GET } from "@/app/api/aluno/material/[produto]/[aula]/[tipo]/route";
import { userHasAccess } from "@/lib/enrollment";
import { prisma } from "@/lib/prisma";

/**
 * Esta rota é uma fronteira de acesso, não um utilitário: é o que separa quem
 * pagou R$ 297 de quem só descobriu o endereço. Até 24/08/2026 essa separação
 * não existia — os slides moravam em `public/` e respondiam 200 a qualquer um.
 *
 * Por isso os testes que importam aqui são os NEGATIVOS. Cada um deles
 * corresponde a uma forma concreta de tentar baixar material sem ter direito.
 */

jest.mock("@vercel/blob", () => ({ get: jest.fn() }));
jest.mock("@/lib/auth/session", () => ({ getSessionFromCookies: jest.fn() }));
jest.mock("@/lib/upstash/rate-limit", () => ({ rateLimit: jest.fn() }));
jest.mock("@/lib/enrollment", () => ({ userHasAccess: jest.fn() }));
jest.mock("@/lib/prisma", () => ({
  prisma: { lesson: { findFirst: jest.fn() } },
}));

const { get } = jest.requireMock("@vercel/blob") as { get: jest.Mock };
const { getSessionFromCookies } = jest.requireMock("@/lib/auth/session") as {
  getSessionFromCookies: jest.Mock;
};
const { rateLimit } = jest.requireMock("@/lib/upstash/rate-limit") as {
  rateLimit: jest.Mock;
};
const acesso = userHasAccess as unknown as jest.Mock;
const lessonFindFirst = prisma.lesson.findFirst as unknown as jest.Mock;

const PRODUTO = "prova-digital-no-processo-penal";
const AULA = "aula-01";

function chamar(
  produto = PRODUTO,
  aula = AULA,
  tipo = "slides",
): Promise<Response> {
  const req = { headers: new Headers() } as unknown as Parameters<
    typeof GET
  >[0];
  return GET(req, { params: Promise.resolve({ produto, aula, tipo }) });
}

function blobOk() {
  get.mockResolvedValue({
    statusCode: 200,
    stream: new ReadableStream(),
    headers: new Headers(),
    blob: { contentType: "application/pdf", size: 4594716 },
  });
}

const TOKEN_ORIGINAL = process.env.BLOB_READ_WRITE_TOKEN;
const TOKEN_MAT_ORIGINAL = process.env.BLOB_MATERIAIS_TOKEN;

beforeEach(() => {
  jest.clearAllMocks();
  process.env.BLOB_READ_WRITE_TOKEN = "vercel_blob_rw_teste";
  process.env.BLOB_MATERIAIS_TOKEN = "vercel_blob_rw_materiais_teste";
  getSessionFromCookies.mockResolvedValue({ sub: "user_1", role: "aluno" });
  rateLimit.mockResolvedValue({ success: true });
  acesso.mockResolvedValue(true);
  lessonFindFirst.mockResolvedValue({ id: "lesson_1" });
  blobOk();
});

afterAll(() => {
  if (TOKEN_ORIGINAL === undefined) delete process.env.BLOB_READ_WRITE_TOKEN;
  else process.env.BLOB_READ_WRITE_TOKEN = TOKEN_ORIGINAL;
  if (TOKEN_MAT_ORIGINAL === undefined) delete process.env.BLOB_MATERIAIS_TOKEN;
  else process.env.BLOB_MATERIAIS_TOKEN = TOKEN_MAT_ORIGINAL;
});

describe("GET /api/aluno/material — quem NÃO pode baixar", () => {
  it("sem sessão, responde 401 e não toca no Blob", async () => {
    getSessionFromCookies.mockResolvedValue(null);
    const res = await chamar();
    expect(res.status).toBe(401);
    expect(get).not.toHaveBeenCalled();
  });

  it("logado mas sem ter comprado, responde 403 e não toca no Blob", async () => {
    acesso.mockResolvedValue(false);
    const res = await chamar();
    expect(res.status).toBe(403);
    expect(get).not.toHaveBeenCalled();
  });

  it("aula de OUTRO produto responde 404 — trocar o slug na URL não serve", async () => {
    // Tem acesso ao produto pedido, mas a aula não pertence a ele.
    lessonFindFirst.mockResolvedValue(null);
    const res = await chamar();
    expect(res.status).toBe(404);
    expect(get).not.toHaveBeenCalled();
  });

  it.each([
    ["../../segredo", AULA, "slides"],
    [PRODUTO, "../aula-02", "slides"],
    [PRODUTO, "aula/01", "slides"],
    ["Produto", AULA, "slides"],
    [PRODUTO, AULA, "video"],
    [PRODUTO, AULA, "../../.env"],
  ])("recusa caminho forjado (%s / %s / %s)", async (p, a, t) => {
    const res = await chamar(p, a, t);
    expect(res.status).toBe(404);
    expect(get).not.toHaveBeenCalled();
    expect(getSessionFromCookies).not.toHaveBeenCalled();
  });

  it("excesso de downloads responde 429 antes de checar acesso", async () => {
    rateLimit.mockResolvedValue({ success: false });
    const res = await chamar();
    expect(res.status).toBe(429);
    expect(acesso).not.toHaveBeenCalled();
  });
});

describe("GET /api/aluno/material — quem pode", () => {
  it("entrega o arquivo com cabeçalho de download e sem cache", async () => {
    const res = await chamar();

    expect(res.status).toBe(200);
    expect(get).toHaveBeenCalledWith(`curso/${PRODUTO}/${AULA}/slides.pptx`, {
      access: "private",
      token: "vercel_blob_rw_materiais_teste",
    });
    const cd = res.headers.get("Content-Disposition") ?? "";
    expect(cd).toContain("attachment");
    // Nome amigável nas duas formas: ASCII para clientes antigos (o travessão
    // vira "_") e UTF-8 percent-encoded para os que entendem.
    expect(cd).toContain('filename="Slides _ Aula 01.pptx"');
    expect(cd).toContain("Slides%20%E2%80%94%20Aula%2001.pptx");
    // Material pago nunca pode ficar em cache compartilhado.
    expect(res.headers.get("Cache-Control")).toBe(
      "private, no-store, max-age=0",
    );
    expect(res.headers.get("X-Content-Type-Options")).toBe("nosniff");
  });

  it("apostila usa o caminho e a extensão do seu próprio tipo", async () => {
    await chamar(PRODUTO, AULA, "apostila");
    expect(get).toHaveBeenCalledWith(`curso/${PRODUTO}/${AULA}/apostila.pdf`, {
      access: "private",
      token: "vercel_blob_rw_materiais_teste",
    });
  });

  it("material ausente no Blob responde 404, não erro", async () => {
    get.mockResolvedValue(null);
    const res = await chamar();
    expect(res.status).toBe(404);
  });

  it("falha do Blob responde 502 e não vaza o erro interno", async () => {
    const erro = jest.spyOn(console, "error").mockImplementation(() => {});
    get.mockRejectedValue(new Error("credencial inválida do store"));
    const res = await chamar();
    expect(res.status).toBe(502);
    expect(JSON.stringify(await res.json())).not.toContain("credencial");
    erro.mockRestore();
  });

  it("sem armazenamento configurado responde 503", async () => {
    delete process.env.BLOB_MATERIAIS_TOKEN;
    delete process.env.BLOB_READ_WRITE_TOKEN;
    const res = await chamar();
    expect(res.status).toBe(503);
  });
});
