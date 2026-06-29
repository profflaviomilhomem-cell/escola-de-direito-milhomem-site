"use client";

import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type ReactNode,
} from "react";

import { useMediaQuery } from "@/hooks/use-media-query";

import { CalculadoraDeviceDesktopShell } from "./calculadora-device-desktop-shell";

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
  /** `desktop` — mesma máquina, escala maior em viewports lg+ (via CSS). */
  layout?: "mobile" | "desktop";
};

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
  children,
  layout = "mobile",
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

  const hideReceiptAfterPrint = layout !== "desktop";

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
        if (hideReceiptAfterPrint) {
          hideTimerRef.current = setTimeout(() => {
            setReceiptOpen(false);
            setVisibleLineCount(0);
          }, RECEIPT_HIDE_MS);
        }
        return;
      }

      setIsPrinting(true);

      lines.forEach((_, i) => {
        const t = window.setTimeout(
          () => {
            setVisibleLineCount(i + 1);
          },
          PRINT_WARMUP_MS + i * LINE_PRINT_MS,
        );
        lineTimersRef.current.push(t);
      });

      const printDoneMs = PRINT_WARMUP_MS + lines.length * LINE_PRINT_MS + 280;

      printTimerRef.current = setTimeout(() => {
        setIsPrinting(false);
      }, printDoneMs);

      if (hideReceiptAfterPrint) {
        hideTimerRef.current = setTimeout(() => {
          setReceiptOpen(false);
          setVisibleLineCount(0);
        }, printDoneMs + RECEIPT_HIDE_MS);
      }
    },
    [clearTimers, reducedMotion, hideReceiptAfterPrint],
  );

  const handleClear = useCallback(() => {
    clearTimers();
    setIsPrinting(false);
    setReceiptOpen(false);
    setVisibleLineCount(0);
    setReceiptLines([]);
    onReset();
  }, [clearTimers, onReset]);

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

  const paperHeight =
    visibleLineCount > 0 ? Math.min(visibleLineCount * 13 + 12, 200) : 0;
  const showPaper = receiptOpen || isPrinting;

  const handleFeed = () => {
    triggerPrint(buildQuickReceipt(display));
  };

  if (layout === "desktop") {
    return (
      <CalculadoraDeviceDesktopShell
        tab={tab}
        onTabChange={onTabChange}
        display={display}
        isPrinting={isPrinting}
        showPaper={showPaper}
        receiptLines={receiptLines}
        visibleLineCount={visibleLineCount}
        printEpoch={printEpoch}
        reducedMotion={reducedMotion}
        onClear={handleClear}
        resetDisabled={resetDisabled}
        isPrintingBusy={isPrinting}
        onPrint={handlePrint}
        onFeed={handleFeed}
        modeKeys={MODE_KEYS}
      >
        {children}
      </CalculadoraDeviceDesktopShell>
    );
  }

  // Ramo mobile apenas (desktop usa CalculadoraDeviceDesktopShell).
  const isDesktop = false;

  return (
    <div
      className="fm-calc-device mx-auto flex w-full flex-col"
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
        {isDesktop ? (
          <div className="fm-calc-roll-housing" aria-hidden>
            <span className="fm-calc-roll-cylinder" />
            <span className="fm-calc-roll-shadow" />
          </div>
        ) : null}
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

      <div
        className={`fm-calc-device-body relative flex min-h-0 flex-1 flex-col overflow-hidden ${
          isDesktop
            ? "fm-calc-device-body--desktop rounded-lg rounded-t-md"
            : "rounded-[1.35rem] rounded-t-[0.65rem] rounded-br-[1.1rem]"
        }`}
      >
        <div
          className={
            isDesktop
              ? "fm-calc-device-top fm-calc-device-top--desktop shrink-0"
              : "fm-calc-device-top flex shrink-0 items-center justify-between gap-2 px-3.5 pt-2 pb-2"
          }
        >
          {isDesktop ? (
            <>
              <span className="fm-calc-brand-plate">FM</span>
              <p className="fm-calc-model-plate">
                DOSIMETRIA · <span className="text-paper/60">HR-001</span>
              </p>
              <div className="fm-calc-led-cluster" aria-hidden>
                <span
                  className={`fm-calc-led ${isPrinting ? "fm-calc-led--print" : "fm-calc-led--pulse"}`}
                />
                <span className="fm-calc-led fm-calc-led--dim" />
                <span
                  className={`fm-calc-led ${isPrinting ? "fm-calc-led--print" : ""}`}
                />
              </div>
            </>
          ) : (
            <>
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
              <p className="text-paper/50 font-mono text-[8px] tracking-[0.28em] uppercase">
                {isPrinting ? "Imprimindo…" : "Dosimetria · FM"}
              </p>
              <span className="text-amber/80 font-serif text-[11px] italic">
                №001
              </span>
            </>
          )}
        </div>

        <div
          className={`fm-calc-lcd shrink-0 ${
            isDesktop
              ? "fm-calc-lcd--register mx-4 mt-1 px-4 py-3"
              : "mx-3 rounded-md px-3 py-2.5"
          } ${isPrinting ? "fm-calc-lcd--busy" : ""}`}
        >
          {isDesktop ? (
            <>
              <div className="fm-calc-lcd-register-meta">
                <span className="truncate">{display.modeLabel}</span>
                <span className="shrink-0 tabular-nums">{display.artigo}</span>
              </div>
              <p
                className="fm-calc-lcd-register-main tabular-nums"
                aria-live="polite"
              >
                {display.penaFinal}
              </p>
              <p className="fm-calc-lcd-register-crime truncate">
                {display.crimeName}
              </p>
              <div className="fm-calc-lcd-register-footer">
                <span>BASE {display.penaBase}</span>
                <span>INT {display.penaIntermediaria}</span>
                <span className="fm-calc-lcd-register-status">
                  {display.statusLine}
                </span>
              </div>
            </>
          ) : (
            <>
              <div className="flex items-start justify-between gap-2">
                <p className="fm-calc-lcd-line text-[9px] tracking-[0.2em] uppercase opacity-70">
                  {display.modeLabel}
                </p>
                <p className="fm-calc-lcd-line text-right text-[8px] tracking-[0.12em] uppercase opacity-55">
                  {display.artigo}
                </p>
              </div>
              <p
                className="fm-calc-lcd-main mt-1 leading-none tracking-tight tabular-nums"
                aria-live="polite"
              >
                {display.penaFinal}
              </p>
              <p className="fm-calc-lcd-line mt-1 truncate text-[10px] opacity-80">
                {display.crimeName}
              </p>
              <div className="mt-2 flex justify-between gap-2 border-t border-[#1a3d28]/40 pt-1.5 font-mono text-[8px] tracking-[0.1em] uppercase opacity-65">
                <span>B:{display.penaBase}</span>
                <span>I:{display.penaIntermediaria}</span>
                <span className="text-[#9ee6b8]">{display.statusLine}</span>
              </div>
            </>
          )}
        </div>

        <div
          className={`fm-calc-screen-well mt-2.5 mb-2 flex min-h-0 flex-1 flex-col overflow-hidden rounded-sm ${
            isDesktop ? "fm-calc-screen-well--desktop mx-4" : "mx-3"
          }`}
        >
          <div className="fm-calc-screen-inner min-h-0 flex-1 overflow-y-auto overscroll-contain px-2.5 py-2">
            {children}
          </div>
        </div>

        <div
          className={`fm-calc-keypad shrink-0 pt-1 ${
            isDesktop ? "fm-calc-keypad--desktop px-4 pb-4" : "px-2.5 pb-3"
          }`}
        >
          {isDesktop ? (
            <div
              className="fm-calc-fn-row mb-2 grid grid-cols-6 gap-1"
              aria-hidden
            >
              <span className="fm-calc-fn-key fm-calc-fn-key--label">ITEM</span>
              <span className="fm-calc-fn-key fm-calc-fn-key--label">CONV</span>
              <button
                type="button"
                className="fm-calc-fn-key fm-calc-fn-key--prt"
                onClick={handlePrint}
                disabled={isPrinting}
              >
                PRT
              </button>
              <button
                type="button"
                className="fm-calc-fn-key"
                onClick={handleFeed}
                disabled={isPrinting}
              >
                FEED
              </button>
              <span className="fm-calc-fn-key fm-calc-fn-key--tax">TAX−</span>
              <span className="fm-calc-fn-key fm-calc-fn-key--tax">TAX+</span>
            </div>
          ) : null}

          <div
            className={`grid gap-1.5 ${isDesktop ? "grid-cols-5" : "grid-cols-5"}`}
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
                  className={`fm-calc-key flex flex-col items-center justify-center gap-0.5 ${
                    isDesktop ? "fm-calc-key--mode py-2.5" : "py-2"
                  } ${active ? "fm-calc-key--active" : ""}`}
                >
                  <span
                    className={
                      isDesktop
                        ? "text-[12px] font-bold tracking-[0.05em]"
                        : "text-[11px] font-bold tracking-[0.06em]"
                    }
                  >
                    {label}
                  </span>
                  <span className="text-[7px] uppercase opacity-60">
                    {hint}
                  </span>
                </button>
              );
            })}
          </div>

          {tab === "calculo" ? (
            <div
              className={`mt-2 grid grid-cols-3 gap-1.5 ${isDesktop ? "" : "mt-1.5"}`}
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
                    className={`fm-calc-key fm-calc-key--phase ${
                      isDesktop ? "py-3" : "py-2.5"
                    } ${active ? "fm-calc-key--active" : ""}`}
                  >
                    <span className="font-serif text-base leading-none italic">
                      {n}
                    </span>
                    <span className="mt-0.5 text-[7px] font-bold tracking-[0.08em] uppercase">
                      {label}
                    </span>
                    <span className="text-[6px] uppercase opacity-50">
                      {sub}
                    </span>
                  </button>
                );
              })}
            </div>
          ) : null}

          {isDesktop ? (
            <div className="fm-calc-action-grid mt-2 grid grid-cols-4 grid-rows-2 gap-1.5">
              <button
                type="button"
                onClick={onReset}
                disabled={resetDisabled || isPrinting}
                className="fm-calc-key fm-calc-key--clear row-span-2 disabled:opacity-35"
                aria-label="Zerar caso"
              >
                <span className="text-lg font-bold">C</span>
                <span className="text-[8px] uppercase opacity-70">Clear</span>
              </button>
              <span className="fm-calc-key fm-calc-key--stub" aria-hidden>
                MU
              </span>
              <span className="fm-calc-key fm-calc-key--stub" aria-hidden>
                M+
              </span>
              <button
                type="button"
                onClick={handlePrint}
                disabled={isPrinting}
                className={`fm-calc-key fm-calc-key--print-tall row-span-2 ${
                  isPrinting ? "fm-calc-key--printing" : ""
                }`}
                aria-label="Imprimir na bobina"
              >
                <span className="text-[11px] font-bold tracking-[0.1em]">
                  PRINT
                </span>
                <span className="text-[8px] uppercase opacity-70">Bobina</span>
              </button>
              <span className="fm-calc-key fm-calc-key--stub" aria-hidden>
                %
              </span>
              <span className="fm-calc-key fm-calc-key--stub" aria-hidden>
                M−
              </span>
            </div>
          ) : (
            <div className="mt-1.5 grid grid-cols-2 gap-1.5">
              <button
                type="button"
                onClick={onReset}
                disabled={resetDisabled || isPrinting}
                className="fm-calc-key fm-calc-key--danger py-3 disabled:opacity-35"
                aria-label="Zerar caso"
              >
                <span className="text-[10px] font-bold tracking-[0.12em]">
                  CLR
                </span>
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
          )}
        </div>
      </div>

      <p className="text-paper-600 mt-2 text-center font-mono text-[8px] tracking-[0.14em] uppercase">
        Instrumento didático · sem valor jurídico vinculante
      </p>
    </div>
  );
}
