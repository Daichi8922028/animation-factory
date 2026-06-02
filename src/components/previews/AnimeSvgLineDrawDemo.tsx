"use client";

import { useEffect, useRef } from "react";
import { animate, stagger, svg } from "animejs";
import type { JSAnimation } from "animejs";

/**
 * anime-svg-line-draw の Tier 1（anime.js v4 + svg.createDrawable）プレビュー。
 * 複数の SVG path を stroke draw（0→1）で順に描き、消して、ループ再生する。
 * Reduce Motion ON では描画アニメを行わず、完成形（draw 0 1）を即表示。
 * useEffect 内で animate インスタンスを保持し、unmount 時に .revert() でクリーンアップ。
 */
export function AnimeSvgLineDrawDemo() {
  const rootRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;

    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const paths = svg.createDrawable(root.querySelectorAll(".anime-draw-line"));

    if (reduce) {
      // 縮退: 線を全描画した完成形を即表示（アニメーションなし）
      animate(paths, { draw: "0 1", duration: 0 });
      return;
    }

    const anim: JSAnimation = animate(paths, {
      draw: ["0 0", "0 1", "1 1"],
      duration: 2600,
      delay: stagger(220),
      loop: true,
      loopDelay: 600,
      ease: "inOutQuad",
    });

    return () => {
      anim.revert();
    };
  }, []);

  return (
    <div
      ref={rootRef}
      className="min-h-screen flex flex-col items-center justify-center gap-8 bg-zinc-950 text-zinc-100 px-8"
    >
      <p className="text-sm uppercase tracking-[0.3em] text-zinc-500">
        Anime.js SVG Line Draw
      </p>

      <svg
        viewBox="0 0 280 160"
        className="w-[min(80vw,540px)]"
        role="img"
        aria-label="anime.js の svg.createDrawable で描かれる線画"
      >
        <title>Anime.js SVG line draw demo</title>
        {/* メインの山型ライン */}
        <path
          className="anime-draw-line"
          d="M24 124 L78 36 L134 124 L190 36 L246 124"
          fill="none"
          stroke="#a3e635"
          strokeWidth={5}
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        {/* 下線 */}
        <path
          className="anime-draw-line"
          d="M34 142 L246 142"
          fill="none"
          stroke="#a3e635"
          strokeOpacity={0.5}
          strokeWidth={3}
          strokeLinecap="round"
        />
        {/* 円のアクセント */}
        <path
          className="anime-draw-line"
          d="M134 80 m-30 0 a30 30 0 1 0 60 0 a30 30 0 1 0 -60 0"
          fill="none"
          stroke="#a3e635"
          strokeOpacity={0.4}
          strokeWidth={2}
        />
      </svg>

      <p className="text-sm text-zinc-400">
        svg.createDrawable を <span className="text-lime-300">draw: 0→1</span> で描画してループ
      </p>
    </div>
  );
}
