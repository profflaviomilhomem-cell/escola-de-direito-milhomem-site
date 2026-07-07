/**
 * @jest-environment node
 *
 * Integração do fluxo de RECUPERAÇÃO DE SENHA ponta a ponta, ao nível das
 * rotas: /api/auth/forgot → (token do link) → /api/auth/reset.
 *
 * Usa o reset-token (jose) e o hash de senha (bcrypt) REAIS — só o banco, o
 * rate-limit e o envio de e-mail são mockados. Prova que:
 *   1. forgot gera um link com um token de reset válido para o usuário certo;
 *   2. e-mail desconhecido não recebe nada (anti-enumeração);
 *   3. reset com o token do link troca a senha por uma REALMENTE utilizável
 *      (o hash gravado valida contra a nova senha via verifyPassword);
 *   4. token adulterado / de issuer errado é recusado (senha intocada).
 *
 * O único motivo de o nó `prod-auth` seguir EM PROGRESSO é a entrega do e-mail
 * (no-op sem RESEND_API_KEY). Este teste blinda todo o resto do caminho.
 */
import type { NextRequest } from "next/server";

import { POST as forgotPOST } from "@/app/api/auth/forgot/route";
import { POST as resetPOST } from "@/app/api/auth/reset/route";
import { signSession } from "@/lib/auth/jwt";
import { verifyPassword } from "@/lib/auth/password";
import { prisma } from "@/lib/prisma";
import { sendEmail } from "@/lib/resend/client";
import { rateLimit } from "@/lib/upstash/rate-limit";

jest.mock("@/lib/prisma", () => ({
  prisma: {
    user: {
      findUnique: jest.fn(),
      update: jest.fn(),
    },
  },
}));

jest.mock("@/lib/upstash/rate-limit", () => ({
  rateLimit: jest.fn(),
}));

jest.mock("@/lib/resend/client", () => ({
  sendEmail: jest.fn(),
}));

const findUnique = prisma.user.findUnique as jest.Mock;
const update = prisma.user.update as jest.Mock;
const rl = rateLimit as jest.Mock;
const send = sendEmail as jest.Mock;

const ORIGINAL_SECRET = process.env.AUTH_SECRET;
const EMAIL = "aluno@exemplo.com";
const NOVA_SENHA = "NovaSenha123!";

function postJson(url: string, body: unknown): NextRequest {
  return new Request(url, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify(body),
  }) as unknown as NextRequest;
}

/** Extrai o token do link de reset do e-mail capturado no mock de sendEmail. */
function tokenFromSentEmail(): string {
  expect(send).toHaveBeenCalledTimes(1);
  const opts = send.mock.calls[0][0] as { text: string; html: string };
  const match = /token=([^\s"&]+)/.exec(opts.text ?? opts.html);
  if (!match) throw new Error("link de reset não encontrado no e-mail enviado");
  return match[1];
}

beforeAll(() => {
  process.env.AUTH_SECRET =
    "test-secret-com-mais-de-32-caracteres-nao-use-em-prod";
});

afterAll(() => {
  process.env.AUTH_SECRET = ORIGINAL_SECRET;
});

beforeEach(() => {
  jest.clearAllMocks();
  rl.mockResolvedValue({ success: true });
  send.mockResolvedValue({ ok: true, skipped: true });
  update.mockResolvedValue({});
});

describe("fluxo de recuperação de senha (forgot → reset)", () => {
  it("gera um link de reset válido para um usuário existente", async () => {
    findUnique.mockResolvedValue({
      id: "user_1",
      email: EMAIL,
      name: "Aluno",
    });

    const res = await forgotPOST(
      postJson("http://localhost/api/auth/forgot", { email: EMAIL }),
    );

    expect(res.status).toBe(200);
    const token = tokenFromSentEmail();

    // o token do link precisa reabrir para o usuário certo na rota de reset
    update.mockResolvedValue({});
    const resetRes = await resetPOST(
      postJson("http://localhost/api/auth/reset", {
        token,
        password: NOVA_SENHA,
      }),
    );
    expect(resetRes.status).toBe(200);
    expect(update).toHaveBeenCalledWith(
      expect.objectContaining({ where: { id: "user_1" } }),
    );
  });

  it("não envia e-mail para e-mail desconhecido (anti-enumeração), mas responde 200", async () => {
    findUnique.mockResolvedValue(null);

    const res = await forgotPOST(
      postJson("http://localhost/api/auth/forgot", {
        email: "naoexiste@exemplo.com",
      }),
    );

    expect(res.status).toBe(200);
    expect(send).not.toHaveBeenCalled();
  });

  it("ponta a ponta: o reset troca a senha por uma REALMENTE utilizável", async () => {
    findUnique.mockResolvedValue({ id: "user_1", email: EMAIL, name: "Aluno" });

    await forgotPOST(
      postJson("http://localhost/api/auth/forgot", { email: EMAIL }),
    );
    const token = tokenFromSentEmail();

    const res = await resetPOST(
      postJson("http://localhost/api/auth/reset", {
        token,
        password: NOVA_SENHA,
      }),
    );
    expect(res.status).toBe(200);

    // o hash gravado no banco tem de validar contra a NOVA senha
    const data = update.mock.calls[0][0].data as { passwordHash: string };
    expect(data.passwordHash).toEqual(expect.any(String));
    expect(data.passwordHash).not.toContain(NOVA_SENHA); // nunca em claro
    await expect(verifyPassword(NOVA_SENHA, data.passwordHash)).resolves.toBe(
      true,
    );
    await expect(
      verifyPassword("senha-errada", data.passwordHash),
    ).resolves.toBe(false);
  });

  it("recusa token adulterado sem tocar na senha (401)", async () => {
    findUnique.mockResolvedValue({ id: "user_1", email: EMAIL, name: "Aluno" });
    await forgotPOST(
      postJson("http://localhost/api/auth/forgot", { email: EMAIL }),
    );
    const token = tokenFromSentEmail();
    const tampered = token.slice(0, -5) + "aaaaa";

    const res = await resetPOST(
      postJson("http://localhost/api/auth/reset", {
        token: tampered,
        password: NOVA_SENHA,
      }),
    );
    expect(res.status).toBe(401);
    expect(update).not.toHaveBeenCalled();
  });

  it("recusa um token de SESSÃO usado como token de reset (issuer errado)", async () => {
    const sessionToken = await signSession({ sub: "user_1", email: EMAIL });

    const res = await resetPOST(
      postJson("http://localhost/api/auth/reset", {
        token: sessionToken,
        password: NOVA_SENHA,
      }),
    );
    expect(res.status).toBe(401);
    expect(update).not.toHaveBeenCalled();
  });

  it("propaga o 429 do rate-limit por e-mail sem gerar link", async () => {
    // 1º rate-limit (IP) passa, 2º (e-mail) estoura
    rl.mockResolvedValueOnce({ success: true }).mockResolvedValueOnce({
      success: false,
    });
    findUnique.mockResolvedValue({ id: "user_1", email: EMAIL, name: "Aluno" });

    const res = await forgotPOST(
      postJson("http://localhost/api/auth/forgot", { email: EMAIL }),
    );

    expect(res.status).toBe(429);
    expect(send).not.toHaveBeenCalled();
  });
});
