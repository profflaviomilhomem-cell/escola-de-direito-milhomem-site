/**
 * Migra os materiais do curso de `public/` para o Vercel Blob PRIVADO.
 *
 * POR QUÊ. Arquivo em `public/` é servido pelo Next a qualquer pessoa, sem
 * sessão. Em 24/08/2026 os dez `slides.pptx` do curso pago respondiam 200 em
 * produção para quem soubesse o endereço. O Blob privado + a rota
 * `/api/aluno/material/...` fecham isso: a entrega passa a exigir login e
 * matrícula.
 *
 * Uso:
 *   node scripts/migrar-materiais-blob.mjs             # ENSAIO: só mostra
 *   node scripts/migrar-materiais-blob.mjs --aplicar   # sobe para o Blob
 *   node scripts/migrar-materiais-blob.mjs --aplicar --banco   # + slidesUrl
 *
 * O passo do banco é separado de propósito: primeiro se confirma que os dez
 * arquivos estão no Blob e leem de volta com o tamanho certo; só então o
 * `slidesUrl` das aulas passa a apontar para a rota nova. Se a ordem se
 * inverter, existe uma janela em que o aluno clica e não recebe nada.
 *
 * NÃO apaga nada de `public/` — remoção é passo manual, depois de conferir.
 */
import { readFileSync, existsSync, statSync } from "node:fs";
import { resolve } from "node:path";

import { PrismaClient } from "@prisma/client";
import { PrismaNeon } from "@prisma/adapter-neon";
import { put, get } from "@vercel/blob";

function carregarEnv() {
  try {
    const raw = readFileSync(resolve(process.cwd(), ".env.local"), "utf8");
    for (const linha of raw.split("\n")) {
      const t = linha.trim();
      if (!t || t.startsWith("#")) continue;
      const i = t.indexOf("=");
      if (i === -1) continue;
      const chave = t.slice(0, i).trim();
      let valor = t.slice(i + 1).trim();
      if (
        (valor.startsWith('"') && valor.endsWith('"')) ||
        (valor.startsWith("'") && valor.endsWith("'"))
      ) {
        valor = valor.slice(1, -1);
      }
      if (!process.env[chave]) process.env[chave] = valor;
    }
  } catch {
    /* opcional */
  }
}
carregarEnv();

const APLICAR = process.argv.includes("--aplicar");
const BANCO = process.argv.includes("--banco");

const PRODUTO = "prova-digital-no-processo-penal";
const ORIGEM = "public/curso/provas-digitais";
const TIPO = "slides";
const EXT = "pptx";
const CONTENT_TYPE =
  "application/vnd.openxmlformats-officedocument.presentationml.presentation";

const AULAS = Array.from(
  { length: 10 },
  (_, i) => `aula-${String(i + 1).padStart(2, "0")}`,
);

const caminhoBlob = (aula) => `curso/${PRODUTO}/${aula}/${TIPO}.${EXT}`;
const urlRota = (aula) => `/api/aluno/material/${PRODUTO}/${aula}/${TIPO}`;

function kb(n) {
  return `${(n / 1024 / 1024).toFixed(2)} MB`;
}

async function main() {
  const token = process.env.MATERIAIS_READ_WRITE_TOKEN;
  if (!token) {
    console.error(
      "MATERIAIS_READ_WRITE_TOKEN ausente.\n" +
        "Material de curso pago precisa de uma store PRIVADA — a store original\n" +
        "do projeto é pública, e o Vercel recusa access:'private' nela.\n" +
        "Conecte a store privada `materiais-curso` ao projeto no painel,\n" +
        "com prefixo MATERIAIS, e puxe as variáveis.",
    );
    process.exit(1);
  }

  console.log(APLICAR ? "== APLICANDO ==" : "== ENSAIO (nada será escrito) ==");
  console.log("");

  const plano = [];
  for (const aula of AULAS) {
    const local = resolve(process.cwd(), ORIGEM, aula, `${TIPO}.${EXT}`);
    if (!existsSync(local)) {
      console.error(`  ! ${aula}: arquivo local não encontrado — ${local}`);
      process.exit(1);
    }
    plano.push({ aula, local, tamanho: statSync(local).size });
  }

  for (const p of plano) {
    console.log(
      `  ${p.aula}  ${kb(p.tamanho).padStart(9)}  →  ${caminhoBlob(p.aula)}`,
    );
  }
  console.log("");

  if (!APLICAR) {
    console.log("Ensaio concluído. Repita com --aplicar para subir.");
    return;
  }

  // --- upload ---
  const enviados = [];
  for (const p of plano) {
    const corpo = readFileSync(p.local);
    const r = await put(caminhoBlob(p.aula), corpo, {
      access: "private",
      contentType: CONTENT_TYPE,
      addRandomSuffix: false,
      allowOverwrite: true,
      token,
    });
    enviados.push({ ...p, pathname: r.pathname });
    console.log(`  enviado  ${p.aula}  ${kb(p.tamanho)}`);
  }
  console.log("");

  // --- verificação: lê de volta e compara tamanho ---
  let falhas = 0;
  for (const p of enviados) {
    const lido = await get(caminhoBlob(p.aula), { access: "private", token });
    const ok = lido && lido.statusCode === 200 && lido.blob.size === p.tamanho;
    console.log(
      `  ${ok ? "ok      " : "FALHOU  "} ${p.aula}  ` +
        (lido ? `${kb(lido.blob.size)} lidos` : "não encontrado"),
    );
    if (!ok) falhas++;
    // Fecha o stream: só queremos os metadados aqui.
    if (lido?.stream) await lido.stream.cancel();
  }
  console.log("");
  if (falhas) {
    console.error(`${falhas} arquivo(s) não conferiram. Banco NÃO tocado.`);
    process.exit(1);
  }
  console.log(
    "Os 10 arquivos estão no Blob e leem de volta com o tamanho certo.",
  );

  if (!BANCO) {
    console.log(
      "Banco não alterado (rode com --banco para apontar slidesUrl).",
    );
    return;
  }

  // --- banco: slidesUrl passa a apontar para a rota autenticada ---
  const prisma = new PrismaClient({
    adapter: new PrismaNeon({ connectionString: process.env.DATABASE_URL }),
  });
  console.log("");
  for (const p of plano) {
    const r = await prisma.lesson.updateMany({
      where: { slug: p.aula, product: { slug: PRODUTO } },
      data: { slidesUrl: urlRota(p.aula) },
    });
    console.log(
      `  ${p.aula}  slidesUrl → ${urlRota(p.aula)}  (${r.count} linha)`,
    );
  }
  const conferir = await prisma.lesson.findMany({
    where: { product: { slug: PRODUTO } },
    orderBy: { position: "asc" },
    select: { slug: true, slidesUrl: true },
  });
  const pendentes = conferir.filter((l) => !l.slidesUrl?.startsWith("/api/"));
  console.log("");
  console.log(
    pendentes.length
      ? `ATENÇÃO: ${pendentes.length} aula(s) ainda apontam para public/.`
      : "As 10 aulas apontam para a rota autenticada.",
  );
  await prisma.$disconnect();
}

main().catch((err) => {
  console.error("Falhou:", err?.message ?? err);
  process.exit(1);
});
