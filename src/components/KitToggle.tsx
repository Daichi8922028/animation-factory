"use client";

import { useKit } from "@/lib/kit";

/**
 * アニメーション 1 件の「Kit に追加 / 解除」トグル。
 * カードでも詳細ページでも使う共通 UI。size で 2 段階を切り替える。
 */
export function KitToggle({
  id,
  size = "sm",
}: {
  id: string;
  size?: "sm" | "md";
}) {
  const { has, toggle, hydrated } = useKit();
  const selected = has(id);

  const stop = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    toggle(id);
  };

  const base =
    "inline-flex items-center gap-1.5 rounded-full border transition-colors font-medium";
  const sized =
    size === "md" ? "text-sm px-3 py-1.5" : "text-[11px] px-2.5 py-1";
  const palette = selected
    ? "border-accent/50 text-accent bg-accent-soft hover:bg-accent/25"
    : "border-edge-strong text-fg bg-surface hover:bg-surface-strong";

  // hydration 前は中立のスタイルで描画して flicker を抑える
  const cls = hydrated
    ? `${base} ${sized} ${palette}`
    : `${base} ${sized} border-edge text-subtle bg-surface`;

  return (
    <button type="button" aria-pressed={selected} onClick={stop} className={cls}>
      <span aria-hidden>{selected ? "✓" : "+"}</span>
      <span>{selected ? "in kit" : "add to kit"}</span>
    </button>
  );
}
