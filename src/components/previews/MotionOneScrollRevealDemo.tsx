"use client";

import { useEffect, useRef } from "react";
import { scroll } from "@motionone/dom";

/**
 * motion-one-scroll-reveal の Tier 1（Motion One scroll()）プレビュー。
 * ネストしたスクロールコンテナの進行に連動して、対象を fade + scale で reveal する。
 * サムネイルを賑やかにするため、コンテナを rAF で自動スクロール（上下に往復ループ）し、
 * 実ユーザーのスクロールでも反応する。
 * Reduce Motion ON では scroll() を生成せず、最終状態で即時表示する縮退に。
 * scroll() の cleanup と rAF は unmount で必ず破棄する。
 */
export function MotionOneScrollRevealDemo() {
  const containerRef = useRef<HTMLDivElement>(null);
  const targetRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const container = containerRef.current;
    const target = targetRef.current;
    if (!container || !target) return;

    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      // 縮退: 進行連動せず最終状態で即時表示
      target.style.opacity = "1";
      target.style.transform = "scale(1)";
      return;
    }

    // scroll() は cleanup 関数（VoidFunction）を返す。
    // コールバックは rAF 内で呼ばれるため、ここでの DOM 書き込みは effect 同期実行ではない。
    const cancelScroll = scroll(
      ({ y }) => {
        const p = y.progress; // 0 → 1
        target.style.opacity = String(p);
        target.style.transform = `scale(${(0.92 + p * 0.08).toFixed(4)})`;
      },
      { container, target, offset: ["start end", "center center"] },
    );

    // 自動スクロール（往復）でサムネイルを賑やかに。
    let rafId = 0;
    let dir = 1;
    const speed = 2; // px / frame
    const step = () => {
      const max = container.scrollHeight - container.clientHeight;
      if (max > 0) {
        let next = container.scrollTop + dir * speed;
        if (next >= max) {
          next = max;
          dir = -1;
        } else if (next <= 0) {
          next = 0;
          dir = 1;
        }
        container.scrollTop = next;
      }
      rafId = window.requestAnimationFrame(step);
    };
    rafId = window.requestAnimationFrame(step);

    return () => {
      cancelScroll();
      window.cancelAnimationFrame(rafId);
    };
  }, []);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center gap-4 bg-zinc-950 text-zinc-100 px-8 py-8">
      <p className="text-sm text-zinc-500">
        Motion One の scroll() でスクロール進行に reveal を連動
      </p>

      <div
        ref={containerRef}
        className="relative h-[60vh] w-full max-w-md overflow-y-auto rounded-2xl border border-white/10 bg-gradient-to-b from-zinc-900 to-zinc-950"
      >
        <div className="flex h-[120%] items-end justify-center p-6 text-xs text-zinc-600">
          ↓ スクロールで進行 0 → 1
        </div>

        <div className="sticky top-1/2 flex -translate-y-1/2 justify-center">
          <div
            ref={targetRef}
            className="rounded-2xl bg-lime-300 px-10 py-8 text-center text-lg font-semibold text-zinc-950 shadow-lg shadow-lime-300/20"
            style={{ opacity: 0, transform: "scale(0.92)", willChange: "transform, opacity" }}
          >
            Scroll Reveal
          </div>
        </div>

        <div className="flex h-[120%] items-start justify-center p-6 text-xs text-zinc-600">
          ↑ 巻き戻すと逆再生（reversible）
        </div>
      </div>

      <p className="text-xs text-zinc-600">
        accent <span className="text-lime-300">#a3e635</span> / 自動スクロールでループ
      </p>
    </div>
  );
}
