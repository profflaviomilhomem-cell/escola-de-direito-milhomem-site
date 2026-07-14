/**
 * Schema Zod compartilhado entre cliente (validação otimista) e
 * servidor (validação autoritativa) para a calculadora de pena.
 */
import { z } from "zod";

const circunstanciaArt59 = z.enum([
  "culpabilidade",
  "antecedentes",
  "condutaSocial",
  "personalidade",
  "motivos",
  "circunstancias",
  "consequencias",
  "comportamentoVitima",
]);

export const calculadoraSchema = z
  .object({
    crimeSlug: z.string().min(1).max(60).optional(),
    minDias: z
      .number()
      .int()
      .positive()
      .max(365 * 50)
      .optional(),
    maxDias: z
      .number()
      .int()
      .positive()
      .max(365 * 50)
      .optional(),
    desfavoraveis: z.array(circunstanciaArt59).max(8).default([]),
    agravantes: z.number().int().min(0).max(20).default(0),
    atenuantes: z.number().int().min(0).max(20).default(0),
    causasAumento: z.array(z.number().min(0).max(3)).max(10).default([]),
    causasDiminuicao: z.array(z.number().min(0).max(0.99)).max(10).default([]),
  })
  .refine((data) => data.crimeSlug || (data.minDias && data.maxDias), {
    message: "Informe um crime preset ou os limites mínimo e máximo.",
  })
  .refine(
    (data) => !data.minDias || !data.maxDias || data.maxDias >= data.minDias,
    { message: "O máximo legal não pode ser menor que o mínimo." },
  );
