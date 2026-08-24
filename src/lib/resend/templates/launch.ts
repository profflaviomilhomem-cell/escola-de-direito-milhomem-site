/**
 * Sequência de lançamento — guia 6.13.
 * Acionada MANUALMENTE no open cart do cohort. 7 e-mails em 7 dias (dias 0..6).
 * Narrativa clássica adaptada: abertura, storytelling, prova, FAQ, objeção,
 * escassez real, fechamento. SEM gatilho falso — a escassez é real (turma
 * fundadora com vagas limitadas e prazo de carrinho verdadeiro).
 */

import { composeEmail, emailRoutes } from "./layout";
import type { SequenceEmailInput, SequenceTemplate } from "./types";

// L1 · dia 0 — Abertura (o carrinho abriu).
const launch1: SequenceTemplate = (input: SequenceEmailInput) => {
  const r = emailRoutes(input.ctx.baseUrl);
  return composeEmail({
    input,
    subject: "As inscrições da Edição Lançamento estão abertas",
    eyebrow: "Edição Lançamento · inscrições abertas",
    title:
      'O carrinho da <em style="color:#f1bb41;font-style:italic;">turma fundadora</em> abriu.',
    titleText: "O carrinho da turma fundadora abriu.",
    paragraphs: [
      "Chegou o momento que antecipei nas últimas semanas. As inscrições da Edição Lançamento — Prova Digital no Processo Penal — estão abertas.",
      "É o cohort inaugural: doze semanas, trilha semanal, fórum por aula com minha resposta e encontros ao vivo. Turma fundadora, com vagas limitadas e condição de preço fundador.",
      "A janela de inscrição é curta e a data de fechamento é real. Nos próximos dias vou detalhar o programa, responder às dúvidas mais comuns e mostrar o que os primeiros alunos disseram. Se já quiser garantir sua vaga, o link está abaixo.",
    ],
    ctas: [{ label: "Ver a Edição Lançamento", href: r.curso }],
  });
};

// L2 · dia 1 — Storytelling (por que a Escola existe).
const launch2: SequenceTemplate = (input: SequenceEmailInput) => {
  const r = emailRoutes(input.ctx.baseUrl);
  return composeEmail({
    input,
    subject: "Por que eu construí esta Escola",
    eyebrow: "A história por trás",
    title:
      'Faltava um curso feito para a <em style="color:#f1bb41;font-style:italic;">prática</em>.',
    titleText: "Faltava um curso feito para a prática.",
    paragraphs: [
      "Em trinta anos de docência e de atuação no sistema de justiça criminal, vi a mesma lacuna se repetir: cursos que ensinam a teoria, mas não mostram como a acusação de fato se constrói — e, por isso, deixam quem defende sem entender o outro lado.",
      "A Escola nasceu para preencher exatamente esse espaço. Não com promessa vaga nem atalho que não existe, mas com método, leitura de fontes e linguagem de tribunal.",
      "A Edição Lançamento é a primeira turma a estudar assim, comigo, do começo ao fim. Este e-mail é o convite para fazer parte dela.",
    ],
    ctas: [{ label: "Conhecer o programa", href: r.curso }],
  });
};

// L3 · dia 2 — Prova (o que os alunos dizem, o que está incluso).
const launch3: SequenceTemplate = (input: SequenceEmailInput) => {
  const r = emailRoutes(input.ctx.baseUrl);
  return composeEmail({
    input,
    // REESCRITO EM 24/08/2026. O texto anterior afirmava que "os primeiros
    // alunos já avaliaram a metodologia" e que os relatos "estão publicados" —
    // não existe turma, não existe aluno, e a lista de avaliações está vazia
    // desde que os depoimentos fictícios saíram em 01/08. O mesmo e-mail
    // prometia "apostila densa em PDF, mapa mental, caderno de questões
    // comentadas e decisões anotadas": no banco, cada aula tem UM material, os
    // slides. Duas afirmações falsas em peça assinada por Promotor de Justiça.
    //
    // Turma fundadora não tem depoimento por definição — a primeira nunca tem.
    // O substituto honesto da prova social é DEMONSTRAÇÃO: o que já está no ar
    // e qualquer um pode conferir antes de pagar. Quando a turma terminar e
    // houver avaliação real com autorização, este e-mail volta a ser "prova".
    subject: "Não acredite em mim — teste antes de pagar",
    eyebrow: "Prova · demonstração",
    title:
      'Não peça para acreditar. <em style="color:#f1bb41;font-style:italic;">Teste.</em>',
    titleText: "Não peça para acreditar. Teste.",
    paragraphs: [
      "Esta é a primeira turma, então não tenho depoimento de aluno para mostrar — e não vou inventar um. O que eu tenho é melhor: você pode conferir o método antes de pagar.",
      "A calculadora de dosimetria da Escola percorre as três fases do art. 68 do Código Penal em 50 tipos penais, e está aberta a qualquer um. O blog tem análises de decisões recentes do STJ e do STF. Se o modo de raciocinar ali fizer sentido para você, é exatamente esse o modo do cohort.",
      "O que a Edição Lançamento inclui: 10 aulas gravadas somando 2h47, com os slides de cada aula para download; fórum por aula com minha resposta em até 72 horas; quatro encontros ao vivo ao longo do cohort; certificado de conclusão ao concluir a trilha; e acesso à plataforma por 12 meses após o encerramento da turma.",
    ],
    ctas: [
      { label: "Testar a calculadora de pena", href: r.calculadora },
      { label: "Ver o programa completo", href: r.curso },
    ],
  });
};

// L4 · dia 3 — FAQ (dúvidas comuns respondidas).
const launch4: SequenceTemplate = (input: SequenceEmailInput) => {
  const r = emailRoutes(input.ctx.baseUrl);
  return composeEmail({
    input,
    subject: "As dúvidas mais comuns sobre a Edição Lançamento",
    eyebrow: "Perguntas frequentes",
    title:
      'Respostas diretas às <em style="color:#f1bb41;font-style:italic;">dúvidas</em> que mais chegam.',
    titleText: "Respostas diretas às dúvidas que mais chegam.",
    paragraphs: [
      // As duas respostas abaixo espelham o FAQ de `config/copy.ts` e foram
      // corrigidas junto com ele em 06/08/2026: a âncora no "evento de 11 de
      // agosto" ficaria vencida (o site entra no ar em 17/08) e as "cinco a sete
      // horas por semana" reintroduziam, por semana, a carga inflada de 60–80h
      // que a página do curso já tinha corrigido em 04/08.
      "Quando começa? A previsão é 1º de setembro de 2026. A data final depende da abertura das inscrições e será confirmada por e-mail a quem já tiver garantido a vaga.",
      "Quanto tempo por semana? O conteúdo gravado soma 2h47, distribuídas em 10 aulas ao longo da turma — cerca de 15 minutos de vídeo por semana. O tempo total de dedicação depende de quanto você aprofundar nos materiais, no fórum e nas leituras indicadas.",
      "Substitui preparatório de concurso? Não. A Edição aprofunda Direito Penal e Processo Penal pela ótica da acusação; complementa, mas não substitui, um preparatório generalista.",
      "A lista completa de perguntas está na página do curso. Se a sua não estiver lá, responda este e-mail — eu leio.",
    ],
    ctas: [{ label: "Ver todas as perguntas", href: r.curso }],
  });
};

// L5 · dia 4 — Objeção (a garantia, o risco zero).
const launch5: SequenceTemplate = (input: SequenceEmailInput) => {
  const r = emailRoutes(input.ctx.baseUrl);
  return composeEmail({
    input,
    subject: "E se não for para você? A garantia responde",
    eyebrow: "Garantia de risco zero",
    title:
      'Quinze dias para decidir, sem <em style="color:#f1bb41;font-style:italic;">letras miúdas</em>.',
    titleText: "Quinze dias para decidir, sem letras miúdas.",
    paragraphs: [
      "A objeção mais honesta é: e se, ao entrar, eu concluir que não é o caminho certo agora? Para isso existe a garantia.",
      "Você tem quinze dias após a compra para conhecer a turma por dentro — aulas, fórum e materiais. Se decidir que não é para você, basta pedir: devolvemos o valor integral, conforme a política publicada em /reembolso. É prazo superior ao mínimo legal de sete dias.",
      "O risco de experimentar, portanto, é zero. O único custo real é ficar de fora da turma fundadora.",
    ],
    ctas: [
      { label: "Garantir minha vaga", href: r.curso },
      { label: "Ler a política de reembolso", href: r.reembolso },
    ],
  });
};

// L6 · dia 5 — Escassez real (o carrinho fecha).
const launch6: SequenceTemplate = (input: SequenceEmailInput) => {
  const r = emailRoutes(input.ctx.baseUrl);
  return composeEmail({
    input,
    subject: "As inscrições fecham amanhã",
    eyebrow: "Últimas horas",
    title:
      'A turma fundadora <em style="color:#f1bb41;font-style:italic;">fecha</em> — e não reabre nesta condição.',
    titleText: "A turma fundadora fecha — e não reabre nesta condição.",
    paragraphs: [
      "Este é um aviso real, não um artifício. As inscrições da Edição Lançamento se encerram amanhã, e as vagas da turma fundadora são limitadas para preservar a escala humana do cohort.",
      "Quando a turma fechar, o preço fundador e a condição de primeira turma não se repetem — os próximos cohorts entram com ticket cheio.",
      "Se você acompanhou até aqui e faz sentido para o seu momento, este é o instante de decidir.",
    ],
    ctas: [{ label: "Inscrever-me agora", href: r.curso }],
  });
};

// L7 · dia 6 — Fechamento (última chamada).
const launch7: SequenceTemplate = (input: SequenceEmailInput) => {
  const r = emailRoutes(input.ctx.baseUrl);
  return composeEmail({
    input,
    subject: "Última chamada — o carrinho fecha hoje",
    eyebrow: "Encerramento",
    title:
      'Hoje é o <em style="color:#f1bb41;font-style:italic;">último dia</em>.',
    titleText: "Hoje é o último dia.",
    paragraphs: [
      "As inscrições da Edição Lançamento se encerram hoje. Depois disso, a turma fundadora está formada e o carrinho fecha.",
      "Se ainda restava uma dúvida, esta é a hora de resolvê-la: responda este e-mail e eu ajudo. Se a decisão já está tomada, o link abaixo leva direto à inscrição.",
      "Seja qual for sua escolha, obrigado por acompanhar. Nos vemos — dentro da turma, ou no próximo Bastidor da Acusação.",
    ],
    ctas: [{ label: "Garantir minha vaga antes de fechar", href: r.curso }],
  });
};

/** Passos da sequência LAUNCH, em ordem (dias 0..6). */
export const LAUNCH_TEMPLATES: SequenceTemplate[] = [
  launch1,
  launch2,
  launch3,
  launch4,
  launch5,
  launch6,
  launch7,
];
