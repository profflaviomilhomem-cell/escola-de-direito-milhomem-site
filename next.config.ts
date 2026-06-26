import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  allowedDevOrigins: ["127.0.0.1", "localhost", "*.trycloudflare.com"],
  /** Declaração vazia: o projeto usa `webpack()` para dev; o build precisa
   *  deste campo para o Next 16 (Turbopack por defeito) não abortar. */
  turbopack: {},
  /** O curso único da Edição Lançamento vive no slug do produto;
   *  308 no nível de config para preservar o SEO do endereço antigo. */
  async redirects() {
    return [
      {
        source: "/cursos/edicao-lancamento",
        destination: "/cursos/prova-digital-no-processo-penal",
        permanent: true,
      },
    ];
  },
  images: {
    remotePatterns: [
      // Foto institucional placeholder do mockup — substituir por
      // foto profissional do Flávio em /public quando disponível.
      { protocol: "https", hostname: "images.unsplash.com" },
      // Capas dos livros (catálogo Martins Fontes / VTEX).
      {
        protocol: "https",
        hostname: "martinsfontespaulista.vteximg.com.br",
        pathname: "/arquivos/**",
      },
      // Imagens do blog migrado ficam em /public/blog-migrated (ver `npm run mirror:blog-images`).
    ],
  },
  /** Em dev com Webpack, compilação on-demand pode demorar — o default de
   *  timeout de chunk às vezes falha ao carregar `app/error.js` ou rotas
   *  dinâmicas (ChunkLoadError). Aumentar só no cliente em modo dev. */
  webpack: (config, { dev, isServer }) => {
    if (dev && !isServer && config.output) {
      config.output = {
        ...config.output,
        chunkLoadTimeout: 300_000,
      };
    }
    return config;
  },
};

export default nextConfig;
