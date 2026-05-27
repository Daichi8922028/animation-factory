"use client";

import { useEffect, useRef, useState } from "react";

type Size = "sm" | "md";

/**
 * クリップボードコピーボタン。
 * - クリックで `navigator.clipboard.writeText(text)`
 * - 成功時は ~1.6 秒「コピーしました」表示
 * - 失敗時は execCommand("copy") にフォールバック
 */
export function CopyButton({
  text,
  label = "コピー",
  doneLabel = "コピーしました",
  size = "sm",
  variant = "ghost",
}: {
  text: string;
  label?: string;
  doneLabel?: string;
  size?: Size;
  variant?: "ghost" | "primary";
}) {
  const [done, setDone] = useState(false);
  const t = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(
    () => () => {
      if (t.current) clearTimeout(t.current);
    },
    [],
  );

  const onClick = async () => {
    try {
      if (navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(text);
      } else {
        // フォールバック
        const ta = document.createElement("textarea");
        ta.value = text;
        ta.style.position = "fixed";
        ta.style.opacity = "0";
        document.body.appendChild(ta);
        ta.select();
        document.execCommand("copy");
        document.body.removeChild(ta);
      }
      setDone(true);
      if (t.current) clearTimeout(t.current);
      t.current = setTimeout(() => setDone(false), 1600);
    } catch {
      // 失敗してもサイレント。フォーカスは奪わない
    }
  };

  const sized =
    size === "md" ? "text-sm px-3 py-1.5" : "text-[11px] px-2.5 py-1";
  const palette =
    variant === "primary"
      ? done
        ? "bg-accent text-base border border-accent"
        : "bg-accent-soft text-accent border border-accent/40 hover:bg-accent/25"
      : done
      ? "bg-accent-soft text-accent border border-accent/40"
      : "bg-surface text-fg border border-edge hover:bg-surface-strong";

  return (
    <button
      type="button"
      onClick={onClick}
      aria-live="polite"
      className={`inline-flex items-center gap-1.5 rounded-md ${sized} ${palette} transition-colors font-medium`}
    >
      <span aria-hidden>{done ? "✓" : "⧉"}</span>
      <span>{done ? doneLabel : label}</span>
    </button>
  );
}
