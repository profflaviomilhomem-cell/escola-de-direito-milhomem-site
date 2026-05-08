type Props = {
  /** 0 a 1 */
  value: number;
  size?: "sm" | "md";
  showLabel?: boolean;
  /** Texto à direita da barra (ex.: "3 de 12 aulas"). */
  label?: string;
};

/**
 * Barra de progresso institucional.
 * - Trilha cream a 12%, preenchimento mostarda.
 * - Sem animação de "shimmer" — discreta a propósito.
 */
export function ProgressBar({
  value,
  size = "md",
  showLabel = false,
  label,
}: Props) {
  const pct = Math.max(0, Math.min(1, value)) * 100;
  const heightClass = size === "sm" ? "h-[3px]" : "h-1";

  return (
    <div
      className={
        showLabel || label
          ? "flex items-center gap-3"
          : "block"
      }
    >
      <div
        className={`bg-paper-200 relative ${heightClass} flex-1 overflow-hidden`}
        role="progressbar"
        aria-valuenow={Math.round(pct)}
        aria-valuemin={0}
        aria-valuemax={100}
      >
        <span
          className="bg-amber absolute inset-y-0 left-0 transition-all duration-500"
          style={{ width: `${pct}%` }}
        />
      </div>
      {(showLabel || label) && (
        <span className="fm-mono text-paper-600 whitespace-nowrap">
          {label ?? `${Math.round(pct)}%`}
        </span>
      )}
    </div>
  );
}
