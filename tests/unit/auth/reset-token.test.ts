/**
 * @jest-environment node
 */
import { signResetToken, verifyResetToken } from "@/lib/auth/reset-token";

const ORIGINAL_SECRET = process.env.AUTH_SECRET;

beforeAll(() => {
  process.env.AUTH_SECRET =
    "test-secret-com-mais-de-32-caracteres-nao-use-em-prod";
});

afterAll(() => {
  process.env.AUTH_SECRET = ORIGINAL_SECRET;
});

describe("auth/reset-token", () => {
  it("faz roundtrip sign → verify e preserva payload", async () => {
    const payloadInput = { sub: "user_123", email: "teste@exemplo.com" };
    const token = await signResetToken(payloadInput);
    const payload = await verifyResetToken(token);

    expect(payload).not.toBeNull();
    expect(payload?.sub).toBe("user_123");
    expect(payload?.email).toBe("teste@exemplo.com");
  });

  it("rejeita token adulterado", async () => {
    const token = await signResetToken({ sub: "u", email: "e@e.com" });
    const tampered = token.substring(0, token.length - 5) + "abcde";
    const payload = await verifyResetToken(tampered);
    expect(payload).toBeNull();
  });

  it("rejeita token com issuer de sessão normal", async () => {
    // Simulando um token de sessão normal tentando ser usado como reset
    const { signSession } = require("@/lib/auth/jwt");
    const tokenSession = await signSession({ sub: "u", email: "e" });
    const payload = await verifyResetToken(tokenSession);
    expect(payload).toBeNull();
  });
});
