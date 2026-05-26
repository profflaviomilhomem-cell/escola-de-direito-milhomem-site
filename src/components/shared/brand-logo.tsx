import Image from "next/image";
import { cn } from "@/lib/utils";
import { brandAssets } from "@/config/brand";

export type BrandLogoVariant =
  | "mark"
  | "stacked"
  | "horizontal"
  | "header";

type Props = {
  variant?: BrandLogoVariant;
  className?: string;
  priority?: boolean;
};

const ALT = "Flávio Milhomem — Escola de direito criminal";

/** Dimensões nativas do arquivo do designer */
const LOGO_W = 1024;
const LOGO_H = 1024;

/**
 * Logo oficial — `elementos_marca-13.jpg` sem edição (arquivo original).
 */
export function BrandLogo({
  variant = "mark",
  className,
  priority = false,
}: Props) {
  const src = brandAssets.logo;

  if (variant === "header") {
    return (
      <span
        className={cn("fm-header-logo-wordmark relative inline-block", className)}
      >
        <Image
          src={src}
          alt={ALT}
          width={LOGO_W}
          height={LOGO_H}
          sizes="(max-width: 640px) 42vw, 240px"
          priority={priority}
          className="fm-header-logo-wordmark__img"
        />
      </span>
    );
  }

  if (variant === "stacked") {
    return (
      <span className={cn("fm-footer-logo", className)}>
        <Image
          src={src}
          alt={ALT}
          width={LOGO_W}
          height={LOGO_H}
          priority={priority}
          className="fm-footer-logo__img"
        />
      </span>
    );
  }

  if (variant === "horizontal") {
    return (
      <span className={cn("fm-header-logo-wordmark relative inline-block", className)}>
        <Image
          src={src}
          alt={ALT}
          width={LOGO_W}
          height={LOGO_H}
          priority={priority}
          className="fm-header-logo-wordmark__img"
        />
      </span>
    );
  }

  return (
    <Image
      src={src}
      alt={ALT}
      width={LOGO_W}
      height={LOGO_H}
      priority={priority}
      className={cn(
        "h-12 w-auto max-w-[4.5rem] shrink-0 object-contain object-left sm:h-[3.25rem] sm:max-w-[5rem]",
        className,
      )}
    />
  );
}
