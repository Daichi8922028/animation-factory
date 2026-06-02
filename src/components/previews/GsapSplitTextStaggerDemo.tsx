"use client";

import { useEffect, useRef } from "react";
import gsap from "gsap";
import { SplitText } from "gsap/SplitText";

/**
 * gsap-split-text-stagger の Tier 1（GSAP + SplitText）プレビュー。
 * 見出しを文字単位に分割し stagger で登場させる。デモ用に repeat:-1 でループ再生。
 * Reduce Motion ON では分割も stagger も行わず、見出しをそのまま即時表示する。
 * gsap.context() + ctx.revert() で unmount 時に分割 span / Tween を確実に破棄。
 */
export function GsapSplitTextStaggerDemo() {
  const rootRef = useRef<HTMLDivElement>(null);
  const headingRef = useRef<HTMLHeadingElement>(null);

  useEffect(() => {
    const heading = headingRef.current;
    if (!heading) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    gsap.registerPlugin(SplitText);

    const ctx = gsap.context(() => {
      const split = new SplitText(heading, { type: "chars", aria: "auto" });

      const tl = gsap.timeline({ repeat: -1, repeatDelay: 0.9 });
      tl.from(split.chars, {
        opacity: 0,
        yPercent: 80,
        rotateX: -40,
        transformOrigin: "0% 50% -40px",
        duration: 0.6,
        ease: "back.out(1.7)",
        stagger: 0.045,
      }).to(
        split.chars,
        {
          opacity: 0,
          yPercent: -60,
          duration: 0.4,
          ease: "power2.in",
          stagger: 0.02,
        },
        "+=0.8",
      );
    }, rootRef);

    return () => ctx.revert();
  }, []);

  return (
    <div
      ref={rootRef}
      className="min-h-screen flex flex-col items-center justify-center gap-8 px-8 bg-zinc-950 text-zinc-100"
    >
      <p className="text-xs uppercase tracking-[0.3em] text-lime-300">
        SplitText Stagger
      </p>

      <h2
        ref={headingRef}
        className="text-5xl sm:text-6xl font-semibold tracking-tight text-center"
        style={{ perspective: 600 }}
      >
        文字が順番に立ち上がる
      </h2>

      <p className="text-sm text-zinc-500 max-w-sm text-center">
        GSAP SplitText で見出しを 1 文字ずつに分割し、stagger で登場させています。
      </p>
    </div>
  );
}
