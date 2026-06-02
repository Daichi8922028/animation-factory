"use client";

import { useEffect, useRef, useState } from "react";

/**
 * wapi-ripple-click の Tier 1（Web Animations API / element.animate）プレビュー。
 * クリック / タップ位置から Material 風 ripple が広がる。一定間隔で自動 ripple も出して賑やかに。
 * Reduce Motion ON では ripple を一切出さず、押下時の色変化だけに縮退する。
 * ripple ノードは animation.onfinish で remove し、setInterval は unmount で必ず止める。
 */
export function WapiRippleClickDemo() {
  const hostRef = useRef<HTMLButtonElement>(null);
  const [clickCount, setClickCount] = useState(0);

  // 指定座標（ホスト要素ローカル px）を起点に ripple を 1 つ生成して再生する。
  const spawnRipple = (localX: number, localY: number) => {
    const host = hostRef.current;
    if (!host) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const rect = host.getBoundingClientRect();
    const size = Math.max(rect.width, rect.height) * 2;

    const ripple = document.createElement("span");
    ripple.style.position = "absolute";
    ripple.style.left = `${localX - size / 2}px`;
    ripple.style.top = `${localY - size / 2}px`;
    ripple.style.width = `${size}px`;
    ripple.style.height = `${size}px`;
    ripple.style.borderRadius = "9999px";
    ripple.style.background = "rgba(163, 230, 53, 0.35)";
    ripple.style.pointerEvents = "none";
    host.appendChild(ripple);

    const anim = ripple.animate(
      [
        { transform: "scale(0)", opacity: 0.6 },
        { transform: "scale(1)", opacity: 0 },
      ],
      { duration: 600, easing: "cubic-bezier(0.4, 0, 0.2, 1)" },
    );
    anim.onfinish = () => ripple.remove();
  };

  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    // 一定間隔でホスト中央付近のランダム位置から自動 ripple（サムネイルを賑やかに）。
    const id = window.setInterval(() => {
      const host = hostRef.current;
      if (!host) return;
      const rect = host.getBoundingClientRect();
      const x = rect.width * (0.3 + Math.random() * 0.4);
      const y = rect.height * (0.3 + Math.random() * 0.4);
      spawnRipple(x, y);
      setClickCount((c) => c + 1);
    }, 1500);

    return () => window.clearInterval(id);
  }, []);

  const handlePointerDown = (e: React.PointerEvent<HTMLButtonElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    spawnRipple(e.clientX - rect.left, e.clientY - rect.top);
    setClickCount((c) => c + 1);
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center gap-8 bg-zinc-950 text-zinc-100 px-8">
      <p className="text-sm text-zinc-500">クリック位置から WAAPI で ripple が広がる</p>

      <button
        ref={hostRef}
        type="button"
        onPointerDown={handlePointerDown}
        className="relative overflow-hidden rounded-2xl bg-zinc-800 px-12 py-7 text-lg font-semibold text-zinc-100 shadow-lg shadow-black/30 outline-none transition-colors active:bg-zinc-700 focus-visible:ring-2 focus-visible:ring-lime-300 focus-visible:ring-offset-2 focus-visible:ring-offset-zinc-950"
      >
        どこでもクリック
      </button>

      <p className="text-xs tabular-nums text-zinc-600">
        ripple: <span className="text-lime-300">{clickCount}</span>
      </p>
    </div>
  );
}
