"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams, usePathname } from "next/navigation";
import type { AnimationSummary, FacetValue } from "@/lib/catalog";
import { AnimationCard } from "./AnimationCard";
import {
  FACET_KEYS,
  FacetSidebar,
  emptyFacetSelection,
  type FacetKey,
  type FacetSelection,
} from "./FacetSidebar";

/**
 * /c/[category] のクライアントビュー。
 * - 初期選択は URL searchParams から読み取り
 * - 選択変更後に useEffect で URL 同期（履歴を汚さない `router.replace`）
 *   ※ setState updater 内で router を呼ぶと "setState during render" になるため
 * - 複数選択 = OR、ファセット間 = AND の AND/OR 結合
 */

type Sections = { key: FacetKey; label: string; values: FacetValue[] }[];

export function CategoryView({
  items,
  facets,
  category,
  allCategories,
}: {
  items: AnimationSummary[];
  facets: Record<string, FacetValue[]>;
  category: { id: string; label: string; description: string };
  allCategories: { id: string; label: string; count: number }[];
}) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  // URL → selection（初回のみ）
  const [selection, setSelection] = useState<FacetSelection>(() => {
    const init = emptyFacetSelection();
    for (const key of FACET_KEYS) {
      const raw = searchParams.get(key);
      if (raw) init[key] = raw.split(",").filter(Boolean);
    }
    return init;
  });

  // selection → URL 同期（初回レンダーはスキップ。すでに URL と一致しているため）
  // 同じく searchParams を依存に含めないことで無限ループを防ぐ。
  const isFirstSync = useRef(true);
  const searchParamsRef = useRef(searchParams);
  useEffect(() => {
    searchParamsRef.current = searchParams;
  });
  useEffect(() => {
    if (isFirstSync.current) {
      isFirstSync.current = false;
      return;
    }
    const params = new URLSearchParams();
    for (const k of FACET_KEYS) {
      if (selection[k].length > 0) params.set(k, selection[k].join(","));
    }
    const nextQs = params.toString();
    const currentQs = searchParamsRef.current.toString();
    if (nextQs === currentQs) return; // すでに一致しているなら何もしない
    router.replace(nextQs ? `${pathname}?${nextQs}` : pathname, {
      scroll: false,
    });
  }, [selection, pathname, router]);

  const onToggle = (key: FacetKey, value: string) => {
    setSelection((prev) => {
      const cur = prev[key];
      const next = cur.includes(value)
        ? cur.filter((v) => v !== value)
        : [...cur, value];
      return { ...prev, [key]: next };
    });
  };

  const onClear = () => {
    setSelection(emptyFacetSelection());
  };

  // 選択に応じてフィルタ
  const matched = useMemo(() => filter(items, selection), [items, selection]);

  // 表示用ファセット（カテゴリ内の値のみに絞る）
  const sections: Sections = FACET_KEYS.map((key) => ({
    key,
    label: key,
    values: pickValuesForCategory(facets[key] ?? [], items, key),
  }));

  // 詳細ページへの back link 用に、現在の URL（フィルタクエリ込み）を作る
  const qs = useMemo(() => searchParams.toString(), [searchParams]);
  const fromHref = qs ? `${pathname}?${qs}` : pathname;

  const activeCount = Object.values(selection).reduce(
    (acc, v) => acc + v.length,
    0,
  );

  // モバイルでサイドバーを折り畳むためのトグル
  const [filtersOpen, setFiltersOpen] = useState(false);

  return (
    <main className="flex-1 bg-base text-fg">
      <div className="max-w-6xl mx-auto px-6 py-12">
        <header>
          <Link href="/" className="text-sm text-subtle hover:text-fg">
            ← all
          </Link>
          <h1 className="mt-4 text-3xl font-semibold text-fg">{category.label}</h1>
          <p className="mt-2 max-w-2xl text-sm text-muted leading-relaxed">
            {category.description}
          </p>

          {/* カテゴリ間ジャンプ: 現在のカテゴリにアクセント色 */}
          <nav className="mt-6 flex flex-wrap gap-2" aria-label="カテゴリ切替">
            {allCategories.map((c) => {
              const active = c.id === category.id;
              return (
                <Link
                  key={c.id}
                  href={`/c/${c.id}`}
                  aria-current={active ? "page" : undefined}
                  className={`text-xs rounded-full border px-3 py-1.5 transition-colors inline-flex items-baseline gap-1.5 ${
                    active
                      ? "border-accent/50 text-accent bg-accent-soft font-medium"
                      : c.count > 0
                      ? "border-edge text-fg bg-surface hover:bg-surface-strong hover:border-edge-strong"
                      : "border-edge text-subtle bg-transparent hover:bg-surface"
                  }`}
                >
                  <span>{c.label}</span>
                  <span
                    className={`tabular-nums ${
                      active ? "text-accent/70" : "text-subtle"
                    }`}
                  >
                    {c.count}
                  </span>
                </Link>
              );
            })}
          </nav>
        </header>

        {/* モバイル専用のフィルタトグル */}
        <div className="mt-6 md:hidden">
          <button
            type="button"
            onClick={() => setFiltersOpen((v) => !v)}
            aria-expanded={filtersOpen}
            className="w-full flex items-center justify-between rounded-lg border border-edge bg-surface px-4 py-2.5 text-sm text-fg hover:bg-surface-strong transition-colors"
          >
            <span className="flex items-center gap-2">
              <span aria-hidden>🎚</span>
              <span>絞り込み</span>
              {activeCount > 0 && (
                <span className="rounded-full bg-accent-soft text-accent text-[10px] px-1.5 py-0.5">
                  {activeCount}
                </span>
              )}
            </span>
            <span aria-hidden className="text-subtle">
              {filtersOpen ? "▲" : "▼"}
            </span>
          </button>
        </div>

        <div className="mt-6 md:mt-10 grid gap-6 md:gap-8 md:grid-cols-[220px_1fr]">
          <div className={filtersOpen ? "block" : "hidden md:block"}>
            <FacetSidebar
              sections={sections}
              selection={selection}
              onChange={onToggle}
              totalCount={items.length}
              matchedCount={matched.length}
            />
          </div>

          <section>
            <div className="flex items-baseline justify-between gap-3">
              <p className="text-xs text-subtle">{matched.length} 件</p>
              {activeCount > 0 && (
                <button
                  type="button"
                  onClick={onClear}
                  className="text-xs text-muted hover:text-fg rounded-full border border-edge px-3 py-1"
                >
                  ファセットをクリア
                </button>
              )}
            </div>

            {matched.length === 0 ? (
              <p className="mt-8 text-sm text-muted">
                該当するアニメーションがありません。ファセットを緩めてください。
              </p>
            ) : (
              <ul className="mt-4 grid gap-4 sm:grid-cols-2">
                {matched.map((a) => (
                  <li key={a.id}>
                    <AnimationCard a={a} fromHref={fromHref} />
                  </li>
                ))}
              </ul>
            )}
          </section>
        </div>
      </div>
    </main>
  );
}

/**
 * カテゴリ内のファセット値だけを抜き出す（全体集計から該当カテゴリ分のみ counting）。
 * 各ファセットキーごとに animations[].* の値を集計する。
 */
function pickValuesForCategory(
  _all: FacetValue[],
  items: AnimationSummary[],
  key: FacetKey,
): FacetValue[] {
  const map = new Map<string, number>();
  for (const a of items) {
    const vs = valuesOf(a, key);
    for (const v of vs) map.set(v, (map.get(v) ?? 0) + 1);
  }
  return [...map.entries()]
    .map(([value, count]) => ({ value, count }))
    .sort((x, y) => y.count - x.count || x.value.localeCompare(y.value));
}

function valuesOf(a: AnimationSummary, key: FacetKey): string[] {
  switch (key) {
    case "release":
      return [a.release];
    case "trigger":
      return [a.triggerPrimary];
    case "lifecycle":
      return [a.lifecycle];
    case "perfCost":
      return [a.perfCost];
    case "baseline":
      return [a.baseline];
    case "reducedMotion":
      return [a.reducedMotion ? "対応" : "未対応"];
    case "implementation":
      return a.implementations.map((i) => i.name);
    case "layer":
      return a.layers;
    case "media":
      return a.media;
  }
}

function filter(
  items: AnimationSummary[],
  selection: FacetSelection,
): AnimationSummary[] {
  return items.filter((a) =>
    FACET_KEYS.every((key) => {
      const sel = selection[key];
      if (sel.length === 0) return true;
      const vs = valuesOf(a, key);
      return sel.some((s) => vs.includes(s));
    }),
  );
}
