"use client";

import { useEffect, useRef } from "react";
import styles from "./CssScrollSnapGalleryDemo.module.css";

/**
 * css-scroll-snap-gallery の Tier 1（純 CSS、scroll-snap + view-timeline）プレビュー。
 * 横スクロールの scroll-snap ギャラリーで、中央付近のカードが view() タイムラインで拡大強調される。
 *
 * 強調は 100% CSS（animation-timeline）。JS は「サムネイルを賑やかに見せるための自動横スクロール」
 * のみを担当し、rAF コールバック内でのみ scrollLeft を更新する（setState は使わない）。
 * Reduce Motion ON では自動スクロールを行わず、CSS 側の強調も無効化される。
 * Safari など animation-timeline 未対応では等倍・全表示にフォールバック。
 */

const ITEMS = [
  { label: "Aurora", hue: "from-lime-300/20 to-emerald-400/10" },
  { label: "Coast", hue: "from-cyan-300/20 to-sky-400/10" },
  { label: "Dune", hue: "from-amber-300/20 to-orange-400/10" },
  { label: "Bloom", hue: "from-pink-300/20 to-rose-400/10" },
  { label: "Frost", hue: "from-indigo-300/20 to-violet-400/10" },
  { label: "Ember", hue: "from-red-300/20 to-orange-500/10" },
  { label: "Mint", hue: "from-teal-300/20 to-green-400/10" },
];

export function CssScrollSnapGalleryDemo() {
  const trackRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = trackRef.current;
    if (!el) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    let rafId = 0;
    let dir = 1; // 1 = 右へ, -1 = 左へ
    const speed = 0.9; // px / frame

    const step = () => {
      const max = el.scrollWidth - el.clientWidth;
      if (max > 0) {
        let next = el.scrollLeft + speed * dir;
        if (next >= max) {
          next = max;
          dir = -1;
        } else if (next <= 0) {
          next = 0;
          dir = 1;
        }
        el.scrollLeft = next;
      }
      rafId = requestAnimationFrame(step);
    };

    rafId = requestAnimationFrame(step);
    return () => cancelAnimationFrame(rafId);
  }, []);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center gap-6 bg-zinc-950 text-zinc-100 px-6 py-12">
      <div className="text-center">
        <h3 className="text-2xl font-semibold tracking-tight">
          Scroll Snap Gallery
        </h3>
        <p className="mt-1 text-sm text-zinc-400">
          中央に来たカードが <span className="text-lime-300">view-timeline</span>{" "}
          で拡大強調されます（横スクロール）
        </p>
      </div>

      <div ref={trackRef} className={`${styles.track} w-full max-w-3xl`}>
        {ITEMS.map((item) => (
          <article
            key={item.label}
            className={`${styles.card} rounded-2xl border border-white/10 bg-gradient-to-br ${item.hue} p-5`}
          >
            <div className="flex h-44 flex-col justify-between">
              <span className="text-xs uppercase tracking-widest text-lime-300">
                #{item.label}
              </span>
              <div>
                <p className="text-lg font-medium text-zinc-100">
                  {item.label}
                </p>
                <p className="mt-1 text-sm text-zinc-400">
                  scroll-snap-align: center
                </p>
              </div>
            </div>
          </article>
        ))}
      </div>

      <p className={`${styles.hint} max-w-md text-center`}>
        ※ Safari など animation-timeline 未対応のブラウザでは等倍・全表示にフォールバックします（@supports
        分岐）。Reduce Motion 時は自動スクロールと強調を停止します。
      </p>
    </div>
  );
}
