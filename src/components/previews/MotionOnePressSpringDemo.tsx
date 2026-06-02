"use client";

import { useEffect, useRef, useState } from "react";
import { animate, spring } from "@motionone/dom";

/**
 * motion-one-press-spring の Tier 1（Motion One spring()）プレビュー。
 * ボタン押下で spring() による弾みフィードバック。一定間隔で自動 press 再生 + 実クリックも反応。
 * Reduce Motion ON では一切アニメーションせず、押下時に色だけ変える縮退に。
 * setInterval / animate コントロールは unmount で必ず停止する。
 */
export function MotionOnePressSpringDemo() {
  const btnRef = useRef<HTMLButtonElement>(null);
  const controlsRef = useRef<{ stop: () => void } | null>(null);
  const [pressCount, setPressCount] = useState(0);

  // 押下フィードバックを1回再生する（自動・手動共通）。
  const playPress = () => {
    const el = btnRef.current;
    if (!el) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    controlsRef.current?.stop();
    controlsRef.current = animate(
      el,
      { transform: ["scale(1)", "scale(0.88)", "scale(1)"] },
      { easing: spring({ stiffness: 420, damping: 12 }), duration: 0.6 },
    );
  };

  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    // 一定間隔で自動 press（サムネイルを賑やかに）。
    const id = window.setInterval(() => {
      playPress();
      setPressCount((c) => c + 1);
    }, 1600);

    return () => {
      window.clearInterval(id);
      controlsRef.current?.stop();
    };
  }, []);

  const handleClick = () => {
    playPress();
    setPressCount((c) => c + 1);
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center gap-8 bg-zinc-950 text-zinc-100 px-8">
      <p className="text-sm text-zinc-500">Motion One の spring() で押下フィードバック</p>

      <button
        ref={btnRef}
        type="button"
        onClick={handleClick}
        className="rounded-2xl bg-lime-300 px-10 py-5 text-lg font-semibold text-zinc-950 shadow-lg shadow-lime-300/20 outline-none transition-colors active:bg-lime-200 focus-visible:ring-2 focus-visible:ring-lime-300 focus-visible:ring-offset-2 focus-visible:ring-offset-zinc-950"
        style={{ willChange: "transform" }}
      >
        押してみる
      </button>

      <p className="text-xs tabular-nums text-zinc-600">
        press: <span className="text-lime-300">{pressCount}</span>
      </p>
    </div>
  );
}
