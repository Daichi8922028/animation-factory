"use client";

import { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

/**
 * gsap-parallax-layers の Tier 1（GSAP + ScrollTrigger）プレビュー。
 * iframe 内でスクロール可能。背景/中景/前景が異なる速度で translateY し parallax を作る。
 * Reduce Motion ON では ScrollTrigger を作らず全レイヤーを静止表示に縮退。
 * gsap.context() + ctx.revert() で unmount 時に必ずクリーンアップ。
 */
export function GsapParallaxLayersDemo() {
  const rootRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!rootRef.current) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    gsap.registerPlugin(ScrollTrigger);

    const ctx = gsap.context(() => {
      gsap.utils.toArray<HTMLElement>(".parallax-layer").forEach((layer) => {
        const speed = Number(layer.dataset.speed ?? "0.5");
        gsap.to(layer, {
          yPercent: -28 * speed,
          ease: "none",
          scrollTrigger: {
            trigger: ".parallax-stage",
            start: "top bottom",
            end: "bottom top",
            scrub: true,
          },
        });
      });
    }, rootRef);

    return () => ctx.revert();
  }, []);

  return (
    <div ref={rootRef} className="min-h-screen bg-zinc-950 text-zinc-100">
      <div className="flex h-[35vh] items-end justify-center p-8 text-sm text-zinc-500">
        ↓ スクロールするとレイヤーが異なる速度で動きます
      </div>

      <section className="parallax-stage relative h-[140vh] overflow-hidden border-y border-white/10">
        {/* 背景レイヤー（最も遅い） */}
        <div
          className="parallax-layer absolute inset-x-0 top-0 flex h-[120%] items-center justify-center"
          data-speed="0.2"
        >
          <div className="text-[28vw] font-black leading-none tracking-tighter text-zinc-900 select-none">
            DEPTH
          </div>
        </div>

        {/* 中景レイヤー（中速）：浮遊する光点 */}
        <div
          className="parallax-layer absolute inset-0"
          data-speed="0.55"
          aria-hidden
        >
          <span className="absolute left-[12%] top-[20%] h-24 w-24 rounded-full bg-lime-300/10 blur-2xl" />
          <span className="absolute right-[16%] top-[45%] h-32 w-32 rounded-full bg-lime-300/15 blur-3xl" />
          <span className="absolute left-[40%] bottom-[18%] h-20 w-20 rounded-full bg-lime-300/10 blur-2xl" />
        </div>

        {/* 前景レイヤー（最も速い）：見出し */}
        <div
          className="parallax-layer absolute inset-0 flex flex-col items-center justify-center gap-4 px-8 text-center"
          data-speed="0.9"
        >
          <h3 className="text-4xl font-semibold tracking-tight">奥行きのある視差</h3>
          <p className="max-w-md text-base text-zinc-300">
            背景はゆっくり、前景は速く。複数レイヤーの速度差がスクロールに奥行きを与えます。
          </p>
          <p className="text-sm text-lime-300">scrub: true で完全追従</p>
        </div>
      </section>

      <div className="flex h-[60vh] items-start justify-center p-8 text-sm text-zinc-500">
        ↑ 通過後の領域
      </div>
    </div>
  );
}
