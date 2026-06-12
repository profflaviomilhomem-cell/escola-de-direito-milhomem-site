"use client";

import {
  useState,
  type Dispatch,
  type ReactNode,
  type SetStateAction,
} from "react";

import { CalculadoraPaperCloseup } from "./calculadora-paper-closeup";
import { DocumentoDidaticoWatermark } from "./documento-didatico-watermark";

import { crimes, type CrimePreset } from "@/lib/business/crimes";
import { fmTitleClamp } from "@/lib/ui/fm-title-clamp";
import {
  calcular,
  labelsArt59,
  type CircunstanciaArt59,
  type DosimetriaResult,
} from "@/lib/business/dosimetria";

import {
  ATENUANTES_LABEL,
  AGRAVANTES_LABEL,
  CAUSAS_AUMENTO,
  CAUSAS_DIMINUICAO,
  categoryOf,
  formatRange,
  type Tab,
} from "./case-file-constants";

export function CalcTabIcon({ tab, active }: { tab: Tab; active: boolean }) {
  const stroke = active ? "currentColor" : "currentColor";
  const icons: Record<Tab, ReactNode> = {
    dados: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={stroke} strokeWidth="1.75" aria-hidden>
        <path d="M4 6h16M4 12h16M4 18h10" strokeLinecap="round" />
      </svg>
    ),
    fato: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={stroke} strokeWidth="1.75" aria-hidden>
        <path d="M12 20h9M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4Z" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    ),
    calculo: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={stroke} strokeWidth="1.75" aria-hidden>
        <path d="M12 3v18M5 8h14M7 16h10" strokeLinecap="round" />
      </svg>
    ),
    sentenca: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={stroke} strokeWidth="1.75" aria-hidden>
        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8Z" />
        <path d="M14 2v6h6M8 13h8M8 17h5" strokeLinecap="round" />
      </svg>
    ),
    exportar: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={stroke} strokeWidth="1.75" aria-hidden>
        <path d="M12 3v12M7 10l5 5 5-5M5 21h14" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    ),
  };
  return icons[tab];
}

// ====================================================================
// TAB · DADOS
// ====================================================================

export function TabEmptyCrime({ embedded }: { embedded?: boolean }) {
  return (
    <p
      className={
        embedded
          ? "text-[#5c4a32] py-6 text-center font-mono text-[10px] uppercase tracking-[0.12em]"
          : "text-paper-600 py-12 text-center text-sm"
      }
    >
      Selecione um crime na aba{" "}
      <strong className={embedded ? "text-[#1a0f04]" : "text-amber"}>
        Crime / TIPO
      </strong>{" "}
      para continuar.
    </p>
  );
}

type TabDadosProps = {
  crimeSlug: string;
  setCrimeSlug: (s: string) => void;
  crimeListOpen: boolean;
  setCrimeListOpen: (open: boolean) => void;
  selectedCrime: CrimePreset | undefined;
  searchQuery: string;
  setSearchQuery: (s: string) => void;
  category: "all" | "patrimonio" | "pessoa" | "drogas" | "outros";
  setCategory: (
    c: "all" | "patrimonio" | "pessoa" | "drogas" | "outros",
  ) => void;
  categoryCounts: Record<
    "all" | "patrimonio" | "pessoa" | "drogas" | "outros",
    number
  >;
  filteredCrimes: CrimePreset[];
  primario: "sim" | "nao";
  setPrimario: (p: "sim" | "nao") => void;
  antecedentes: "limpos" | "1-condenacao" | "multiplas";
  setAntecedentes: (a: "limpos" | "1-condenacao" | "multiplas") => void;
  statusProc: "ipl" | "denuncia" | "instrucao" | "sentenca";
  setStatusProc: (s: "ipl" | "denuncia" | "instrucao" | "sentenca") => void;
  jurisprudencia: Array<{ tribunal: string; code: string; summary: string }>;
  isMobile: boolean;
  embedded?: boolean;
};

const CRIME_CATEGORY_FILTERS = [
  ["all", "Todos"],
  ["patrimonio", "Patrimônio"],
  ["pessoa", "Pessoa"],
  ["drogas", "Drogas"],
  ["outros", "Outros"],
] as const;

/** Filtros exibidos na calculadora (tela bege) */
const EMBEDDED_CRIME_CATEGORY_FILTERS = CRIME_CATEGORY_FILTERS.filter(
  ([key]) => key !== "outros",
);

export function TabDados(props: TabDadosProps) {
  const listExpanded = !props.crimeSlug || props.crimeListOpen;

  const renderCategoryFilters = (
    filters: ReadonlyArray<(typeof CRIME_CATEGORY_FILTERS)[number]>,
    layout: "toolbar" | "scroll",
  ) =>
    filters.map(([key, label]) => {
      const active = props.category === key;
      return (
        <button
          key={key}
          type="button"
          role="tab"
          aria-selected={active}
          onClick={() => {
            props.setCategory(key);
            props.setCrimeListOpen(true);
          }}
          className={
            layout === "toolbar"
              ? `fm-calc-dados-cat ${active ? "fm-calc-dados-cat--on" : ""}`
              : `shrink-0 border px-2.5 py-1.5 font-mono text-[9px] uppercase tracking-[0.14em] transition-colors sm:px-3 sm:text-[10px] sm:tracking-[0.2em] ${
                  active
                    ? "bg-amber/10 border-amber text-amber"
                    : "border-paper-200 text-paper-700 hover:text-paper"
                }`
          }
        >
          {label}
          {layout === "toolbar" ? null : ` (${props.categoryCounts[key]})`}
        </button>
      );
    });

  const crimeList = listExpanded ? (
    <ul
      className={`space-y-1.5 overflow-y-auto pr-1 sm:space-y-2 ${
        props.embedded
          ? "fm-calc-dados-list max-h-[min(11.5rem,28vh)] min-h-0"
          : "max-h-[min(42vh,360px)] sm:max-h-[460px]"
      }`}
    >
      {props.filteredCrimes.length === 0 && (
        <li
          className={
            props.embedded
              ? "text-[#5c4a32] italic"
              : "text-paper-600 italic"
          }
        >
          Nenhum crime corresponde ao filtro.
        </li>
      )}
      {props.filteredCrimes.map((c) => {
        const selected = c.slug === props.crimeSlug;
        return (
          <li key={c.slug}>
            <button
              type="button"
              onClick={() => {
                props.setCrimeSlug(c.slug);
                props.setCrimeListOpen(false);
              }}
              className={`group flex w-full items-start gap-2.5 border p-2.5 text-left transition-colors sm:items-center sm:gap-3 sm:p-3 ${
                props.embedded
                  ? selected
                    ? "fm-calc-screen-chip fm-calc-screen-chip--on"
                    : "fm-calc-screen-chip"
                  : selected
                    ? "bg-amber/5 border-amber"
                    : "border-paper-100 hover:border-amber/60"
              }`}
            >
              <span
                className={`mt-0.5 grid h-4 w-4 shrink-0 place-items-center rounded-full border sm:mt-0 sm:h-5 sm:w-5 ${
                  selected
                    ? "border-amber"
                    : props.embedded
                      ? "border-[#8a6a09]/50"
                      : "border-paper-400"
                }`}
              >
                {selected && (
                  <span className="bg-amber block h-2 w-2 rounded-full sm:h-2.5 sm:w-2.5" />
                )}
              </span>
              <span className="min-w-0 flex-1">
                <span
                  className={`block font-serif text-[15px] leading-tight sm:text-base ${
                    selected
                      ? props.embedded
                        ? "text-[#1a0f04] font-semibold"
                        : "text-amber"
                      : props.embedded
                        ? "text-[#2a1f10]"
                        : "text-paper"
                  }`}
                >
                  {c.nome}
                </span>
                <span className="text-paper-600 mt-0.5 block font-mono text-[9px] uppercase tracking-[0.12em] sm:text-[10px] sm:tracking-[0.15em]">
                  {c.artigo}
                  <span className="text-paper-700 sm:hidden">
                    {" "}
                    · {formatRange(c)}
                  </span>
                </span>
              </span>
              <span className="text-paper-700 hidden shrink-0 whitespace-nowrap font-mono text-[10px] uppercase tracking-[0.15em] sm:block">
                {formatRange(c)}
              </span>
            </button>
          </li>
        );
      })}
    </ul>
  ) : props.selectedCrime ? (
    <div
      className={
        props.embedded
          ? "fm-calc-screen-chip fm-calc-screen-chip--on px-2.5 py-2.5"
          : "border-amber/40 bg-amber/5 border px-3 py-3"
      }
    >
      <p
        className={`font-serif leading-tight ${
          props.embedded
            ? "text-[14px] font-semibold text-[#1a0f04]"
            : "text-amber text-lg"
        }`}
      >
        {props.selectedCrime.nome}
      </p>
      <p
        className={`mt-1 font-mono uppercase tracking-[0.12em] ${
          props.embedded
            ? "text-[9px] text-[#5c4a32]"
            : "text-paper-600 text-[10px]"
        }`}
      >
        {props.selectedCrime.artigo} · {formatRange(props.selectedCrime)}
      </p>
      <p
        className={`mt-2 font-mono uppercase tracking-[0.1em] ${
          props.embedded
            ? "text-[7px] text-[#5c4a32]/80"
            : "text-paper-600 text-[9px]"
        }`}
      >
        Toque em um filtro acima para trocar o crime
      </p>
    </div>
  ) : null;

  return (
    <div>
      {!props.embedded ? (
        <>
          <h2 className="mb-1 font-serif text-2xl sm:mb-2 sm:text-3xl">
            Dados do caso
          </h2>
          <p className="text-paper-700 mb-4 text-sm sm:mb-6 sm:text-[15px]">
            Escolha o crime e a situação do réu.
          </p>
        </>
      ) : null}

      {props.isMobile && props.jurisprudencia.length > 0 && (
        <details
          className={
            props.embedded
              ? "mb-2 border border-[#c4b59a] bg-white/30"
              : "border-paper-100 bg-carbon mb-4 border"
          }
        >
          <summary className="text-amber cursor-pointer px-4 py-3 font-mono text-[10px] uppercase tracking-[0.16em]">
            Jurisprudência ({props.jurisprudencia.length})
          </summary>
          <ul className="border-paper-100 space-y-2 border-t px-4 py-3">
            {props.jurisprudencia.map((j, i) => (
              <li key={i} className="border-amber/50 border-l-2 py-1 pl-2">
                <p className="text-amber font-mono text-[9px] uppercase tracking-[0.14em]">
                  {j.tribunal} · {j.code}
                </p>
                <p className="text-paper-800 mt-0.5 text-[12px] leading-snug">
                  {j.summary}
                </p>
              </li>
            ))}
          </ul>
        </details>
      )}

      {props.embedded ? (
        <div className="flex min-h-0 flex-col gap-2">
          <div className="fm-calc-dados-toolbar shrink-0 space-y-1.5">
            <div className="fm-calc-dados-toolbar__row grid grid-cols-[minmax(0,1fr)_minmax(6.75rem,8.5rem)] items-end gap-1.5">
              {listExpanded ? (
                <input
                  type="search"
                  value={props.searchQuery}
                  onChange={(e) => {
                    props.setSearchQuery(e.target.value);
                    props.setCrimeListOpen(true);
                  }}
                  placeholder="Buscar crime ou artigo…"
                  className="fm-calc-screen-field w-full px-2.5 py-2 text-[12px] outline-none focus:border-[#8a6a09]"
                />
              ) : (
                <span aria-hidden />
              )}
              <div className="min-w-0">
                <label
                  htmlFor="fm-calc-status-proc"
                  className="fm-calc-dados-toolbar__label"
                >
                  Status processual
                </label>
                <select
                  id="fm-calc-status-proc"
                  value={props.statusProc}
                  onChange={(e) =>
                    props.setStatusProc(
                      e.target.value as TabDadosProps["statusProc"],
                    )
                  }
                  className="fm-calc-screen-field w-full px-2 py-1.5 text-[11px] outline-none"
                >
                  <option value="ipl">Indiciamento (IPL)</option>
                  <option value="denuncia">Denúncia oferecida</option>
                  <option value="instrucao">Audiência de instrução</option>
                  <option value="sentenca">Sentença</option>
                </select>
              </div>
            </div>
            <div
              className="fm-calc-dados-cats grid grid-cols-4 gap-1"
              role="tablist"
              aria-label="Categorias de crime"
            >
              {renderCategoryFilters(EMBEDDED_CRIME_CATEGORY_FILTERS, "toolbar")}
            </div>
          </div>

          {!props.crimeSlug && listExpanded ? (
            <p className="text-[#5c4a32]/90 shrink-0 font-mono text-[8px] uppercase tracking-[0.1em]">
              Escolha um crime na lista abaixo.
            </p>
          ) : null}

          {crimeList}

          <div className="fm-calc-dados-meta grid shrink-0 grid-cols-2 gap-1.5">
            <div>
              <span className="fm-calc-dados-toolbar__label">Réu primário?</span>
              <div className="mt-0.5 flex gap-1">
                {(["sim", "nao"] as const).map((p) => {
                  const active = props.primario === p;
                  return (
                    <label
                      key={p}
                      className={`fm-calc-screen-chip flex flex-1 cursor-pointer items-center justify-center px-1.5 py-1.5 text-[11px] ${
                        active ? "fm-calc-screen-chip--on" : ""
                      }`}
                    >
                      <input
                        type="radio"
                        name="primario-embedded"
                        checked={active}
                        onChange={() => props.setPrimario(p)}
                        className="sr-only"
                      />
                      {p === "sim" ? "Sim" : "Não"}
                    </label>
                  );
                })}
              </div>
            </div>
            <div>
              <label
                htmlFor="fm-calc-antecedentes"
                className="fm-calc-dados-toolbar__label"
              >
                Antecedentes
              </label>
              <select
                id="fm-calc-antecedentes"
                value={props.antecedentes}
                onChange={(e) =>
                  props.setAntecedentes(
                    e.target.value as TabDadosProps["antecedentes"],
                  )
                }
                className="fm-calc-screen-field mt-0.5 w-full px-2 py-1.5 text-[11px] outline-none"
              >
                <option value="limpos">Sem antecedentes</option>
                <option value="1-condenacao">1 condenação</option>
                <option value="multiplas">Múltiplas</option>
              </select>
            </div>
          </div>
        </div>
      ) : (
        <div className="grid gap-5 md:grid-cols-2 md:gap-6">
          <div className="space-y-3 sm:space-y-4">
            {listExpanded ? (
              <input
                type="search"
                value={props.searchQuery}
                onChange={(e) => {
                  props.setSearchQuery(e.target.value);
                  props.setCrimeListOpen(true);
                }}
                placeholder="Buscar crime ou artigo…"
                className="border-paper-200 focus:border-amber bg-carbon text-paper placeholder:text-paper-600 w-full border px-3 py-2.5 text-sm outline-none sm:px-4 sm:py-3"
              />
            ) : null}

            <div
              className="-mx-1 flex gap-2 overflow-x-auto px-1 pb-1 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
              role="tablist"
              aria-label="Categorias de crime"
            >
              {renderCategoryFilters(CRIME_CATEGORY_FILTERS, "scroll")}
            </div>

            {!props.crimeSlug && listExpanded ? (
              <p className="text-paper-600 text-sm">
                Escolha um crime na lista abaixo.
              </p>
            ) : null}

            {crimeList}
          </div>

          <div className="space-y-4 sm:space-y-5">
            <div>
              <label className="text-paper-600 mb-2 block font-mono text-[10px] uppercase tracking-[0.2em]">
                Status processual
              </label>
              <select
                value={props.statusProc}
                onChange={(e) =>
                  props.setStatusProc(
                    e.target.value as TabDadosProps["statusProc"],
                  )
                }
                className="border-paper-200 focus:border-amber bg-carbon text-paper w-full border px-4 py-3 text-sm outline-none"
              >
                <option value="ipl">Indiciamento (IPL)</option>
                <option value="denuncia">Denúncia oferecida</option>
                <option value="instrucao">Audiência de instrução</option>
                <option value="sentenca">Sentença</option>
              </select>
            </div>

            <div>
              <label className="text-paper-600 mb-2 block font-mono text-[10px] uppercase tracking-[0.2em]">
                Réu primário?
              </label>
              <div className="flex gap-2">
                {(["sim", "nao"] as const).map((p) => {
                  const active = props.primario === p;
                  return (
                    <label
                      key={p}
                      className={`flex flex-1 cursor-pointer items-center justify-center gap-2 border p-3 transition-colors ${
                        active
                          ? "bg-amber/5 border-amber"
                          : "border-paper-200 hover:border-amber/60"
                      }`}
                    >
                      <input
                        type="radio"
                        name="primario"
                        checked={active}
                        onChange={() => props.setPrimario(p)}
                        className="accent-amber"
                      />
                      <span className="text-sm capitalize">
                        {p === "sim" ? "Sim" : "Não"}
                      </span>
                    </label>
                  );
                })}
              </div>
            </div>

            <div>
              <label className="text-paper-600 mb-2 block font-mono text-[10px] uppercase tracking-[0.2em]">
                Antecedentes
              </label>
              <select
                value={props.antecedentes}
                onChange={(e) =>
                  props.setAntecedentes(
                    e.target.value as TabDadosProps["antecedentes"],
                  )
                }
                className="border-paper-200 focus:border-amber bg-carbon text-paper w-full border px-4 py-3 text-sm outline-none"
              >
                <option value="limpos">Sem antecedentes criminais</option>
                <option value="1-condenacao">1 condenação anterior trânsita</option>
                <option value="multiplas">Múltiplas condenações anteriores</option>
              </select>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}

// ====================================================================
// TAB · FATO
// ====================================================================

export function TabFato({
  fatoText,
  setFatoText,
  embedded = false,
}: {
  fatoText: string;
  setFatoText: (s: string) => void;
  embedded?: boolean;
}) {
  return (
    <div>
      {!embedded ? (
        <>
          <h2 className="mb-1 font-serif text-2xl sm:mb-2 sm:text-3xl">
            Descrição do fato
          </h2>
          <p className="text-paper-700 mb-4 text-sm sm:mb-6 sm:text-[15px]">
            Texto opcional que aparece na sentença.
          </p>
        </>
      ) : null}
      <textarea
        rows={embedded ? 5 : 8}
        value={fatoText}
        onChange={(e) => setFatoText(e.target.value)}
        placeholder="Narre o fato hipotético em poucas linhas…"
        className={
          embedded
            ? "fm-calc-screen-field w-full resize-none px-2 py-2 text-[12px] leading-relaxed outline-none"
            : "border-paper-200 focus:border-amber bg-carbon text-paper placeholder:text-paper-600 w-full border px-4 py-3 text-sm leading-relaxed outline-none"
        }
      />
      <p
        className={`mt-2 flex justify-end font-mono text-[9px] uppercase tracking-[0.1em] ${
          embedded ? "text-[#5c4a32]" : "text-paper-600 text-xs"
        }`}
      >
        <span>{fatoText.length} caracteres</span>
      </p>
    </div>
  );
}

// ====================================================================
// TAB · CÁLCULO
// ====================================================================

type TabCalculoProps = {
  crime: CrimePreset;
  result: DosimetriaResult;
  desfavoraveis: Set<CircunstanciaArt59>;
  setDesfavoraveis: React.Dispatch<React.SetStateAction<Set<CircunstanciaArt59>>>;
  atenuantesSet: Set<string>;
  setAtenuantesSet: React.Dispatch<React.SetStateAction<Set<string>>>;
  agravantesSet: Set<string>;
  setAgravantesSet: React.Dispatch<React.SetStateAction<Set<string>>>;
  aumentosSet: Set<string>;
  setAumentosSet: React.Dispatch<React.SetStateAction<Set<string>>>;
  diminuicoesSet: Set<string>;
  setDiminuicoesSet: React.Dispatch<React.SetStateAction<Set<string>>>;
  toggleSet: <T,>(s: Set<T>, v: T) => Set<T>;
  rangeMarkerPct: number;
  balanceAngle: number;
  isMobile: boolean;
  embedded?: boolean;
  calcPhase?: 1 | 2 | 3;
  setCalcPhase?: (p: 1 | 2 | 3) => void;
};

function PenaSummaryCard({
  crime,
  result,
  rangeMarkerPct,
  balanceLabel,
  compact,
}: {
  crime: CrimePreset;
  result: DosimetriaResult;
  rangeMarkerPct: number;
  balanceLabel?: string;
  compact?: boolean;
}) {
  return (
    <div
      className={`border-paper-100 bg-carbon border text-center ${compact ? "p-4" : "p-6"}`}
    >
      <p className="text-paper-600 mb-1 font-mono text-[9px] uppercase tracking-[0.14em] sm:text-[10px]">
        Pena definitiva
      </p>
      <p
        className="fm-title-fluid text-amber font-serif leading-none"
        style={fmTitleClamp(compact ? "28px" : "36px", compact ? "8vw" : "4vw", compact ? "40px" : "56px")}
      >
        {result.formatado.penaFinal}
      </p>
      <div className="mt-3 sm:mt-5">
        <div className="text-paper-600 mb-1.5 flex justify-between font-mono text-[9px] uppercase tracking-[0.12em] sm:text-[10px]">
          <span>{formatRange(crime).split(" a ")[0]}</span>
          <span>{formatRange(crime).split(" a ")[1]}</span>
        </div>
        <div className="bg-paper-200 relative h-[2px]">
          <span
            className="bg-amber absolute top-1/2 h-3 w-3 -translate-x-1/2 -translate-y-1/2 rounded-full transition-all duration-300 sm:h-3.5 sm:w-3.5"
            style={{
              left: `${rangeMarkerPct}%`,
              boxShadow: "0 0 12px rgba(241, 187, 65, 0.5)",
            }}
          />
        </div>
      </div>
      {balanceLabel ? (
        <p className="text-paper-600 mt-2 font-mono text-[9px] uppercase tracking-[0.12em]">
          {balanceLabel}
        </p>
      ) : null}
      <div className="border-paper-100 mt-3 space-y-0 border-t pt-2 font-mono text-[11px] sm:mt-4 sm:text-[12px]">
        <BreakdownRow label="Base:" value={result.formatado.penaBase} />
        <BreakdownRow
          label="Interm.:"
          value={result.formatado.penaIntermediaria}
          bordered
        />
      </div>
    </div>
  );
}

const DOSIMETRIA_PHASES = [
  { n: 1 as const, label: "Fase I", sub: "Art. 59" },
  { n: 2 as const, label: "Fase II", sub: "Aten./Agrav." },
  { n: 3 as const, label: "Fase III", sub: "Causas" },
];

function DosimetriaPhaseNav({
  phase,
  setPhase,
  embedded,
}: {
  phase: 1 | 2 | 3;
  setPhase: (n: 1 | 2 | 3) => void;
  embedded?: boolean;
}) {
  return (
    <div
      className={
        embedded
          ? "fm-calc-phase-row mb-2 grid grid-cols-3 gap-1"
          : "grid grid-cols-3 gap-1.5"
      }
      role="tablist"
      aria-label="Fases da dosimetria"
    >
      {DOSIMETRIA_PHASES.map(({ n, label, sub }) => {
        const active = phase === n;
        return (
          <button
            key={n}
            type="button"
            role="tab"
            aria-selected={active}
            onClick={() => setPhase(n)}
            className={
              embedded
                ? `fm-calc-phase-tab text-center ${active ? "fm-calc-phase-tab--active" : ""}`
                : `border px-2 py-2.5 text-center transition-colors ${
                    active
                      ? "bg-amber/15 border-amber text-amber"
                      : "border-paper-200 text-paper-700"
                  }`
            }
          >
            <span
              className={
                embedded
                  ? "block font-serif text-sm italic leading-none"
                  : "block font-serif text-lg italic leading-none"
              }
            >
              {n}
            </span>
            {embedded ? (
              <>
                <span className="mt-0.5 block text-[7px] font-bold uppercase tracking-[0.06em]">
                  {label}
                </span>
                <span className="block text-[6px] uppercase opacity-55">{sub}</span>
              </>
            ) : null}
          </button>
        );
      })}
    </div>
  );
}

function renderFactorList(
  items: Array<{ slug: string; label: string; fracao?: number }>,
  activeSet: Set<string>,
  setter: Dispatch<SetStateAction<Set<string>>>,
  toggleSet: TabCalculoProps["toggleSet"],
  tone: "at" | "ag" | "dim" | "aum",
  showMultiplier?: boolean,
) {
  return (
    <ul className="fm-calc-factor-list space-y-1">
      {items.map((item) => {
        const active = activeSet.has(item.slug);
        const mult =
          showMultiplier && item.fracao !== undefined
            ? tone === "dim"
              ? (1 - item.fracao).toFixed(2)
              : (1 + item.fracao).toFixed(2)
            : null;
        return (
          <li key={item.slug}>
            <label
              className={`fm-calc-screen-chip flex cursor-pointer items-start gap-2 border px-2 py-2 ${
                active
                  ? tone === "at" || tone === "dim"
                    ? "fm-calc-screen-chip--on"
                    : "border-[#c45c4a] bg-[#c45c4a]/10"
                  : ""
              }`}
            >
              <FmCheck
                checked={active}
                onChange={() => setter((s) => toggleSet(s, item.slug))}
              />
              <span className="min-w-0 flex-1 text-[11px] leading-snug">{item.label}</span>
              {mult ? (
                <span className="shrink-0 font-mono text-[8px] text-[#5c4a32]">×{mult}</span>
              ) : null}
            </label>
          </li>
        );
      })}
    </ul>
  );
}

export function TabCalculoMobile(p: TabCalculoProps) {
  const [internalPhase, setInternalPhase] = useState<1 | 2 | 3>(1);
  const phase = p.calcPhase ?? internalPhase;
  const setPhase = p.setCalcPhase ?? setInternalPhase;
  const [fase2Side, setFase2Side] = useState<"at" | "ag">("at");
  const [fase3Side, setFase3Side] = useState<"dim" | "aum">("dim");
  const dualColumns = Boolean(p.embedded);

  const balanceLabel =
    p.atenuantesSet.size > p.agravantesSet.size
      ? "Favorece o réu"
      : p.atenuantesSet.size < p.agravantesSet.size
        ? "Desfavorece o réu"
        : "Neutro";

  return (
    <div className={p.embedded ? "space-y-2" : "space-y-4"}>
      {p.embedded ? (
        <div className="fm-calc-pena-strip" aria-live="polite">
          <span className="fm-calc-pena-strip__label">Pena definitiva</span>
          <span className="fm-calc-pena-strip__value">
            {p.result.formatado.penaFinal}
          </span>
          <span className="fm-calc-pena-strip__meta">
            B {p.result.formatado.penaBase} · I {p.result.formatado.penaIntermediaria}
            · {balanceLabel}
          </span>
        </div>
      ) : (
        <PenaSummaryCard
          crime={p.crime}
          result={p.result}
          rangeMarkerPct={p.rangeMarkerPct}
          balanceLabel={balanceLabel}
          compact
        />
      )}

      <DosimetriaPhaseNav
        phase={phase}
        setPhase={setPhase}
        embedded={p.embedded}
      />

      {phase === 1 && (
        <section className={p.embedded ? "" : "border-paper-100 border p-3"}>
          {!p.embedded ? (
            <p className="text-paper-700 mb-3 text-xs leading-relaxed">
              Vetores desfavoráveis do art. 59 CP.
            </p>
          ) : null}
          <div className="grid gap-1.5">
            {(Object.entries(labelsArt59) as [CircunstanciaArt59, string][]).map(
              ([key, label]) => {
                const active = p.desfavoraveis.has(key);
                return (
                  <label
                    key={key}
                    className={`fm-calc-screen-chip flex cursor-pointer items-center gap-2 border px-2 py-2 ${
                      active ? "fm-calc-screen-chip--on" : ""
                    }`}
                  >
                    <FmCheck
                      checked={active}
                      onChange={() =>
                        p.setDesfavoraveis((s) => p.toggleSet(s, key))
                      }
                    />
                    <span className="text-[12px] leading-snug">{label}</span>
                  </label>
                );
              },
            )}
          </div>
        </section>
      )}

      {phase === 2 && (
        <section className={p.embedded ? "" : "border-paper-100 border"}>
          {dualColumns ? (
            <div className="fm-calc-dosimetria-grid grid grid-cols-2 gap-2">
              <div className="min-w-0">
                <p className="fm-calc-dosimetria-col-title fm-calc-dosimetria-col-title--at">
                  Atenuantes (−1/6)
                </p>
                {renderFactorList(
                  ATENUANTES_LABEL,
                  p.atenuantesSet,
                  p.setAtenuantesSet,
                  p.toggleSet,
                  "at",
                )}
              </div>
              <div className="min-w-0">
                <p className="fm-calc-dosimetria-col-title fm-calc-dosimetria-col-title--ag">
                  Agravantes (+1/6)
                </p>
                {renderFactorList(
                  AGRAVANTES_LABEL,
                  p.agravantesSet,
                  p.setAgravantesSet,
                  p.toggleSet,
                  "ag",
                )}
              </div>
            </div>
          ) : (
            <>
              <div className="fm-calc-screen-seg mb-2 grid grid-cols-2">
                {(
                  [
                    ["at", "Atenuantes"],
                    ["ag", "Agravantes"],
                  ] as const
                ).map(([side, label]) => (
                  <button
                    key={side}
                    type="button"
                    onClick={() => setFase2Side(side)}
                    className={`py-2 font-mono text-[9px] uppercase tracking-[0.1em] ${
                      fase2Side === side ? "fm-calc-screen-seg--on" : ""
                    }`}
                  >
                    {label}
                  </button>
                ))}
              </div>
              {renderFactorList(
                fase2Side === "at" ? ATENUANTES_LABEL : AGRAVANTES_LABEL,
                fase2Side === "at" ? p.atenuantesSet : p.agravantesSet,
                fase2Side === "at" ? p.setAtenuantesSet : p.setAgravantesSet,
                p.toggleSet,
                fase2Side === "at" ? "at" : "ag",
              )}
            </>
          )}
        </section>
      )}

      {phase === 3 && (
        <section className={p.embedded ? "" : "border-paper-100 border"}>
          {dualColumns ? (
            <div className="fm-calc-dosimetria-grid grid grid-cols-2 gap-2">
              <div className="min-w-0">
                <p className="fm-calc-dosimetria-col-title">Diminuição</p>
                {renderFactorList(
                  CAUSAS_DIMINUICAO,
                  p.diminuicoesSet,
                  p.setDiminuicoesSet,
                  p.toggleSet,
                  "dim",
                  true,
                )}
              </div>
              <div className="min-w-0">
                <p className="fm-calc-dosimetria-col-title fm-calc-dosimetria-col-title--ag">
                  Aumento
                </p>
                {renderFactorList(
                  CAUSAS_AUMENTO,
                  p.aumentosSet,
                  p.setAumentosSet,
                  p.toggleSet,
                  "aum",
                  true,
                )}
              </div>
            </div>
          ) : (
            <>
              <div className="fm-calc-screen-seg mb-2 grid grid-cols-2">
                {(
                  [
                    ["dim", "Diminuição"],
                    ["aum", "Aumento"],
                  ] as const
                ).map(([side, label]) => (
                  <button
                    key={side}
                    type="button"
                    onClick={() => setFase3Side(side)}
                    className={`py-2 font-mono text-[9px] uppercase tracking-[0.1em] ${
                      fase3Side === side ? "fm-calc-screen-seg--on" : ""
                    }`}
                  >
                    {label}
                  </button>
                ))}
              </div>
              {renderFactorList(
                fase3Side === "dim" ? CAUSAS_DIMINUICAO : CAUSAS_AUMENTO,
                fase3Side === "dim" ? p.diminuicoesSet : p.aumentosSet,
                fase3Side === "dim" ? p.setDiminuicoesSet : p.setAumentosSet,
                p.toggleSet,
                fase3Side === "dim" ? "dim" : "aum",
                true,
              )}
            </>
          )}
        </section>
      )}
    </div>
  );
}


export function TabCalculo(p: TabCalculoProps) {
  if (p.isMobile || p.embedded) return <TabCalculoMobile {...p} />;

  const balanceLabel =
    p.atenuantesSet.size > p.agravantesSet.size
      ? "Pendendo a favor do réu"
      : p.atenuantesSet.size < p.agravantesSet.size
        ? "Pendendo contra o réu"
        : "Equilíbrio neutro";

  return (
    <div>
      <h2 className="mb-2 font-serif text-3xl">Cálculo trifásico</h2>
      <p className="text-paper-700 mb-6 text-[15px]">
        Três fases sequenciais. A balança à direita reflete o equilíbrio entre
        atenuantes e agravantes.
      </p>

      <div className="grid gap-8 lg:grid-cols-[1fr_320px]">
        {/* Esquerda — fases */}
        <div className="space-y-6">
          {/* Fase 1 */}
          <details open className="border-paper-100 group border">
            <summary className="hover:bg-paper-50 flex cursor-pointer items-center justify-between gap-3 p-5">
              <div className="flex items-center gap-4">
                <span className="bg-amber text-carbon grid h-10 w-10 place-items-center rounded-full font-serif italic">
                  1
                </span>
                <div>
                  <p className="text-amber font-mono text-[11px] uppercase tracking-[0.2em]">
                    Fase 1
                  </p>
                  <h3 className="font-serif text-xl leading-tight">
                    Pena-base · vetores do art. 59
                  </h3>
                </div>
              </div>
              <span className="text-paper-700 font-mono text-[11px] uppercase tracking-[0.2em]">
                {p.desfavoraveis.size} de 8
              </span>
            </summary>
            <div className="border-paper-100 border-t p-5">
              <p className="text-paper-700 mb-4 text-sm">
                Marque os vetores desfavoráveis ao acusado.
              </p>
              <div className="grid gap-2 sm:grid-cols-2">
                {(Object.entries(labelsArt59) as [
                  CircunstanciaArt59,
                  string,
                ][]).map(([key, label]) => {
                  const active = p.desfavoraveis.has(key);
                  return (
                    <label
                      key={key}
                      className={`flex cursor-pointer items-center gap-3 border p-3 transition-colors ${
                        active
                          ? "bg-amber/5 border-amber"
                          : "border-paper-100 hover:border-amber/60"
                      }`}
                    >
                      <FmCheck
                        checked={active}
                        onChange={() =>
                          p.setDesfavoraveis((s) => p.toggleSet(s, key))
                        }
                      />
                      <span className="text-paper text-sm">{label}</span>
                    </label>
                  );
                })}
              </div>
            </div>
          </details>

          {/* Fase 2 */}
          <details open className="border-paper-100 border">
            <summary className="hover:bg-paper-50 flex cursor-pointer items-center justify-between gap-3 p-5">
              <div className="flex items-center gap-4">
                <span className="bg-amber/10 border-amber text-amber grid h-10 w-10 place-items-center rounded-full border-2 font-serif italic">
                  2
                </span>
                <div>
                  <p className="text-amber font-mono text-[11px] uppercase tracking-[0.2em]">
                    Fase 2
                  </p>
                  <h3 className="font-serif text-xl leading-tight">
                    Intermediária · atenuantes/agravantes
                  </h3>
                </div>
              </div>
              <span className="text-paper-700 font-mono text-[11px] uppercase tracking-[0.2em]">
                {p.atenuantesSet.size}A · {p.agravantesSet.size}G
              </span>
            </summary>
            <div className="border-paper-100 grid gap-4 border-t p-5 md:grid-cols-2">
              <div>
                <h4 className="text-amber mb-2 font-mono text-[11px] uppercase tracking-[0.2em]">
                  Atenuantes (−1/6 cada)
                </h4>
                <ul className="space-y-1.5">
                  {ATENUANTES_LABEL.map((a) => {
                    const active = p.atenuantesSet.has(a.slug);
                    return (
                      <li key={a.slug}>
                        <label
                          className={`flex cursor-pointer items-center gap-2 border p-2 transition-colors ${
                            active
                              ? "bg-amber/5 border-amber"
                              : "border-paper-100 hover:border-amber/60"
                          }`}
                        >
                          <FmCheck
                            checked={active}
                            onChange={() =>
                              p.setAtenuantesSet((s) => p.toggleSet(s, a.slug))
                            }
                          />
                          <span className="text-sm">{a.label}</span>
                        </label>
                      </li>
                    );
                  })}
                </ul>
              </div>
              <div>
                <h4 className="text-alerta-400 mb-2 font-mono text-[11px] uppercase tracking-[0.2em]">
                  Agravantes (+1/6 cada)
                </h4>
                <ul className="space-y-1.5">
                  {AGRAVANTES_LABEL.map((a) => {
                    const active = p.agravantesSet.has(a.slug);
                    return (
                      <li key={a.slug}>
                        <label
                          className={`flex cursor-pointer items-center gap-2 border p-2 transition-colors ${
                            active
                              ? "border-alerta-400 bg-alerta-400/10"
                              : "border-paper-100 hover:border-alerta-400/60"
                          }`}
                        >
                          <FmCheck
                            checked={active}
                            onChange={() =>
                              p.setAgravantesSet((s) => p.toggleSet(s, a.slug))
                            }
                          />
                          <span className="text-sm">{a.label}</span>
                        </label>
                      </li>
                    );
                  })}
                </ul>
              </div>
            </div>
          </details>

          {/* Fase 3 */}
          <details open className="border-paper-100 border">
            <summary className="hover:bg-paper-50 flex cursor-pointer items-center justify-between gap-3 p-5">
              <div className="flex items-center gap-4">
                <span className="bg-carbon-elevated border-paper-200 text-paper-700 grid h-10 w-10 place-items-center rounded-full border-2 font-serif italic">
                  3
                </span>
                <div>
                  <p className="text-amber font-mono text-[11px] uppercase tracking-[0.2em]">
                    Fase 3
                  </p>
                  <h3 className="font-serif text-xl leading-tight">
                    Definitiva · causas
                  </h3>
                </div>
              </div>
              <span className="text-paper-700 font-mono text-[11px] uppercase tracking-[0.2em]">
                {p.aumentosSet.size}+ · {p.diminuicoesSet.size}−
              </span>
            </summary>
            <div className="border-paper-100 grid gap-4 border-t p-5 md:grid-cols-2">
              <div>
                <h4 className="text-amber mb-2 font-mono text-[11px] uppercase tracking-[0.2em]">
                  Diminuições (×)
                </h4>
                <ul className="space-y-1.5">
                  {CAUSAS_DIMINUICAO.map((d) => {
                    const active = p.diminuicoesSet.has(d.slug);
                    return (
                      <li key={d.slug}>
                        <label
                          className={`flex cursor-pointer items-center gap-2 border p-2 transition-colors ${
                            active
                              ? "bg-amber/5 border-amber"
                              : "border-paper-100 hover:border-amber/60"
                          }`}
                        >
                          <FmCheck
                            checked={active}
                            onChange={() =>
                              p.setDiminuicoesSet((s) => p.toggleSet(s, d.slug))
                            }
                          />
                          <span className="text-sm">{d.label}</span>
                          <span className="text-paper-600 ml-auto whitespace-nowrap font-mono text-[10px]">
                            ×{(1 - d.fracao).toFixed(2)}
                          </span>
                        </label>
                      </li>
                    );
                  })}
                </ul>
              </div>
              <div>
                <h4 className="text-alerta-400 mb-2 font-mono text-[11px] uppercase tracking-[0.2em]">
                  Aumentos (×)
                </h4>
                <ul className="space-y-1.5">
                  {CAUSAS_AUMENTO.map((a) => {
                    const active = p.aumentosSet.has(a.slug);
                    return (
                      <li key={a.slug}>
                        <label
                          className={`flex cursor-pointer items-center gap-2 border p-2 transition-colors ${
                            active
                              ? "border-alerta-400 bg-alerta-400/10"
                              : "border-paper-100 hover:border-alerta-400/60"
                          }`}
                        >
                          <FmCheck
                            checked={active}
                            onChange={() =>
                              p.setAumentosSet((s) => p.toggleSet(s, a.slug))
                            }
                          />
                          <span className="text-sm">{a.label}</span>
                          <span className="text-paper-600 ml-auto whitespace-nowrap font-mono text-[10px]">
                            ×{(1 + a.fracao).toFixed(2)}
                          </span>
                        </label>
                      </li>
                    );
                  })}
                </ul>
              </div>
            </div>
          </details>
        </div>

        {/* Direita — painel de resultado */}
        <div className="space-y-6 lg:sticky lg:top-24 lg:self-start">
          {/* Pena definitiva */}
          <div className="border-paper-100 bg-carbon border p-6 text-center">
            <p className="text-paper-600 mb-2 font-mono text-[10px] uppercase tracking-[0.2em]">
              Pena definitiva (parcial)
            </p>
            <p
              className="fm-title-fluid text-amber font-serif leading-none"
              style={fmTitleClamp("36px", "4vw", "56px")}
            >
              {p.result.formatado.penaFinal}
            </p>
            <div className="mt-5">
              <div className="text-paper-600 mb-2 flex justify-between font-mono text-[10px] uppercase tracking-[0.15em]">
                <span>{formatRange(p.crime).split(" a ")[0]}</span>
                <span>{formatRange(p.crime).split(" a ")[1]}</span>
              </div>
              <div className="bg-paper-200 relative h-[2px]">
                <span
                  className="bg-amber absolute top-1/2 h-3.5 w-3.5 -translate-x-1/2 -translate-y-1/2 rounded-full transition-all duration-300"
                  style={{
                    left: `${p.rangeMarkerPct}%`,
                    boxShadow: "0 0 12px rgba(241, 187, 65, 0.5)",
                  }}
                />
              </div>
            </div>
          </div>

          {/* Balança SVG */}
          <div className="border-paper-100 bg-carbon flex flex-col items-center border p-6">
            <p className="text-paper-600 mb-3 font-mono text-[10px] uppercase tracking-[0.2em]">
              Balança da justiça
            </p>
            <svg viewBox="0 0 220 200" className="w-full max-w-[220px]">
              <line x1="110" y1="190" x2="110" y2="60" stroke="#f1bb41" strokeWidth="2" />
              <line x1="80" y1="190" x2="140" y2="190" stroke="#f1bb41" strokeWidth="2" />
              <g
                style={{
                  transform: `rotate(${p.balanceAngle}deg)`,
                  transformOrigin: "110px 60px",
                  transition: "transform .5s cubic-bezier(0.34, 1.3, 0.64, 1)",
                }}
              >
                <line x1="20" y1="60" x2="200" y2="60" stroke="#f1bb41" strokeWidth="2" />
                <line x1="20" y1="60" x2="20" y2="80" stroke="#f1bb41" strokeWidth="1.5" />
                <ellipse cx="20" cy="84" rx="22" ry="4" fill="#f1bb41" opacity="0.85" />
                <text x="20" y="106" textAnchor="middle" fontFamily="JetBrains Mono" fontSize="10" fill="#e0e0e0" letterSpacing="1">−</text>
                <line x1="200" y1="60" x2="200" y2="80" stroke="#f1bb41" strokeWidth="1.5" />
                <ellipse cx="200" cy="84" rx="22" ry="4" fill="#f1bb41" opacity="0.85" />
                <text x="200" y="106" textAnchor="middle" fontFamily="JetBrains Mono" fontSize="10" fill="#e0e0e0" letterSpacing="1">+</text>
                <circle cx="110" cy="60" r="4" fill="#f1bb41" />
              </g>
            </svg>
            <p className="text-paper-700 mt-2 font-mono text-[10px] uppercase tracking-[0.2em]">
              {balanceLabel}
            </p>
          </div>

          {/* Quebra do cálculo */}
          <div className="border-paper-100 bg-carbon border p-5 font-mono text-[12px]">
            <BreakdownRow
              label="Pena-base:"
              value={p.result.formatado.penaBase}
            />
            <BreakdownRow
              label="Intermediária:"
              value={p.result.formatado.penaIntermediaria}
              bordered
            />
            <BreakdownRow
              label="Definitiva:"
              value={p.result.formatado.penaFinal}
              accent
              bordered
            />
          </div>
        </div>
      </div>
    </div>
  );
}

function BreakdownRow({
  label,
  value,
  accent,
  bordered,
}: {
  label: string;
  value: string;
  accent?: boolean;
  bordered?: boolean;
}) {
  return (
    <div
      className={`flex items-center justify-between gap-4 py-2 ${bordered ? "border-paper-100 border-t" : ""}`}
    >
      <span className={accent ? "text-amber" : "text-paper-600"}>
        {label}
      </span>
      <span className={accent ? "text-amber font-semibold" : "text-paper"}>
        {value}
      </span>
    </div>
  );
}

function FmCheck({
  checked,
  onChange,
}: {
  checked: boolean;
  onChange: () => void;
}) {
  return (
    <span
      className={`relative inline-grid h-[1.15rem] w-[1.15rem] flex-shrink-0 cursor-pointer place-items-center border ${
        checked
          ? "border-amber bg-amber"
          : "border-paper-400 bg-transparent"
      }`}
      role="checkbox"
      aria-checked={checked}
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === " " || e.key === "Enter") {
          e.preventDefault();
          onChange();
        }
      }}
    >
      <input
        type="checkbox"
        checked={checked}
        onChange={onChange}
        className="absolute inset-0 cursor-pointer opacity-0"
      />
      {checked && (
        <span className="text-carbon text-xs font-bold leading-none">✓</span>
      )}
    </span>
  );
}

// ====================================================================
// TAB · SENTENÇA
// ====================================================================

type SentencaManuscritoProps = {
  crime: CrimePreset;
  result: DosimetriaResult;
  desfavoraveisCount: number;
  sentencaFase2: string;
  sentencaFase3: string;
  fatoText: string;
  density: "device" | "closeup" | "page";
};

function SentencaManuscritoArticle({
  crime,
  result,
  desfavoraveisCount,
  sentencaFase2,
  sentencaFase3,
  fatoText,
  density,
}: SentencaManuscritoProps) {
  const compact = density === "device";
  const closeup = density === "closeup";

  return (
    <article
      className={`font-serif ${
        compact
          ? "px-1 py-1 text-[11px] leading-[1.65]"
          : closeup
            ? "fm-calc-manuscrito--closeup"
            : "px-4 py-5 text-[14px] leading-[1.75] sm:px-8 sm:py-8 sm:text-[15px] sm:leading-[1.85]"
      }`}
      style={closeup ? undefined : { color: "#2a1f10" }}
    >
      {fatoText.trim().length > 0 && (
        <p className={compact ? "mb-2" : "mb-5"}>
          <strong
            className={closeup ? "fm-calc-manuscrito__lead" : undefined}
            style={closeup ? undefined : { color: "#1a0f04" }}
          >
            Dos fatos.
          </strong>{" "}
          {fatoText}
        </p>
      )}

      <p className={compact ? "mb-2" : "mb-5"}>
        <strong
          className={closeup ? "fm-calc-manuscrito__lead" : undefined}
          style={closeup ? undefined : { color: "#1a0f04" }}
        >
          Vistos os autos.
        </strong>{" "}
        Trata-se de caso hipotético envolvendo o crime de{" "}
        <strong
          className={closeup ? "fm-calc-manuscrito__accent" : undefined}
          style={closeup ? undefined : { color: "#8a6a09" }}
        >
          {crime.nome.toLowerCase()} ({crime.artigo})
        </strong>
        , cuja pena cominada varia de{" "}
        <span
          className={closeup ? "fm-calc-manuscrito__accent" : undefined}
          style={closeup ? undefined : { color: "#8a6a09" }}
        >
          {formatRange(crime)}
        </span>{" "}
        de reclusão.
      </p>

      <p className={compact ? "mb-2" : "mb-5"}>
        Atendendo às circunstâncias judiciais do art. 59, verificou-se que{" "}
        <span
          className={closeup ? "fm-calc-manuscrito__accent" : undefined}
          style={closeup ? undefined : { color: "#8a6a09" }}
        >
          {desfavoraveisCount} dos 8 vetores
        </span>{" "}
        depõem contra o acusado, fixando-se a{" "}
        <strong className={closeup ? "fm-calc-manuscrito__term" : undefined}>
          pena-base
        </strong>{" "}
        em{" "}
        <strong
          className={closeup ? "fm-calc-manuscrito__accent" : undefined}
          style={closeup ? undefined : { color: "#8a6a09" }}
        >
          {result.formatado.penaBase}
        </strong>
        .
      </p>

      <p className={compact ? "mb-2" : "mb-5"}>
        Na fase intermediária, {sentencaFase2}, resultando em{" "}
        <strong
          className={closeup ? "fm-calc-manuscrito__accent" : undefined}
          style={closeup ? undefined : { color: "#8a6a09" }}
        >
          {result.formatado.penaIntermediaria}
        </strong>
        .
      </p>

      <p className={compact ? "mb-2" : closeup ? "mb-6" : "mb-7"}>
        Em última fase, {sentencaFase3}, fixando-se a{" "}
        <strong className={closeup ? "fm-calc-manuscrito__term" : undefined}>
          pena definitiva em{" "}
          <span
            className={closeup ? "fm-calc-manuscrito__accent" : undefined}
            style={closeup ? undefined : { color: "#8a6a09" }}
          >
            {result.formatado.penaFinal}
          </span>
        </strong>
        .
      </p>

      <hr className={`border-amber/40 ${compact ? "my-3" : "my-7"}`} />

      <p
        className={compact ? "text-[10px] italic" : "text-[13px] italic"}
        style={{ color: "rgba(26,15,4,0.7)" }}
      >
        Documento didático. Não vincula MPDFT, Escola ou o Prof. Flávio Milhomem
        em sua condição funcional.
      </p>
    </article>
  );
}

export function TabSentenca({
  crime,
  result,
  desfavoraveisCount,
  sentencaFase2,
  sentencaFase3,
  fatoText,
  embedded = false,
}: {
  crime: CrimePreset;
  result: DosimetriaResult;
  desfavoraveisCount: number;
  sentencaFase2: string;
  sentencaFase3: string;
  fatoText: string;
  embedded?: boolean;
}) {
  const manuscritoProps: SentencaManuscritoProps = {
    crime,
    result,
    desfavoraveisCount,
    sentencaFase2,
    sentencaFase3,
    fatoText,
    density: "page",
  };

  const [closeupOpen, setCloseupOpen] = useState(embedded);

  // Reabre o closeup quando o resultado muda no modo embedded — ajuste de
  // estado durante o render (sem effect, evita render em cascata).
  const closeupResetKey = embedded
    ? `${crime.slug}|${result.formatado.penaFinal}`
    : null;
  const [prevCloseupResetKey, setPrevCloseupResetKey] =
    useState(closeupResetKey);
  if (prevCloseupResetKey !== closeupResetKey) {
    setPrevCloseupResetKey(closeupResetKey);
    if (closeupResetKey !== null) setCloseupOpen(true);
  }

  if (embedded) {
    return (
      <>
        <div className="fm-calc-txt-preview">
          <p className="fm-calc-txt-preview__label">Saída · manuscrito</p>
          <p className="fm-calc-txt-preview__crime">{crime.nome}</p>
          <p className="fm-calc-txt-preview__pena">
            Pena definitiva: <strong>{result.formatado.penaFinal}</strong>
          </p>
          <p className="fm-calc-txt-preview__hint">
            O texto abre em folha ampliada para leitura confortável.
          </p>
          <button
            type="button"
            className="fm-calc-txt-preview__open"
            onClick={() => setCloseupOpen(true)}
          >
            Abrir folha de leitura
          </button>
        </div>

        <CalculadoraPaperCloseup
          open={closeupOpen}
          onClose={() => setCloseupOpen(false)}
          title="Manuscrito da sentença"
          subtitle={`${crime.artigo} · pena ${result.formatado.penaFinal}`}
        >
          <SentencaManuscritoArticle {...manuscritoProps} density="closeup" />
        </CalculadoraPaperCloseup>
      </>
    );
  }

  return (
    <div className="fm-paper-kraft relative shadow-2xl">
      <DocumentoDidaticoWatermark />
      <div className="relative z-[1] border-amber/40 border-b px-4 py-4 sm:px-8 sm:py-6">
        <div
          className="flex items-center justify-between font-mono text-[10px] uppercase tracking-[0.25em]"
          style={{ color: "#1a0f04" }}
        >
          <span>República Federativa do Brasil</span>
          <span>Caso #2026/001</span>
        </div>
        <h3 className="mt-3 font-serif text-2xl" style={{ color: "#1a0f04" }}>
          Manuscrito da{" "}
          <em className="italic" style={{ color: "#8a6a09" }}>
            sentença
          </em>
        </h3>
        <p className="mt-1 text-[13px]" style={{ color: "#1a0f04" }}>
          Atualiza-se em tempo real conforme você ajusta o cálculo.
        </p>
      </div>

      <div className="relative z-[1]">
        <SentencaManuscritoArticle {...manuscritoProps} density="page" />
      </div>
    </div>
  );
}

// ====================================================================
// TAB · EXPORTAR
// ====================================================================

export function TabExportar({ embedded = false }: { embedded?: boolean }) {
  const formatos = [
    {
      eyebrow: "PDF · A4",
      title: "Sentença formal",
      desc: "Manuscrito em papel kraft, cabeçalho institucional, hash de validação no rodapé.",
    },
    {
      eyebrow: "PDF · resumo",
      title: "Memorial técnico",
      desc: "Duas páginas com o cálculo passo a passo, jurisprudência citada e legislação aplicada.",
    },
    {
      eyebrow: "JSON · API",
      title: "Estrutura bruta",
      desc: "Para integração com outros sistemas. Inclui todos os parâmetros e o resultado de cada fase.",
    },
  ];
  return (
    <div>
      {!embedded ? (
        <>
          <h2 className="mb-1 font-serif text-2xl sm:mb-2 sm:text-3xl">
            Exportar caso
          </h2>
          <p className="text-paper-700 mb-5 text-sm sm:mb-8 sm:text-[15px]">
            Escolha o formato. Cada exportação inclui hash de validação único em{" "}
            <code className="text-amber font-mono text-xs">/calc/[hash]</code>.
          </p>
        </>
      ) : null}
      <div
        className={`grid gap-2 ${embedded ? "grid-cols-1" : "gap-3 sm:gap-4 md:grid-cols-3"}`}
      >
        {formatos.map((f) => (
          <button
            key={f.title}
            type="button"
            className={
              embedded
                ? "fm-calc-screen-chip group flex w-full flex-col px-3 py-2.5 text-left active:scale-[0.98]"
                : "border-paper-200 hover:border-amber bg-carbon-elevated group border p-4 text-left transition-colors sm:p-6"
            }
          >
            <p className="text-amber mb-3 font-mono text-[10px] uppercase tracking-[0.2em]">
              {f.eyebrow}
            </p>
            <h3 className="group-hover:text-amber mb-2 font-serif text-xl">
              {f.title}
            </h3>
            <p className="text-paper-700 text-sm leading-relaxed">{f.desc}</p>
          </button>
        ))}
      </div>
    </div>
  );
}
