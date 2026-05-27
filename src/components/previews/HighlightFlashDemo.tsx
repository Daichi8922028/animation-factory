"use client";

import { useEffect, useState } from "react";
import styles from "./HighlightFlashDemo.module.css";

/** highlight-flash のプレビュー。検索ヒット風の擬似テーブル行を 2 秒ごとに点滅。 */
export function HighlightFlashDemo() {
  const rows = ["Alpha", "Beta", "Gamma", "Delta"];
  const [hitIndex, setHitIndex] = useState(0);
  const [seq, setSeq] = useState(0);

  useEffect(() => {
    const t = setInterval(() => {
      setHitIndex((i) => (i + 1) % rows.length);
      setSeq((s) => s + 1);
    }, 1800);
    return () => clearInterval(t);
  }, [rows.length]);

  return (
    <div className="min-h-screen flex items-center justify-center p-8 bg-zinc-950 text-zinc-100">
      <div className="w-full max-w-sm rounded-xl border border-white/10 overflow-hidden">
        {rows.map((label, i) => (
          <div
            key={`${label}-${hitIndex === i ? seq : "static"}`}
            className={`${styles.target} ${
              hitIndex === i ? styles.isFlash : ""
            } px-4 py-3 text-sm border-b border-white/5 last:border-b-0 ${
              hitIndex === i ? "text-zinc-100" : "text-zinc-500"
            }`}
          >
            {label}
          </div>
        ))}
      </div>
    </div>
  );
}
