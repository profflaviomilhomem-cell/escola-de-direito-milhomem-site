import { z } from "zod";

export const contactSchema = z.object({
  name: z.string().min(2, "Informe seu nome.").max(120, "Nome longo demais."),
  email: z
    .string()
    .min(1, "Informe seu e-mail.")
    .email("E-mail inválido.")
    .max(255, "E-mail longo demais."),
  /**
   * Previsto no blueprint da página de contato (Livro-Guia cap. 5.8: "campos
   * mínimos — nome, e-mail, assunto, mensagem") e ausente até 03/08/2026.
   *
   * Vai para a linha de assunto do e-mail, então quem recebe tria sem abrir a
   * mensagem — a página anuncia três canais bem diferentes (Edição Lançamento,
   * parcerias acadêmicas e imprensa) numa caixa só.
   */
  subject: z
    .string()
    .min(3, "Informe o assunto.")
    .max(150, "Assunto longo demais."),
  message: z
    .string()
    .min(10, "Mensagem muito curta.")
    .max(4000, "Mensagem longa demais."),
  website: z.string().max(0).optional(),
});

export type ContactInput = z.infer<typeof contactSchema>;
