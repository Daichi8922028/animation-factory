/**
 * サイト基本情報。NEXT_PUBLIC_SITE_URL が設定されていればそれを使う。
 * 未設定なら Vercel の自動 URL（プレビュー / Preview Deployment 用）にフォールバック、
 * それもなければ localhost。
 */

function pickBaseUrl(): string {
  const envUrl = process.env.NEXT_PUBLIC_SITE_URL;
  if (envUrl) return envUrl.replace(/\/$/, "");
  const vercel = process.env.VERCEL_URL;
  if (vercel) return `https://${vercel.replace(/\/$/, "")}`;
  return "http://localhost:3000";
}

export const SITE = {
  name: "animation factory",
  shortDescription:
    "React で実装できる UI アニメーションを視覚的に試して、.md として取得し、AI に渡して実装させられる無料カタログ。",
  baseUrl: pickBaseUrl(),
  locale: "ja_JP",
  twitterCard: "summary_large_image" as const,
} as const;
