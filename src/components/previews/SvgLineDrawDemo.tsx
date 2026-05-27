"use client";

import { useEffect, useRef, useState } from "react";
import styles from "./SvgLineDrawDemo.module.css";

/**
 * svg-line-draw の Tier 1（純 CSS + IO）プレビュー。
 * viewport 進入時に .isIn クラスを付け、stroke-dashoffset 1 → 0 で描画。
 * IO は一度発火で unobserve、再生は明示ボタンで replay。
 */
export function SvgLineDrawDemo() {
  const ref = useRef<SVGSVGElement>(null);
  const [seq, setSeq] = useState(0);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    // replay 用にクラスを一度外して付け直す
    el.classList.remove(styles.isIn);
    // reflow を挟んで transition を発火
    void el.getBoundingClientRect();
    const t = setTimeout(() => el.classList.add(styles.isIn), 60);
    return () => clearTimeout(t);
  }, [seq]);

  return (
    <div className="min-h-screen flex items-center justify-center p-8 flex-col gap-6 bg-zinc-950">
      <svg
        ref={ref}
        viewBox="0 0 200 200"
        width={220}
        height={220}
        fill="none"
        stroke="currentColor"
        strokeWidth={3}
        strokeLinecap="round"
        strokeLinejoin="round"
        className={styles.svg}
        aria-hidden="true"
      >
        {/* チェックマーク + 円 の 2 パス。両方とも pathLength="1" */}
        <path
          d="M40 100 A60 60 0 1 1 160 100 A60 60 0 1 1 40 100 Z"
          pathLength="1"
        />
        <path d="M70 105 L92 128 L132 78" pathLength="1" />
      </svg>
      <button
        onClick={() => setSeq((s) => s + 1)}
        className="text-xs text-zinc-400 hover:text-zinc-200 border border-white/10 rounded-md px-3 py-1.5"
      >
        Replay
      </button>
    </div>
  );
}
