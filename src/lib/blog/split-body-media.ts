/**
 * Extrai embeds de vídeo (YouTube) do HTML migrado do WordPress
 * para exibir antes do corpo do artigo.
 */
const YOUTUBE_FIGURE_RE =
  /<figure\b[^>]*(?:wp-block-embed|is-provider-youtube|youtube)[^>]*>[\s\S]*?<\/figure>/gi;

const YOUTUBE_IFRAME_FIGURE_RE =
  /<figure\b[^>]*>[\s\S]*?<iframe\b[^>]*(?:youtube\.com|youtu\.be)[^>]*>[\s\S]*?<\/figure>/gi;

function isYoutubeEmbed(html: string) {
  return /youtube\.com|youtu\.be/i.test(html);
}

function cleanBodyHtml(html: string) {
  return html
    .replace(/<p>\s*<\/p>/gi, "")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

export function splitBlogLeadVideo(html: string): {
  leadMedia: string[];
  bodyHtml: string;
} {
  const leadMedia: string[] = [];
  const seen = new Set<string>();

  const collect = (match: string) => {
    const normalized = match.trim();
    if (!isYoutubeEmbed(normalized) || seen.has(normalized)) return "";
    seen.add(normalized);
    leadMedia.push(normalized);
    return "";
  };

  let bodyHtml = html;

  bodyHtml = bodyHtml.replace(YOUTUBE_FIGURE_RE, collect);
  bodyHtml = bodyHtml.replace(YOUTUBE_IFRAME_FIGURE_RE, collect);

  return {
    leadMedia,
    bodyHtml: cleanBodyHtml(bodyHtml),
  };
}
