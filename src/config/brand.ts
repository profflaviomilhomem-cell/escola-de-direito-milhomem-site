/**
 * Logo oficial — monograma entregue pelo design (PNG transparente).
 * `brandLogoVersion` força novo URL quando o asset muda (evita cache do
 * `next/image` com `priority` no header).
 */
export const brandLogoVersion = "bb5b51c1" as const;

const logoMonogramPath = "/images/brand/logo-monogram-2026-05.png" as const;

export const brandAssets = {
  logo: logoMonogramPath,
  mark: logoMonogramPath,
  headerCircleDark: logoMonogramPath,
  headerCircleLight: logoMonogramPath,
  headerDark: logoMonogramPath,
  headerLight: logoMonogramPath,
  horizontal: logoMonogramPath,
  stackedGold: logoMonogramPath,
  stackedPrimary: logoMonogramPath,
} as const;

export const brandIcons = {
  favicon32: "/icons/icon-32.png",
  appleTouch: "/icons/apple-touch-icon.png",
  pwa192: "/icons/icon-192.png",
  pwa512: "/icons/icon-512.png",
} as const;

/** Proporções nativas do PNG do designer (px). */
export const brandLogoDimensions = {
  logo: { width: 737, height: 413 },
} as const;
