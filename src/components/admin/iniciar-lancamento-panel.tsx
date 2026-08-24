"use client";

import { useState } from "react";

type Resultado = { total: number; enrolled: number; skipped: number };

/**
 * Disparo manual da sequência de LANÇAMENTO, no painel da Operação.
 *
 * A rota `POST /api/admin/email/launch/start` existia desde 07/07/2026 e não
 * tinha botão: disparar o lançamento exigia chamar a API na mão. Quem toca o
 * marketing não deveria precisar de terminal para abrir o carrinho.
 *
 * POR QUE TEM CONFIRMAÇÃO EM DOIS PASSOS: a ação é irreversível em massa —
 * inscreve TODA a lista numa sequência de 7 e-mails, e não existe "desfazer"
 * em bloco. Um clique acidental num painel que também mostra receita e pedidos
 * mandaria sete e-mails para todo mundo, em nome de um Promotor de Justiça em
 * atividade. O segundo passo mostra o número de pessoas antes de confirmar.
 *
 * A rota é idempotente (quem já está ativo na sequência é pulado), então
 * repetir não duplica envio. O botão desabilita durante a chamada mesmo assim.
 */
export function IniciarLancamentoPanel({ elegiveis }: { elegiveis: number }) {
  const [estado, setEstado] = useState<
    "parado" | "confirmando" | "enviando" | "feito" | "erro"
  >("parado");
  const [resultado, setResultado] = useState<Resultado | null>(null);
  const [erro, setErro] = useState<string | null>(null);

  async function disparar() {
    setEstado("enviando");
    setErro(null);
    try {
      const res = await fetch("/api/admin/email/launch/start", {
        method: "POST",
      });
      const data = (await res.json()) as
        | ({ ok: true } & Resultado)
        | { ok: false; error?: string };

      if (!res.ok || !data.ok) {
        setErro(
          ("error" in data && data.error) ||
            "Não foi possível iniciar o lançamento.",
        );
        setEstado("erro");
        return;
      }

      setResultado({
        total: data.total,
        enrolled: data.enrolled,
        skipped: data.skipped,
      });
      setEstado("feito");
    } catch {
      setErro("Falha de rede. Nada foi disparado — pode tentar de novo.");
      setEstado("erro");
    }
  }

  const semLista = elegiveis === 0;

  return (
    <div className="border-paper-100 bg-carbon-elevated/30 mt-4 border px-6 py-6">
      <p className="text-paper-600 text-[13px] leading-relaxed">
        Inscreve a lista inteira na sequência de lançamento — 7 e-mails ao longo
        de 7 dias. Use na abertura do carrinho.
      </p>

      <p className="text-paper mt-4 font-serif text-4xl leading-none">
        {elegiveis}
      </p>
      <p className="text-paper-600 mt-2 text-[13px]">
        {semLista
          ? "ninguém na lista — não há para quem enviar"
          : "pessoas receberiam, hoje (confirmadas e não descadastradas)"}
      </p>

      {estado === "feito" && resultado ? (
        <div
          role="status"
          className="border-paper-100/60 mt-5 rounded border px-4 py-3"
        >
          <p className="text-paper text-sm">Lançamento iniciado.</p>
          <p className="text-paper-600 mt-1 text-[13px]">
            {resultado.enrolled} inscrito(s) agora
            {resultado.skipped > 0
              ? `; ${resultado.skipped} pulado(s) por já estarem na sequência`
              : ""}
            . Total avaliado: {resultado.total}.
          </p>
          <p className="text-paper-600 mt-2 text-[12px] italic">
            Os envios saem conforme o agendador roda. Nada é enviado neste
            instante.
          </p>
        </div>
      ) : null}

      {estado === "erro" && erro ? (
        <div
          role="alert"
          className="border-paper-100/60 mt-5 rounded border px-4 py-3"
        >
          <p className="text-paper text-sm">{erro}</p>
        </div>
      ) : null}

      {estado === "confirmando" ? (
        <div className="border-amber/50 mt-5 rounded border px-4 py-4">
          <p className="text-paper text-sm">
            Confirmar o disparo para {elegiveis} pessoa(s)?
          </p>
          <p className="text-paper-600 mt-2 text-[13px]">
            São 7 e-mails ao longo de 7 dias, em nome do professor. Não existe
            desfazer em massa — cancelar depois é lead a lead.
          </p>
          <div className="mt-4 flex flex-wrap gap-2">
            <button
              type="button"
              onClick={disparar}
              className="border-amber/90 bg-amber/90 text-carbon hover:bg-amber rounded border px-4 py-2 font-mono text-[11px] tracking-[0.14em] uppercase transition-colors"
            >
              Confirmar disparo
            </button>
            <button
              type="button"
              onClick={() => setEstado("parado")}
              className="border-paper-100/70 text-paper-700 hover:text-paper rounded border px-4 py-2 font-mono text-[11px] tracking-[0.14em] uppercase transition-colors"
            >
              Cancelar
            </button>
          </div>
        </div>
      ) : (
        <button
          type="button"
          disabled={semLista || estado === "enviando"}
          onClick={() => setEstado("confirmando")}
          className="border-amber/60 text-amber hover:bg-amber hover:text-carbon focus-visible:outline-amber mt-5 rounded border px-4 py-2 font-mono text-[11px] tracking-[0.14em] uppercase transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:bg-transparent disabled:hover:text-current"
        >
          {estado === "enviando" ? "Disparando…" : "Iniciar lançamento"}
        </button>
      )}
    </div>
  );
}
