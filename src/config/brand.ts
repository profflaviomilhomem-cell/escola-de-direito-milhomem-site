/**
 * Logo oficial — monograma entregue pelo design (PNG transparente).
 * `brandLogoVersion` força novo URL quando o asset muda (evita cache do
 * `next/image` com `priority` no header).
 */
export const brandLogoVersion = "c4d9e7a2" as const;

const logoMonogramPath = "/images/brand/logo-monogram-2026-05.png" as const;
/**
 * Logo horizontal (símbolo + wordmark) em branco/amarelo para o header escuro
 * (`bg-carbon`). Recorte sem margens do `logo-header-white-yellow.png`.
 */
const logoHorizontalHeaderPath =
  "/images/brand/logo-header-white-yellow-trim.png" as const;

export const brandAssets = {
  logo: logoMonogramPath,
  mark: logoMonogramPath,
  headerCircleDark: logoMonogramPath,
  headerCircleLight: logoMonogramPath,
  headerDark: logoMonogramPath,
  headerLight: logoMonogramPath,
  horizontal: logoHorizontalHeaderPath,
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
  horizontal: { width: 1555, height: 430 },
} as const;
