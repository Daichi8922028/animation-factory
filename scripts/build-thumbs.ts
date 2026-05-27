/**
 * 各 /preview/[id] を Playwright で WebP スクショ → public/thumbs/<id>.webp。
 *
 * 前提:
 *   - localhost:3000 に dev or start で起動中（THUMBS_BASE_URL で変更可）
 *   - npx playwright install chromium 済み
 *
 * 使い方:
 *   npm run dev            # 別タブで起動
 *   npm run build:thumbs   # キャプチャ
 *
 * 仕様:
 *   - viewport 800×500, deviceScaleFactor 2（最終解像度 1600×1000）
 *   - 各ページで 1.2 秒待機（アニメーションが落ち着いた頃の 1 フレームを取る）
 *   - JPEG quality 80（Playwright が png/jpeg のみサポート。webp 変換は別途必要なら sharp で）
 *   - 既存ファイルは上書き、生成は逐次（並列化は dev のジャンクを避けるため避ける）
 */
import { mkdirSync } from "node:fs";
import { join } from "node:path";
import { chromium } from "playwright";
import { PREVIEW_IDS } from "../src/components/previews/ids";

const BASE = process.env.THUMBS_BASE_URL || "http://localhost:3000";
const WAIT_MS = Number(process.env.THUMBS_WAIT_MS || 1200);
const OUT_DIR = join(process.cwd(), "public", "thumbs");

async function main() {
  console.log(`Base URL: ${BASE}`);
  console.log(`Out dir:  ${OUT_DIR}`);
  mkdirSync(OUT_DIR, { recursive: true });

  const browser = await chromium.launch();
  const ctx = await browser.newContext({
    viewport: { width: 800, height: 500 },
    deviceScaleFactor: 2,
    colorScheme: "dark", // demos の多くは暗背景設計のため、見栄え的に dark で固定
  });
  const page = await ctx.newPage();

  let okCount = 0;
  let failCount = 0;
  const start = Date.now();

  for (const id of PREVIEW_IDS) {
    const url = `${BASE}/preview/${id}`;
    const out = join(OUT_DIR, `${id}.jpg`);
    process.stdout.write(`  ${id.padEnd(30)} `);
    try {
      await page.goto(url, { waitUntil: "load", timeout: 30_000 });
      await page.waitForTimeout(WAIT_MS);
      await page.screenshot({ path: out, type: "jpeg", quality: 80 });
      okCount += 1;
      console.log("ok");
    } catch (e) {
      failCount += 1;
      console.log(`fail: ${(e as Error).message}`);
    }
  }

  await browser.close();

  const elapsed = ((Date.now() - start) / 1000).toFixed(1);
  console.log(`\n${okCount} ok / ${failCount} fail / ${elapsed}s`);
  if (failCount > 0) process.exit(1);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
