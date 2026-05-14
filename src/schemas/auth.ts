import { z } from "zod";

/**
 * Schemas Zod compartilhados entre formulário (RHF + zodResolver)
 * e API routes (`/api/auth/register` e `/api/auth/login`).
 *
 * IMPORTANTE — bcrypt trunca silenciosamente acima de 72 bytes.
 * O limite é em **bytes**, não em caracteres: emojis e acentos
 * pesam mais. `TextEncoder.encode().length` é a medida correta.
 * Vide Seção 3.11 do Guia de Desenvolvimento Web.
 */

const MAX_PASSWORD_BYTES = 72;
const MIN_PASSWORD_CHARS = 8;

const passwordField = z
  .string()
  .min(MIN_PASSWORD_CHARS, `Senha precisa de pelo menos ${MIN_PASSWORD_CHARS} caracteres.`)
  .refine(
    (value) => new TextEncoder().encode(value).length <= MAX_PASSWORD_BYTES,
    {
      message: `Senha excede o limite de ${MAX_PASSWORD_BYTES} bytes (acentos e emojis pesam mais que 1 byte).`,
    },
  );

// `.trim()` + `.toLowerCase()` rodam ANTES do `.pipe(z.email())`, então
// "  Rafael@Advogados-RJ.COM " vira "rafael@advogados-rj.com" antes do
// regex de e-mail rejeitar. Mantém input/output como `string` (preserva
// a inferência do RHF resolver, que `preprocess` quebraria com `unknown`).
const emailField = z
  .string()
  .trim()
  .toLowerCase()
  .pipe(
    z
      .email("E-mail inválido.")
      .min(1, "Informe seu e-mail.")
      .max(255, "E-mail longo demais."),
  );

export const registerSchema = z.object({
  name: z
    .string()
    .trim()
    .min(2, "Informe um nome com pelo menos 2 caracteres.")
    .max(120, "Nome longo demais.")
    .optional()
    .or(z.literal("").transform(() => undefined)),
  email: emailField,
  password: passwordField,
});

export type RegisterInput = z.infer<typeof registerSchema>;

export const loginSchema = z.object({
  email: emailField,
  // No login não exigimos os 8 caracteres mínimos — usuário pode ter
  // cadastrado antes de a regra existir; o bcrypt verify simplesmente
  // retorna false se não bater.
  password: z
    .string()
    .min(1, "Informe sua senha.")
    .refine(
      (value) => new TextEncoder().encode(value).length <= MAX_PASSWORD_BYTES,
      { message: `Senha excede o limite de ${MAX_PASSWORD_BYTES} bytes.` },
    ),
});

export type LoginInput = z.infer<typeof loginSchema>;

export const forgotPasswordSchema = z.object({
  email: emailField,
});

export type ForgotPasswordInput = z.infer<typeof forgotPasswordSchema>;

export const resetPasswordSchema = z.object({
  token: z.string().min(1, "Token de recuperação ausente."),
  password: passwordField,
});

export type ResetPasswordInput = z.infer<typeof resetPasswordSchema>;

export const updateProfileSchema = z.object({
  name: z
    .string()
    .trim()
    .min(2, "Informe um nome com pelo menos 2 caracteres.")
    .max(120, "Nome longo demais.")
    .optional()
    .or(z.literal("").transform(() => undefined)),
  email: emailField,
});

export type UpdateProfileInput = z.infer<typeof updateProfileSchema>;

export const updatePasswordSchema = z.object({
  currentPassword: z.string().min(1, "Informe sua senha atual."),
  newPassword: passwordField,
});

export type UpdatePasswordInput = z.infer<typeof updatePasswordSchema>;
