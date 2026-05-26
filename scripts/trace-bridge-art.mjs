/**
 * Extrai traços de elementos_marca-18 para máscara de revelação (manual de marca).
 * Não edita a arte — só gera paths alinhados aos pixels do arquivo oficial.
 *
 * Uso: npm run trace:bridge
 */
import { writeFileSync } from "node:fs";
import { createRequire } from "node:module";
import { resolve } from "node:path";

import sharp from "sharp";

const require = createRequire(import.meta.url);
const ImageTracer = require("imagetracerjs");

const ROOT = resolve(process.cwd());
const SRC = resolve(ROOT, "public/images/brand/elementos_marca-18.png");
const OUT = resolve(ROOT, "src/data/bridge-art-paths.json");

const SIZE = 1000;

const options = {
  ltres: 0.2,
  qtres: 0.2,
  pathomit: 0,
  rightangleenhance: false,
  colorsampling: 0,
  numberofcolors: 2,
  mincolorratio: 0.0005,
  colorquantcycles: 8,
  scale: 1,
  linefilter: false,
  roundcoords: 1,
  viewbox: true,
};

const EDGE_KERNEL = {
  width: 3,
  height: 3,
  kernel: [-1, -1, -1, -1, 9, -1, -1, -1, -1],
};

const { data, info } = await sharp(SRC)
  .resize(SIZE, SIZE, { fit: "contain", background: { r: 3, g: 0, b: 36, alpha: 1 } })
  .greyscale()
  .convolve(EDGE_KERNEL)
  .normalize()
  .threshold(40)
  .raw()
  .toBuffer({ resolveWithObject: true });

const rgba = new Uint8ClampedArray(info.width * info.height * 4);
for (let i = 0; i < info.width * info.height; i++) {
  const v = data[i];
  rgba[i * 4] = v;
  rgba[i * 4 + 1] = v;
  rgba[i * 4 + 2] = v;
  rgba[i * 4 + 3] = 255;
}

const svgString = ImageTracer.imagedataToSVG(
  { width: info.width, height: info.height, data: rgba },
  options,
);

const pathMatches = [...svgString.matchAll(/\sd="([^"]+)"/g)].map((m) => m[1]);

/** Ordem: traços maiores primeiro (estrutura), depois detalhes. */
const paths = pathMatches
  .filter((d) => d.length >= 14 && !/^M 0 0 H \d+ V \d+ H 0 Z/.test(d))
  .sort((a, b) => b.length - a.length);

writeFileSync(
  OUT,
  JSON.stringify(
    {
      source: "public/images/brand/elementos_marca-18.png",
      asset: "/images/brand/elementos_marca-18.png",
      width: info.width,
      height: info.height,
      viewBox: `0 0 ${info.width} ${info.height}`,
      pathCount: paths.length,
      paths,
    },
    null,
    2,
  ),
);

console.log(`OK: ${paths.length} paths de máscara → ${OUT}`);
