/**
 * Sequência pós-compra — guia 6.13.
 * Acionada quando o pedido vira PAID. 3 e-mails em 7 dias (dias 0/2/6):
 * boas-vindas ao cohort, instruções de acesso, convite ao grupo + 1ª tarefa.
 */

import { composeEmail, emailRoutes } from "./layout";
import type { SequenceEmailInput, SequenceTemplate } from "./types";

// P1 · dia 0 — Boas-vindas ao cohort.
const post1: SequenceTemplate = (input: SequenceEmailInput) => {
  const r = emailRoutes(input.ctx.baseUrl);
  return composeEmail({
    input,
    subject: "Bem-vindo à turma fundadora — sua vaga está confirmada",
    eyebrow: "Matrícula confirmada",
    title:
      'Você está <em style="color:#f1bb41;font-style:italic;">dentro</em>.',
    titleText: "Você está dentro.",
    paragraphs: [
      "Sua matrícula na Edição Lançamento está confirmada. Seja muito bem-vindo à turma fundadora da Escola — é uma alegria ter você aqui.",
      "Nos próximos dias você recebe as instruções de acesso à plataforma e a orientação para o primeiro passo. Por ora, não precisa fazer nada: guarde este e-mail e fique atento à caixa de entrada.",
      "O cohort tem início previsto para 1º de setembro de 2026, com trilha semanal, fórum por aula e encontros ao vivo. Vamos estudar juntos, do começo ao fim.",
    ],
    ctas: [{ label: "Acessar a plataforma", href: r.alunoDashboard }],
  });
};

// P2 · dia 2 — Instruções de acesso.
const post2: SequenceTemplate = (input: SequenceEmailInput) => {
  const r = emailRoutes(input.ctx.baseUrl);
  return composeEmail({
    input,
    subject: "Como acessar suas aulas e materiais",
    eyebrow: "Instruções de acesso",
    title:
      'Tudo o que você precisa para <em style="color:#f1bb41;font-style:italic;">começar</em>.',
    titleText: "Tudo o que você precisa para começar.",
    paragraphs: [
      "Seu acesso à plataforma já está liberado. É nela que ficam as aulas gravadas, os PDFs de cada módulo, o fórum por aula e o calendário dos encontros ao vivo.",
      "Entre pela área do aluno com o e-mail desta compra. As aulas são liberadas semanalmente; os materiais de apoio — apostilas, mapa mental e caderno de questões — já estão disponíveis para download.",
      "Recomendo o desktop para leitura dos PDFs mais extensos; as aulas e o fórum funcionam bem também no navegador do celular. Qualquer problema de acesso, responda este e-mail.",
    ],
    ctas: [{ label: "Entrar na área do aluno", href: r.alunoDashboard }],
  });
};

// P3 · dia 6 — Convite ao grupo + primeira tarefa.
const post3: SequenceTemplate = (input: SequenceEmailInput) => {
  const r = emailRoutes(input.ctx.baseUrl);
  return composeEmail({
    input,
    subject: "Sua primeira tarefa (e o grupo da turma)",
    eyebrow: "Primeiros passos",
    title:
      'Comece pelo <em style="color:#f1bb41;font-style:italic;">fórum</em> — e pela primeira tarefa.',
    titleText: "Comece pelo fórum — e pela primeira tarefa.",
    paragraphs: [
      "A turma fundadora estuda em conjunto, e o fórum por aula é onde isso acontece: é lá que você tira dúvidas, discute casos e recebe minha resposta em até 72 horas.",
      "Sua primeira tarefa é simples e vale a pena fazer agora: acesse o fórum da aula de abertura e escreva uma apresentação curta — quem é você, onde atua e o que espera do cohort. Conhecer a turma muda a qualidade das discussões que virão.",
      "Depois disso, assista à aula de abertura e siga a trilha no seu ritmo. Nos vemos por dentro.",
    ],
    ctas: [{ label: "Ir para o fórum da turma", href: r.alunoDashboard }],
  });
};

/** Passos da sequência POST_PURCHASE, em ordem (dias 0/2/6). */
export const POST_PURCHASE_TEMPLATES: SequenceTemplate[] = [
  post1,
  post2,
  post3,
];
