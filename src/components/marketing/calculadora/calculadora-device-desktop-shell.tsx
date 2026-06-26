"use client";

import type { CSSProperties, ReactNode } from "react";

import type { CalcDeviceTab } from "./calculadora-device-mobile";

type Props = {
  tab: CalcDeviceTab;
  onTabChange: (tab: CalcDeviceTab) => void;
  display: {
    penaFinal: string;
    penaBase: string;
    penaIntermediaria: string;
    crimeName: string;
    artigo: string;
    modeLabel: string;
    statusLine: string;
  };
  isPrinting: boolean;
  showPaper: boolean;
  receiptLines: string[];
  visibleLineCount: number;
  printEpoch: number;
  reducedMotion: boolean;
  onClear: () => void;
  resetDisabled: boolean;
  isPrintingBusy: boolean;
  onPrint: () => void;
  onFeed: () => void;
  modeKeys: Array<{ id: CalcDeviceTab; label: string; hint: string }>;
  children: ReactNode;
};

/**
 * Layout desktop — calculadora de bobina (referência HR-100RC).
 * Dimensões fixas: a bobina anima dentro do compartimento superior sem redimensionar o chassi.
 */
export function CalculadoraDeviceDesktopShell({
  tab,
  onTabChange,
  display,
  isPrinting,
  showPaper,
  receiptLines,
  visibleLineCount,
  printEpoch,
  reducedMotion,
  onClear,
  resetDisabled,
  isPrintingBusy,
  onPrint,
  onFeed,
  modeKeys,
  children,
}: Props) {
  const paperStyle: CSSProperties | undefined = showPaper
    ? {
        ["--fm-paper-h" as string]: `${Math.min(
          visibleLineCount * 13 + 8,
          76,
        )}px`,
      }
    : undefined;

  return (
    <div className="fm-calc-device fm-calc-device--desktop">
      <div className="fm-calc-device-body fm-calc-device-body--desktop">
        <div
          className={`fm-calc-printer-bay ${isPrinting ? "fm-calc-printer-bay--printing" : ""}`}
          aria-live="polite"
          aria-busy={isPrinting}
        >
          <div className="fm-calc-printer-rig" aria-hidden>
            <div className="fm-calc-arm-tower fm-calc-arm-tower--left">
              <span className="fm-calc-arm-hook" />
              <span className="fm-calc-arm-shaft" />
            </div>

            <div className="fm-calc-printer-center">
              <div className="fm-calc-roll-housing fm-calc-roll-housing--hr">
                <span className="fm-calc-roll-cylinder" />
                <span className="fm-calc-roll-core" />
              </div>

              <div className="fm-calc-printer-window">
                <div className="fm-calc-printer-window__channel">
                  <div
                    className={`fm-calc-paper-strip fm-calc-paper-strip--hr ${
                      showPaper ? "fm-calc-paper-strip--visible" : ""
                    } ${isPrinting ? "fm-calc-paper-strip--feeding" : ""}`}
                    style={paperStyle}
                  >
                    {receiptLines.slice(0, visibleLineCount).map((line, i) => {
                      const isActiveLine =
                        isPrinting &&
                        i === visibleLineCount - 1 &&
                        !reducedMotion;
                      return (
                        <p
                          key={`${printEpoch}-${i}`}
                          className={`fm-calc-receipt-line fm-calc-receipt-line--hr ${
                            isActiveLine ? "fm-calc-receipt-line--typing" : ""
                          }`}
                        >
                          {line}
                        </p>
                      );
                    })}
                  </div>
                </div>
                <div className="fm-calc-printer-window__glass" />
                <div className="fm-calc-printer-window__lip" />
              </div>

              <div className="fm-calc-print-slot fm-calc-print-slot--hr" />
            </div>

            <div className="fm-calc-arm-tower fm-calc-arm-tower--right">
              <span className="fm-calc-arm-hook" />
              <span className="fm-calc-arm-shaft" />
            </div>
          </div>
        </div>

        <div className="fm-calc-lcd-bezel">
          <div
            className={`fm-calc-lcd fm-calc-lcd--register ${isPrinting ? "fm-calc-lcd--busy" : ""}`}
          >
            <div className="fm-calc-lcd-register-head">
              <span className="fm-calc-brand-plate">FM</span>
              <span className="fm-calc-model-plate">DOSIMETRIA · HR-001</span>
              <div className="fm-calc-led-cluster" aria-hidden>
                <span
                  className={`fm-calc-led ${isPrinting ? "fm-calc-led--print" : "fm-calc-led--pulse"}`}
                />
                <span className="fm-calc-led fm-calc-led--dim" />
                <span
                  className={`fm-calc-led ${isPrinting ? "fm-calc-led--print" : ""}`}
                />
              </div>
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
              <span>{display.modeLabel}</span>
              <span>{display.artigo}</span>
              <span>
                BASE {display.penaBase} · INT {display.penaIntermediaria}
              </span>
              <span className="fm-calc-lcd-register-status">
                {display.statusLine}
              </span>
            </div>
          </div>
        </div>

        <div
          className="fm-calc-fn-row fm-calc-fn-row--desktop"
          role="group"
          aria-label="Funções da impressora"
        >
          <span className="fm-calc-fn-key fm-calc-fn-key--label">TIME</span>
          <span className="fm-calc-fn-key fm-calc-fn-key--label">COST</span>
          <button
            type="button"
            className="fm-calc-fn-key fm-calc-fn-key--prt"
            onClick={onPrint}
            disabled={isPrintingBusy}
          >
            PRT
          </button>
          <button
            type="button"
            className="fm-calc-fn-key"
            onClick={onFeed}
            disabled={isPrintingBusy}
          >
            FEED
          </button>
          <span className="fm-calc-fn-key fm-calc-fn-key--tax">TAX−</span>
          <span className="fm-calc-fn-key fm-calc-fn-key--tax">TAX+</span>
        </div>

        <div className="fm-calc-desktop-split">
          <div className="fm-calc-screen-well fm-calc-screen-well--desktop">
            <div className="fm-calc-screen-inner">{children}</div>
          </div>

          <div className="fm-calc-keypad fm-calc-keypad--desktop">
            <div
              className="fm-calc-keypad-nav"
              role="tablist"
              aria-label="Navegação da calculadora"
            >
              {modeKeys.map(({ id, label, hint }) => {
                const active = tab === id;
                return (
                  <button
                    key={id}
                    type="button"
                    role="tab"
                    aria-selected={active}
                    aria-label={`${hint}${active ? ", ativo" : ""}`}
                    title={hint}
                    onClick={() => onTabChange(id)}
                    className={`fm-calc-key fm-calc-key--nav ${
                      active ? "fm-calc-key--active" : ""
                    }`}
                  >
                    <span className="fm-calc-key__label">{label}</span>
                    <span className="fm-calc-key__hint">{hint}</span>
                  </button>
                );
              })}
            </div>

            <div className="fm-calc-keypad-actions">
              <button
                type="button"
                onClick={onClear}
                disabled={resetDisabled || isPrintingBusy}
                className="fm-calc-key fm-calc-key--clear fm-calc-key--action disabled:opacity-35"
                aria-label="Zerar caso e recolher bobina"
              >
                <span className="fm-calc-key__main">C</span>
                <span className="fm-calc-key__sub">Clear</span>
              </button>
              <button
                type="button"
                onClick={onPrint}
                disabled={isPrintingBusy}
                className={`fm-calc-key fm-calc-key--print-tall fm-calc-key--action ${
                  isPrintingBusy ? "fm-calc-key--printing" : ""
                }`}
                aria-label="Imprimir na bobina"
              >
                <span className="fm-calc-key__main">Print</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      <p className="fm-calc-device-footnote">
        Instrumento didático · sem valor jurídico vinculante
      </p>
    </div>
  );
}
