"use client";

import { animate, motion, useMotionValue, useReducedMotion } from "motion/react";
import { useEffect, useState } from "react";

const SNAP_Y = [210, 110, 12]; // peek, half, full（translateY px）
const LABELS = ["peek", "half", "full"];

/** bottom-sheet-snap-points のプレビュー。peek/half/full を自動巡回 + 縦ドラッグでスナップ。 */
export function BottomSheetSnapPointsDemo() {
  const y = useMotionValue(SNAP_Y[0]);
  const [idx, setIdx] = useState(0);
  const reduce = useReducedMotion();

  useEffect(() => {
    const controls = animate(
      y,
      SNAP_Y[idx],
      reduce ? { duration: 0 } : { type: "spring", stiffness: 300, damping: 32 },
    );
    return () => controls.stop();
  }, [idx, y, reduce]);

  useEffect(() => {
    const t = setInterval(() => setIdx((i) => (i + 1) % SNAP_Y.length), 1900);
    return () => clearInterval(t);
  }, []);

  const snap = () => {
    const cur = y.get();
    let nearest = 0;
    SNAP_Y.forEach((s, i) => {
      if (Math.abs(s - cur) < Math.abs(SNAP_Y[nearest] - cur)) nearest = i;
    });
    setIdx(nearest);
  };

  return (
    <div className="min-h-screen relative flex items-center justify-center bg-zinc-950 text-zinc-100">
      <div className="relative h-[420px] w-72 overflow-hidden rounded-2xl border border-white/10 bg-zinc-900/40">
        <div className="p-4 text-xs text-zinc-500">地図 / 一覧（背景）</div>
        <motion.div
          drag="y"
          style={{ y }}
          dragConstraints={{ top: SNAP_Y[2], bottom: SNAP_Y[0] }}
          dragElastic={0.05}
          onDragEnd={snap}
          role="dialog"
          aria-label="詳細シート"
          className="absolute inset-x-0 bottom-0 h-[380px] cursor-grab rounded-t-2xl border-t border-white/10 bg-zinc-900 shadow-2xl shadow-black/60 active:cursor-grabbing"
        >
          <div className="mx-auto mt-2 h-1.5 w-10 rounded-full bg-white/20" aria-hidden />
          <div className="p-4">
            <h3 className="text-sm font-semibold">ドラッグで段階を変える</h3>
            <p className="mt-1 text-xs text-zinc-400">
              peek / half / full にスナップ（現在: {LABELS[idx]}）
            </p>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
