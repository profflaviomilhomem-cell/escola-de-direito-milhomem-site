/**
 * Descarrega imagens do WordPress antigo para `public/blog-migrated/`
 * e reescreve `src/data/migrated-posts.json` para usar só URLs locais
 * (`/blog-migrated/wp-content/uploads/...`).
 *
 * Assim o site novo não depende do domínio original continuar online.
 *
 * Uso (após `npm run sync:blog` se regenerares o JSON):
 *   npm run mirror:blog-images
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const JSON_PATH = path.join(__dirname, "../src/data/migrated-posts.json");
const PUBLIC_ROOT = path.join(__dirname, "../public/blog-migrated");
const CANON_HOST = "professorflaviomilhomem.com.br";

function isOurHost(hostname) {
  const h = hostname.replace(/^www\./i, "").toLowerCase();
  return h === CANON_HOST;
}

function absoluteUrl(raw) {
  const t = String(raw).trim().split(/\s+/)[0];
  if (!t) return null;
  try {
    const u = new URL(t);
    if (!isOurHost(u.hostname)) return null;
    u.protocol = "https:";
    u.hostname = CANON_HOST;
    u.hash = "";
    return u.href;
  } catch {
    return null;
  }
}

/** Caminho público começando em /blog-migrated + pathname do WP */
function urlToPublicHref(absolute) {
  const u = new URL(absolute);
  const rel = u.pathname.replace(/^\/+/, "");
  return `/blog-migrated/${rel}`;
}

function urlToDiskPath(absolute) {
  const u = new URL(absolute);
  const rel = u.pathname.replace(/^\/+/, "");
  return path.join(PUBLIC_ROOT, rel);
}

function collectUrls(posts) {
  const urls = new Set();
  const imgRe = /<img[^>]+src=["']([^"']+)["']/gi;
  /** Qualquer URL de media do WP no HTML (fallback; não pode incluir vírgulas de srcset) */
  const wpMediaRe =
    /https:\/\/(?:www\.)?professorflaviomilhomem\.com\.br(\/wp-content\/uploads\/[^"'\\s>,]+)/gi;

  for (const p of posts) {
    if (p.coverImage) {
      const a = absoluteUrl(p.coverImage);
      if (a) urls.add(a);
    }
    const av = p.author?.avatarSrc;
    if (av) {
      const a = absoluteUrl(av);
      if (a) urls.add(a);
    }
    if (typeof p.body === "string") {
      let m;
      imgRe.lastIndex = 0;
      while ((m = imgRe.exec(p.body)) !== null) {
        const a = absoluteUrl(m[1]);
        if (a) urls.add(a);
      }
      const srcsetRe = /srcset=["']([^"']+)["']/gi;
      while ((m = srcsetRe.exec(p.body)) !== null) {
        const parts = m[1].split(",").map((s) => s.trim().split(/\s+/)[0]);
        for (const part of parts) {
          const a = absoluteUrl(part);
          if (a) urls.add(a);
        }
      }
      wpMediaRe.lastIndex = 0;
      while ((m = wpMediaRe.exec(p.body)) !== null) {
        const a = absoluteUrl(`https://${CANON_HOST}${m[1]}`);
        if (a) urls.add(a);
      }
    }
  }
  return urls;
}

async function downloadOne(url) {
  const dest = urlToDiskPath(url);
  if (fs.existsSync(dest)) {
    const st = fs.statSync(dest);
    if (st.size > 0) return;
  }
  fs.mkdirSync(path.dirname(dest), { recursive: true });
  const res = await fetch(url, { redirect: "follow" });
  if (!res.ok) {
    throw new Error(`Falha ${res.status} ao obter ${url}`);
  }
  const buf = Buffer.from(await res.arrayBuffer());
  fs.writeFileSync(dest, buf);
}

function rewriteBody(body, replacements) {
  if (typeof body !== "string") return body;
  const pairs = [];
  for (const [canon, local] of replacements) {
    const u = new URL(canon);
    const pq = u.pathname + u.search;
    for (const base of [
      `https://${CANON_HOST}`,
      `https://www.${CANON_HOST}`,
      `http://${CANON_HOST}`,
      `http://www.${CANON_HOST}`,
    ]) {
      pairs.push([base + pq, local]);
    }
  }
  pairs.sort((a, b) => b[0].length - a[0].length);
  let out = body;
  for (const [from, to] of pairs) {
    out = out.split(from).join(to);
  }
  return out;
}

async function main() {
  const raw = fs.readFileSync(JSON_PATH, "utf8");
  const posts = JSON.parse(raw);
  const urls = collectUrls(posts);

  console.log(`${urls.size} URLs de imagem a espelhar…`);

  const urlToLocal = new Map();
  for (const u of urls) {
    urlToLocal.set(u, urlToPublicHref(u));
  }

  let n = 0;
  for (const u of urls) {
    n += 1;
    process.stdout.write(`[${n}/${urls.size}] ${u.slice(0, 72)}…\n`);
    await downloadOne(u);
  }

  const next = posts.map((p) => {
    const copy = { ...p };
    if (p.coverImage) {
      const a = absoluteUrl(p.coverImage);
      if (a && urlToLocal.has(a)) copy.coverImage = urlToLocal.get(a);
    }
    if (p.author?.avatarSrc) {
      const a = absoluteUrl(p.author.avatarSrc);
      if (a && urlToLocal.has(a)) {
        copy.author = { ...p.author, avatarSrc: urlToLocal.get(a) };
      }
    }
    copy.body = rewriteBody(p.body, urlToLocal);
    return copy;
  });

  fs.writeFileSync(JSON_PATH, JSON.stringify(next, null, 2), "utf8");
  console.log(`Atualizado ${JSON_PATH} com caminhos locais.`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
