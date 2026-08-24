/**
 * Regras de progresso da aula — puras, sem DOM, sem rede.
 *
 * POR QUE EXISTEM SEPARADAS. Até 24/08/2026 estas regras viviam soltas dentro
 * do player nativo, e o player do Cloudflare Stream simplesmente não as tinha:
 * o Stream é um `<iframe>`, não emite `onTimeUpdate`, e ninguém gravava nada.
 * Isso é uma armadilha com data marcada — no dia em que os vídeos subirem para
 * o Stream (o `videoId` das 10 aulas está vazio esperando), o progresso pararia
 * de ser gravado e, como o certificado exige 100% das aulas concluídas
 * (`lib/certificates.ts`), NENHUM aluno receberia certificado. Ninguém notaria
 * até a turma acabar.
 *
 * Com a regra num lugar só, os dois players decidem igual — e dá para testar
 * sem navegador, que é o que faltava.
 */

/** Segundos de vídeo assistido entre uma gravação e a próxima. */
export const PASSO_GRAVACAO_SEC = 15;

/** Fração assistida a partir da qual terminar o vídeo conclui a aula. */
export const RAZAO_CONCLUSAO = 0.95;

/**
 * Vale gravar o ponto assistido agora?
 *
 * `onTimeUpdate` dispara ~4x por segundo. Gravar em todas seria uma chamada de
 * rede a cada 250 ms por aluno. Só grava a cada `PASSO_GRAVACAO_SEC` de avanço
 * real — e nunca anda para trás, para que rebobinar não apague progresso já
 * conquistado.
 */
export function devePersistir(
  watchedSec: number,
  ultimoPersistidoSec: number,
): boolean {
  if (!Number.isFinite(watchedSec) || watchedSec < 0) return false;
  return Math.floor(watchedSec) - ultimoPersistidoSec >= PASSO_GRAVACAO_SEC;
}

/**
 * Terminar o vídeo conclui a aula?
 *
 * O evento de fim também dispara quando o aluno arrasta a barra até o final sem
 * ter assistido. Por isso a razão: só conclui quem de fato percorreu
 * `RAZAO_CONCLUSAO` da duração. Duração desconhecida (0, NaN, Infinity — o
 * Stream demora a informar) NÃO conclui: melhor o aluno usar o botão manual do
 * que ganhar certificado sem ter assistido.
 */
export function concluiAoTerminar(
  watchedSec: number,
  duracaoSec: number | undefined,
): boolean {
  if (!duracaoSec || !Number.isFinite(duracaoSec) || duracaoSec <= 0) {
    return false;
  }
  if (!Number.isFinite(watchedSec) || watchedSec < 0) return false;
  return watchedSec / duracaoSec >= RAZAO_CONCLUSAO;
}
