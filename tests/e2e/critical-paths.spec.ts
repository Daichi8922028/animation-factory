import { test, expect } from "@playwright/test";

/**
 * 致命パスのスモークテスト。
 * 個別画面の細部より「主要な動線が全部 200 で繋がる」ことを優先。
 */

test.describe("animation factory critical paths", () => {
  test("home loads with hero + categories + tags", async ({ page }) => {
    await page.goto("/");
    await expect(page.getByRole("heading", { name: /animation factory/ })).toBeVisible();
    // how to use セクション
    await expect(page.getByText("how to use")).toBeVisible();
    // カテゴリ
    await expect(page.getByRole("link", { name: /登場・退場/ })).toBeVisible();
    // 人気タグ chip
    await expect(page.getByRole("link", { name: /^#/ }).first()).toBeVisible();
  });

  test("search filters animations in place", async ({ page }) => {
    await page.goto("/");
    const search = page.getByRole("searchbox", { name: /アニメーションを検索/ });
    await search.fill("fade");
    await expect(page).toHaveURL(/\?q=fade/);
    await expect(page.getByText(/results for/i)).toBeVisible();
  });

  test("category → detail → back to category preserves filter", async ({ page }) => {
    await page.goto("/c/entrance-exit?perfCost=low");
    // facet UI と category nav
    await expect(page.getByRole("heading", { name: "絞り込み" })).toBeVisible();
    await expect(page.getByRole("link", { name: /登場・退場/ }).first()).toBeVisible();

    const firstCard = page.locator('a[href^="/a/"]').first();
    await firstCard.click();
    await expect(page).toHaveURL(/\/a\/[a-z-]+\?from=/);

    // 戻る link が category label を含む（ラベルは "← 登場・退場"）
    const back = page.getByRole("link", { name: /← 登場・退場/ });
    await expect(back).toBeVisible();
    await back.click();
    await expect(page).toHaveURL(/\/c\/entrance-exit\?perfCost=low/);
  });

  test("detail page renders preview iframe + copy buttons + AI prompt panel", async ({ page }) => {
    await page.goto("/a/fade-up");
    // プレビュー iframe
    await expect(page.locator('iframe[title*="プレビュー"]')).toBeVisible();
    // ダウンロードボタン
    await expect(page.getByRole("link", { name: /\.md をダウンロード/ })).toBeVisible();
    // AI prompt パネル
    await expect(page.getByRole("heading", { name: "AI に渡すプロンプト" })).toBeVisible();
    // .md コピーボタン
    await expect(page.getByRole("button", { name: /\.md 全体をコピー/ })).toBeVisible();
  });

  test("tag chip on detail → tag page → back to detail", async ({ page }) => {
    await page.goto("/a/fade-up");
    // detail のタグ chip
    const tagLink = page.locator('a[href^="/t/"]').first();
    const tagHref = await tagLink.getAttribute("href");
    expect(tagHref).toContain("from=");
    await tagLink.click();
    await expect(page).toHaveURL(/\/t\//);
    // back ラベルは "← Fade Up"
    await expect(page.getByRole("link", { name: /← Fade Up/ })).toBeVisible();
  });

  test("theme toggle persists across navigation", async ({ page }) => {
    await page.goto("/");
    // 既定はライト
    await expect(page.locator("html")).toHaveAttribute("data-theme", "light");
    // ダークに切替
    await page.getByRole("button", { name: /ダークモードに切替/ }).click();
    await expect(page.locator("html")).toHaveAttribute("data-theme", "dark");
    // 別ページに遷移しても維持
    await page.goto("/c/hover-press");
    await expect(page.locator("html")).toHaveAttribute("data-theme", "dark");
  });

  test("kit add → bar appears → DL endpoint returns zip", async ({ page }) => {
    await page.goto("/a/fade-up");
    // 詳細の「add to kit」（md サイズ）
    const kitToggle = page.getByRole("button", { name: /add to kit|in kit/ }).first();
    await kitToggle.click();
    // KitBar が出る
    await expect(page.getByText(/Kit を DL/)).toBeVisible();
    // DL リンクは /api/kit
    const dl = page.getByRole("link", { name: /Kit を DL/ });
    const href = await dl.getAttribute("href");
    expect(href).toMatch(/^\/api\/kit\?ids=fade-up/);
  });

  test("/api/animation/<id> returns markdown", async ({ request }) => {
    const res = await request.get("/api/animation/fade-up");
    expect(res.status()).toBe(200);
    expect(res.headers()["content-type"]).toContain("text/markdown");
    const body = await res.text();
    expect(body).toContain("id: fade-up");
  });

  test("/api/kit returns zip with selected ids", async ({ request }) => {
    const res = await request.get("/api/kit?ids=fade-up,hover-lift");
    expect(res.status()).toBe(200);
    expect(res.headers()["content-type"]).toBe("application/zip");
  });

  test("/api/kit rejects malformed ids", async ({ request }) => {
    expect((await request.get("/api/kit?ids=")).status()).toBe(400);
    expect((await request.get("/api/kit?ids=does-not-exist")).status()).toBe(404);
  });

  test("404 page renders for unmatched route", async ({ page }) => {
    const res = await page.goto("/__nope_does_not_exist");
    expect(res?.status()).toBe(404);
    await expect(page.getByRole("heading", { name: /ページが見つかりません/ })).toBeVisible();
    await expect(page.getByRole("link", { name: /ホームへ戻る/ })).toBeVisible();
  });

  test("from=evil.com is sanitized to home", async ({ page }) => {
    await page.goto("/a/fade-up?from=https%3A%2F%2Fevil.com");
    // 悪意ある from は無視され、"all animations" にフォールバック
    const back = page.getByRole("link", { name: /← all animations/ });
    await expect(back).toBeVisible();
    expect(await back.getAttribute("href")).toBe("/");
  });

  test("sitemap.xml and robots.txt are served", async ({ request }) => {
    const sm = await request.get("/sitemap.xml");
    expect(sm.status()).toBe(200);
    const body = await sm.text();
    expect(body).toContain("<urlset");
    expect(body).toContain("/a/fade-up");

    const rb = await request.get("/robots.txt");
    expect(rb.status()).toBe(200);
    expect(await rb.text()).toContain("Sitemap:");
  });
});
