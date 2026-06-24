import Image from "next/image";
import { cn } from "@/lib/utils";
import {
  brandAssets,
  brandLogoDimensions,
  brandLogoVersion,
} from "@/config/brand";

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

/**
 * Logo oficial — monograma do designer (`logo-monogram.png`).
 * Tamanhos visuais vêm do CSS (`.fm-header-logo-wordmark`, `.fm-footer-logo`).
 */
export function BrandLogo({
  variant = "mark",
  className,
  priority = false,
}: Props) {
  const src = brandAssets.logo;
  const { width, height } = brandLogoDimensions.logo;
  const imageKey = `${brandLogoVersion}-${variant}`;

  if (variant === "header") {
    const horizontal = brandLogoDimensions.horizontal;
    return (
      <span
        className={cn("fm-header-logo-wordmark relative inline-block", className)}
      >
        <Image
          key={imageKey}
          src={brandAssets.horizontal}
          alt={ALT}
          width={horizontal.width}
          height={horizontal.height}
          sizes="(max-width: 640px) 56vw, 320px"
          priority={priority}
          unoptimized
          className="fm-header-logo-wordmark__img"
        />
      </span>
    );
  }

  if (variant === "stacked") {
    return (
      <span className={cn("fm-footer-logo", className)}>
        <Image
          key={imageKey}
          src={src}
          alt={ALT}
          width={width}
          height={height}
          priority={priority}
          unoptimized
          className="fm-footer-logo__img"
        />
      </span>
    );
  }

  if (variant === "horizontal") {
    const horizontal = brandLogoDimensions.horizontal;
    return (
      <span className={cn("fm-header-logo-wordmark relative inline-block", className)}>
        <Image
          key={imageKey}
          src={brandAssets.horizontal}
          alt={ALT}
          width={horizontal.width}
          height={horizontal.height}
          priority={priority}
          unoptimized
          className="fm-header-logo-wordmark__img"
        />
      </span>
    );
  }

  return (
    <Image
      key={imageKey}
      src={src}
      alt={ALT}
      width={width}
      height={height}
      priority={priority}
      unoptimized
      className={cn(
        "h-12 w-auto max-w-[4.5rem] shrink-0 object-contain object-left sm:h-[3.25rem] sm:max-w-[5rem]",
        className,
      )}
    />
  );
}
