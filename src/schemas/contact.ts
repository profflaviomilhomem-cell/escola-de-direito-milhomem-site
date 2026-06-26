import { z } from "zod";

export const contactSchema = z.object({
  name: z.string().min(2, "Informe seu nome.").max(120, "Nome longo demais."),
  email: z
    .string()
    .min(1, "Informe seu e-mail.")
    .email("E-mail inválido.")
    .max(255, "E-mail longo demais."),
  message: z
    .string()
    .min(10, "Mensagem muito curta.")
    .max(4000, "Mensagem longa demais."),
  website: z.string().max(0).optional(),
});

export type ContactInput = z.infer<typeof contactSchema>;
