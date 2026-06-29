import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";

type Props = {
  /** Valor da barra 0–100 (shadcn Progress). */
  value: number;
  /** Texto editorial acima da barra; se omitido, só a barra é renderizada. */
  label?: string;
  /** Classes extras no `<p>` do rótulo (ex.: hero sem uppercase denso). */
  labelClassName?: string;
  className?: string;
  barClassName?: string;
};

const defaultLabelClass =
  "fm-mono text-paper-600 text-[10px] tracking-[0.16em] uppercase";

/**
 * Padrão institucional — rótulo mono + barra shadcn.
 * Usado em hero do curso, listagem de cursos, certificados, módulos, etc.
 */
export function LabeledProgress({
  value,
  label,
  labelClassName,
  className,
  barClassName,
}: Props) {
  const bar = (
    <Progress
      value={value}
      className={cn("bg-paper-200 h-1.5", barClassName, !label && className)}
    />
  );

  if (!label) {
    return bar;
  }

  return (
    <div className={cn("space-y-2", className)}>
      <p className={cn(defaultLabelClass, labelClassName)}>{label}</p>
      {bar}
    </div>
  );
}
