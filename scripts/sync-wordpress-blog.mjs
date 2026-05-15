/**
 * Sincroniza posts do WordPress do cliente para `src/data/migrated-posts.json`.
 * Fonte: REST API (mesmo conteúdo, datas e imagens do site em produção).
 *
 * Uso: `npm run sync:blog`
 *
 * Depois de sincronizar, se quiseres imagens só no vosso hosting (sem
 * depender do site WordPress): `npm run mirror:blog-images`
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const OUT = path.join(__dirname, "../src/data/migrated-posts.json");
const BASE =
  "https://professorflaviomilhomem.com.br/wp-json/wp/v2/posts";
const PER_PAGE = 50;

function stripHtml(html) {
  if (!html) return "";
  return html
    .replace(/<[^>]+>/g, " ")
    .replace(/\s+/g, " ")
    .replace(/\s+([.,;:!?])/g, "$1")
    .trim();
}

function decodeBasicEntities(text) {
  return text
    .replace(/&#(\d+);/g, (_, n) => String.fromCharCode(Number(n)))
    .replace(/&#x([0-9a-fA-F]+);/g, (_, h) =>
      String.fromCharCode(parseInt(h, 16)),
    )
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#039;/g, "'")
    .replace(/&hellip;/g, "…");
}

function featuredUrl(post) {
  const fm = post._embedded?.["wp:featuredmedia"]?.[0];
  if (fm?.source_url) return fm.source_url;
  return post.yoast_head_json?.og_image?.[0]?.url ?? undefined;
}

function tagsFrom(post) {
  const terms = post._embedded?.["wp:term"];
  if (!terms?.length) return [];
  const tagGroup = terms.find((g) => g?.[0]?.taxonomy === "post_tag");
  return tagGroup?.map((t) => t.name).filter(Boolean) ?? [];
}

function primaryCategory(post) {
  const terms = post._embedded?.["wp:term"];
  if (!terms?.length) return "GERAL";
  const catGroup = terms.find((g) => g?.[0]?.taxonomy === "category");
  if (!catGroup?.length) return "GERAL";
  return catGroup[0].name;
}

function readingMinutes(html) {
  const text = stripHtml(html);
  const words = text.split(/\s+/).filter(Boolean).length;
  return Math.max(1, Math.ceil(words / 200));
}

function authorBlock(post) {
  const a = post._embedded?.author?.[0];
  return {
    name: a?.name ?? "Flávio Milhomem",
    avatarSrc:
      a?.avatar_urls?.["96"] ??
      a?.avatar_urls?.["48"] ??
      "/images/professor/flavio-avatar-64.jpg",
    role: "Professor de Direito Criminal",
  };
}

async function fetchPage(page) {
  const url = new URL(BASE);
  url.searchParams.set("status", "publish");
  url.searchParams.set("per_page", String(PER_PAGE));
  url.searchParams.set("page", String(page));
  url.searchParams.set("_embed", "wp:featuredmedia,wp:term,author");

  const res = await fetch(url);
  if (res.status === 400) return [];
  if (!res.ok) {
    const t = await res.text();
    throw new Error(`WP ${res.status}: ${t.slice(0, 400)}`);
  }
  return res.json();
}

async function fetchAll() {
  const all = [];
  for (let page = 1; page < 200; page++) {
    const batch = await fetchPage(page);
    if (!batch.length) break;
    all.push(...batch);
    if (batch.length < PER_PAGE) break;
  }
  return all;
}

function mapPost(p) {
  const excerptRaw = stripHtml(p.excerpt?.rendered ?? "");
  const excerpt =
    excerptRaw ||
    `${stripHtml(p.content?.rendered ?? "").slice(0, 280).trim()}…`;

  return {
    slug: p.slug,
    title: decodeBasicEntities(
      (p.title?.rendered ?? p.slug).replace(/<[^>]+>/g, ""),
    ),
    excerpt: decodeBasicEntities(excerpt),
    body: p.content?.rendered ?? "",
    publishedAt: p.date,
    category: primaryCategory(p),
    author: authorBlock(p),
    cover: { from: "#030024", to: "#0c0a38" },
    coverImage: featuredUrl(p),
    readingMin: readingMinutes(p.content?.rendered ?? ""),
    tags: tagsFrom(p).length ? tagsFrom(p) : ["Blog"],
  };
}

async function main() {
  const raw = await fetchAll();
  raw.sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime(),
  );
  const posts = raw.map(mapPost);
  fs.mkdirSync(path.dirname(OUT), { recursive: true });
  fs.writeFileSync(OUT, JSON.stringify(posts, null, 2), "utf8");
  console.log(`Escritos ${posts.length} artigos em ${OUT}`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
