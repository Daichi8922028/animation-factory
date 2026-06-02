"use client";

import { useEffect, useState } from "react";
import {
  motion,
  useMotionValue,
  useTransform,
  useReducedMotion,
  animate,
} from "motion/react";

/**
 * svg-progress-ring の Tier 1（motion + strokeDashoffset 補間）プレビュー。
 * 進捗 0→100% を自動ループ。外周の充填と中央の数値を同じ MotionValue から導出するため必ず一致する。
 * Reduce Motion ON では補間せず、目標値を即時に表示。
 */
const SIZE = 160;
const STROKE = 14;
const R = (SIZE - STROKE) / 2;
const CIRCUMFERENCE = 2 * Math.PI * R;

export function SvgProgressRingDemo() {
  const reduce = useReducedMotion();

  // 進捗(0..100)の単一ソース。円の offset と数値はここから導出する。
  const progress = useMotionValue(0);
  const offset = useTransform(progress, (v) => CIRCUMFERENCE * (1 - v / 100));

  // 表示用の整数テキストは MotionValue を購読して state に反映（render 中の setState は避ける）
  const [display, setDisplay] = useState(0);

  useEffect(() => {
    const unsub = progress.on("change", (v) => setDisplay(Math.round(v)));
    return () => unsub();
  }, [progress]);

  useEffect(() => {
    if (reduce) {
      // Reduce Motion: 補間せず満了状態を即時に
      progress.set(100);
      return;
    }

    let cancelled = false;
    let controls: ReturnType<typeof animate> | undefined;

    const cycle = () => {
      if (cancelled) return;
      progress.set(0);
      controls = animate(progress, 100, {
        duration: 1.8,
        ease: "easeInOut",
        onComplete: () => {
          if (cancelled) return;
          // 100% で少し止めてから次のループへ
          controls = animate(progress, 100, {
            duration: 0.6,
            onComplete: cycle,
          });
        },
      });
    };

    cycle();

    return () => {
      cancelled = true;
      controls?.stop();
    };
  }, [progress, reduce]);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center gap-6 p-8 bg-zinc-950 text-zinc-100">
      <div className="relative" style={{ width: SIZE, height: SIZE }}>
        <svg
          width={SIZE}
          height={SIZE}
          viewBox={`0 0 ${SIZE} ${SIZE}`}
          role="progressbar"
          aria-valuenow={display}
          aria-valuemin={0}
          aria-valuemax={100}
          aria-label="アップロード進捗"
        >
          <g
            transform={`rotate(-90 ${SIZE / 2} ${SIZE / 2})`}
            fill="none"
          >
            <circle
              cx={SIZE / 2}
              cy={SIZE / 2}
              r={R}
              stroke="rgba(255,255,255,0.1)"
              strokeWidth={STROKE}
            />
            <motion.circle
              cx={SIZE / 2}
              cy={SIZE / 2}
              r={R}
              stroke="#a3e635"
              strokeWidth={STROKE}
              strokeLinecap="round"
              strokeDasharray={CIRCUMFERENCE}
              style={{ strokeDashoffset: offset }}
            />
          </g>
        </svg>

        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-4xl font-semibold tabular-nums tracking-tight text-lime-300">
            {display}
            <span className="text-xl text-zinc-400">%</span>
          </span>
          <span className="mt-0.5 text-[11px] uppercase tracking-widest text-zinc-500">
            uploading
          </span>
        </div>
      </div>

      <p className="text-sm text-zinc-500">
        strokeDashoffset を補間して円が 0→100% に埋まります
      </p>
    </div>
  );
}
