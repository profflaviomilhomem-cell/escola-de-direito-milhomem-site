#!/usr/bin/env node
/**
 * Dev server wrapper:
 * - Limpa cache de persistência do Turbopack (evita "Failed to open database" ao voltar a usar turbo).
 * - Usa webpack por defeito (mais estável com paths longos / cache estragado).
 * - Porta fixa 3055 (evita colisão com outro app em 3000 e URL previsível).
 * - Abre o browser no macOS em http://localhost:<porta> (desativar: NEXT_OPEN=0 ou CI=true).
 */
import { spawn, execFile } from "node:child_process";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.join(__dirname, "..");
const port = String(process.env.PORT || "3055");
const turbopackCache = path.join(root, ".next/dev/cache/turbopack");

try {
  fs.rmSync(turbopackCache, { recursive: true, force: true });
} catch {
  // ignore
}

const nextBin = path.join(root, "node_modules/next/dist/bin/next");
const args = ["dev", "--webpack", "-p", port];

function openBrowser(url) {
  if (process.env.CI === "true" || process.env.NEXT_OPEN === "0") return;
  try {
    if (process.platform === "darwin") {
      execFile("open", [url], () => {});
    } else if (process.platform === "win32") {
      spawn("cmd", ["/c", "start", "", url], {
        detached: true,
        stdio: "ignore",
      }).unref();
    } else {
      execFile("xdg-open", [url], () => {});
    }
  } catch {
    // ignore
  }
}

/** Usar `localhost` (não 127.0.0.1) para alinhar com o origin esperado pelo webpack HMR. */
const url = `http://localhost:${port}`;
const openTimer = setTimeout(() => openBrowser(url), 1800);

const child = spawn(process.execPath, [nextBin, ...args], {
  cwd: root,
  stdio: "inherit",
  env: { ...process.env, PORT: port },
});

function shutdown(signal) {
  clearTimeout(openTimer);
  try {
    child.kill(signal);
  } catch {
    // ignore
  }
}

process.on("SIGINT", () => shutdown("SIGINT"));
process.on("SIGTERM", () => shutdown("SIGTERM"));

child.on("exit", (code, signal) => {
  clearTimeout(openTimer);
  if (signal) process.exit(1);
  process.exit(code ?? 0);
});
