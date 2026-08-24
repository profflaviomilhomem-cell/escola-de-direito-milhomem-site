/**
 * Sequência de carrinho abandonado — guia 6.13.
 * 3 e-mails em 48h pós-abandono (+1h / +12h / +36h).
 * Foco em objeção e garantia — sem pressão artificial.
 */

import { composeEmail, emailRoutes } from "./layout";
import type { SequenceEmailInput, SequenceTemplate } from "./types";

// A1 · +1h — Lembrete gentil (ficou algo pendente).
const cart1: SequenceTemplate = (input: SequenceEmailInput) => {
  const r = emailRoutes(input.ctx.baseUrl);
  return composeEmail({
    input,
    subject: "Sua inscrição na Edição Lançamento ficou pela metade",
    eyebrow: "Inscrição pendente",
    title:
      'Você chegou quase <em style="color:#f1bb41;font-style:italic;">lá</em>.',
    titleText: "Você chegou quase lá.",
    paragraphs: [
      "Notei que você começou a inscrição na Edição Lançamento, mas não concluiu. Acontece — às vezes é só o momento que não ajudou.",
      // 24/08/2026: dizia "sua vaga ainda está reservada". Não fica: a contagem
      // de vagas (50 − pedidos PAGOS, ver catalog.ts) só considera pagamento
      // confirmado, então pedido pendente não segura lugar nenhum. Reservar
      // vaga que o sistema não reserva é promessa que o código desmente.
      "As vagas da turma fundadora são limitadas, e a inscrição só se conclui com o pagamento. Retomar leva menos de um minuto.",
      "Se ficou alguma dúvida antes de finalizar, responda este e-mail. Eu leio e ajudo pessoalmente.",
    ],
    ctas: [{ label: "Concluir minha inscrição", href: r.checkout }],
  });
};

// A2 · +12h — Objeção (o que costuma travar) + garantia.
const cart2: SequenceTemplate = (input: SequenceEmailInput) => {
  const r = emailRoutes(input.ctx.baseUrl);
  return composeEmail({
    input,
    subject: "A dúvida que costuma travar — e a garantia que resolve",
    eyebrow: "Sobre a decisão",
    title:
      'O risco de experimentar é <em style="color:#f1bb41;font-style:italic;">zero</em>.',
    titleText: "O risco de experimentar é zero.",
    paragraphs: [
      "Quando alguém hesita na hora de concluir, quase sempre é a mesma pergunta: e se não for para mim? É uma dúvida legítima.",
      "Por isso a Edição Lançamento tem garantia incondicional de quinze dias. Você entra, assiste às aulas, baixa os slides e acompanha o fórum por dentro — e, se concluir que não é o caminho certo agora, pede o reembolso integral, conforme a política publicada em /reembolso. Prazo superior ao mínimo legal de sete dias.",
      "Na prática, você decide de verdade só depois de ver o curso por dentro, sem risco financeiro.",
    ],
    ctas: [
      { label: "Retomar a inscrição", href: r.checkout },
      { label: "Ler a garantia", href: r.reembolso },
    ],
  });
};

// A3 · +36h — Fecho (a janela é real).
const cart3: SequenceTemplate = (input: SequenceEmailInput) => {
  const r = emailRoutes(input.ctx.baseUrl);
  return composeEmail({
    input,
    // 24/08/2026: o assunto era "sua vaga não fica reservada para sempre" —
    // mesma promessa que saiu do A1: pedido pendente não reserva vaga alguma.
    subject: "A turma fundadora fecha — e a condição é da primeira turma",
    eyebrow: "Última lembrança",
    title:
      'A condição de <em style="color:#f1bb41;font-style:italic;">turma fundadora</em> tem prazo.',
    titleText: "A condição de turma fundadora tem prazo.",
    paragraphs: [
      "Este é o último lembrete sobre a inscrição que você começou. Não quero insistir além da conta — mas também não quero que você fique de fora por esquecimento.",
      "As vagas da turma fundadora são limitadas e o preço fundador é da primeira turma. Quando o carrinho fechar, essa condição não se repete nos próximos cohorts.",
      "Se fizer sentido, conclua agora. Se preferir esperar um próximo cohort, sem problema — você continua no Bastidor da Acusação, recebendo as edições quinzenais.",
    ],
    ctas: [{ label: "Concluir antes de fechar", href: r.checkout }],
  });
};

/** Passos da sequência ABANDONED_CART, em ordem (+1h / +12h / +36h). */
export const ABANDONED_CART_TEMPLATES: SequenceTemplate[] = [
  cart1,
  cart2,
  cart3,
];
