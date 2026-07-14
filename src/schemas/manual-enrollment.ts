import { z } from "zod";

export const manualEnrollmentSchema = z.object({
  email: z
    .string()
    .trim()
    .min(3, "Informe o e-mail do aluno.")
    .email("E-mail inválido."),
  productSlug: z.string().trim().min(1, "Selecione um produto."),
  note: z.string().trim().max(500).optional(),
});
