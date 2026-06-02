"use client";

import { useEffect, useRef } from "react";
import styles from "./CssStickyHeaderCollapseDemo.module.css";

/**
 * css-sticky-header-collapse の Tier 1（純 CSS、animation-timeline: scroll()）プレビュー。
 * sticky ヘッダがスクロール進行に応じて高さ・余白・ロゴサイズを collapse する。
 * カタログのサムネを賑やかにするため、対応ブラウザでは rAF で上下に自動スクロールしてループ。
 * Reduce Motion 時は自動スクロールせず、CSS 側の animation も止まる（@media 分岐）。
 * scroll-timeline 未対応では @supports 分岐で展開状態の sticky ヘッダにフォールバック。
 */
export function CssStickyHeaderCollapseDemo() {
  const scrollerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = scrollerRef.current;
    if (!el) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    let raf = 0;
    let start = 0;
    const cycleMs = 4800; // 下までスクロール → 戻る 1 周

    const tick = (now: number) => {
      if (!start) start = now;
      const max = el.scrollHeight - el.clientHeight;
      if (max > 0) {
        // 0 → 1 → 0 を往復する三角波
        const t = ((now - start) % cycleMs) / cycleMs;
        const tri = t < 0.5 ? t * 2 : (1 - t) * 2;
        el.scrollTop = max * tri;
      }
      raf = requestAnimationFrame(tick);
    };

    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, []);

  return (
    <div className="min-h-screen flex items-center justify-center bg-zinc-950 text-zinc-100 p-8">
      <div className="w-full max-w-md">
        <p className="mb-3 text-sm text-zinc-500">
          スクロール進行に応じて sticky ヘッダが collapse します（JS ゼロの scroll-timeline）。
        </p>

        <div ref={scrollerRef} className={styles.scroller}>
          <header className={styles.header}>
            <span className={styles.logo}>
              <span className={styles.dot} />
              Brand
              <span className={styles.subtitle}>animation-factory</span>
            </span>
            <nav className={styles.nav}>
              <span>Docs</span>
              <span>API</span>
              <span className="text-lime-300">Sign in</span>
            </nav>
          </header>

          <div className="px-5 py-6">
            <h3 className="text-2xl font-semibold tracking-tight">
              Scroll-driven Sticky Header
            </h3>
            <p className="mt-2 text-sm text-zinc-400">
              下にスクロールするとヘッダの高さとロゴが縮み、戻すと展開状態に戻ります。
            </p>

            <div className="mt-6 grid gap-4">
              {Array.from({ length: 8 }).map((_, i) => (
                <article
                  key={i}
                  className="rounded-lg border border-white/10 bg-white/5 px-4 py-4"
                >
                  <h4 className="text-sm text-zinc-100">Section {i + 1}</h4>
                  <p className="mt-1 text-xs text-zinc-400">
                    本文コンテンツ。ヘッダはスクロール量に直結して滑らかに collapse します。
                  </p>
                </article>
              ))}
            </div>

            <p className="mt-6 text-xs text-zinc-500">
              ※ animation-timeline: scroll() 未対応のブラウザでは展開状態の sticky ヘッダに
              フォールバックします（@supports 分岐）。
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
