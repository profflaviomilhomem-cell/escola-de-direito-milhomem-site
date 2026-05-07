"use client";

import { useState } from "react";

import { crimes } from "@/lib/business/crimes";
import { labelsArt59, type CircunstanciaArt59 } from "@/lib/business/dosimetria";

type PassoCalculo = {
  fase: 1 | 2 | 3;
  titulo: string;
  detalhe: string;
  resultadoDias: number;
};

type DosimetriaResult = {
  crime: { nome: string; artigo: string; minDias: number; maxDias: number };
  penaBaseDias: number;
  penaIntermediariaDias: number;
  penaFinalDias: number;
  passos: PassoCalculo[];
  formatado: { penaBase: string; penaIntermediaria: string; penaFinal: string };
};

const fracoesDisponiveis = [
  { label: "1/6", value: 1 / 6 },
  { label: "1/4", value: 1 / 4 },
  { label: "1/3", value: 1 / 3 },
  { label: "1/2", value: 1 / 2 },
  { label: "2/3", value: 2 / 3 },
  { label: "3/4", value: 3 / 4 },
];

const circunstanciasOrdem: CircunstanciaArt59[] = [
  "culpabilidade",
  "antecedentes",
  "condutaSocial",
  "personalidade",
  "motivos",
  "circunstancias",
  "consequencias",
  "comportamentoVitima",
];

type Etapa = 0 | 1 | 2 | 3 | 4;

export function CalculadoraWizard() {
  const [etapa, setEtapa] = useState<Etapa>(0);
  const [crimeSlug, setCrimeSlug] = useState<string>(crimes[0]?.slug ?? "");
  const [desfavoraveis, setDesfavoraveis] = useState<CircunstanciaArt59[]>([]);
  const [atenuantes, setAtenuantes] = useState(0);
  const [agravantes, setAgravantes] = useState(0);
  const [causasAumento, setCausasAumento] = useState<number[]>([]);
  const [causasDiminuicao, setCausasDiminuicao] = useState<number[]>([]);

  const [resultado, setResultado] = useState<DosimetriaResult | null>(null);
  const [carregando, setCarregando] = useState(false);
  const [erro, setErro] = useState<string | null>(null);

  function toggleDesfavoravel(c: CircunstanciaArt59) {
    setDesfavoraveis((prev) =>
      prev.includes(c) ? prev.filter((x) => x !== c) : [...prev, c],
    );
  }

  async function calcular() {
    setCarregando(true);
    setErro(null);
    try {
      const res = await fetch("/api/calculadora", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          crimeSlug,
          desfavoraveis,
          atenuantes,
          agravantes,
          causasAumento,
          causasDiminuicao,
        }),
      });
      const data = await res.json();
      if (!res.ok || !data.ok) {
        throw new Error(data.error ?? "Falha ao calcular.");
      }
      setResultado(data.resultado);
      setEtapa(4);
    } catch (e) {
      setErro(e instanceof Error ? e.message : "Erro inesperado.");
    } finally {
      setCarregando(false);
    }
  }

  function reiniciar() {
    setEtapa(0);
    setDesfavoraveis([]);
    setAtenuantes(0);
    setAgravantes(0);
    setCausasAumento([]);
    setCausasDiminuicao([]);
    setResultado(null);
    setErro(null);
  }

  const totalEtapas = 4;
  const podeAvancar = etapa < 3;

  return (
    <div className="border-amber/20 bg-paper-50 mt-12 border p-6 md:p-10">
      {/* Stepper */}
      {etapa < 4 && (
        <ol className="text-paper-700 mb-10 flex flex-wrap gap-3 font-mono text-[10px] uppercase tracking-[0.2em]">
          {["Crime", "Fase 1", "Fase 2", "Fase 3"].map((label, idx) => (
            <li
              key={label}
              className={
                idx === etapa
                  ? "text-amber border-amber border-b pb-1"
                  : idx < etapa
                    ? "text-paper-800"
                    : "text-paper-400"
              }
            >
              {String(idx + 1).padStart(2, "0")} · {label}
            </li>
          ))}
        </ol>
      )}

      {/* Etapa 0 — Crime */}
      {etapa === 0 && (
        <div>
          <h2 className="font-serif text-[28px] leading-tight">
            Selecione o <em className="text-amber italic">crime hipotético</em>
          </h2>
          <p className="text-paper-700 mt-2 text-sm">
            Os limites mínimo e máximo abaixo seguem a redação atual da lei
            penal e servem apenas para o exercício didático.
          </p>

          <fieldset className="mt-6 grid gap-2">
            <legend className="sr-only">Crimes</legend>
            {crimes.map((crime) => {
              const ativo = crime.slug === crimeSlug;
              return (
                <label
                  key={crime.slug}
                  className={`group flex cursor-pointer items-center justify-between gap-4 border p-4 transition-colors ${
                    ativo
                      ? "border-amber bg-amber/10"
                      : "border-paper-200 hover:border-amber/50"
                  }`}
                >
                  <div className="flex items-center gap-4">
                    <input
                      type="radio"
                      name="crime"
                      value={crime.slug}
                      checked={ativo}
                      onChange={() => setCrimeSlug(crime.slug)}
                      className="accent-amber"
                    />
                    <div>
                      <div className="text-paper font-serif text-[18px]">
                        {crime.nome}
                      </div>
                      <div className="text-paper-600 font-mono text-[11px] uppercase tracking-[0.15em]">
                        {crime.artigo}
                      </div>
                    </div>
                  </div>
                  <div className="text-amber font-mono text-[11px] tracking-[0.15em]">
                    {crime.minDias / 365}–{crime.maxDias / 365} anos
                  </div>
                </label>
              );
            })}
          </fieldset>
        </div>
      )}

      {/* Etapa 1 — Fase 1 */}
      {etapa === 1 && (
        <div>
          <h2 className="font-serif text-[28px] leading-tight">
            Fase 1 — <em className="text-amber italic">Pena-base</em>{" "}
            <span className="text-paper-600 text-[16px]">(art. 59 CP)</span>
          </h2>
          <p className="text-paper-700 mt-2 text-sm">
            Marque as circunstâncias judiciais consideradas{" "}
            <strong className="text-paper">desfavoráveis</strong> ao réu. Cada
            uma soma 1/8 do intervalo legal sobre o mínimo.
          </p>

          <div className="mt-6 grid gap-2 md:grid-cols-2">
            {circunstanciasOrdem.map((c) => {
              const ativo = desfavoraveis.includes(c);
              return (
                <label
                  key={c}
                  className={`flex cursor-pointer items-center gap-3 border p-3 text-sm transition-colors ${
                    ativo
                      ? "border-amber bg-amber/10 text-paper"
                      : "border-paper-200 text-paper-800 hover:border-amber/50"
                  }`}
                >
                  <input
                    type="checkbox"
                    checked={ativo}
                    onChange={() => toggleDesfavoravel(c)}
                    className="accent-amber"
                  />
                  {labelsArt59[c]}
                </label>
              );
            })}
          </div>
          <p className="text-paper-600 mt-4 font-mono text-[11px] tracking-[0.1em]">
            {desfavoraveis.length}/8 circunstâncias desfavoráveis
          </p>
        </div>
      )}

      {/* Etapa 2 — Fase 2 */}
      {etapa === 2 && (
        <div>
          <h2 className="font-serif text-[28px] leading-tight">
            Fase 2 — <em className="text-amber italic">Pena intermediária</em>{" "}
            <span className="text-paper-600 text-[16px]">(arts. 61 a 66)</span>
          </h2>
          <p className="text-paper-700 mt-2 text-sm">
            Conte quantas atenuantes (art. 65) e agravantes (art. 61) incidem.
            Cada uma vale 1/6 da pena-base.
          </p>

          <div className="mt-8 grid gap-6 md:grid-cols-2">
            <Counter
              label="Atenuantes"
              hint="Reduzem 1/6 cada (Súmula 231 STJ: não passa abaixo do mínimo)"
              value={atenuantes}
              onChange={setAtenuantes}
            />
            <Counter
              label="Agravantes"
              hint="Aumentam 1/6 cada (didaticamente, não passa do máximo)"
              value={agravantes}
              onChange={setAgravantes}
            />
          </div>
        </div>
      )}

      {/* Etapa 3 — Fase 3 */}
      {etapa === 3 && (
        <div>
          <h2 className="font-serif text-[28px] leading-tight">
            Fase 3 — <em className="text-amber italic">Pena definitiva</em>
          </h2>
          <p className="text-paper-700 mt-2 text-sm">
            Adicione as causas de aumento e diminuição com suas frações
            específicas. Aplicadas sequencialmente, podem ultrapassar mínimo
            e máximo legais.
          </p>

          <div className="mt-8 grid gap-8 md:grid-cols-2">
            <FracaoList
              titulo="Causas de aumento"
              prefixo="+"
              valores={causasAumento}
              onChange={setCausasAumento}
            />
            <FracaoList
              titulo="Causas de diminuição"
              prefixo="−"
              valores={causasDiminuicao}
              onChange={setCausasDiminuicao}
            />
          </div>
        </div>
      )}

      {/* Resultado */}
      {etapa === 4 && resultado && <Resultado resultado={resultado} />}

      {/* Erro */}
      {erro && (
        <p
          role="alert"
          className="border-alerta-500 bg-alerta-500/10 text-alerta-400 mt-6 border-l-2 p-3 font-mono text-[12px]"
        >
          {erro}
        </p>
      )}

      {/* Navegação */}
      <div className="mt-10 flex items-center justify-between gap-4">
        {etapa > 0 && etapa < 4 ? (
          <button
            type="button"
            onClick={() => setEtapa((e) => (e - 1) as Etapa)}
            className="border-paper-400 text-paper-800 hover:border-amber hover:text-amber border px-5 py-2 font-mono text-[12px] uppercase tracking-[0.2em] transition-colors"
          >
            ← Voltar
          </button>
        ) : (
          <span />
        )}

        {etapa < 3 && (
          <button
            type="button"
            onClick={() => setEtapa((e) => (e + 1) as Etapa)}
            disabled={!podeAvancar}
            className="border-amber text-amber hover:bg-amber hover:text-carbon border px-5 py-2 font-mono text-[12px] uppercase tracking-[0.2em] transition-colors"
          >
            {etapa === 0
              ? `Avançar para Fase 1 →`
              : `Avançar para Fase ${etapa + 1} →`}
          </button>
        )}

        {etapa === 3 && (
          <button
            type="button"
            onClick={calcular}
            disabled={carregando}
            className="border-amber bg-amber text-carbon hover:bg-amber-soft hover:border-amber-soft border px-6 py-2 font-mono text-[12px] uppercase tracking-[0.2em] transition-colors disabled:opacity-50"
          >
            {carregando ? "Calculando…" : "Calcular pena hipotética →"}
          </button>
        )}

        {etapa === 4 && (
          <button
            type="button"
            onClick={reiniciar}
            className="border-amber text-amber hover:bg-amber hover:text-carbon border px-5 py-2 font-mono text-[12px] uppercase tracking-[0.2em] transition-colors"
          >
            ↺ Refazer simulação
          </button>
        )}

        <span aria-hidden className="text-paper-400 font-mono text-[10px]">
          {etapa < 4 && `${etapa + 1} / ${totalEtapas}`}
        </span>
      </div>
    </div>
  );
}

function Counter({
  label,
  hint,
  value,
  onChange,
}: {
  label: string;
  hint: string;
  value: number;
  onChange: (n: number) => void;
}) {
  return (
    <div className="border-paper-200 border p-5">
      <p className="font-serif text-[20px]">{label}</p>
      <p className="text-paper-600 mt-1 text-xs">{hint}</p>
      <div className="mt-4 flex items-center gap-4">
        <button
          type="button"
          onClick={() => onChange(Math.max(0, value - 1))}
          aria-label={`Diminuir ${label.toLowerCase()}`}
          className="border-paper-400 text-paper hover:border-amber hover:text-amber h-10 w-10 border font-mono text-[18px] transition-colors"
        >
          −
        </button>
        <span className="text-paper w-12 text-center font-mono text-[24px]">
          {value}
        </span>
        <button
          type="button"
          onClick={() => onChange(Math.min(20, value + 1))}
          aria-label={`Aumentar ${label.toLowerCase()}`}
          className="border-paper-400 text-paper hover:border-amber hover:text-amber h-10 w-10 border font-mono text-[18px] transition-colors"
        >
          +
        </button>
      </div>
    </div>
  );
}

function FracaoList({
  titulo,
  prefixo,
  valores,
  onChange,
}: {
  titulo: string;
  prefixo: string;
  valores: number[];
  onChange: (vs: number[]) => void;
}) {
  const [selecionada, setSelecionada] = useState<number>(fracoesDisponiveis[0]!.value);

  return (
    <div className="border-paper-200 border p-5">
      <p className="font-serif text-[20px]">{titulo}</p>

      <ul className="mt-4 space-y-2">
        {valores.length === 0 && (
          <li className="text-paper-600 font-mono text-[11px] tracking-[0.1em]">
            Nenhuma incidente
          </li>
        )}
        {valores.map((v, idx) => (
          <li
            key={`${v}-${idx}`}
            className="border-amber/30 text-paper flex items-center justify-between border-l-2 pl-3 font-mono text-[13px]"
          >
            <span>
              {prefixo}
              {fracaoLegivel(v)}
            </span>
            <button
              type="button"
              onClick={() => onChange(valores.filter((_, i) => i !== idx))}
              aria-label="Remover"
              className="text-paper-400 hover:text-alerta-400 text-xs transition-colors"
            >
              remover
            </button>
          </li>
        ))}
      </ul>

      <div className="mt-4 flex gap-2">
        <select
          value={selecionada}
          onChange={(e) => setSelecionada(Number(e.target.value))}
          className="border-paper-400 bg-carbon text-paper flex-1 border px-3 py-2 font-mono text-[12px]"
        >
          {fracoesDisponiveis.map((f) => (
            <option key={f.label} value={f.value}>
              {f.label}
            </option>
          ))}
        </select>
        <button
          type="button"
          onClick={() => onChange([...valores, selecionada])}
          className="border-amber text-amber hover:bg-amber hover:text-carbon border px-4 py-2 font-mono text-[12px] uppercase tracking-[0.2em] transition-colors"
        >
          Adicionar
        </button>
      </div>
    </div>
  );
}

function fracaoLegivel(decimal: number): string {
  const match = fracoesDisponiveis.find(
    (f) => Math.abs(f.value - decimal) < 0.005,
  );
  return match ? match.label : `${(decimal * 100).toFixed(0)}%`;
}

function Resultado({ resultado }: { resultado: DosimetriaResult }) {
  return (
    <div>
      <p className="text-amber font-mono text-[10px] uppercase tracking-[0.2em]">
        Resultado da simulação
      </p>
      <h2 className="mt-3 font-serif text-[36px] leading-tight">
        {resultado.crime.nome}
      </h2>
      <p className="text-paper-600 font-mono text-[11px] uppercase tracking-[0.15em]">
        {resultado.crime.artigo}
      </p>

      <div className="border-amber bg-amber/10 mt-8 border-l-4 p-6">
        <p className="text-amber font-mono text-[11px] uppercase tracking-[0.2em]">
          Pena hipotética definitiva
        </p>
        <p className="text-paper mt-2 font-serif text-[44px] leading-tight">
          {resultado.formatado.penaFinal}
        </p>
      </div>

      <ol className="mt-10 space-y-6">
        {resultado.passos.map((passo) => (
          <li
            key={passo.fase}
            className="border-paper-200 border-l-2 pl-5"
          >
            <p className="text-amber font-mono text-[10px] uppercase tracking-[0.2em]">
              Fase {passo.fase}
            </p>
            <p className="text-paper mt-1 font-serif text-[20px]">
              {passo.titulo}
            </p>
            <p className="text-paper-700 mt-2 text-sm leading-relaxed">
              {passo.detalhe}
            </p>
            <p className="text-amber mt-2 font-mono text-[13px]">
              ={" "}
              {passo.fase === 1
                ? resultado.formatado.penaBase
                : passo.fase === 2
                  ? resultado.formatado.penaIntermediaria
                  : resultado.formatado.penaFinal}
            </p>
          </li>
        ))}
      </ol>
    </div>
  );
}
