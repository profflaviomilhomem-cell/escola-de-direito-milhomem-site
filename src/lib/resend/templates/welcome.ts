/**
 * Sequência de boas-vindas — guia 6.13.
 * Acionada no duplo opt-in. 5 e-mails em 10 dias (dias 0/2/4/7/10).
 *
 * Tom: Sábio + Cuidador (copy.ts), erudito acessível. Compliance-safe —
 * a Escola em primeiro plano, o cargo nunca como isca de venda.
 */

import { composeEmail, emailRoutes } from "./layout";
import type { SequenceEmailInput, SequenceTemplate } from "./types";

// E1 · dia 0 — Bem-vindo + download da isca.
const welcome1: SequenceTemplate = (input: SequenceEmailInput) => {
  const r = emailRoutes(input.ctx.baseUrl);
  return composeEmail({
    input,
    subject: "Bem-vindo ao Bastidor da Acusação — seu material está aqui",
    eyebrow: "Bastidor da Acusação",
    title:
      'Bem-vindo ao <em style="color:#f1bb41;font-style:italic;">Bastidor da Acusação</em>.',
    titleText: "Bem-vindo ao Bastidor da Acusação.",
    paragraphs: [
      "Sua inscrição está confirmada. A partir de agora você recebe, a cada quinze dias, análise de decisões recentes do STJ e do STF em matéria penal, leitura recomendada e o que se move na Escola — sem filler, sem spam.",
      "Para começar, deixei disponível o material que motivou sua inscrição. Ele resume, em uma página, como a acusação se constrói: da notícia do fato à sustentação em tribunal.",
      "Guarde este e-mail. Nos próximos dias eu escrevo de novo, contando quem sou e por que a perspectiva da acusação muda o modo de estudar Direito Penal.",
    ],
    ctas: [{ label: "Baixar o material", href: r.materiais }],
  });
};

// E2 · dia 2 — Quem é Flávio (bio + vídeo de 3 min).
const welcome2: SequenceTemplate = (input: SequenceEmailInput) => {
  const r = emailRoutes(input.ctx.baseUrl);
  return composeEmail({
    input,
    subject: "Quem escreve para você — em três minutos",
    eyebrow: "Quem conduz a Escola",
    title:
      'Antes de seguirmos, deixe eu me <em style="color:#f1bb41;font-style:italic;">apresentar</em>.',
    titleText: "Antes de seguirmos, deixe eu me apresentar.",
    paragraphs: [
      "Sou Flávio Milhomem. Leciono Direito Penal e Processo Penal há trinta anos, sou autor de obras adotadas em graduação e em preparação para concursos, e me formei academicamente na Universidade Católica Portuguesa e na École Nationale de la Magistrature, na França.",
      "Gravei um vídeo curto — cerca de três minutos — contando por que decidi abrir uma escola e o que ela se propõe a fazer diferente dos cursos que você já conhece.",
      "A trajetória completa, com credenciais verificáveis e os vínculos institucionais descritos com transparência, está na página Sobre.",
    ],
    ctas: [
      { label: "Assistir ao vídeo (3 min)", href: r.youtube },
      { label: "Ler a biografia", href: r.sobre },
    ],
  });
};

// E3 · dia 4 — Por que o lado da acusação importa (artigo-tese).
const welcome3: SequenceTemplate = (input: SequenceEmailInput) => {
  const r = emailRoutes(input.ctx.baseUrl);
  return composeEmail({
    input,
    subject: "Por que estudar Direito Penal pelo lado da acusação",
    eyebrow: "A tese da Escola",
    title:
      'Para defender bem, é preciso entender como a <em style="color:#f1bb41;font-style:italic;">acusação pensa</em>.',
    titleText: "Para defender bem, é preciso entender como a acusação pensa.",
    paragraphs: [
      "A maioria dos cursos de direito criminal ensina para a prova. Poucos ensinam para a prática — e quase nenhum parte de quem constrói a denúncia.",
      "Não basta dominar a teoria. Para sustentar uma tese, é preciso saber como a prova é produzida, por que cada linha da acusação é escrita daquela forma e quais precedentes a sustentam. Esse recorte raramente aparece com densidade nos cursos generalistas.",
      "Reuni esse raciocínio em um artigo no blog da Escola. Ele é a melhor porta de entrada para o método que você vai encontrar aqui.",
    ],
    ctas: [{ label: "Ler o artigo", href: r.blog }],
  });
};

// E4 · dia 7 — O que é a Edição Lançamento (pré-apresentação).
const welcome4: SequenceTemplate = (input: SequenceEmailInput) => {
  const r = emailRoutes(input.ctx.baseUrl);
  return composeEmail({
    input,
    subject: "O que é a Edição Lançamento da Escola",
    eyebrow: "Edição Lançamento",
    title:
      'O primeiro cohort da Escola já tem <em style="color:#f1bb41;font-style:italic;">forma</em>.',
    titleText: "O primeiro cohort da Escola já tem forma.",
    paragraphs: [
      "A Edição Lançamento é o cohort inaugural: Prova Digital no Processo Penal, em doze semanas, sobre cadeia de custódia e prova digital pela perspectiva da acusação.",
      "Não é videoteca. É turma com início e fim definidos, trilha semanal, fórum por aula com resposta do professor e encontros ao vivo. Você estuda com outros alunos e com acesso a mim na cadência do programa.",
      "Ainda não estou abrindo inscrições — quero que você conheça a proposta antes. A ementa completa, o cronograma e o formato estão na página do curso.",
    ],
    ctas: [{ label: "Conhecer a Edição Lançamento", href: r.curso }],
  });
};

// E5 · dia 10 — Convite para a lista de espera (opt-in adicional).
const welcome5: SequenceTemplate = (input: SequenceEmailInput) => {
  const r = emailRoutes(input.ctx.baseUrl);
  return composeEmail({
    input,
    subject: "Quer prioridade na turma fundadora?",
    eyebrow: "Lista de espera · turma fundadora",
    title:
      'As vagas da turma fundadora são <em style="color:#f1bb41;font-style:italic;">limitadas</em>.',
    titleText: "As vagas da turma fundadora são limitadas.",
    paragraphs: [
      "A Edição Lançamento abre com um número reduzido de vagas — o suficiente para manter escala humana, fórum vivo e resposta do professor em até 72 horas.",
      "Quem entra na lista de espera é avisado primeiro quando as inscrições abrirem, e tem prioridade na condição de turma fundadora. É um passo a mais, opcional, e você decide.",
      "Se fizer sentido para o seu momento, entre na lista. Se preferir apenas acompanhar o Bastidor da Acusação, também está ótimo — você continua recebendo as edições quinzenais.",
    ],
    ctas: [{ label: "Entrar na lista de espera", href: r.curso }],
  });
};

/** Passos da sequência WELCOME, em ordem (dias 0/2/4/7/10). */
export const WELCOME_TEMPLATES: SequenceTemplate[] = [
  welcome1,
  welcome2,
  welcome3,
  welcome4,
  welcome5,
];
