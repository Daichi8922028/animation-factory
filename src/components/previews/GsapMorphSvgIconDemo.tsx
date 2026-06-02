"use client";

import { useEffect, useRef } from "react";
import gsap from "gsap";
import { MorphSVGPlugin } from "gsap/MorphSVGPlugin";

/**
 * gsap-morph-svg-icon の Tier 1（GSAP + MorphSVGPlugin）プレビュー。
 * 単一の SVG path を 3 つのアイコン形状（再生 → 一時停止 → ハート → …）の
 * 間でループ・モーフし続ける micro-interaction。
 * Reduce Motion ON では timeline を作らず、代表アイコンを静止表示に縮退。
 * gsap.context() + ctx.revert() で unmount 時に必ずクリーンアップ。
 */

// すべて viewBox "0 0 24 24" の単一 path。MorphSVGPlugin が d 属性を補間する。
const PLAY = "M8 5v14l11-7z";
const PAUSE = "M6 5h4v14H6zM14 5h4v14h-4z";
const HEART =
  "M12 21S3 14.5 3 8.8C3 6 5.2 4 7.8 4c1.7 0 3.2.9 4.2 2.3C13 4.9 14.5 4 16.2 4 18.8 4 21 6 21 8.8 21 14.5 12 21 12 21z";
const STAR =
  "M12 3l2.7 5.6 6.1.9-4.4 4.3 1 6.1-5.4-2.9-5.4 2.9 1-6.1L3.2 9.5l6.1-.9z";

const SHAPES = [PAUSE, HEART, STAR, PLAY];

export function GsapMorphSvgIconDemo() {
  const rootRef = useRef<HTMLDivElement>(null);
  const pathRef = useRef<SVGPathElement>(null);

  useEffect(() => {
    if (!pathRef.current) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    gsap.registerPlugin(MorphSVGPlugin);

    const ctx = gsap.context(() => {
      const tl = gsap.timeline({ repeat: -1, repeatDelay: 0.5 });
      for (const shape of SHAPES) {
        tl.to(
          pathRef.current,
          { duration: 0.6, morphSVG: shape, ease: "power2.inOut" },
          "+=0.5",
        );
      }
    }, rootRef);

    return () => ctx.revert();
  }, []);

  return (
    <div
      ref={rootRef}
      className="min-h-screen flex flex-col items-center justify-center gap-10 bg-zinc-950 text-zinc-100"
    >
      <div className="flex flex-col items-center gap-2 text-center">
        <h3 className="text-2xl font-semibold tracking-tight">MorphSVG Icon</h3>
        <p className="max-w-xs text-sm text-zinc-400">
          MorphSVGPlugin で SVG path の形状を連続モーフ
        </p>
      </div>

      <div className="flex items-center justify-center rounded-3xl border border-white/10 bg-gradient-to-b from-zinc-900 to-zinc-950 p-12 shadow-2xl">
        <svg
          viewBox="0 0 24 24"
          width="120"
          height="120"
          aria-hidden="true"
          className="drop-shadow-[0_0_18px_rgba(163,230,53,0.35)]"
        >
          <path ref={pathRef} d={PLAY} fill="#a3e635" />
        </svg>
      </div>

      <p className="text-xs text-zinc-500">play → pause → heart → star → …</p>
    </div>
  );
}
