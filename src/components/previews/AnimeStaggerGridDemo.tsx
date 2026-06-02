"use client";

import { useEffect, useRef } from "react";
import { animate, stagger } from "animejs";

const COLS = 6;
const ROWS = 4;
const CELL_COUNT = COLS * ROWS;

/**
 * anime-stagger-grid の Tier 1（anime.js v4 stagger / grid）プレビュー。
 * グリッドのセルが中心から波状に拡散しながら登場し、loop + alternate で常時再生。
 * anime.js は prefers-reduced-motion を自動尊重しないため手動でガードし、
 * Reduce Motion 時は animate() を生成せず静止表示にする。
 * cleanup で anim.pause() + anim.revert() を呼び、unmount 時に必ず破棄・原状回復する。
 */
export function AnimeStaggerGridDemo() {
  const rootRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const cells = root.querySelectorAll<HTMLElement>(".cell");
    const anim = animate(cells, {
      scale: [0.2, 1],
      opacity: [0.15, 1],
      translateY: [18, 0],
      ease: "outElastic(1, .65)",
      duration: 1100,
      delay: stagger(70, { grid: [COLS, ROWS], from: "center" }),
      loop: true,
      alternate: true,
    });

    return () => {
      anim.pause();
      anim.revert();
    };
  }, []);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center gap-8 bg-zinc-950 text-zinc-100 px-8 py-16">
      <div className="text-center">
        <h2 className="text-2xl font-semibold tracking-tight">Anime.js Stagger Grid</h2>
        <p className="mt-2 text-sm text-zinc-400">
          中心から波状に広がる grid stagger（ループ再生）
        </p>
      </div>

      <div
        ref={rootRef}
        className="grid gap-3"
        style={{ gridTemplateColumns: `repeat(${COLS}, minmax(0, 1fr))` }}
        aria-hidden="true"
      >
        {Array.from({ length: CELL_COUNT }, (_, i) => (
          <div
            key={i}
            className="cell h-10 w-10 rounded-md bg-lime-300 shadow-[0_0_18px_-4px_#a3e635] sm:h-12 sm:w-12"
          />
        ))}
      </div>

      <p className="text-xs text-zinc-500">
        anime.js v4 · stagger(grid, from: &quot;center&quot;)
      </p>
    </div>
  );
}
