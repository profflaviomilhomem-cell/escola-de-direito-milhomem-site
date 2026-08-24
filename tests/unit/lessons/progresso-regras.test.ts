import {
  concluiAoTerminar,
  devePersistir,
  PASSO_GRAVACAO_SEC,
  RAZAO_CONCLUSAO,
} from "@/lib/lessons/progresso-regras";

/**
 * Estas duas funções decidem se o aluno ganha certificado.
 *
 * O certificado exige 100% das aulas concluídas (`lib/certificates.ts`), a
 * conclusão automática nasce de `concluiAoTerminar`, e o ponto assistido que
 * sustenta o painel do aluno nasce de `devePersistir`. Até 24/08/2026 as duas
 * viviam soltas dentro do player, sem um único teste — e o player do Cloudflare
 * Stream nem as tinha.
 */

describe("devePersistir — quando vale gravar o ponto assistido", () => {
  it("não grava antes de avançar o passo (evita 4 chamadas por segundo)", () => {
    expect(devePersistir(10, 0)).toBe(false);
    expect(devePersistir(PASSO_GRAVACAO_SEC - 1, 0)).toBe(false);
  });

  it("grava ao completar exatamente um passo", () => {
    expect(devePersistir(PASSO_GRAVACAO_SEC, 0)).toBe(true);
  });

  it("grava quando o salto é maior que o passo", () => {
    expect(devePersistir(120, 30)).toBe(true);
  });

  it("NÃO grava ao rebobinar — progresso conquistado não anda para trás", () => {
    expect(devePersistir(30, 600)).toBe(false);
    expect(devePersistir(0, 100)).toBe(false);
  });

  it("ignora valor sujo do player (NaN, Infinity, negativo)", () => {
    expect(devePersistir(Number.NaN, 0)).toBe(false);
    expect(devePersistir(Number.POSITIVE_INFINITY, 0)).toBe(false);
    expect(devePersistir(-5, 0)).toBe(false);
  });

  it("usa o segundo inteiro, não a fração", () => {
    // 14,99 s ainda não fecha o passo de 15.
    expect(devePersistir(14.99, 0)).toBe(false);
    expect(devePersistir(15.01, 0)).toBe(true);
  });
});

describe("concluiAoTerminar — quando terminar o vídeo conclui a aula", () => {
  it("conclui quem assistiu a fração exigida", () => {
    expect(concluiAoTerminar(100, 100)).toBe(true);
    expect(concluiAoTerminar(RAZAO_CONCLUSAO * 100, 100)).toBe(true);
  });

  it("NÃO conclui quem arrastou a barra até o fim sem assistir", () => {
    // O evento de fim dispara no seek; sem esta regra, o certificado sairia
    // para quem só puxou o cursor.
    expect(concluiAoTerminar(10, 1000)).toBe(false);
    expect(concluiAoTerminar(94, 100)).toBe(false);
  });

  it("NÃO conclui com duração desconhecida — o Stream demora a informar", () => {
    expect(concluiAoTerminar(500, undefined)).toBe(false);
    expect(concluiAoTerminar(500, 0)).toBe(false);
    expect(concluiAoTerminar(500, Number.NaN)).toBe(false);
    expect(concluiAoTerminar(500, Number.POSITIVE_INFINITY)).toBe(false);
  });

  it("ignora tempo assistido inválido", () => {
    expect(concluiAoTerminar(Number.NaN, 100)).toBe(false);
    expect(concluiAoTerminar(-1, 100)).toBe(false);
  });

  it("as constantes são as que a landing promete", () => {
    // "≥95% conclui" está no texto do curso e no critério do certificado.
    expect(RAZAO_CONCLUSAO).toBe(0.95);
    expect(PASSO_GRAVACAO_SEC).toBe(15);
  });
});
