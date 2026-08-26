import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  allowedDevOrigins: ["127.0.0.1", "localhost", "*.trycloudflare.com"],
  /** Declaração vazia: o projeto usa `webpack()` para dev; o build precisa
   *  deste campo para o Next 16 (Turbopack por defeito) não abortar. */
  turbopack: {},
  /** O curso único da Edição Lançamento vive no slug do produto;
   *  308 no nível de config para preservar o SEO do endereço antigo. */
  /**
   * Security headers das rotas de API.
   *
   * O `matcher` do `proxy.ts` exclui `api` de propósito — o proxy existe para
   * guardar página, e rodá-lo em toda chamada de API custaria latência e
   * arriscaria o webhook do Pagar.me. A consequência, medida em produção em
   * 26/08/2026: **nenhuma rota `/api/*` recebia security header**, nem o
   * `nosniff`. Só chegava o HSTS que a própria Vercel injeta.
   *
   * A rota do material pago já se protegia sozinha (manda `nosniff` e
   * `Content-Disposition: attachment` no próprio handler). O resto devolve JSON,
   * e JSON sem `nosniff` é o caso clássico de conteúdo interpretado como outra
   * coisa pelo browser.
   *
   * Isto cobre a lacuna sem passar pelo proxy: são headers de resposta
   * aplicados pela plataforma, sem código rodando por requisição.
   *
   * `X-Frame-Options: DENY` aqui é mais estrito do que o `SAMEORIGIN` das
   * páginas, de propósito — resposta de API não tem por que ser enquadrada,
   * nem pelo próprio site.
   */
  async headers() {
    return [
      {
        source: "/api/:path*",
        headers: [
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "X-Frame-Options", value: "DENY" },
          { key: "Referrer-Policy", value: "no-referrer" },
        ],
      },
    ];
  },

  async redirects() {
    return [
      // 24/08/2026 — as duas iscas gratuitas foram CANCELADAS pelo Flávio
      // ("quero suprimir estas 03 entregas gratuitas; num segundo lançamento
      // posso produzir o material"). As páginas prometiam um PDF que nunca
      // existiu — a tabela LeadMagnet sempre esteve vazia. Os três endereços
      // estiveram no sitemap e podem estar indexados, então seguem
      // redirecionando para o quiz, que é a isca a partir de agora.
      {
        source: "/materiais",
        destination: "/quiz-penal",
        permanent: true,
      },
      {
        source: "/materiais/:slug",
        destination: "/quiz-penal",
        permanent: true,
      },
      {
        source: "/cursos/edicao-lancamento",
        destination: "/cursos/prova-digital-no-processo-penal",
        permanent: true,
      },
      {
        // O Livro-Guia (cap. 7.3) especifica o endereço COM o recorte
        // geográfico — é a única página local da estratégia de SEO no DF, e
        // publicá-la sem "brasilia" descartava justamente o sinal que ela
        // existia para carregar. O endereço antigo esteve no ar, então segue
        // redirecionando.
        source: "/eventos/dia-do-advogado-2026",
        destination: "/eventos/dia-do-advogado-2026-brasilia",
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
