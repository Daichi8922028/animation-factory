/**
 * README / SNS シェア用のスクショを取る一発スクリプト。
 *
 * 使い方:
 *   npm run dev            # 別タブ
 *   npx tsx scripts/screenshot.ts
 *
 * 出力:
 *   docs/screenshot-home.png      ← READMEのヒーロー想定
 *   docs/screenshot-detail.png    ← 詳細ページ（AI Apply Prompt パネル見える状態）
 *   docs/social-preview.png       ← 1280x640 の GitHub Social preview 用
 */
import { mkdirSync } from "node:fs";
import { join } from "node:path";
import { chromium } from "playwright";

const BASE = process.env.THUMBS_BASE_URL || "http://localhost:3000";
const OUT = join(process.cwd(), "docs");

/** Next.js dev のフローティングインジケータ等を隠す CSS */
const HIDE_DEV_BADGE = `
  nextjs-portal,
  [data-nextjs-toast],
  [data-nextjs-dev-tools-button],
  [data-next-mark] { display: none !important; }
`;

/** ページ本体 + 全 iframe に CSS を注入 */
async function hideDevBadgeOnAllFrames(page: import("playwright").Page) {
  await page.addStyleTag({ content: HIDE_DEV_BADGE }).catch(() => {});
  for (const f of page.frames()) {
    if (f === page.mainFrame()) continue;
    try {
      await f.addStyleTag({ content: HIDE_DEV_BADGE });
    } catch {
      // cross-origin など差し込めない場合はスキップ
    }
  }
}

async function main() {
  mkdirSync(OUT, { recursive: true });
  const browser = await chromium.launch();

  // ---- 1) home（縦長で「カタログ感」を出す）
  {
    const ctx = await browser.newContext({
      viewport: { width: 1280, height: 900 },
      deviceScaleFactor: 2,
      colorScheme: "light",
    });
    const page = await ctx.newPage();
    await page.goto(`${BASE}/`, { waitUntil: "load" });
    await hideDevBadgeOnAllFrames(page);
    await page.waitForTimeout(1500); // hero アニメと count-up が見える位置
    const path = join(OUT, "screenshot-home.png");
    await page.screenshot({ path, fullPage: false });
    console.log("home →", path);
    await ctx.close();
  }

  // ---- 2) detail (fade-up) — preview iframe + AI Prompt panel を含める
  {
    const ctx = await browser.newContext({
      viewport: { width: 1280, height: 900 },
      deviceScaleFactor: 2,
      colorScheme: "light",
    });
    const page = await ctx.newPage();
    await page.goto(`${BASE}/a/fade-up`, { waitUntil: "load" });
    // iframe (preview) の読み込みを待ってから CSS を注入
    await page.waitForTimeout(1500);
    await hideDevBadgeOnAllFrames(page);
    // AI Apply Prompt パネル付近までスクロール
    await page.evaluate(() => window.scrollBy({ top: 360, behavior: "instant" as ScrollBehavior }));
    await page.waitForTimeout(400);
    const path = join(OUT, "screenshot-detail.png");
    await page.screenshot({ path, fullPage: false });
    console.log("detail →", path);
    await ctx.close();
  }

  // ---- 3) Social preview: GitHub は 1280×640、X / OG は 1200×630 推奨。両方使える共通サイズで
  {
    const ctx = await browser.newContext({
      viewport: { width: 1280, height: 640 },
      deviceScaleFactor: 2,
      colorScheme: "dark", // OG はダーク基調で映える
    });
    const page = await ctx.newPage();
    await page.goto(`${BASE}/`, { waitUntil: "load" });
    await hideDevBadgeOnAllFrames(page);
    await page.waitForTimeout(1200);
    const path = join(OUT, "social-preview.png");
    await page.screenshot({ path, fullPage: false });
    console.log("social →", path);
    await ctx.close();
  }

  await browser.close();
  console.log("\nUsage in README:");
  console.log("  ![animation factory](docs/screenshot-home.png)");
  console.log("Upload to GitHub repo Settings → Social preview: docs/social-preview.png");
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
