"use client";

import { useEffect, useRef } from "react";
import { useReducedMotion } from "motion/react";

/**
 * wapi-flip-counter の Tier 1（Web Animations API）プレビュー。
 * 数字が縦にフリップ（element.animate）して次の値へ切り替わる自動カウントアップ。
 * ライブラリ非依存（WAAPI のみ）。Reduce Motion ON では即時差し替えに縮退。
 *
 * lint 対策:
 * - useEffect 本体で setState を同期呼びしない（値は ref + DOM 直接更新で進める）。
 * - ref.current への代入は useEffect 内のみ。
 * - setInterval は unmount で必ず clearInterval。
 */

const DIGIT_HEIGHT = 56;
const STEP_MS = 1000;
const FLIP_MS = 460;
const DIGITS = 4; // 0000-9999 をゼロ埋め表示

export function WapiFlipCounterDemo() {
  const reduceMotion = useReducedMotion();
  const reduceRef = useRef(reduceMotion);
  // 各桁の枠 ref。flip-current / flip-incoming の二枚を内包する。
  const cellRefs = useRef<Array<HTMLSpanElement | null>>([]);
  const valueRef = useRef(0);

  // render 中ではなく effect 内で最新の reduce 設定を ref に反映する。
  useEffect(() => {
    reduceRef.current = reduceMotion;
  }, [reduceMotion]);

  useEffect(() => {
    const flipCell = (cell: HTMLSpanElement, next: string) => {
      const current = cell.querySelector<HTMLElement>("[data-current]");
      const incoming = cell.querySelector<HTMLElement>("[data-incoming]");
      if (!current || !incoming) return;
      if (current.textContent === next) return;

      incoming.textContent = next;

      if (reduceRef.current) {
        current.textContent = next; // 即時差し替え
        return;
      }

      const opts: KeyframeAnimationOptions = {
        duration: FLIP_MS,
        easing: "cubic-bezier(.22,.61,.36,1)",
        fill: "forwards",
      };
      const outgoing = current.animate(
        [
          { transform: "translateY(0)", opacity: 1 },
          { transform: `translateY(-${DIGIT_HEIGHT}px)`, opacity: 0 },
        ],
        opts,
      );
      incoming.animate(
        [
          { transform: `translateY(${DIGIT_HEIGHT}px)`, opacity: 0 },
          { transform: "translateY(0)", opacity: 1 },
        ],
        opts,
      );
      outgoing.onfinish = () => {
        current.textContent = next;
        current.style.transform = "translateY(0)";
        current.style.opacity = "1";
      };
    };

    const render = (n: number) => {
      const padded = String(n % 10 ** DIGITS).padStart(DIGITS, "0");
      for (let i = 0; i < DIGITS; i++) {
        const cell = cellRefs.current[i];
        if (cell) flipCell(cell, padded[i]);
      }
    };

    const id = window.setInterval(() => {
      valueRef.current = (valueRef.current + 1) % 10 ** DIGITS;
      render(valueRef.current);
    }, STEP_MS);

    return () => window.clearInterval(id);
  }, []);

  return (
    <div className="min-h-screen w-full flex flex-col items-center justify-center gap-8 bg-zinc-950 text-zinc-100 px-6">
      <p className="text-sm uppercase tracking-[0.2em] text-zinc-500">
        Live Visitors
      </p>

      <div
        className="flex items-center gap-1 rounded-2xl border border-white/10 bg-gradient-to-b from-zinc-900 to-zinc-950 px-6 py-5 shadow-xl"
        aria-live="polite"
        aria-label="自動カウントアップ中のカウンタ"
      >
        {Array.from({ length: DIGITS }).map((_, i) => (
          <span
            key={i}
            ref={(el) => {
              cellRefs.current[i] = el;
            }}
            className="relative block overflow-hidden font-mono font-semibold text-lime-300 tabular-nums"
            style={{
              height: DIGIT_HEIGHT,
              width: DIGIT_HEIGHT * 0.62,
              fontSize: DIGIT_HEIGHT * 0.74,
              lineHeight: `${DIGIT_HEIGHT}px`,
            }}
          >
            <span
              data-current
              className="absolute inset-0 flex items-center justify-center will-change-transform"
            >
              0
            </span>
            <span
              data-incoming
              aria-hidden
              className="absolute inset-0 flex items-center justify-center opacity-0 will-change-transform"
            >
              0
            </span>
          </span>
        ))}
      </div>

      <p className="text-xs text-zinc-500">
        Web Animations API（element.animate）のみ・ライブラリ非依存
      </p>
    </div>
  );
}
