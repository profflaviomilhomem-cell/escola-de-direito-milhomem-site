/**
 * Gera poster.jpg (frame ~6s) para cada aula com video.mp4 em provas-digitais.
 * Atualiza provas-digitais-manifest.json com paths dos posters.
 *
 * Uso: node scripts/generate-lesson-posters.mjs
 */
import { execSync } from "node:child_process";
import { existsSync, readFileSync, statSync, writeFileSync } from "node:fs";
import { join, resolve } from "node:path";

const ROOT = resolve(process.cwd());
const OUT_DIR = join(ROOT, "public/curso/provas-digitais");
const MANIFEST_PATH = join(ROOT, "src/data/provas-digitais-manifest.json");

function sh(cmd) {
  execSync(cmd, { stdio: "pipe" });
}

const manifest = JSON.parse(readFileSync(MANIFEST_PATH, "utf8"));
let ok = 0;

for (const lesson of manifest.lessons) {
  const dir = join(OUT_DIR, lesson.slug);
  const videoPath = join(dir, "video.mp4");
  const posterPath = join(dir, "poster.jpg");
  if (!existsSync(videoPath)) continue;

  process.stdout.write(`${lesson.slug}… `);
  try {
    const v = videoPath.replace(/'/g, "'\\''");
    const p = posterPath.replace(/'/g, "'\\''");
    sh(
      `ffmpeg -y -hide_banner -loglevel error -ss 00:00:06 -i '${v}' -frames:v 1 -q:v 5 '${p}'`,
    );
    if (existsSync(posterPath) && statSync(posterPath).size > 2048) {
      lesson.video ??= {
        path: `/curso/provas-digitais/${lesson.slug}/video.mp4`,
      };
      lesson.video.poster = {
        path: `/curso/provas-digitais/${lesson.slug}/poster.jpg`,
        bytes: statSync(posterPath).size,
      };
      ok += 1;
      console.log("ok");
    } else {
      console.log("falhou");
    }
  } catch (e) {
    console.log("erro", e.message?.slice(0, 60) ?? e);
  }
}

manifest.importedAt = new Date().toISOString();
writeFileSync(MANIFEST_PATH, JSON.stringify(manifest, null, 2));
console.log(`\nPosters gerados: ${ok}`);
