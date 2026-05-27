"use client";

import { kitDownloadHref, useKit } from "@/lib/kit";

/**
 * 画面下に sticky で出る選択バー。
 * - kit が 0 件のときは何も表示しない
 * - hydration 前は描画しない（SSR と localStorage の不一致を避ける）
 */
export function KitBar() {
  const { ids, hydrated, clear } = useKit();

  if (!hydrated || ids.length === 0) return null;

  return (
    <div className="fixed inset-x-0 bottom-0 z-30 flex justify-center pointer-events-none px-4 pb-4">
      <div className="pointer-events-auto flex items-center gap-3 rounded-full border border-edge-strong bg-overlay backdrop-blur px-4 py-2 shadow-lg shadow-black/30 dark:shadow-black/60">
        <span className="text-xs uppercase tracking-widest text-subtle">
          kit
        </span>
        <span className="text-sm text-fg">
          {ids.length}{" "}
          <span className="text-subtle text-xs">selected</span>
        </span>
        <button
          type="button"
          onClick={clear}
          className="text-xs text-muted hover:text-fg transition-colors px-2"
        >
          クリア
        </button>
        <a
          href={kitDownloadHref(ids)}
          className="rounded-full bg-accent-soft border border-accent/40 text-accent px-3 py-1.5 text-xs font-medium hover:bg-accent/20 transition-colors"
        >
          Kit を DL
        </a>
      </div>
    </div>
  );
}
