import { copy } from "@/config/copy";

type Props = {
  variant?: "compact" | "full";
  className?: string;
};

/** Aviso de separação entre Escola (privada) e função institucional. */
export function InstitutionalNotice({
  variant = "compact",
  className = "",
}: Props) {
  const text =
    variant === "full"
      ? `${copy.legal.marketingFootnote} ${copy.legal.sobreEscola}`
      : copy.legal.marketingFootnote;

  return (
    <p
      className={`text-paper-600 font-mono text-[10px] leading-relaxed tracking-[0.06em] ${className}`}
    >
      {text}
    </p>
  );
}
