import type { EmailTrackContext } from "./layout";

/** Entrada uniforme de todo template de sequência. */
export type SequenceEmailInput = {
  ctx: EmailTrackContext;
  /** Nome do destinatário (pode faltar). */
  name?: string;
  /** URL de descadastro assinada (LGPD). */
  unsubscribeUrl: string;
};

export type RenderedEmail = {
  subject: string;
  html: string;
  text: string;
};

/** Assinatura de um passo de sequência (mesma forma do confirm-newsletter). */
export type SequenceTemplate = (input: SequenceEmailInput) => RenderedEmail;
