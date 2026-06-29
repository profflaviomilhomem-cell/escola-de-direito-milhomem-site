"use client";

import { useEffect, useId, type ReactNode } from "react";
import { createPortal } from "react-dom";
import { DocumentoDidaticoWatermark } from "./documento-didatico-watermark";

type CalculadoraPaperCloseupProps = {
  open: boolean;
  onClose: () => void;
  title?: string;
  subtitle?: string;
  children: ReactNode;
};

/**
 * Folha de papel ampliada — “sai” da calculadora para leitura confortável do manuscrito.
 */
export function CalculadoraPaperCloseup({
  open,
  onClose,
  title = "Manuscrito da sentença",
  subtitle,
  children,
}: CalculadoraPaperCloseupProps) {
  const titleId = useId();

  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = prev;
      window.removeEventListener("keydown", onKey);
    };
  }, [open, onClose]);

  if (!open || typeof document === "undefined") return null;

  return createPortal(
    <div className="fm-calc-paper-closeup-root" role="presentation">
      <button
        type="button"
        className="fm-calc-paper-closeup-backdrop"
        aria-label="Fechar leitura ampliada"
        onClick={onClose}
      />
      <div
        className="fm-calc-paper-closeup"
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
      >
        <div className="fm-calc-paper-closeup__tape" aria-hidden>
          <span className="fm-calc-paper-closeup__tape-edge" />
        </div>
        <div className="fm-calc-paper-closeup__sheet fm-paper-kraft">
          <DocumentoDidaticoWatermark />
          <div className="fm-calc-paper-closeup__header">
            <div>
              <p id={titleId} className="fm-calc-paper-closeup__title">
                {title}
              </p>
              {subtitle ? (
                <p className="fm-calc-paper-closeup__subtitle">{subtitle}</p>
              ) : null}
            </div>
            <button
              type="button"
              className="fm-calc-paper-closeup__close"
              onClick={onClose}
            >
              Fechar
            </button>
          </div>
          <div className="fm-calc-paper-closeup__body">{children}</div>
        </div>
      </div>
    </div>,
    document.body,
  );
}
