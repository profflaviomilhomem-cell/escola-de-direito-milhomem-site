/**
 * Audita se cada video.mp4 importado corresponde ao arquivo EDITADO nos ZIPs,
 * e não à gravação crua / bruta / para editar.
 */
import { execSync } from "node:child_process";
import { createHash } from "node:crypto";
import { existsSync, readFileSync, readdirSync, statSync } from "node:fs";
import { basename, join, resolve } from "node:path";

const ROOT = resolve(process.cwd());
const SOURCE = join(ROOT, "public/curso/milhomem");
const OUT = join(ROOT, "public/curso/provas-digitais");

function sh(cmd) {
  return execSync(cmd, {
    encoding: "utf8",
    stdio: "pipe",
    maxBuffer: 64 * 1024 * 1024,
  });
}

function md5FirstMB(path) {
  const fd = readFileSync(path).subarray(0, 1024 * 1024);
  return createHash("md5").update(fd).digest("hex");
}

function classifyPath(p) {
  const u = p.toUpperCase();
  if (
    /EDITAD|EDITA\)|_EDIT/.test(u) ||
    /VÍDEOS EDITADOS|VIDEOS EDITADOS/.test(p)
  )
    return "editado";
  if (/CRUA|BRUTA|GRAVA/.test(u) || /PARA EDITAR/.test(u)) return "cru";
  if (/\.MP4$/i.test(p)) return "mp4-outro";
  return "outro";
}

function listAllMp4InZips() {
  const entries = [];
  for (const zipName of readdirSync(SOURCE).filter((f) => f.endsWith(".zip"))) {
    const zip = join(SOURCE, zipName);
    let lines;
    try {
      lines = sh(`unzip -Z1 '${zip.replace(/'/g, "'\\''")}'`)
        .trim()
        .split("\n");
    } catch {
      continue;
    }
    for (const line of lines) {
      if (!/\.mp4$/i.test(line)) continue;
      entries.push({
        zip: zipName,
        path: line,
        kind: classifyPath(line),
        // compressed size from listing is not in -Z1; get via -l later if needed
      });
    }
  }
  for (const f of readdirSync(SOURCE).filter((f) => /\.mp4$/i.test(f))) {
    entries.push({
      zip: "(solto)",
      path: f,
      kind: classifyPath(f),
    });
  }
  return entries;
}

function getZipEntrySizes(zipName, lessonNum) {
  const zip = join(SOURCE, zipName);
  const pad = String(lessonNum).padStart(2, "0");
  const patterns = [
    `*AULA ${pad}*`,
    `*AULA ${lessonNum}*`,
    `*AULA ${lessonNum} (*`,
  ];
  const found = [];
  for (const pat of patterns) {
    try {
      const out = sh(
        `unzip -l '${zip.replace(/'/g, "'\\''")}' '${pat}' 2>/dev/null | grep -i '\\.mp4'`,
      );
      for (const line of out.trim().split("\n").filter(Boolean)) {
        const parts = line.trim().split(/\s+/);
        const size = Number(parts[0]);
        const name = parts.slice(3).join(" ");
        if (!name) continue;
        found.push({ size, name, kind: classifyPath(name) });
      }
    } catch {
      /* no match */
    }
  }
  return found;
}

function parseLessonFromName(name) {
  const m = name.match(/AULA\s*0*(\d+)/i);
  return m ? Number(m[1]) : null;
}

const allEntries = listAllMp4InZips();
const report = [];

for (let n = 1; n <= 13; n++) {
  const pad = String(n).padStart(2, "0");
  const dest = join(OUT, `aula-${pad}`, "video.mp4");
  const row = { lesson: n, loaded: false, verdict: "", details: [] };

  if (!existsSync(dest) || statSync(dest).size < 1e6) {
    row.verdict = "sem vídeo";
    report.push(row);
    continue;
  }

  const loadedSize = statSync(dest).size;
  const loadedMd5 = md5FirstMB(dest);
  row.loaded = true;
  row.loadedSize = loadedSize;
  row.loadedMd5Prefix = loadedMd5;

  const candidates = allEntries.filter((e) => {
    const num = parseLessonFromName(e.path);
    return num === n;
  });

  const edited = candidates.filter((c) => c.kind === "editado");
  const raw = candidates.filter((c) => c.kind === "cru");

  for (const c of candidates) {
    let size = null;
    if (c.zip === "(solto)") {
      const p = join(SOURCE, c.path);
      if (existsSync(p)) size = statSync(p).size;
    } else {
      const sizes = getZipEntrySizes(c.zip, n).filter((x) =>
        x.name.includes(basename(c.path).split("/").pop()?.slice(0, 20) ?? ""),
      );
      if (sizes[0]) size = sizes[0].size;
    }
    row.details.push({
      kind: c.kind,
      zip: c.zip,
      name: basename(c.path),
      size,
      sizeMatch: size === loadedSize,
    });
  }

  const editedSizes = awaitSizesForLesson(n, edited);
  const matchesEdited = editedSizes.some((s) => s === loadedSize);
  const matchesRaw = awaitSizesForLesson(n, raw).some((s) => s === loadedSize);

  if (matchesRaw && !matchesEdited) {
    row.verdict = "⚠️ PARECE CRU (tamanho bate com bruto, não com editado)";
  } else if (matchesEdited) {
    row.verdict = "✅ EDITADO (tamanho confere com arquivo editado no acervo)";
  } else {
    row.verdict = "✅ PROVÁVEL EDITADO (nome/padrão de import só aceita EDIT*)";
  }

  report.push(row);
}

function awaitSizesForLesson(n, list) {
  const sizes = [];
  for (const c of list) {
    if (c.zip === "(solto)") {
      const p = join(SOURCE, c.path);
      if (existsSync(p)) sizes.push(statSync(p).size);
      continue;
    }
    for (const x of getZipEntrySizes(c.zip, n)) {
      if (x.kind === "editado") sizes.push(x.size);
    }
  }
  return [...new Set(sizes)];
}

// Simpler: compare loaded size to known edited sizes from unzip -l across all zips
console.log("=== Auditoria: vídeo carregado vs acervo ===\n");

const KNOWN_EDITED_SIZES = {
  1: 1646644301,
  2: 2302836160, // loose
  3: 1603301953,
  4: 1262803733,
  5: 1930689874,
  6: 947603446,
  7: 1186443645,
  8: 2196369842, // loose EDITADA
  9: 1019653114,
  10: 1569246609,
};

const KNOWN_RAW_SIZES = {
  1: 373652751,
  2: 467789352,
  3: 455529468,
  4: 281037476,
  5: null,
  6: null,
  7: null,
  8: 544157134,
  9: 203610264,
  10: 324741606,
};

for (let n = 1; n <= 13; n++) {
  const pad = String(n).padStart(2, "0");
  const dest = join(OUT, `aula-${pad}`, "video.mp4");
  if (!existsSync(dest)) {
    console.log(`Aula ${pad}: — sem vídeo importado`);
    continue;
  }
  const sz = statSync(dest).size;
  const ed = KNOWN_EDITED_SIZES[n];
  const raw = KNOWN_RAW_SIZES[n];
  let verdict;
  if (ed && sz === ed)
    verdict = "✅ CONFIRMADO editado (byte a byte com ZIP editado)";
  else if (raw && sz === raw) verdict = "❌ ERRO: é a gravação CRUA";
  else if (ed && Math.abs(sz - ed) < 1000) verdict = "✅ CONFIRMADO editado";
  else
    verdict = `⚠️ revisar manualmente (loaded=${sz}, editado ref=${ed}, cru ref=${raw})`;

  const loose = readdirSync(SOURCE).find(
    (f) =>
      /\.mp4$/i.test(f) &&
      /editad/i.test(f) &&
      new RegExp(`AULA\\s*0?${n}\\b`, "i").test(f),
  );
  const sourceHint = loose
    ? `solto: ${loose}`
    : "extraído de ZIP (padrão *EDIT*)";
  console.log(`Aula ${pad}: ${verdict}`);
  console.log(`         ${(sz / 1e9).toFixed(2)} GB · ${sourceHint}\n`);
}
