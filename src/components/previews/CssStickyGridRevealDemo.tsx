"use client";

import { useEffect, useRef } from "react";
import styles from "./CssStickyGridRevealDemo.module.css";

/**
 * css-sticky-grid-reveal の Tier 1（純 CSS、position: sticky + animation-timeline: view()）プレビュー。
 * sticky なグリッドが、スクロール進入に応じて各セルを順次 reveal / scale する。
 * カタログのサムネイルを賑やかにするため、内部スクロールコンテナを rAF で自動往復させてループ再生する。
 * Reduce Motion ON では自動スクロールせず、CSS 側も @supports/@media で即時表示に縮退（JS アニメは一切なし）。
 */
export function CssStickyGridRevealDemo() {
  const scrollerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = scrollerRef.current;
    if (!el) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    let raf = 0;
    let start: number | null = null;
    const cycleMs = 5200; // 往復 1 周期

    const tick = (t: number) => {
      if (start === null) start = t;
      const max = el.scrollHeight - el.clientHeight;
      if (max > 0) {
        const phase = ((t - start) % cycleMs) / cycleMs; // 0..1
        // 0->1->0 の三角波でスムーズに往復
        const tri = phase < 0.5 ? phase * 2 : (1 - phase) * 2;
        // イーズして端での折り返しを滑らかに
        const eased = tri * tri * (3 - 2 * tri);
        el.scrollTop = eased * max;
      }
      raf = requestAnimationFrame(tick);
    };

    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, []);

  return (
    <div className="min-h-screen flex items-center justify-center bg-zinc-950 text-zinc-100 p-6">
      <div className="w-full max-w-lg">
        <p className="mb-3 text-center text-xs text-zinc-500">
          sticky なグリッドがスクロール進入で順次 reveal します（JS アニメなし・純 CSS）
        </p>

        <div
          ref={scrollerRef}
          className="h-[70vh] overflow-y-auto rounded-2xl border border-white/10 bg-gradient-to-b from-zinc-900 to-zinc-950"
        >
          <div className={styles.stage}>
            <div className={styles.grid}>
              {Array.from({ length: 6 }).map((_, i) => (
                <article
                  key={i}
                  className={`${styles.cell} flex aspect-square flex-col items-center justify-center rounded-xl border border-white/10 bg-white/5`}
                >
                  <span className="text-2xl font-semibold tracking-tight text-lime-300">
                    {i + 1}
                  </span>
                  <span className="mt-1 text-[11px] text-zinc-400">cell</span>
                </article>
              ))}
            </div>
            <p className={`${styles.hint} px-8 pb-8 text-center`}>
              ※ Safari など animation-timeline 未対応では即時表示にフォールバックします（@supports 分岐）。
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
