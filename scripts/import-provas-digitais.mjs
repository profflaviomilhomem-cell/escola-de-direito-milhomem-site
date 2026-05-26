/**
 * Extrai vídeos editados e slides dos ZIPs em public/curso/milhomem
 * para public/curso/provas-digitais/aula-XX/{video.mp4,slides.pptx}
 *
 * Uso: node scripts/import-provas-digitais.mjs
 */
import { execSync } from "node:child_process";
import {
  copyFileSync,
  existsSync,
  mkdirSync,
  readdirSync,
  renameSync,
  rmSync,
  statSync,
  writeFileSync,
} from "node:fs";
import { basename, join, resolve } from "node:path";

const ROOT = resolve(process.cwd());
const SOURCE_DIR = join(ROOT, "public/curso/milhomem");
const OUT_DIR = join(ROOT, "public/curso/provas-digitais");
const MANIFEST_PATH = join(ROOT, "src/data/provas-digitais-manifest.json");

/** Curso publicado com 10 aulas (11–13 não entram no programa). */
const LESSON_COUNT = 10;

/** Títulos editoriais — conferir com o professor após import. */
const LESSON_TITLES = {
  1: "Introdução à prova digital e cadeia de custódia",
  2: "Cadeia de custódia — reconhecimento, isolamento e fixação",
  3: "Coleta, acondicionamento e transporte da prova",
  4: "Laudo pericial e integridade (hash)",
  5: "Prova digital no CPP pós-Lei 13.964/2019",
  6: "Mensagens, prints e metadados",
  7: "WhatsApp e aplicativos de mensagem",
  8: "Interceptação e prova derivada",
  9: "Prova digital em crimes patrimoniais e violentos",
  10: "Valoração da prova digital pelo juiz",
};

function pad2(n) {
  return String(n).padStart(2, "0");
}

function sh(cmd, opts = {}) {
  return execSync(cmd, { encoding: "utf8", stdio: "pipe", ...opts });
}

function unzipMatch(zipPath, pattern, destDir) {
  mkdirSync(destDir, { recursive: true });
  const zip = zipPath.replace(/'/g, "'\\''");
  const dir = destDir.replace(/'/g, "'\\''");
  try {
    sh(`unzip -o -j '${zip}' '${pattern}' -d '${dir}'`, {
      maxBuffer: 64 * 1024 * 1024,
    });
  } catch {
    return null;
  }
  const files = readdirSync(destDir).filter((f) => {
    if (f.startsWith(".")) return false;
    try {
      return statSync(join(destDir, f)).size > 1024;
    } catch {
      return false;
    }
  });
  return files[0] ?? null;
}

function extractPoster(n) {
  const videoPath = join(OUT_DIR, `aula-${pad2(n)}`, "video.mp4");
  const posterPath = join(OUT_DIR, `aula-${pad2(n)}`, "poster.jpg");
  if (!existsSync(videoPath)) return { ok: false };
  try {
    const v = videoPath.replace(/'/g, "'\\''");
    const p = posterPath.replace(/'/g, "'\\''");
    sh(
      `ffmpeg -y -hide_banner -loglevel error -ss 00:00:06 -i '${v}' -frames:v 1 -q:v 5 '${p}'`,
      { maxBuffer: 16 * 1024 * 1024 },
    );
    if (existsSync(posterPath) && statSync(posterPath).size > 2048) {
      return { ok: true, bytes: statSync(posterPath).size };
    }
  } catch {
    /* ffmpeg ausente ou falha no frame */
  }
  return { ok: false };
}

function readPptxTitle(pptxPath) {
  try {
    const p = pptxPath.replace(/'/g, "'\\''");
    const xml = sh(`unzip -p '${p}' docProps/core.xml 2>/dev/null || true`);
    const m = xml.match(/<dc:title[^>]*>([^<]*)<\/dc:title>/i);
    if (m?.[1]?.trim()) return m[1].trim();
  } catch {
    /* ignore */
  }
  return null;
}

const ALL_ZIPS = () =>
  readdirSync(SOURCE_DIR)
    .filter((f) => f.endsWith(".zip"))
    .map((f) => join(SOURCE_DIR, f));

function extractVideo(n) {
  const lessonDir = join(OUT_DIR, `aula-${pad2(n)}`);
  const dest = join(lessonDir, "video.mp4");
  mkdirSync(lessonDir, { recursive: true });

  const loose = readdirSync(SOURCE_DIR).find(
    (f) =>
      /\.mp4$/i.test(f) &&
      /editad/i.test(f) &&
      new RegExp(`AULA\\s*0?${n}\\b`, "i").test(f),
  );
  if (loose) {
    copyFileSync(join(SOURCE_DIR, loose), dest);
    return { ok: true, archive: "(solto)", fileName: loose, variant: "editado" };
  }

  const patterns = [
    `*AULA ${pad2(n)}*EDIT*`,
    `*AULA ${n}*EDIT*`,
    `*AULA ${pad2(n)}*editad*`,
    `*AULA ${n}*editad*`,
    `*AULA ${n} (*editad*`,
    `*${pad2(n)}*EDITAD*`,
  ];
  const tmp = join(ROOT, ".tmp-import-pd", `v-${n}`);
  rmSync(tmp, { recursive: true, force: true });

  for (const pattern of patterns) {
    for (const zip of ALL_ZIPS()) {
      const file = unzipMatch(zip, pattern, tmp);
      if (file) {
        renameSync(join(tmp, file), dest);
        rmSync(tmp, { recursive: true, force: true });
        return {
          ok: true,
          archive: basename(zip),
          fileName: file,
          variant: "editado",
        };
      }
      rmSync(tmp, { recursive: true, force: true });
    }
  }
  return { ok: false };
}

function extractSlidesPython(zip, regex, dest) {
  const py = join(ROOT, "scripts/extract-zip-entry.py");
  try {
    const name = sh(
      `python3 '${py.replace(/'/g, "'\\''")}' '${zip.replace(/'/g, "'\\''")}' '${dest.replace(/'/g, "'\\''")}' '${regex.replace(/'/g, "'\\''")}'`,
      { maxBuffer: 64 * 1024 * 1024 },
    ).trim();
    return name
      ? { ok: true, archive: basename(zip), fileName: basename(name) }
      : { ok: false };
  } catch {
    return { ok: false };
  }
}

function extractSlides(n) {
  const lessonDir = join(OUT_DIR, `aula-${pad2(n)}`);
  const dest = join(lessonDir, "slides.pptx");
  mkdirSync(lessonDir, { recursive: true });
  if (existsSync(dest)) rmSync(dest);

  if (n <= 2) {
    const regex = `SLIDES/.*CADEIA.*Aula ${pad2(n)}\\.pptx`;
    for (const zip of ALL_ZIPS()) {
      const r = extractSlidesPython(zip, regex, dest);
      if (r.ok && existsSync(dest) && statSync(dest).size > 1024) {
        return {
          ok: true,
          archive: basename(zip),
          fileName: r.fileName,
        };
      }
    }
    return { ok: false };
  }

  const patterns =
    n === 9
      ? [`*Aula 9*.pptx`, `*Aula 09*.pptx`, `*Aula 9-*.pptx`]
      : [`*Aula ${n}.pptx`, `*Aula ${pad2(n)}.pptx`];

  const tmp = join(ROOT, ".tmp-import-pd", `s-${n}`);
  rmSync(tmp, { recursive: true, force: true });

  for (const pattern of patterns) {
    for (const zip of ALL_ZIPS()) {
      const file = unzipMatch(zip, pattern, tmp);
      if (file) {
        renameSync(join(tmp, file), dest);
        rmSync(tmp, { recursive: true, force: true });
        return {
          ok: true,
          archive: basename(zip),
          fileName: file,
        };
      }
      rmSync(tmp, { recursive: true, force: true });
    }
  }
  return { ok: false };
}

function main() {
  console.log("Importando Prova Digital (vídeos editados + slides)…\n");
  mkdirSync(OUT_DIR, { recursive: true });

  const lessons = [];

  for (let n = 1; n <= LESSON_COUNT; n++) {
    process.stdout.write(`Aula ${pad2(n)}… `);
    const video = extractVideo(n);
    const poster = video.ok ? extractPoster(n) : { ok: false };
    const slides = extractSlides(n);
    const videoPath = join(OUT_DIR, `aula-${pad2(n)}`, "video.mp4");
    const slidesPath = join(OUT_DIR, `aula-${pad2(n)}`, "slides.pptx");
    const pptxTitle =
      slides.ok && existsSync(slidesPath) ? readPptxTitle(slidesPath) : null;

    lessons.push({
      number: n,
      slug: `aula-${pad2(n)}`,
      title: LESSON_TITLES[n],
      pptxTitle,
      video: video.ok
        ? {
            path: `/curso/provas-digitais/aula-${pad2(n)}/video.mp4`,
            bytes: statSync(videoPath).size,
            variant: video.variant ?? "editado",
            sourceArchive: video.archive,
            sourceFile: video.fileName,
            poster: poster.ok
              ? {
                  path: `/curso/provas-digitais/aula-${pad2(n)}/poster.jpg`,
                  bytes: poster.bytes,
                }
              : null,
          }
        : null,
      slides: slides.ok
        ? {
            path: `/curso/provas-digitais/aula-${pad2(n)}/slides.pptx`,
            bytes: statSync(slidesPath).size,
            sourceArchive: slides.archive,
            sourceFile: slides.fileName,
          }
        : null,
    });
    console.log(
      `${video.ok ? "V" : "—"}${poster.ok ? "P" : "—"}${slides.ok ? "S" : "—"} ${LESSON_TITLES[n].slice(0, 42)}…`,
    );
  }

  rmSync(join(ROOT, ".tmp-import-pd"), { recursive: true, force: true });

  for (let n = LESSON_COUNT + 1; n <= 13; n++) {
    rmSync(join(OUT_DIR, `aula-${pad2(n)}`), { recursive: true, force: true });
  }

  const manifest = {
    importedAt: new Date().toISOString(),
    courseSlug: "prova-digital-no-processo-penal",
    courseName: "Prova Digital no Processo Penal",
    summary: {
      videosOk: lessons.filter((l) => l.video).length,
      slidesOk: lessons.filter((l) => l.slides).length,
      missingVideo: lessons.filter((l) => !l.video).map((l) => l.number),
      missingSlides: lessons.filter((l) => !l.slides).map((l) => l.number),
    },
    lessons,
  };

  writeFileSync(MANIFEST_PATH, JSON.stringify(manifest, null, 2));

  console.log(
    `\nConcluído: ${manifest.summary.videosOk}/${LESSON_COUNT} vídeos, ${manifest.summary.slidesOk}/${LESSON_COUNT} slides.`,
  );
  if (manifest.summary.missingVideo.length) {
    console.log("Faltam vídeos editados nas aulas:", manifest.summary.missingVideo.join(", "));
  }
  if (manifest.summary.missingSlides.length) {
    console.log("Faltam slides nas aulas:", manifest.summary.missingSlides.join(", "));
  }
}

main();
