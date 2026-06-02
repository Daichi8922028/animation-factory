"use client";

import { useEffect, useRef } from "react";
import Lenis from "lenis";

/**
 * lenis-parallax-scroll の Tier 1（Lenis）プレビュー。
 * iframe 内のネストした scroll container（wrapper + content）に Lenis を生成し、
 * lenis.on("scroll") の scroll 値で複数レイヤーを異なる速度で parallax 変位させる。
 * 変位は DOM ref に直接書き込む（React state を rAF/scroll ループで更新しない）。
 * Reduce Motion ON ではスムージングを無効化し、parallax も適用しない（通常スクロール）。
 * cleanup: cancelAnimationFrame + lenis.destroy()。
 */
const LAYERS = [
  { key: "sky", speed: -0.25, className: "from-lime-300/15 to-transparent" },
  { key: "hills", speed: -0.5, className: "from-emerald-500/15 to-transparent" },
  { key: "fore", speed: -0.85, className: "from-zinc-100/10 to-transparent" },
];

export function LenisParallaxScrollDemo() {
  const wrapperRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const layerRefs = useRef<(HTMLDivElement | null)[]>([]);

  useEffect(() => {
    const wrapper = wrapperRef.current;
    const content = contentRef.current;
    if (!wrapper || !content) return;

    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    // ネストした scroll container に Lenis を生成（document ではなく iframe 内の wrapper）。
    const lenis = new Lenis({
      wrapper,
      content,
      lerp: reduce ? 1 : 0.1,
      smoothWheel: !reduce,
    });

    // scroll 値でレイヤーを異なる速度で変位（parallax）。state は更新しない。
    const onScroll = (l: Lenis) => {
      const y = l.scroll;
      for (let i = 0; i < LAYERS.length; i++) {
        const el = layerRefs.current[i];
        if (el) {
          const offset = reduce ? 0 : y * LAYERS[i].speed;
          el.style.transform = `translate3d(0, ${offset}px, 0)`;
        }
      }
    };
    lenis.on("scroll", onScroll);

    let rafId = 0;
    const raf = (time: number) => {
      lenis.raf(time);
      rafId = requestAnimationFrame(raf);
    };
    rafId = requestAnimationFrame(raf);

    // サムネイルを賑やかにする自動スクロール（reduce 時は静止）。
    let autoId = 0;
    if (!reduce) {
      let dir = 1;
      autoId = window.setInterval(() => {
        const max = content.scrollHeight - wrapper.clientHeight;
        const next = lenis.scroll + dir * 6;
        if (next >= max) dir = -1;
        else if (next <= 0) dir = 1;
        lenis.scrollTo(Math.max(0, Math.min(max, next)), { immediate: false });
      }, 16);
    }

    return () => {
      cancelAnimationFrame(rafId);
      if (autoId) window.clearInterval(autoId);
      lenis.destroy();
    };
  }, []);

  return (
    <div className="flex min-h-screen items-center justify-center bg-zinc-950 p-6 text-zinc-100">
      <div
        ref={wrapperRef}
        className="relative h-[70vh] w-full max-w-md overflow-hidden rounded-2xl border border-white/10 bg-gradient-to-b from-zinc-900 to-zinc-950"
      >
        {/* parallax レイヤー（絶対配置で重ねる） */}
        <div className="pointer-events-none absolute inset-0 z-0">
          {LAYERS.map((layer, i) => (
            <div
              key={layer.key}
              ref={(el) => {
                layerRefs.current[i] = el;
              }}
              className={`absolute inset-x-0 top-0 h-[140%] bg-gradient-to-b ${layer.className} will-change-transform`}
            />
          ))}
        </div>

        {/* 前景のスクロール可能なコンテンツ */}
        <div ref={contentRef} className="relative z-10">
          <section className="flex h-[70vh] flex-col items-center justify-center gap-3 px-8 text-center">
            <span className="text-xs uppercase tracking-[0.3em] text-lime-300">
              lenis parallax
            </span>
            <h3 className="text-3xl font-semibold tracking-tight">
              スクロールで層が動く
            </h3>
            <p className="max-w-xs text-sm text-zinc-400">
              Lenis の scroll 値で背景レイヤーを異なる速度で変位させ、奥行きを演出します。
            </p>
            <span className="mt-2 text-xs text-zinc-500">↓ 自動でスクロールします</span>
          </section>

          <section className="flex h-[70vh] flex-col items-center justify-center gap-3 px-8 text-center">
            <span className="text-5xl font-bold tracking-tight text-lime-300">01</span>
            <h3 className="text-2xl font-semibold tracking-tight">奥行きのある背景</h3>
            <p className="max-w-xs text-sm text-zinc-400">
              遠いレイヤーほどゆっくり動き、視差で立体感が生まれます。
            </p>
          </section>

          <section className="flex h-[70vh] flex-col items-center justify-center gap-3 px-8 text-center">
            <span className="text-5xl font-bold tracking-tight text-lime-300">02</span>
            <h3 className="text-2xl font-semibold tracking-tight">なめらかな慣性</h3>
            <p className="max-w-xs text-sm text-zinc-400">
              Lenis の lerp でスクロールが滑らかに追従します。
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}
