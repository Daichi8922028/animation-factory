"use client";

import { useEffect, useRef, useState } from "react";

type Item = { id: string; name: string; score: number };

const BASE: Item[] = [
  { id: "a", name: "Alpha", score: 42 },
  { id: "b", name: "Bravo", score: 88 },
  { id: "c", name: "Charlie", score: 17 },
  { id: "d", name: "Delta", score: 63 },
  { id: "e", name: "Echo", score: 95 },
];

function startVT(cb: () => void) {
  const reduce =
    typeof window !== "undefined" &&
    window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;
  const doc = document as Document & {
    startViewTransition?: (cb: () => void) => unknown;
  };
  if (!reduce && typeof doc.startViewTransition === "function") doc.startViewTransition(cb);
  else cb();
}

/** view-transition-list-reorder のプレビュー。スコアを変えて並び替え、各行が新位置へ morph。 */
export function ViewTransitionListReorderDemo() {
  const [items, setItems] = useState<Item[]>(() =>
    [...BASE].sort((a, b) => b.score - a.score),
  );
  const ref = useRef(items);
  useEffect(() => {
    ref.current = items;
  }, [items]);

  useEffect(() => {
    const t = setInterval(() => {
      const next = ref.current
        .map((it) => ({ ...it, score: (it.score * 7 + 31) % 100 }))
        .sort((a, b) => b.score - a.score);
      startVT(() => setItems(next));
    }, 2400);
    return () => clearInterval(t);
  }, []);

  return (
    <div className="min-h-screen flex items-center justify-center bg-zinc-950 p-8 text-zinc-100">
      <ul className="w-72 space-y-2">
        {items.map((it, i) => (
          <li
            key={it.id}
            style={{ viewTransitionName: `vtlr-${it.id}` }}
            className="flex items-center justify-between rounded-lg border border-white/10 bg-zinc-900 px-4 py-2.5 text-sm"
          >
            <span className="flex items-center gap-3">
              <span className="tabular-nums text-zinc-500">{i + 1}</span>
              {it.name}
            </span>
            <span className="tabular-nums text-lime-300">{it.score}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
