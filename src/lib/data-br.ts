/**
 * Datas e horas no fuso do público — sempre explícito, nunca implícito.
 *
 * POR QUE ESTE ARQUIVO EXISTE
 *
 * O servidor da Vercel roda em **UTC**; o aluno e o professor leem em
 * **America/Sao_Paulo** (-03). `toLocaleDateString()` e `toLocaleString()` sem
 * `timeZone` usam o fuso de *quem renderiza*, então o mesmo instante vira
 * texto diferente no servidor e no navegador. Consequências reais medidas
 * neste projeto em 05/08/2026:
 *
 *  - `/aluno/forum` é Server Component e formatava **hora**: toda mensagem
 *    aparecia 3 horas adiantada para o aluno.
 *  - 2 dos 79 posts do blog exibiam o **dia errado** (publicados às 22h BRT,
 *    que em UTC já é o dia seguinte). Como as páginas são geradas no
 *    servidor, o erro é permanente, não transitório.
 *
 * E há a armadilha irmã: `new Date("2026-08-15")` é meia-noite **UTC**, ou
 * seja, 21h do dia 14 no Brasil. Uma data de calendário (vencimento, prazo de
 * reembolso, data de emissão de certificado) não é um instante — por isso
 * `dataCalendarioBR` existe separada.
 */

export const FUSO_BR = "America/Sao_Paulo";

type Entrada = Date | string | number;

function paraData(valor: Entrada): Date {
  return valor instanceof Date ? valor : new Date(valor);
}

/**
 * Formatação livre com o fuso de Brasília **sempre** aplicado.
 *
 * Existe para que um formato novo não nasça errado: quem precisa de um recorte
 * fora dos helpers nomeados usa esta função em vez de chamar
 * `toLocaleDateString` direto, e o `timeZone` deixa de depender de lembrança.
 */
export function formatarDataComOpcoesBR(
  valor: Entrada,
  opcoes: Intl.DateTimeFormatOptions,
): string {
  return new Intl.DateTimeFormat("pt-BR", {
    timeZone: FUSO_BR,
    ...opcoes,
  }).format(paraData(valor));
}

/** dd/mm/aaaa no fuso de Brasília. */
export function formatarDataBR(valor: Entrada): string {
  return new Intl.DateTimeFormat("pt-BR", {
    timeZone: FUSO_BR,
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  }).format(paraData(valor));
}

/** dd/mm/aa no fuso de Brasília. */
export function formatarDataCurtaBR(valor: Entrada): string {
  return new Intl.DateTimeFormat("pt-BR", {
    timeZone: FUSO_BR,
    day: "2-digit",
    month: "2-digit",
    year: "2-digit",
  }).format(paraData(valor));
}

/** "5 de agosto de 2026" no fuso de Brasília. */
export function formatarDataLongaBR(valor: Entrada): string {
  return new Intl.DateTimeFormat("pt-BR", {
    timeZone: FUSO_BR,
    day: "2-digit",
    month: "long",
    year: "numeric",
  }).format(paraData(valor));
}

/** "05 de ago, 14:32" — data curta com hora, no fuso de Brasília. */
export function formatarDataHoraBR(valor: Entrada): string {
  return new Intl.DateTimeFormat("pt-BR", {
    timeZone: FUSO_BR,
    day: "2-digit",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  }).format(paraData(valor));
}

/**
 * Trata "AAAA-MM-DD" como **data de calendário**, não como instante.
 *
 * `new Date("2026-08-15")` é meia-noite UTC = 21h do dia 14 em Brasília, e aí
 * qualquer formatação "anda um dia" para trás. Ancorando ao meio-dia UTC, a
 * data sobrevive a qualquer fuso entre -11 e +11.
 */
export function dataCalendarioBR(iso: string): Date {
  const soData = /^\d{4}-\d{2}-\d{2}$/.test(iso);
  return new Date(soData ? `${iso}T12:00:00Z` : iso);
}

/**
 * Saudação por período do dia **no fuso de Brasília**.
 *
 * O painel do professor tinha "Bom dia" escrito à mão no JSX — ele lia "Bom
 * dia" às 23h. Cravar o fuso aqui importa: em `NODE_ENV=production` isto roda
 * no servidor em UTC, onde 20h de Brasília já é 23h "da máquina".
 */
export function saudacaoBR(valor: Entrada = new Date()): string {
  // `hourCycle: "h23"` e não `hour12: false`: o segundo pode resolver para o
  // ciclo h24 em alguns motores e devolver "24" à meia-noite, que viraria
  // "Boa noite" às 00h por acidente. h23 é o contrato explícito (00–23).
  const hora = Number(
    new Intl.DateTimeFormat("pt-BR", {
      timeZone: FUSO_BR,
      hour: "2-digit",
      hourCycle: "h23",
    }).format(paraData(valor)),
  );
  if (hora < 12) return "Bom dia";
  if (hora < 18) return "Boa tarde";
  return "Boa noite";
}
