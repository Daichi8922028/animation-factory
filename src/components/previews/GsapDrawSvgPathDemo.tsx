"use client";

import { useEffect, useRef } from "react";
import gsap from "gsap";
import { DrawSVGPlugin } from "gsap/DrawSVGPlugin";

/**
 * gsap-draw-svg-path の Tier 1（GSAP + DrawSVGPlugin）プレビュー。
 * line / ロゴ風の複数 path を 0%→100% に描画し、ループ再生する。
 * Reduce Motion ON では描画アニメを行わず、完成形を即表示。
 * gsap.context() + ctx.revert() で unmount 時に必ずクリーンアップ。
 */
export function GsapDrawSvgPathDemo() {
  const rootRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!rootRef.current) return;
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    gsap.registerPlugin(DrawSVGPlugin);

    const ctx = gsap.context(() => {
      if (reduce) {
        gsap.set(".draw-path", { drawSVG: "100%" });
        return;
      }
      const tl = gsap.timeline({ repeat: -1, repeatDelay: 0.8 });
      tl.set(".draw-path", { drawSVG: "0%" })
        .to(".draw-path", {
          drawSVG: "100%",
          duration: 1.6,
          ease: "power2.inOut",
          stagger: 0.18,
        })
        .to(
          ".draw-path",
          { drawSVG: "0% 100%", duration: 0.8, ease: "power1.in", stagger: 0.1 },
          "+=0.9",
        );
    }, rootRef);

    return () => ctx.revert();
  }, []);

  return (
    <div
      ref={rootRef}
      className="min-h-screen flex flex-col items-center justify-center gap-8 bg-zinc-950 text-zinc-100 px-8"
    >
      <p className="text-sm uppercase tracking-[0.3em] text-zinc-500">
        GSAP DrawSVG Path
      </p>

      <svg
        viewBox="0 0 260 140"
        className="w-[min(80vw,520px)]"
        role="img"
        aria-label="DrawSVG で描かれるロゴ風のパス"
      >
        <title>DrawSVG path demo</title>
        {/* zig-zag のメインライン */}
        <path
          className="draw-path"
          d="M20 110 L70 30 L120 110 L170 30 L220 110"
          fill="none"
          stroke="#a3e635"
          strokeWidth={5}
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        {/* 下線 */}
        <path
          className="draw-path"
          d="M30 128 L230 128"
          fill="none"
          stroke="#a3e635"
          strokeOpacity={0.5}
          strokeWidth={3}
          strokeLinecap="round"
        />
        {/* 円のアクセント */}
        <path
          className="draw-path"
          d="M120 70 m-26 0 a26 26 0 1 0 52 0 a26 26 0 1 0 -52 0"
          fill="none"
          stroke="#a3e635"
          strokeOpacity={0.35}
          strokeWidth={2}
        />
      </svg>

      <p className="text-sm text-zinc-400">
        DrawSVGPlugin で path を <span className="text-lime-300">0%→100%</span> に描画してループ
      </p>
    </div>
  );
}
