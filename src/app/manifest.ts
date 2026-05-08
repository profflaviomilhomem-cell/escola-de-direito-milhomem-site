import type { MetadataRoute } from "next";

import { siteConfig } from "@/config/site";

/**
 * Web App Manifest — pré-requisito para PWA (Seção 3.13 do guia).
 *
 * Cores e ícones alinhados ao Design System navy/mostarda. Ícones
 * 192/512 são servidos pelos files `app/icon.tsx` (Next gera as URLs
 * com hash automaticamente quando o cliente solicitar). Apple touch
 * vem de `app/apple-icon.tsx`. Quando o logo final do designer for
 * entregue, basta substituir os componentes ImageResponse por PNGs
 * estáticos em `/public/icons/` e atualizar este array.
 */
export default function manifest(): MetadataRoute.Manifest {
  return {
    name: siteConfig.name,
    short_name: siteConfig.shortName,
    description: siteConfig.description,
    start_url: "/",
    display: "standalone",
    background_color: "#06172F",
    theme_color: "#06172F",
    icons: [
      {
        src: "/icon",
        sizes: "32x32",
        type: "image/png",
      },
      {
        src: "/apple-icon",
        sizes: "180x180",
        type: "image/png",
        purpose: "any",
      },
    ],
  };
}
