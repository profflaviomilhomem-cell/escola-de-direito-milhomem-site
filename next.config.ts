import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      // Foto institucional placeholder do mockup — substituir por
      // foto profissional do Flávio em /public quando disponível.
      { protocol: "https", hostname: "images.unsplash.com" },
      // Imagens do blog migrado ficam em /public/blog-migrated (ver `npm run mirror:blog-images`).
    ],
  },
};

export default nextConfig;
