import type { MetadataRoute } from "next";

import { siteConfig } from "@/config/site";

/**
 * Web App Manifest — pré-requisito para PWA (Seção 3.13 do guia).
 */
export default function manifest(): MetadataRoute.Manifest {
  return {
    name: siteConfig.name,
    short_name: siteConfig.shortName,
    description: siteConfig.description,
    start_url: "/",
    display: "standalone",
    background_color: "#fafaf7",
    theme_color: "#2a4485",
    icons: [
      // TODO: gerar ícones em /public/icons após decisão de marca.
      // { src: "/icons/icon-192.png", sizes: "192x192", type: "image/png" },
      // { src: "/icons/icon-512.png", sizes: "512x512", type: "image/png" },
    ],
  };
}
