#!/usr/bin/env node
/**
 * Um comando: sobe o dev (se ainda não estiver) + link HTTPS para o celular.
 * Uso: npm run phone
 */
import { spawn } from "node:child_process";
import net from "node:net";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.join(__dirname, "..");
const port = String(process.env.PORT || "3055");

function portOpen() {
  return new Promise((resolve) => {
    const socket = net.connect({ port: Number(port), host: "127.0.0.1" }, () => {
      socket.end();
      resolve(true);
    });
    socket.on("error", () => resolve(false));
    socket.setTimeout(800, () => {
      socket.destroy();
      resolve(false);
    });
  });
}

async function waitForPort() {
  for (let i = 0; i < 60; i++) {
    if (await portOpen()) return true;
    await new Promise((r) => setTimeout(r, 500));
  }
  return false;
}

let devChild = null;

if (!(await portOpen())) {
  console.log("\n▶ Iniciando servidor de desenvolvimento…\n");
  devChild = spawn(process.execPath, [path.join(__dirname, "dev.mjs")], {
    cwd: root,
    stdio: "inherit",
    env: { ...process.env, NEXT_OPEN: "0" },
  });

  const up = await waitForPort();
  if (!up) {
    console.error("\n❌ O dev não subiu a tempo. Verifique erros acima.\n");
    devChild.kill("SIGTERM");
    process.exit(1);
  }
} else {
  console.log(`\n✓ Site já rodando na porta ${port}\n`);
}

const linkChild = spawn(process.execPath, [path.join(__dirname, "share-dev.mjs")], {
  cwd: root,
  stdio: "inherit",
  env: process.env,
});

function shutdown() {
  linkChild.kill("SIGINT");
  if (devChild) devChild.kill("SIGINT");
}

process.on("SIGINT", shutdown);
process.on("SIGTERM", shutdown);

linkChild.on("exit", (code) => {
  if (devChild) devChild.kill("SIGTERM");
  process.exit(code ?? 0);
});

devChild?.on("exit", () => {
  linkChild.kill("SIGTERM");
});
