"use client";

import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type ReactNode,
} from "react";

import { useMediaQuery } from "@/hooks/use-media-query";

export type CalcDeviceTab =
  | "dados"
  | "fato"
  | "calculo"
  | "sentenca"
  | "exportar";

export type CrimeCategory =
  | "all"
  | "patrimonio"
  | "pessoa"
  | "drogas"
  | "outros";

const MODE_KEYS: Array<{
  id: CalcDeviceTab;
  label: string;
  hint: string;
}> = [
  { id: "dados", label: "TIPO", hint: "Crime" },
  { id: "fato", label: "FATO", hint: "Narrativa" },
  { id: "calculo", label: "PENA", hint: "Dosimetria" },
  { id: "sentenca", label: "TXT", hint: "Sentença" },
  { id: "exportar", label: "OUT", hint: "Exportar" },
];

const RECEIPT_HIDE_MS = 4500;
const LINE_PRINT_MS = 145;
const PRINT_WARMUP_MS = 220;

type CalculadoraDeviceMobileProps = {
  tab: CalcDeviceTab;
  onTabChange: (tab: CalcDeviceTab) => void;
  calcPhase: 1 | 2 | 3;
  onCalcPhaseChange: (phase: 1 | 2 | 3) => void;
  display: {
    penaFinal: string;
    penaBase: string;
    penaIntermediaria: string;
    crimeName: string;
    artigo: string;
    modeLabel: string;
    statusLine: string;
  };
  onReset: () => void;
  resetDisabled: boolean;
  crimeCategory: CrimeCategory;
  onCrimeCategoryChange: (category: CrimeCategory) => void;
  crimeCategoryCounts: Record<CrimeCategory, number>;
  children: ReactNode;
};

const CRIME_CATEGORY_KEYS: Array<{
  id: CrimeCategory;
  label: string;
  hint: string;
}> = [
  { id: "all", label: "Todos", hint: "Todos os crimes" },
  { id: "patrimonio", label: "Patrimônio", hint: "Crimes patrimoniais" },
  { id: "pessoa", label: "Pessoa", hint: "Crimes contra a pessoa" },
  { id: "drogas", label: "Drogas", hint: "Crimes de drogas" },
  { id: "outros", label: "Outros", hint: "Outras categorias" },
];

function buildQuickReceipt(display: CalculadoraDeviceMobileProps["display"]) {
  return [
    "FM · DOSIMETRIA",
    "----------------",
    `DEF  ${display.penaFinal}`,
    `BAS  ${display.penaBase}`,
    `INT  ${display.penaIntermediaria}`,
    display.modeLabel.slice(0, 18),
    display.statusLine,
  ];
}

function buildFullReceipt(display: CalculadoraDeviceMobileProps["display"]) {
  return [
    "** IMPRESSAO **",
    "CASO #2026/001",
    "----------------",
    display.crimeName.slice(0, 22),
    display.artigo.slice(0, 22),
    "----------------",
    "PENA DEFINITIVA",
    display.penaFinal,
    `BASE ${display.penaBase}`,
    `INTERM ${display.penaIntermediaria}`,
    display.modeLabel.slice(0, 20),
    display.statusLine,
    "----------------",
    "DIDATICO · FM",
  ];
}

export function CalculadoraDeviceMobile({
  tab,
  onTabChange,
  calcPhase,
  onCalcPhaseChange,
  display,
  onReset,
  resetDisabled,
  crimeCategory,
  onCrimeCategoryChange,
  crimeCategoryCounts,
  children,
}: CalculadoraDeviceMobileProps) {
  const reducedMotion = useMediaQuery("(prefers-reduced-motion: reduce)");
  const [isPrinting, setIsPrinting] = useState(false);
  const [receiptOpen, setReceiptOpen] = useState(false);
  const [receiptLines, setReceiptLines] = useState<string[]>([]);
  const [visibleLineCount, setVisibleLineCount] = useState(0);
  const [printEpoch, setPrintEpoch] = useState(0);

  const hideTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const printTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const lineTimersRef = useRef<number[]>([]);
  const skipNextAutoRef = useRef(true);
  const displaySigRef = useRef("");

  const clearTimers = useCallback(() => {
    if (hideTimerRef.current) clearTimeout(hideTimerRef.current);
    if (printTimerRef.current) clearTimeout(printTimerRef.current);
    lineTimersRef.current.forEach((t) => clearTimeout(t));
    hideTimerRef.current = null;
    printTimerRef.current = null;
    lineTimersRef.current = [];
  }, []);

  const triggerPrint = useCallback(
    (lines: string[]) => {
      clearTimers();
      setReceiptLines(lines);
      setVisibleLineCount(0);
      setPrintEpoch((n) => n + 1);
      setReceiptOpen(true);

      if (reducedMotion) {
        setVisibleLineCount(lines.length);
        setIsPrinting(false);
        hideTimerRef.current = setTimeout(() => {
          setReceiptOpen(false);
          setVisibleLineCount(0);
        }, RECEIPT_HIDE_MS);
        return;
      }

      setIsPrinting(true);

      lines.forEach((_, i) => {
        const t = window.setTimeout(() => {
          setVisibleLineCount(i + 1);
        }, PRINT_WARMUP_MS + i * LINE_PRINT_MS);
        lineTimersRef.current.push(t);
      });

      const printDoneMs =
        PRINT_WARMUP_MS + lines.length * LINE_PRINT_MS + 280;

      printTimerRef.current = setTimeout(() => {
        setIsPrinting(false);
      }, printDoneMs);

      hideTimerRef.current = setTimeout(() => {
        setReceiptOpen(false);
        setVisibleLineCount(0);
      }, printDoneMs + RECEIPT_HIDE_MS);
    },
    [clearTimers, reducedMotion],
  );

  const displaySignature = `${display.penaFinal}|${display.penaBase}|${display.penaIntermediaria}|${display.modeLabel}|${display.statusLine}|${display.crimeName}`;

  useEffect(() => {
    if (skipNextAutoRef.current) {
      skipNextAutoRef.current = false;
      displaySigRef.current = displaySignature;
      return;
    }
    if (displaySignature === displaySigRef.current) return;
    displaySigRef.current = displaySignature;
    triggerPrint(buildQuickReceipt(display));
  }, [display, displaySignature, triggerPrint]);

  useEffect(() => () => clearTimers(), [clearTimers]);

  const handlePrint = () => {
    triggerPrint(buildFullReceipt(display));
    const lines = buildFullReceipt(display).length;
    const navDelay = reducedMotion
      ? 80
      : PRINT_WARMUP_MS + lines * LINE_PRINT_MS + 400;
    window.setTimeout(() => onTabChange("exportar"), navDelay);
  };

  const paperLinePx = 13;
  const paperHeight =
    visibleLineCount > 0
      ? Math.min(visibleLineCount * paperLinePx + 10, 200)
      : 0;
  const showPaper = receiptOpen || isPrinting;

  return (
    <div
      className="fm-calc-device mx-auto flex w-full max-w-[420px] flex-col"
      style={{ height: "calc(100dvh - 5.75rem)", maxHeight: "680px" }}
    >
      {/* Bobina — papel sobe pelo slot com braços (calculadora clássica) */}
      <div
        className={`fm-calc-printer-top shrink-0 ${
          isPrinting ? "fm-calc-printer-top--printing" : ""
        }`}
        style={{ ["--fm-paper-h" as string]: `${paperHeight}px` }}
        aria-live="polite"
        aria-busy={isPrinting}
      >
        <div className="fm-calc-paper-assembly">
          <div
            className={`fm-calc-paper-arm fm-calc-paper-arm--left ${
              showPaper ? "fm-calc-paper-arm--up" : ""
            }`}
            aria-hidden
          />
          <div className="fm-calc-paper-column">
            <div
              className={`fm-calc-paper-strip ${
                showPaper ? "fm-calc-paper-strip--visible" : ""
              } ${isPrinting ? "fm-calc-paper-strip--feeding" : ""}`}
            >
              {receiptLines.slice(0, visibleLineCount).map((line, i) => {
                const isActiveLine =
                  isPrinting && i === visibleLineCount - 1 && !reducedMotion;
                return (
                  <p
                    key={`${printEpoch}-${i}`}
                    className={`fm-calc-receipt-line ${
                      isActiveLine ? "fm-calc-receipt-line--typing" : ""
                    }`}
                  >
                    {line}
                  </p>
                );
              })}
            </div>
            <div className="fm-calc-print-slot" aria-hidden />
          </div>
          <div
            className={`fm-calc-paper-arm fm-calc-paper-arm--right ${
              showPaper ? "fm-calc-paper-arm--up" : ""
            }`}
            aria-hidden
          />
        </div>
      </div>

      <div className="fm-calc-device-body relative flex min-h-0 flex-1 flex-col overflow-hidden rounded-[1.35rem] rounded-br-[1.1rem] rounded-t-[0.65rem]">
        <div className="fm-calc-device-top flex shrink-0 items-center justify-between gap-2 px-3.5 pb-2 pt-2">
          <div className="flex items-center gap-2">
            <span
              className={`fm-calc-led ${isPrinting ? "fm-calc-led--print" : ""}`}
              aria-hidden
            />
            <span className="fm-calc-led fm-calc-led--dim" aria-hidden />
            <span
              className={`fm-calc-led ${isPrinting ? "fm-calc-led--print" : "fm-calc-led--pulse"}`}
              aria-hidden
              title={isPrinting ? "Imprimindo" : "Ao vivo"}
            />
          </div>
          <p className="text-paper/50 font-mono text-[8px] uppercase tracking-[0.28em]">
            {isPrinting ? "Imprimindo…" : "Dosimetria · FM"}
          </p>
          <span className="text-amber/80 font-serif text-[11px] italic">№001</span>
        </div>

        <div
          className={`fm-calc-lcd mx-3 shrink-0 rounded-md px-3 py-2.5 ${
            isPrinting ? "fm-calc-lcd--busy" : ""
          }`}
        >
          <div className="flex items-start justify-between gap-2">
            <p className="fm-calc-lcd-line text-[9px] uppercase tracking-[0.2em] opacity-70">
              {display.modeLabel}
            </p>
            <p className="fm-calc-lcd-line text-right text-[8px] uppercase tracking-[0.12em] opacity-55">
              {display.artigo}
            </p>
          </div>
          <p
            className="fm-calc-lcd-main mt-1 tabular-nums leading-none tracking-tight"
            aria-live="polite"
          >
            {display.penaFinal}
          </p>
          <p className="fm-calc-lcd-line mt-1 truncate text-[10px] opacity-80">
            {display.crimeName}
          </p>
          <div className="mt-2 flex justify-between gap-2 border-t border-[#1a3d28]/40 pt-1.5 font-mono text-[8px] uppercase tracking-[0.1em] opacity-65">
            <span>B:{display.penaBase}</span>
            <span>I:{display.penaIntermediaria}</span>
            <span className="text-[#9ee6b8]">{display.statusLine}</span>
          </div>
        </div>

        <div className="fm-calc-screen-well mx-3 mb-2 mt-2.5 flex min-h-0 flex-1 flex-col overflow-hidden rounded-sm">
          <div className="fm-calc-screen-inner min-h-0 flex-1 overflow-y-auto overscroll-contain px-2.5 py-2">
            {children}
          </div>
        </div>

        <div className="fm-calc-keypad shrink-0 px-2.5 pb-3 pt-1">
          <div
            className="grid grid-cols-5 gap-1.5"
            role="tablist"
            aria-label="Modos da calculadora"
          >
            {MODE_KEYS.map(({ id, label, hint }) => {
              const active = tab === id;
              return (
                <button
                  key={id}
                  type="button"
                  role="tab"
                  aria-selected={active}
                  aria-label={`${hint}${active ? ", ativo" : ""}`}
                  onClick={() => onTabChange(id)}
                  className={`fm-calc-key flex flex-col items-center justify-center gap-0.5 py-2 ${
                    active ? "fm-calc-key--active" : ""
                  }`}
                >
                  <span className="text-[11px] font-bold tracking-[0.06em]">
                    {label}
                  </span>
                  <span className="text-[7px] uppercase opacity-60">{hint}</span>
                </button>
              );
            })}
          </div>

          {tab === "dados" ? (
            <div
              className="mt-1.5 -mx-0.5 flex gap-1 overflow-x-auto pb-0.5 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
              role="tablist"
              aria-label="Categorias de crime"
            >
              {CRIME_CATEGORY_KEYS.map(({ id, label, hint }) => {
                const active = crimeCategory === id;
                const count = crimeCategoryCounts[id];
                return (
                  <button
                    key={id}
                    type="button"
                    role="tab"
                    aria-selected={active}
                    aria-label={`${hint} (${count} crimes)${active ? ", ativo" : ""}`}
                    onClick={() => onCrimeCategoryChange(id)}
                    className={`fm-calc-key fm-calc-key--phase shrink-0 px-2.5 py-2 ${
                      active ? "fm-calc-key--active" : ""
                    }`}
                  >
                    <span className="whitespace-nowrap text-[9px] font-bold leading-tight tracking-[0.02em]">
                      {label}
                    </span>
                    <span className="text-[6px] opacity-55">({count})</span>
                  </button>
                );
              })}
            </div>
          ) : null}

          {tab === "calculo" ? (
            <div
              className="mt-1.5 grid grid-cols-3 gap-1.5"
              role="tablist"
              aria-label="Fases da dosimetria"
            >
              {(
                [
                  [1, "FASE I", "Art. 59"],
                  [2, "FASE II", "Aten/Agrav"],
                  [3, "FASE III", "Causas"],
                ] as const
              ).map(([n, label, sub]) => {
                const active = calcPhase === n;
                return (
                  <button
                    key={n}
                    type="button"
                    role="tab"
                    aria-selected={active}
                    onClick={() => onCalcPhaseChange(n)}
                    className={`fm-calc-key fm-calc-key--phase py-2.5 ${
                      active ? "fm-calc-key--active" : ""
                    }`}
                  >
                    <span className="font-serif text-base italic leading-none">
                      {n}
                    </span>
                    <span className="mt-0.5 text-[7px] font-bold uppercase tracking-[0.08em]">
                      {label}
                    </span>
                    <span className="text-[6px] uppercase opacity-50">{sub}</span>
                  </button>
                );
              })}
            </div>
          ) : null}

          <div className="mt-1.5 grid grid-cols-2 gap-1.5">
            <button
              type="button"
              onClick={onReset}
              disabled={resetDisabled || isPrinting}
              className="fm-calc-key fm-calc-key--danger py-3 disabled:opacity-35"
              aria-label="Zerar caso"
            >
              <span className="text-[10px] font-bold tracking-[0.12em]">CLR</span>
              <span className="text-[7px] uppercase opacity-60">Zerar</span>
            </button>
            <button
              type="button"
              onClick={handlePrint}
              disabled={isPrinting}
              className={`fm-calc-key fm-calc-key--print py-3 ${
                isPrinting ? "fm-calc-key--printing" : ""
              }`}
              aria-label="Imprimir na bobina"
            >
              <span className="text-[10px] font-bold tracking-[0.12em]">
                PRINT
              </span>
              <span className="text-[7px] uppercase opacity-60">Bobina</span>
            </button>
          </div>
        </div>
      </div>

      <p className="text-paper-600 mt-2 text-center font-mono text-[8px] uppercase tracking-[0.14em]">
        Instrumento didático · sem valor jurídico vinculante
      </p>
    </div>
  );
}
