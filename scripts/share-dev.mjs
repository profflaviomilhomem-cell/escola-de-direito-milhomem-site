#!/usr/bin/env node
/**
 * Link HTTPS temporário para testar no celular (Cloudflare Tunnel).
 * O túnel só existe enquanto este processo estiver rodando.
 */
import { spawn, execFile } from "node:child_process";
import net from "node:net";
import os from "node:os";

const port = String(process.env.PORT || "3055");
const localUrl = `http://127.0.0.1:${port}`;

function portOpen() {
  return new Promise((resolve) => {
    const socket = net.connect(
      { port: Number(port), host: "127.0.0.1" },
      () => {
        socket.end();
        resolve(true);
      },
    );
    socket.on("error", () => resolve(false));
    socket.setTimeout(800, () => {
      socket.destroy();
      resolve(false);
    });
  });
}

async function waitForDev() {
  for (let i = 0; i < 40; i++) {
    if (await portOpen()) return true;
    await new Promise((r) => setTimeout(r, 500));
  }
  return false;
}

function localIp() {
  try {
    for (const ifaces of Object.values(os.networkInterfaces())) {
      for (const iface of ifaces ?? []) {
        if (iface.family === "IPv4" && !iface.internal) return iface.address;
      }
    }
  } catch {
    // sandbox / permissões restritas — ignorar fallback LAN
  }
  return null;
}

let printed = false;

const AREA_PATHS = [
  { label: "Home (institucional)", path: "/" },
  {
    label: "Área do aluno",
    path: "/dev/sessao?role=aluno&redirect=/aluno/dashboard",
  },
  {
    label: "Área do professor",
    path: "/dev/sessao?role=professor&redirect=/professor/dashboard",
  },
];

function announce(url) {
  if (printed) return;
  printed = true;
  const base = url.replace(/\/$/, "");

  console.log("\n╔══════════════════════════════════════════════════════════╗");
  console.log("║  CELULAR (Chrome / Android)                               ║");
  console.log("║  1. Escaneie o QR abaixo  OU  copie o link                ║");
  console.log(
    "║  2. NÃO FECHE este terminal enquanto testar                 ║",
  );
  console.log("╚══════════════════════════════════════════════════════════╝\n");
  console.log(`  Base: ${base}\n`);
  console.log("  Rotas:\n");
  for (const { label, path } of AREA_PATHS) {
    console.log(`  · ${label}`);
    console.log(`    ${base}${path}\n`);
  }
  console.log(`  Painel dev (as três áreas): ${base}/dev\n`);

  const ip = localIp();
  if (ip) {
    console.log(
      `  Alternativa (mesmo Wi‑Fi, sem túnel): http://${ip}:${port}\n` +
        `  (precisa: npm run dev -- --hostname 0.0.0.0)\n`,
    );
  }

  execFile(
    "npx",
    ["--yes", "qrcode-terminal", url, "--small"],
    { env: process.env },
    (err) => {
      if (err) {
        console.log("  (QR: copie o link acima manualmente)\n");
      }
    },
  );
}

function scanForUrl(text) {
  const m = text.match(/https:\/\/[a-z0-9-]+\.trycloudflare\.com/gi);
  if (m?.length) announce(m[m.length - 1]);
}

const ready = await waitForDev();
if (!ready) {
  console.error(
    `\n❌ O site não está rodando em ${localUrl}\n\n` +
      `   Opção A — um comando só:\n` +
      `     npm run phone\n\n` +
      `   Opção B — dois terminais:\n` +
      `     Terminal 1: npm run dev\n` +
      `     Terminal 2: npm run link\n`,
  );
  process.exit(1);
}

console.log(
  `\n🔗 Gerando link para ${localUrl} … (pode levar ~15s na 1ª vez)\n`,
);

const child = spawn(
  "npx",
  ["--yes", "cloudflared", "tunnel", "--url", localUrl],
  {
    stdio: ["inherit", "pipe", "pipe"],
    env: process.env,
    shell: true,
  },
);

child.stdout.on("data", (chunk) => {
  const text = chunk.toString();
  process.stdout.write(text);
  scanForUrl(text);
});

child.stderr.on("data", (chunk) => {
  const text = chunk.toString();
  process.stderr.write(text);
  scanForUrl(text);
});

child.on("error", (err) => {
  console.error("\n❌ Falha ao iniciar o túnel:", err.message);
  console.error("   Verifique internet e tente de novo: npm run link\n");
  process.exit(1);
});

child.on("exit", (code) => {
  if (!printed && code !== 0) {
    console.error(
      "\n❌ O túnel encerrou antes de gerar o link.\n" +
        "   Tente novamente ou use: npm run phone\n",
    );
  }
  process.exit(code ?? 0);
});

process.on("SIGINT", () => {
  console.log("\n\nLink encerrado.\n");
  child.kill("SIGINT");
});
