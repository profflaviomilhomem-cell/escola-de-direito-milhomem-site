import {
  hashPassword,
  verifyPassword,
  PasswordTooLongError,
} from "@/lib/auth/password";

describe("auth/password", () => {
  it("aceita senha válida e verifica", async () => {
    const hash = await hashPassword("senha-forte-123");
    expect(hash).toMatch(/^\$2[aby]\$/);
    await expect(verifyPassword("senha-forte-123", hash)).resolves.toBe(true);
  });

  it("rejeita senha errada", async () => {
    const hash = await hashPassword("senha-forte-123");
    await expect(verifyPassword("errada", hash)).resolves.toBe(false);
  });

  it("lança PasswordTooLongError em senha > 72 bytes", async () => {
    const longa = "a".repeat(73);
    await expect(hashPassword(longa)).rejects.toBeInstanceOf(
      PasswordTooLongError,
    );
  });

  it("aceita senha exatamente no limite (72 bytes)", async () => {
    const noLimite = "a".repeat(72);
    await expect(hashPassword(noLimite)).resolves.toBeTruthy();
  });
});
