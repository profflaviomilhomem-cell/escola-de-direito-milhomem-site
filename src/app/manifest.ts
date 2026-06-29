import type { MetadataRoute } from "next";

import { brandIcons } from "@/config/brand";
import { siteConfig } from "@/config/site";

/** Web App Manifest — ícones oficiais da marca (símbolo da ponte). */
export default function manifest(): MetadataRoute.Manifest {
  return {
    name: siteConfig.name,
    short_name: siteConfig.shortName,
    description: siteConfig.description,
    start_url: "/",
    display: "standalone",
    background_color: "#030024",
    theme_color: "#030024",
    icons: [
      {
        src: brandIcons.favicon32,
        sizes: "32x32",
        type: "image/png",
      },
      {
        src: brandIcons.pwa192,
        sizes: "192x192",
        type: "image/png",
        purpose: "any",
      },
      {
        src: brandIcons.pwa512,
        sizes: "512x512",
        type: "image/png",
        purpose: "any",
      },
      {
        src: brandIcons.appleTouch,
        sizes: "180x180",
        type: "image/png",
        purpose: "any",
      },
    ],
  };
}
