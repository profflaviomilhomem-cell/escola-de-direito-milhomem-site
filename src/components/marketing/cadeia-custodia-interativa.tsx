"use client";

import { useCallback, useState } from "react";

import {
  CADEIA_CUSTODIA_ETAPAS,
  type EtapaCadeiaCustodia,
} from "@/data/cadeia-custodia-etapas";
import { formatarDataComOpcoesBR } from "@/lib/data-br";

/**
 * As dez etapas do art. 158-B, rompíveis pelo leitor.
 *
 * Por que este bloco existe: a página não tem um único depoimento (a lista em
 * `turma-fundadora-avaliacoes.ts` está legitimamente vazia até a turma estrear).
 * Sem prova social, a alternativa honesta é demonstração — o leitor cético
 * acredita no que ele mesmo manipula, não no que a página promete.
 *
 * A forma vem do próprio assunto: o art. 158-D, §4º manda registrar todo
 * rompimento de lacre numa ficha de acompanhamento de vestígio, com nome, data,
 * local e finalidade. O bloco É essa ficha. Por isso a numeração é em algarismo
 * romano — são os incisos da lei, não decoração — e por isso existe o registro
 * acumulado no rodapé.
 *
 * `<details>` nativo em vez de acordeão com ARIA: teclado, busca na página e
 * indexação funcionam sem JavaScript, e o elemento é Baseline widely available.
 */
export function CadeiaCustodiaInterativa() {
  const [rompidos, setRompidos] = useState<readonly string[]>([]);
  const [registro, setRegistro] = useState<readonly string[]>([]);

  const aoAlternar = useCallback(
    (etapa: EtapaCadeiaCustodia, aberto: boolean) => {
      setRompidos((atual) => {
        if (aberto)
          return atual.includes(etapa.id) ? atual : [...atual, etapa.id];
        return atual.filter((id) => id !== etapa.id);
      });
      if (!aberto) return;
      // Hora de Brasília, não do relógio do servidor — a suíte roda em UTC.
      const hora = formatarDataComOpcoesBR(new Date(), {
        hour: "2-digit",
        minute: "2-digit",
      });
      setRegistro((atual) => [
        ...atual,
        // Numerado porque o art. 158-D, §4º manda consignar o novo lacre a cada
        // rompimento — e porque duas rupturas do mesmo elo no mesmo minuto, sem
        // número, parecem linha repetida por engano.
        `${String(atual.length + 1).padStart(3, "0")} · ${hora} · elo ${etapa.inciso} · ${etapa.nome.toLowerCase()} · lacre rompido`,
      ]);
    },
    [],
  );

  const relacrar = useCallback(() => {
    setRompidos([]);
    setRegistro([]);
    document
      .querySelectorAll<HTMLDetailsElement>("[data-elo-custodia]")
      .forEach((el) => {
        el.open = false;
      });
  }, []);

  const total = CADEIA_CUSTODIA_ETAPAS.length;

  return (
    <section
      className="mt-20 scroll-mt-28"
      aria-labelledby="cadeia-interativa-title"
      id="cadeia-custodia"
    >
      <p className="text-amber font-mono text-[11px] tracking-[0.18em] uppercase">
        Art. 158-B do CPP · Lei 13.964/2019
      </p>
      <h2
        id="cadeia-interativa-title"
        className="text-paper mt-3 font-serif text-3xl"
      >
        Rompa um elo. Veja o que acontece.
      </h2>
      <p className="text-paper-700 mt-3 max-w-2xl">
        A lei deu dez etapas à cadeia de custódia, do reconhecimento ao
        descarte. Abra qualquer uma para ler o que se perde quando ela falha.
      </p>

      <div className="border-paper-100 bg-paper-50 mt-8 rounded-lg border">
        <div className="border-paper-100 flex flex-wrap items-center justify-between gap-3 border-b px-4 py-3">
          <p
            className="text-paper-600 font-mono text-[11px] tracking-[0.14em] uppercase"
            aria-live="polite"
          >
            {rompidos.length} de {total} lacres rompidos
          </p>
          {rompidos.length > 0 ? (
            <button
              type="button"
              onClick={relacrar}
              className="border-paper-200 text-paper-700 hover:border-paper-400 hover:text-paper focus-visible:outline-amber rounded border px-2.5 py-1 font-mono text-[11px] tracking-[0.14em] uppercase transition-colors focus-visible:outline-2 focus-visible:outline-offset-2"
            >
              Relacrar tudo
            </button>
          ) : null}
        </div>

        <ol className="divide-paper-100 divide-y">
          {CADEIA_CUSTODIA_ETAPAS.map((etapa) => {
            const rompido = rompidos.includes(etapa.id);
            return (
              <li key={etapa.id}>
                <details
                  data-elo-custodia
                  onToggle={(e) => aoAlternar(etapa, e.currentTarget.open)}
                  className="group"
                >
                  <summary className="focus-visible:outline-amber relative flex cursor-pointer items-center gap-4 px-4 py-3.5 focus-visible:outline-2 focus-visible:outline-offset-[-2px]">
                    {/*
                      O elo da corrente. Fica DENTRO do summary de propósito:
                      quando o leitor abre uma etapa, o painel empurra a linha
                      para baixo e a corrente aparece interrompida exatamente
                      onde ele rompeu o lacre. A metáfora é o próprio estado.
                    */}
                    <span
                      aria-hidden
                      className={[
                        "absolute top-0 bottom-0 left-8 -translate-x-1/2",
                        rompido
                          ? "border-amber/70 w-0 border-l border-dashed"
                          : "bg-paper-200 w-px",
                      ].join(" ")}
                    />
                    <span
                      aria-hidden
                      className={[
                        "bg-carbon relative z-10 flex h-8 w-8 shrink-0 items-center justify-center rounded-full border font-mono text-[11px] motion-safe:transition-colors",
                        rompido
                          ? "border-amber text-amber"
                          : "border-paper-200 text-paper-600",
                      ].join(" ")}
                    >
                      {etapa.inciso}
                    </span>
                    <span className="text-paper min-w-0 flex-1 font-serif text-lg">
                      {etapa.nome}
                    </span>
                    <span
                      className={[
                        "shrink-0 font-mono text-[10px] tracking-[0.14em] uppercase",
                        rompido ? "text-amber" : "text-paper-600",
                      ].join(" ")}
                    >
                      {rompido ? "Rompido" : "Lacrado"}
                    </span>
                  </summary>
                  <div className="mb-4 ml-16 pr-4">
                    <p className="text-paper-600 text-sm">{etapa.definicao}</p>
                    <p className="border-amber/60 text-paper-700 mt-3 border-l-2 pl-4 text-sm">
                      {etapa.consequencia}
                    </p>
                  </div>
                </details>
              </li>
            );
          })}
        </ol>

        {registro.length > 0 ? (
          <div className="border-paper-100 border-t px-4 py-3">
            <p className="text-paper-600 font-mono text-[10px] tracking-[0.18em] uppercase">
              Ficha de acompanhamento de vestígio
            </p>
            <ol className="text-paper-700 mt-2 space-y-1 font-mono text-[11px]">
              {registro.map((linha, i) => (
                <li key={`${linha}-${i}`}>{linha}</li>
              ))}
            </ol>
            <p className="text-paper-400 mt-3 font-mono text-[10px]">
              O art. 158-D, §4º manda registrar em ficha todo rompimento de
              lacre.
            </p>
          </div>
        ) : null}
      </div>

      <p className="text-paper-600 mt-4 max-w-2xl text-sm">
        O efeito processual da ruptura — nulidade, desentranhamento ou perda de
        valor probatório — se discute caso a caso. É o assunto das aulas 2 a 5.
      </p>
    </section>
  );
}
