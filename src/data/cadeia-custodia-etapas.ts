/**
 * As dez etapas da cadeia de custódia — art. 158-B do CPP, redação da Lei
 * 13.964/2019.
 *
 * ⚠️ REGRA: `definicao` é paráfrase fiel do inciso; nada aqui pode contrariar o
 * texto legal. Conferido no Planalto em 14/08/2026 (Del3689Compilado), inciso a
 * inciso. O modelo interativo de 13/08/2026 listava SEIS etapas — erro de
 * transcrição corrigido aqui. São dez, de reconhecimento a descarte, exatamente
 * como o art. 158-A define o alcance da cadeia.
 *
 * `consequencia` descreve o que se perde quando o elo falha, apoiado no texto do
 * próprio inciso e nos arts. 158-A, 158-C e 158-D. NÃO afirma nulidade: o efeito
 * processual da ruptura é controvertido e se decide caso a caso — dizer o
 * contrário em página assinada por Promotor de Justiça em atividade é o risco
 * que o cap. 9 do Livro-Guia existe para evitar.
 */

export type EtapaCadeiaCustodia = {
  /** Numeral do inciso, como está na lei. */
  readonly inciso: string;
  readonly id: string;
  readonly nome: string;
  readonly definicao: string;
  readonly consequencia: string;
};

export const CADEIA_CUSTODIA_ETAPAS: readonly EtapaCadeiaCustodia[] = [
  {
    inciso: "I",
    id: "reconhecimento",
    nome: "Reconhecimento",
    definicao:
      "Distinguir um elemento como de potencial interesse para a produção da prova pericial.",
    consequencia:
      "O vestígio que ninguém reconheceu não entra na cadeia. Tudo o que vier depois carrega uma origem que o processo não documentou — e o art. 158-A, §2º atribui a preservação justamente a quem reconheceu.",
  },
  {
    inciso: "II",
    id: "isolamento",
    nome: "Isolamento",
    definicao:
      "Evitar que se altere o estado das coisas, preservando o ambiente imediato, mediato e relacionado aos vestígios.",
    consequencia:
      "Sem isolamento não há como sustentar que o estado das coisas era o mesmo entre o crime e a coleta. Abre-se espaço para discutir tudo o que veio depois.",
  },
  {
    inciso: "III",
    id: "fixacao",
    nome: "Fixação",
    definicao:
      "Descrever o vestígio em detalhe, como se encontra, podendo ilustrar por fotografia, filmagem ou croqui.",
    consequencia:
      "O próprio inciso chama a descrição no laudo de indispensável. Sem ela não existe registro do estado em que o vestígio estava — e nada com que comparar o que chegou à perícia.",
  },
  {
    inciso: "IV",
    id: "coleta",
    nome: "Coleta",
    definicao:
      "Recolher o vestígio que será submetido à análise pericial, respeitando suas características e natureza.",
    consequencia:
      "Coleta fora do procedimento altera aquilo que deveria ser examinado. O art. 158-C ainda determina que ela seja feita preferencialmente por perito oficial.",
  },
  {
    inciso: "V",
    id: "acondicionamento",
    nome: "Acondicionamento",
    definicao:
      "Embalar cada vestígio de forma individualizada, com anotação da data, da hora e do nome de quem coletou e acondicionou.",
    consequencia:
      "Sem embalagem individualizada e sem esses três registros, um vestígio deixa de ser distinguível de outro — e não há a quem atribuir o que foi feito com ele.",
  },
  {
    inciso: "VI",
    id: "transporte",
    nome: "Transporte",
    definicao:
      "Transferir o vestígio de um local a outro em condições adequadas, garantindo o controle de sua posse.",
    consequencia:
      "Perdido o controle da posse, abre-se um intervalo em que o vestígio esteve com alguém que o processo não sabe nomear.",
  },
  {
    inciso: "VII",
    id: "recebimento",
    nome: "Recebimento",
    definicao:
      "Ato formal de transferência da posse, documentado com protocolo, assinatura e identificação de quem recebeu.",
    consequencia:
      "É o elo mais burocrático e o mais fácil de romper. Sem o protocolo, a corrente de responsáveis fica com um nome faltando.",
  },
  {
    inciso: "VIII",
    id: "processamento",
    nome: "Processamento",
    definicao:
      "O exame pericial em si, com metodologia adequada às características do material, formalizado em laudo.",
    consequencia:
      "Metodologia inadequada à natureza do material compromete o resultado — e o resultado é exatamente o que vai para o laudo que instrui a acusação.",
  },
  {
    inciso: "IX",
    id: "armazenamento",
    nome: "Armazenamento",
    definicao:
      "Guardar o material em condições adequadas, vinculado ao número do laudo, inclusive para contraperícia.",
    consequencia:
      "Sem guarda adequada e sem vínculo com o laudo, a contraperícia deixa de ser possível na prática, ainda que continue possível no papel.",
  },
  {
    inciso: "X",
    id: "descarte",
    nome: "Descarte",
    definicao:
      "Liberar o vestígio respeitando a legislação vigente e, quando pertinente, mediante autorização judicial.",
    consequencia:
      "Descartado o vestígio, não há reexame. O que sobra do caso é o laudo, e a discussão passa a ser sobre um documento — não sobre a prova.",
  },
] as const;
