/**
 * Atualiza sourceFile/sourceArchive no manifest sem reextrair vídeos.
 * Uso: node scripts/patch-manifest-sources.mjs
 */
import { execSync } from "node:child_process";
import { resolve } from "node:path";

const py = resolve(process.cwd(), "scripts/patch-manifest-sources.py");
execSync(`python3 '${py.replace(/'/g, "'\\''")}'`, { stdio: "inherit" });
