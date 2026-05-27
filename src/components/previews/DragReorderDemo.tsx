"use client";

import { Reorder } from "motion/react";
import { useState } from "react";

/** drag-reorder のプレビュー。Reorder.Group + Reorder.Item で並び替え。 */
export function DragReorderDemo() {
  const [items, setItems] = useState([
    "デザイン: 仕様確定",
    "実装: ルーティング",
    "実装: コンポーネント",
    "QA: クロスブラウザ",
    "デプロイ準備",
  ]);

  return (
    <div className="min-h-screen flex items-center justify-center p-8 bg-zinc-950 text-zinc-100">
      <div className="w-full max-w-sm">
        <p className="text-xs text-zinc-500 mb-3">
          項目をドラッグして並び替え
        </p>
        <Reorder.Group
          axis="y"
          values={items}
          onReorder={setItems}
          className="space-y-2"
        >
          {items.map((it) => (
            <Reorder.Item
              key={it}
              value={it}
              className="bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-sm cursor-grab active:cursor-grabbing flex items-center gap-3"
              whileDrag={{
                scale: 1.04,
                boxShadow: "0 10px 30px rgba(0,0,0,0.4)",
              }}
            >
              <span className="text-zinc-500 select-none">⋮⋮</span>
              <span>{it}</span>
            </Reorder.Item>
          ))}
        </Reorder.Group>
      </div>
    </div>
  );
}
