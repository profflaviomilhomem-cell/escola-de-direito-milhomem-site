import { siteConfig } from "@/config/site";

/**
 * robots.txt servido por rota, não por arquivo estático.
 *
 * Era `public/robots.txt`, com a linha do `Sitemap:` fixa em
 * `professorflaviomilhomem.com.br`. Enquanto o domínio definitivo ainda
 * hospeda o site WordPress antigo, essa linha apontava os buscadores para
 * um sitemap que não é o deste site — enquanto `canonical` e `sitemap.xml`
 * já seguiam `NEXT_PUBLIC_SITE_URL`. Ficavam três fontes discordando.
 *
 * Aqui o host sai de `siteConfig.url` (a mesma origem do canonical e do
 * sitemap), então trocar a env no dia do apontamento basta — não há mais
 * arquivo para lembrar de editar à mão.
 *
 * O texto abaixo é o conteúdo curado em 07/mai/2026, preservado na íntegra
 * (incluindo comentários, que a convenção `MetadataRoute.Robots` do Next
 * não permite emitir).
 */
export const dynamic = "force-static";

export function GET(): Response {
  const body = `# Escola Flávio Milhomem — robots.txt
# Última revisão: 07/mai/2026

# === Bots de busca tradicional — permitidos ===
User-agent: Googlebot
Allow: /

User-agent: Bingbot
Allow: /

User-agent: DuckDuckBot
Allow: /

User-agent: YandexBot
Allow: /

# === Bots de IA generativa de uso legítimo — permitidos ===
User-agent: GPTBot
Allow: /

User-agent: ChatGPT-User
Allow: /

User-agent: OAI-SearchBot
Allow: /

User-agent: ClaudeBot
Allow: /

User-agent: Claude-Web
Allow: /

User-agent: Claude-SearchBot
Allow: /

User-agent: PerplexityBot
Allow: /

User-agent: Perplexity-User
Allow: /

User-agent: Google-Extended
Allow: /

User-agent: Applebot-Extended
Allow: /

User-agent: cohere-ai
Allow: /

User-agent: Meta-ExternalAgent
Allow: /

User-agent: Bytespider
Allow: /

# === Bots e scrapers conhecidos por uso predatório — bloqueados ===
User-agent: CCBot
Disallow: /

User-agent: DataForSeoBot
Disallow: /

User-agent: SemrushBot
Disallow: /

User-agent: AhrefsBot
Disallow: /

User-agent: MJ12bot
Disallow: /

User-agent: dotbot
Disallow: /

# === Áreas privadas — bloqueio universal ===
User-agent: *
Disallow: /admin/
Disallow: /api/
Disallow: /aluno/
Disallow: /checkout/
Disallow: /sucesso/
Disallow: /obrigado/
Disallow: /webhook/
Disallow: /*?utm_

# === Sitemap ===
Sitemap: ${siteConfig.url}/sitemap.xml
`;

  return new Response(body, {
    headers: { "Content-Type": "text/plain; charset=utf-8" },
  });
}
