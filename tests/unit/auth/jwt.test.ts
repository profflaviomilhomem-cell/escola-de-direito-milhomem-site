/**
 * @jest-environment node
 *
 * `jose` checa `payload instanceof Uint8Array` internamente; o `Uint8Array`
 * do `TextEncoder` polyfilled (node:util) tem realm diferente do `Uint8Array`
 * do jsdom, e o check falha. JWT é lógica pura — testar em ambiente Node.
 */
import { signSession, verifySession } from "@/lib/auth/jwt";

const ORIGINAL_SECRET = process.env.AUTH_SECRET;

beforeAll(() => {
  // Garante secret de teste — independe do .env.local da máquina
  process.env.AUTH_SECRET =
    "test-secret-com-mais-de-32-caracteres-nao-use-em-prod";
});

afterAll(() => {
  process.env.AUTH_SECRET = ORIGINAL_SECRET;
});

describe("auth/jwt", () => {
  it("faz roundtrip sign → verify e preserva claims", async () => {
    const token = await signSession({
      sub: "user_abc123",
      email: "rafael@advogados-rj.com",
      name: "Rafael",
      role: "aluno",
    });
    const payload = await verifySession(token);
    expect(payload).not.toBeNull();
    expect(payload?.sub).toBe("user_abc123");
    expect(payload?.email).toBe("rafael@advogados-rj.com");
    expect(payload?.name).toBe("Rafael");
    expect(payload?.role).toBe("aluno");
  });

  it("retorna null para token expirado", async () => {
    const token = await signSession(
      { sub: "u", email: "e@e.com" },
      -10, // expirou 10s atrás
    );
    const payload = await verifySession(token);
    expect(payload).toBeNull();
  });

  it("retorna null para token alterado", async () => {
    const token = await signSession({ sub: "u", email: "e@e.com" });
    const tampered = `${token.slice(0, -2)}xx`;
    const payload = await verifySession(tampered);
    expect(payload).toBeNull();
  });

  it("retorna null para issuer diferente", async () => {
    // Trocamos o secret no meio para simular um token assinado por
    // outra chave (que `verifySession` deveria recusar).
    const original = process.env.AUTH_SECRET;
    process.env.AUTH_SECRET =
      "outro-secret-totalmente-diferente-com-mais-de-32-chars";
    const tokenForeign = await signSession({ sub: "u", email: "e@e.com" });
    process.env.AUTH_SECRET = original;
    const payload = await verifySession(tokenForeign);
    expect(payload).toBeNull();
  });
});
