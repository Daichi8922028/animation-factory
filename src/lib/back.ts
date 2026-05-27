import { CATEGORIES } from "@/lib/catalog";

/**
 * 各ページの「← 戻る」リンクを `?from=` から組み立てる共通ロジック。
 *
 * 受理する形式:
 * - `/a/<id>`               詳細ページ（label は名前があれば動的に）
 * - `/c/<id>` (?...)        カテゴリ（フィルタも保持、label は category.label）
 * - `/t/<tag>` (?...)       タグ（label は `#tag`）
 * - `/` または `/?q=...`    ホーム（検索クエリも保持）
 * - それ以外               安全側に倒してホームへ
 *
 * options.animationIndex を渡すと `/a/<id>` の back link ラベルにアニメ名を使う。
 */
export type BackInfo = { href: string; label: string };

export function resolveBack(
  from: string | undefined,
  options?: { animationIndex?: ReadonlyArray<{ id: string; name: string }> },
): BackInfo {
  const fallback: BackInfo = { href: "/", label: "all animations" };
  if (!from) return fallback;

  // /a/<id> 詳細
  if (from.startsWith("/a/")) {
    const pathOnly = from.split("?")[0];
    const id = pathOnly.slice(3);
    const found = options?.animationIndex?.find((a) => a.id === id);
    return { href: from, label: found?.name ?? "戻る" };
  }

  // /c/<id> カテゴリ
  if (from.startsWith("/c/")) {
    const pathOnly = from.split("?")[0];
    const catId = pathOnly.slice(3);
    const cat = CATEGORIES.find((c) => c.id === catId);
    if (!cat) return fallback;
    return { href: from, label: cat.label };
  }

  // /t/<tag> タグ
  if (from.startsWith("/t/")) {
    const pathOnly = from.split("?")[0];
    const tagRaw = pathOnly.slice(3);
    let tag = tagRaw;
    try {
      tag = decodeURIComponent(tagRaw);
    } catch {
      // decode 失敗時は raw のまま
    }
    return { href: from, label: `#${tag}` };
  }

  // ホーム
  if (from === "/" || from.startsWith("/?")) {
    return { href: from, label: "all animations" };
  }

  return fallback;
}
