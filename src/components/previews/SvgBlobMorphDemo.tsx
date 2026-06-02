"use client";

import { motion, useReducedMotion } from "motion/react";

/**
 * svg-blob-morph の Tier 1（React + Motion）プレビュー。
 * 有機的な blob の SVG path d を複数形状へ連続モーフ（continuous / autoplay）。
 * 各 path は同じコマンド構造（C 4 つ）で揃えているため d を滑らかに補間できる。
 * Reduce Motion ON では最初の形状を静止表示（アニメ無し）。
 *
 * lint: setState を useEffect 内で同期呼びしない（ここでは state も effect も未使用）。
 * 自己完結（ネットワーク無し / 外部アセット無し / 追加 import 無し）。
 */

// すべて "M … C … C … C … C … Z" の同一コマンド構造（4 つの 3 次ベジェ）。
// 中心 (100,100) 周りの有機的な閉曲線を 4 形状用意し、最後に先頭へ戻してループ。
const BLOB_SHAPES = [
  "M100 28 C140 24 176 52 178 96 C180 140 148 176 100 176 C52 176 24 138 26 96 C28 54 60 32 100 28 Z",
  "M100 22 C150 30 170 60 172 104 C174 148 140 182 96 178 C52 174 30 140 28 98 C26 56 50 14 100 22 Z",
  "M100 30 C138 18 178 48 176 92 C174 136 152 174 102 176 C52 178 22 150 26 102 C30 54 62 42 100 30 Z",
  "M100 26 C146 28 172 56 174 100 C176 144 142 178 98 176 C54 174 28 144 30 100 C32 56 54 24 100 26 Z",
] as const;

export function SvgBlobMorphDemo() {
  const reduce = useReducedMotion();

  // 先頭形状へ戻す閉ループ用シーケンス。
  const sequence = [...BLOB_SHAPES, BLOB_SHAPES[0]];

  return (
    <div className="min-h-screen flex flex-col items-center justify-center gap-8 bg-zinc-950 text-zinc-100 p-8">
      <svg
        viewBox="0 0 200 200"
        width={220}
        height={220}
        role="img"
        aria-label="有機的な blob が連続して形を変えるアニメーション"
        className="drop-shadow-[0_0_40px_rgba(163,230,53,0.25)]"
      >
        <defs>
          <linearGradient id="blob-morph-grad" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#a3e635" />
            <stop offset="100%" stopColor="#22d3ee" />
          </linearGradient>
        </defs>

        <motion.path
          fill="url(#blob-morph-grad)"
          initial={{ d: BLOB_SHAPES[0] }}
          animate={reduce ? { d: BLOB_SHAPES[0] } : { d: sequence }}
          transition={
            reduce
              ? { duration: 0 }
              : {
                  duration: 8,
                  ease: "easeInOut",
                  repeat: Infinity,
                  repeatType: "loop",
                }
          }
        />
      </svg>

      <div className="text-center max-w-xs">
        <h3 className="text-xl font-semibold tracking-tight text-zinc-100">
          SVG Blob Morph
        </h3>
        <p className="mt-2 text-sm text-zinc-400">
          path の <span className="text-lime-300">d</span> をキーフレームで連続モーフ。装飾的な背景演出に。
        </p>
      </div>
    </div>
  );
}
