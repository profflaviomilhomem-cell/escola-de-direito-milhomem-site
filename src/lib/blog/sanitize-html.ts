import sanitizeHtml from "sanitize-html";

/**
 * Saneamento do HTML de artigos (migrados do WordPress ou compostos no editor).
 * Defesa em profundidade: mesmo que o conteúdo venha de um autor confiável
 * (admin), passamos por um allowlist antes de qualquer `dangerouslySetInnerHTML`
 * para que um post comprometido não injete script/handler no leitor público.
 *
 * Preserva o essencial da prosa jurídica + embeds de vídeo do YouTube/Vimeo.
 */

const ALLOWED_IFRAME_HOSTS = [
  "www.youtube.com",
  "youtube.com",
  "www.youtube-nocookie.com",
  "youtube-nocookie.com",
  "player.vimeo.com",
];

const OPTIONS: sanitizeHtml.IOptions = {
  allowedTags: sanitizeHtml.defaults.allowedTags.concat([
    "img",
    "figure",
    "figcaption",
    "iframe",
    "h1",
    "h2",
    "u",
    "s",
    "span",
  ]),
  allowedAttributes: {
    a: ["href", "name", "target", "rel"],
    img: ["src", "alt", "title", "width", "height", "loading"],
    iframe: [
      "src",
      "width",
      "height",
      "allow",
      "allowfullscreen",
      "frameborder",
      "title",
      "loading",
      "referrerpolicy",
    ],
    // `class` é seguro e alguns seletores de estilo dependem dela
    // (ex.: `.wp-block-embed__wrapper`). `style` inline fica de fora de
    // propósito — o layout já normaliza dimensões via CSS.
    "*": ["class", "id"],
  },
  allowedSchemes: ["http", "https", "mailto"],
  allowedIframeHostnames: ALLOWED_IFRAME_HOSTS,
  allowIframeRelativeUrls: false,
  // Reforça rel de segurança em links que abrem nova aba.
  transformTags: {
    a: (tagName, attribs) => {
      if (attribs.target === "_blank") {
        attribs.rel = "noopener noreferrer";
      }
      return { tagName, attribs };
    },
  },
};

/** Saneia HTML de artigo do blog antes de renderizar como innerHTML. */
export function sanitizeBlogHtml(dirty: string): string {
  return sanitizeHtml(dirty, OPTIONS);
}
