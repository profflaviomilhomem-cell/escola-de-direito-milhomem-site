/**
 * Gera public/images/dossie/newspaper-correio.jpg a partir de newspaper-source.html
 */
import { chromium } from "@playwright/test";
import { fileURLToPath } from "node:url";
import path from "node:path";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const htmlPath = path.join(root, "public/images/dossie/newspaper-source.html");
const outPath = path.join(root, "public/images/dossie/newspaper-correio.jpg");

const browser = await chromium.launch();
const page = await browser.newPage({
  viewport: { width: 1280, height: 900 },
  deviceScaleFactor: 2,
});

await page.goto(`file://${htmlPath}`, { waitUntil: "networkidle" });
await page.waitForTimeout(800);

await page.locator(".newspaper-page").screenshot({
  path: outPath,
  type: "jpeg",
  quality: 88,
});

await browser.close();
console.log("Gerado:", outPath);
