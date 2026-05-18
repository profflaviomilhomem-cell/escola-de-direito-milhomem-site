import { splitBlogLeadVideo } from "@/lib/blog/split-body-media";

export function bodyLooksLikeHtml(body: string) {
  return /<\s*(p|div|h[1-6]|figure|ul|ol|blockquote|section|hr)\b/i.test(
    body.trim().slice(0, 4000),
  );
}

export function hasBlogLeadVideo(body: string) {
  return splitBlogLeadVideo(body).leadMedia.length > 0;
}
