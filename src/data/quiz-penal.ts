/**
 * Quiz "Qual seu nível em Penal?" — ferramenta de topo de funil (#6).
 * 20 questões em 4 áreas, base legal: CPP, CP, Pacote Anticrime (Lei
 * 13.964/2019), Lei 9.296/1996 e entendimento consolidado de STF/STJ.
 * Conteúdo de uso educativo; respostas calibradas pelo entendimento dominante.
 */

export type QuizArea =
  | "cadeia-custodia"
  | "prova-digital"
  | "processo-penal"
  | "direito-penal";

export type QuizQuestion = {
  id: number;
  area: QuizArea;
  q: string;
  options: readonly string[];
  /** Índice (0-based) da alternativa correta. */
  correct: number;
  explain: string;
};

export const QUIZ_AREAS: Record<QuizArea, { label: string; short: string }> = {
  "cadeia-custodia": {
    label: "Cadeia de custódia",
    short: "Cadeia de custódia",
  },
  "prova-digital": {
    label: "Prova digital e interceptações",
    short: "Prova digital",
  },
  "processo-penal": {
    label: "Processo penal (parte geral)",
    short: "Processo penal",
  },
  "direito-penal": {
    label: "Direito penal (parte geral)",
    short: "Direito penal",
  },
};

export const quizPenalQuestions: readonly QuizQuestion[] = [
  // ── Cadeia de custódia ───────────────────────────────────────────
  {
    id: 1,
    area: "cadeia-custodia",
    q: "Segundo o CPP, o que é a cadeia de custódia?",
    options: [
      "O conjunto de procedimentos para manter e documentar a história cronológica do vestígio",
      "A lista de testemunhas arroladas pela acusação",
      "O rol de provas admitidas em juízo",
      "A sequência de recursos cabíveis na sentença",
    ],
    correct: 0,
    explain:
      "Art. 158-A do CPP: cadeia de custódia é o conjunto de procedimentos para manter e documentar a história cronológica do vestígio, da coleta ao descarte.",
  },
  {
    id: 2,
    area: "cadeia-custodia",
    q: "O Pacote Anticrime (Lei 13.964/2019) inseriu a disciplina da cadeia de custódia em quais artigos do CPP?",
    options: [
      "Arts. 158-A a 158-F",
      "Arts. 5º a 10",
      "Arts. 240 a 250",
      "Arts. 386 a 397",
    ],
    correct: 0,
    explain:
      "A Lei 13.964/2019 acrescentou os arts. 158-A a 158-F ao CPP, detalhando cada etapa da cadeia de custódia.",
  },
  {
    id: 3,
    area: "cadeia-custodia",
    q: "A coleta do vestígio deve ser realizada preferencialmente por:",
    options: [
      "Perito oficial",
      "Qualquer pessoa presente no local",
      "O juiz da causa",
      "O membro do Ministério Público",
    ],
    correct: 0,
    explain:
      "Art. 158-C do CPP: a coleta dos vestígios deve ser feita preferencialmente por perito oficial, que dará o encaminhamento adequado.",
  },
  {
    id: 4,
    area: "cadeia-custodia",
    q: "A 'rastreabilidade' do vestígio significa:",
    options: [
      "Poder seguir o caminho do vestígio, do reconhecimento ao descarte",
      "A rapidez na produção da prova pericial",
      "O direito do réu ao silêncio",
      "A contagem do prazo prescricional",
    ],
    correct: 0,
    explain:
      "Rastreabilidade é a aptidão de reconstituir todo o trajeto do vestígio, garantindo que a prova examinada é a mesma colhida no local.",
  },
  {
    id: 5,
    area: "cadeia-custodia",
    q: "A quebra da cadeia de custódia, conforme tende a entender o STJ, leva principalmente a:",
    options: [
      "Questionamento da confiabilidade e integridade daquela prova",
      "Nulidade automática de todo o processo, em qualquer caso",
      "Aumento obrigatório da pena",
      "Extinção da punibilidade",
    ],
    correct: 0,
    explain:
      "O STJ tem afastado a nulidade automática: a quebra atinge a confiabilidade do elemento, a ser valorada no caso concreto, sem contaminar necessariamente todo o processo.",
  },
  // ── Prova digital e interceptações ───────────────────────────────
  {
    id: 6,
    area: "prova-digital",
    q: "Mensagens extraídas do celular do investigado mediante acesso policial sem autorização judicial são, em regra:",
    options: [
      "Prova ilícita",
      "Sempre válidas, por estarem no aparelho",
      "Irrelevantes para o processo",
      "Presumidas verdadeiras",
    ],
    correct: 0,
    explain:
      "O STJ firmou que o acesso aos dados armazenados no celular depende de autorização judicial; sem ela, a prova é, em regra, ilícita.",
  },
  {
    id: 7,
    area: "prova-digital",
    q: "O espelhamento de conversas via WhatsApp Web obtido pela polícia é problemático sobretudo porque:",
    options: [
      "Permite enviar e apagar mensagens, comprometendo a integridade",
      "Consome muita internet",
      "Não funciona em computadores",
      "Dispensa qualquer perícia",
    ],
    correct: 0,
    explain:
      "No espelhamento, quem acessa pode interagir com a conta (enviar/apagar), o que compromete a integridade e a confiabilidade do conteúdo (entendimento do STJ).",
  },
  {
    id: 8,
    area: "prova-digital",
    q: "Para preservar e demonstrar a integridade de um arquivo digital, é comum utilizar:",
    options: [
      "Cálculo de hash (ex.: SHA-256)",
      "Fotocópia autenticada em cartório",
      "Reconhecimento de firma",
      "Uma testemunha que viu o arquivo",
    ],
    correct: 0,
    explain:
      "O hash funciona como uma 'impressão digital' do arquivo: qualquer alteração muda o valor, permitindo provar que o conteúdo não foi adulterado.",
  },
  {
    id: 9,
    area: "prova-digital",
    q: "A interceptação das comunicações telefônicas é disciplinada por qual lei?",
    options: [
      "Lei 9.296/1996",
      "Lei 8.072/1990",
      "Lei 11.343/2006",
      "Lei 12.850/2013",
    ],
    correct: 0,
    explain:
      "A Lei 9.296/1996 regulamenta o art. 5º, XII, da CF, disciplinando a interceptação telefônica e do fluxo de comunicações em sistemas de informática.",
  },
  {
    id: 10,
    area: "prova-digital",
    q: "Dados telemáticos já armazenados (e-mails, arquivos em nuvem) e a interceptação do fluxo de comunicações:",
    options: [
      "Têm regimes jurídicos distintos",
      "São exatamente a mesma coisa",
      "Nunca podem ser obtidos, em hipótese alguma",
      "Dispensam decisão judicial em ambos os casos",
    ],
    correct: 0,
    explain:
      "Interceptar fluxo em tempo real (Lei 9.296/96) é diferente de acessar dados já armazenados; os requisitos e fundamentos jurídicos não se confundem.",
  },
  // ── Processo penal (parte geral) ─────────────────────────────────
  {
    id: 11,
    area: "processo-penal",
    q: "Na dúvida razoável sobre a autoria ou a materialidade, o processo penal resolve a questão:",
    options: [
      "Em favor do réu (in dubio pro reo)",
      "Em favor da acusação",
      "Por sorteio entre as teses",
      "Sempre pela condenação",
    ],
    correct: 0,
    explain:
      "Decorrência da presunção de inocência (art. 5º, LVII, CF): persistindo dúvida razoável, a absolvição se impõe (art. 386, VII, CPP).",
  },
  {
    id: 12,
    area: "processo-penal",
    q: "A validade da prova emprestada depende, especialmente, da observância do:",
    options: [
      "Contraditório",
      "Duplo grau de jurisdição apenas",
      "Confissão do réu",
      "Pagamento de fiança",
    ],
    correct: 0,
    explain:
      "A prova produzida em outro processo só é aproveitável se respeitado o contraditório, preferencialmente entre as mesmas partes.",
  },
  {
    id: 13,
    area: "processo-penal",
    q: "No sistema atual, a confissão do réu tem valor:",
    options: [
      "Relativo, devendo ser confrontada com as demais provas",
      "Absoluto, bastando por si só para condenar",
      "Nenhum, sendo sempre desconsiderada",
      "Vinculante e irretratável para o juiz",
    ],
    correct: 0,
    explain:
      "Art. 197 do CPP: o valor da confissão é aferido pelos critérios da prova em geral, confrontada com o conjunto probatório.",
  },
  {
    id: 14,
    area: "processo-penal",
    q: "O juiz das garantias foi introduzido no CPP por qual norma?",
    options: [
      "Lei 13.964/2019 (Pacote Anticrime)",
      "Diretamente pela CF/1988",
      "Lei 9.099/1995",
      "Lei 7.210/1984 (LEP)",
    ],
    correct: 0,
    explain:
      "O Pacote Anticrime criou a figura do juiz das garantias (arts. 3º-A a 3º-F do CPP), responsável pelo controle da legalidade na investigação.",
  },
  {
    id: 15,
    area: "processo-penal",
    q: "A busca e apreensão domiciliar, em regra, exige:",
    options: [
      "Mandado judicial, salvo flagrante e demais exceções constitucionais",
      "Apenas ordem verbal do delegado",
      "Autorização exclusiva do Ministério Público",
      "Nenhuma formalidade durante o dia",
    ],
    correct: 0,
    explain:
      "A inviolabilidade do domicílio (art. 5º, XI, CF) impõe, como regra, ordem judicial, ressalvados flagrante delito, desastre, socorro ou consentimento.",
  },
  // ── Direito penal (parte geral) ──────────────────────────────────
  {
    id: 16,
    area: "direito-penal",
    q: "O princípio da legalidade penal (não há crime sem lei anterior que o defina) está em:",
    options: [
      "Art. 5º, XXXIX, da CF e art. 1º do CP",
      "Apenas no art. 121 do CP",
      "Somente na Súmula 711 do STF",
      "Exclusivamente na Lei de Execução Penal",
    ],
    correct: 0,
    explain:
      "A reserva legal está consagrada no art. 5º, XXXIX, da CF e repetida no art. 1º do Código Penal.",
  },
  {
    id: 17,
    area: "direito-penal",
    q: "Na tentativa (art. 14, II, CP), a pena, em regra, é:",
    options: [
      "A do crime consumado, reduzida de um a dois terços",
      "Igual à do crime consumado",
      "O dobro da pena do consumado",
      "Sempre extinta",
    ],
    correct: 0,
    explain:
      "Parágrafo único do art. 14 do CP: pune-se a tentativa com a pena do crime consumado, reduzida de um a dois terços.",
  },
  {
    id: 18,
    area: "direito-penal",
    q: "Há dolo eventual quando o agente:",
    options: [
      "Assume o risco de produzir o resultado",
      "Não prevê de modo algum o resultado",
      "Age sem qualquer vontade",
      "Atua acobertado por legítima defesa",
    ],
    correct: 0,
    explain:
      "Art. 18, I, do CP: o dolo eventual ocorre quando o agente assume o risco de produzir o resultado previsto.",
  },
  {
    id: 19,
    area: "direito-penal",
    q: "A prescrição é causa de:",
    options: [
      "Extinção da punibilidade",
      "Aumento de pena",
      "Agravante genérica",
      "Qualificadora do crime",
    ],
    correct: 0,
    explain:
      "Art. 107, IV, do CP: a prescrição extingue a punibilidade do agente.",
  },
  {
    id: 20,
    area: "direito-penal",
    q: "O princípio da insignificância (bagatela), conforme o STF, afasta:",
    options: [
      "A tipicidade material da conduta",
      "Sempre a culpabilidade",
      "A ilicitude meramente formal",
      "A imputabilidade do agente",
    ],
    correct: 0,
    explain:
      "Para o STF, presentes os vetores (mínima ofensividade, ausência de periculosidade social, reduzido grau de reprovabilidade e inexpressividade da lesão), exclui-se a tipicidade material.",
  },
];
