import {
  forwardRef,
  useId,
  type ComponentPropsWithoutRef,
} from "react";

type Props = Omit<ComponentPropsWithoutRef<"input">, "id" | "placeholder"> & {
  label: string;
  error?: string;
};

/**
 * Input com label flutuante (padrão "tela de login Netflix").
 *
 * Em estado vazio, a label senta no centro vertical do campo, parecendo
 * placeholder. Ao focar OU quando o campo tem valor, ela sobe pro topo
 * em tamanho menor — usando `peer` + `peer-focus`/`peer-[:not(:placeholder-shown)]`
 * pra evitar lógica de estado em React.
 *
 * Usa `ref` forwarding para integrar com `react-hook-form`.
 */
export const FloatingInput = forwardRef<HTMLInputElement, Props>(
  function FloatingInput({ label, error, className, type, ...rest }, ref) {
    const id = useId();
    const errorId = error ? `${id}-error` : undefined;
    return (
      <div className="relative">
        <input
          {...rest}
          id={id}
          ref={ref}
          type={type ?? "text"}
          /* Necessário para o seletor `peer-[:not(:placeholder-shown)]`:
             mantemos um placeholder não-vazio (espaço) para que o input
             nunca fique "placeholder-shown" quando preenchido. */
          placeholder=" "
          aria-invalid={Boolean(error) || undefined}
          aria-describedby={errorId}
          className={`peer border-paper-200 focus:border-amber bg-carbon-elevated/80 text-paper w-full border px-4 pb-2 pt-6 text-sm outline-none transition-colors ${
            error ? "border-alerta-400" : ""
          } ${className ?? ""}`}
        />
        <label
          htmlFor={id}
          className="text-paper-600 peer-focus:text-amber peer-focus:top-2 peer-focus:text-[10px] peer-focus:tracking-[0.2em] peer-focus:uppercase peer-[:not(:placeholder-shown)]:top-2 peer-[:not(:placeholder-shown)]:text-[10px] peer-[:not(:placeholder-shown)]:tracking-[0.2em] peer-[:not(:placeholder-shown)]:uppercase pointer-events-none absolute left-4 top-4 text-sm transition-all duration-150"
        >
          {label}
        </label>
        {error && (
          <p
            id={errorId}
            role="alert"
            className="text-alerta-400 mt-1 text-xs"
          >
            {error}
          </p>
        )}
      </div>
    );
  },
);
