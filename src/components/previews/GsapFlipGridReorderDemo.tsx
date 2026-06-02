"use client";

import { useEffect, useRef } from "react";
import gsap from "gsap";
import { Flip } from "gsap/Flip";

/**
 * gsap-flip-grid-reorder の Tier 1（GSAP + Flip）プレビュー。
 * 一定間隔で CSS Grid 項目を自動 shuffle し、Flip.from() で旧位置→新位置を補間する。
 * gsap.context() + ctx.revert() で unmount 時に必ずクリーンアップ。
 * Reduce Motion ON では shuffle 自体を止め、静止グリッドに縮退する。
 */
const TILES = [
  { label: "A", tone: "bg-lime-300 text-zinc-900" },
  { label: "B", tone: "bg-zinc-800 text-zinc-100" },
  { label: "C", tone: "bg-zinc-700 text-zinc-100" },
  { label: "D", tone: "bg-lime-300 text-zinc-900" },
  { label: "E", tone: "bg-zinc-800 text-zinc-100" },
  { label: "F", tone: "bg-zinc-700 text-zinc-100" },
  { label: "G", tone: "bg-zinc-800 text-zinc-100" },
  { label: "H", tone: "bg-lime-300 text-zinc-900" },
  { label: "I", tone: "bg-zinc-700 text-zinc-100" },
];

export function GsapFlipGridReorderDemo() {
  const rootRef = useRef<HTMLDivElement>(null);
  const gridRef = useRef<HTMLUListElement>(null);

  useEffect(() => {
    const grid = gridRef.current;
    if (!grid) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    gsap.registerPlugin(Flip);

    let intervalId: number | undefined;
    let startId: number | undefined;

    const ctx = gsap.context(() => {
      const shuffle = () => {
        // 1. 現在のレイアウトを記録
        const state = Flip.getState(grid.children);

        // 2. DOM 順序をランダムに並べ替え
        Array.from(grid.children)
          .map((el) => ({ el, k: Math.random() }))
          .sort((a, b) => a.k - b.k)
          .forEach(({ el }) => grid.appendChild(el));

        // 3. 記録した state から新位置へ補間
        Flip.from(state, {
          duration: 0.6,
          ease: "power2.inOut",
          stagger: 0.03,
          absolute: true,
        });
      };

      // 初回 shuffle はサムネイルを賑やかにするため少し遅らせて発火
      startId = window.setTimeout(shuffle, 600);
      intervalId = window.setInterval(shuffle, 2400);
    }, rootRef);

    return () => {
      if (startId !== undefined) window.clearTimeout(startId);
      if (intervalId !== undefined) window.clearInterval(intervalId);
      ctx.revert();
    };
  }, []);

  return (
    <div
      ref={rootRef}
      className="min-h-screen flex flex-col items-center justify-center gap-8 bg-zinc-950 px-8 py-16 text-zinc-100"
    >
      <div className="text-center">
        <h2 className="text-2xl font-semibold tracking-tight">GSAP Flip Grid Reorder</h2>
        <p className="mt-2 text-sm text-zinc-400">
          一定間隔で <span className="text-lime-300">Flip</span> がグリッドを並べ替えます
        </p>
      </div>

      <ul ref={gridRef} className="grid grid-cols-3 gap-3">
        {TILES.map((tile) => (
          <li
            key={tile.label}
            className={`flex h-20 w-20 items-center justify-center rounded-xl text-xl font-bold shadow-lg shadow-black/30 ${tile.tone}`}
          >
            {tile.label}
          </li>
        ))}
      </ul>

      <p className="text-xs text-zinc-500">
        Reduce Motion 時は静止します（並べ替えなし）
      </p>
    </div>
  );
}
