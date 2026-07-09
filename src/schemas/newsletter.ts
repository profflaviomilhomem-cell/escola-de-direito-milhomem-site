import { z } from "zod";

/**
 * Schema compartilhado de captura de lead — usado pelo formulário
 * (`react-hook-form` + `zodResolver`) e pela API Route `/api/leads`
 * (validação autoritativa no servidor).
 */
export const newsletterSchema = z.object({
  email: z
    .string()
    .min(1, "Informe seu e-mail.")
    .email("E-mail inválido.")
    .max(255, "E-mail longo demais."),
  name: z.string().max(120, "Nome longo demais.").optional(),
  source: z.string().max(60).optional(),
  leadMagnetSlug: z.string().max(120).optional(),
  utmSource: z.string().max(120).optional(),
  utmMedium: z.string().max(120).optional(),
  utmCampaign: z.string().max(120).optional(),
  // Honeypot — campo invisível. Bots tendem a preencher; humanos não.
  // Aceitamos qualquer valor no schema (limitado) DE PROPÓSITO: rejeitar aqui
  // devolveria um 422 apontando o campo `website` e ensinaria o bot qual é a
  // armadilha. O descarte silencioso (201 fake) acontece na rota, após validar.
  website: z.string().max(255).optional(),
});

export type NewsletterInput = z.infer<typeof newsletterSchema>;
