"use client";

import { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

/**
 * gsap-clip-image-reveal の Tier 1（GSAP + ScrollTrigger）プレビュー。
 * iframe 内でスクロール可能。スクロール進行に同期して clip-path のマスクが開き、
 * グラデーションブロック（画像代わり）が左から reveal される。
 * カタログのサムネが動くよう、Reduce Motion OFF 時はスクロール待ちに加えて
 * 自動でマスクを開閉ループさせる。
 * Reduce Motion ON ではマスクを全開（即時表示）に縮退。
 * gsap.context() + ctx.revert() で unmount 時に必ずクリーンアップ。
 */
export function GsapClipImageRevealDemo() {
  const rootRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!rootRef.current) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      gsap.set(".clip-target", { clipPath: "inset(0 0% 0 0)" });
      return;
    }

    gsap.registerPlugin(ScrollTrigger);

    const ctx = gsap.context(() => {
      // スクロール連動の本命: スクロール進行に合わせて clip-path を開く
      gsap.fromTo(
        ".clip-scroll",
        { clipPath: "inset(0 100% 0 0)" },
        {
          clipPath: "inset(0 0% 0 0)",
          ease: "none",
          scrollTrigger: {
            trigger: ".clip-scroll-figure",
            start: "top 85%",
            end: "top 35%",
            scrub: true,
          },
        }
      );

      // サムネが静止しないよう、最初のブロックは自動で reveal をループ
      gsap.fromTo(
        ".clip-loop",
        { clipPath: "inset(0 100% 0 0)" },
        {
          clipPath: "inset(0 0% 0 0)",
          duration: 1.4,
          ease: "power2.inOut",
          repeat: -1,
          yoyo: true,
          repeatDelay: 0.4,
        }
      );
    }, rootRef);

    return () => ctx.revert();
  }, []);

  return (
    <div
      ref={rootRef}
      className="min-h-screen bg-zinc-950 text-zinc-100"
    >
      <section className="min-h-screen flex flex-col items-center justify-center gap-6 px-8">
        <p className="text-xs uppercase tracking-[0.3em] text-zinc-500">
          clip-path reveal (auto loop)
        </p>
        <div className="relative h-56 w-80 max-w-full overflow-hidden rounded-xl border border-white/10">
          <div className="clip-loop h-full w-full bg-gradient-to-br from-lime-300 via-emerald-400 to-cyan-500" />
        </div>
        <p className="text-sm text-zinc-400">↓ スクロールでもう一枚を reveal</p>
      </section>

      <section className="clip-scroll-figure min-h-screen flex flex-col items-center justify-center gap-6 px-8 bg-gradient-to-b from-zinc-900 to-zinc-950 border-y border-white/10">
        <p className="text-xs uppercase tracking-[0.3em] text-zinc-500">
          clip-path reveal (scroll-scrubbed)
        </p>
        <div className="relative h-64 w-96 max-w-full overflow-hidden rounded-xl border border-white/10">
          <div
            className="clip-scroll h-full w-full bg-gradient-to-tr from-cyan-500 via-sky-400 to-lime-300"
            style={{ clipPath: "inset(0 100% 0 0)" }}
          />
        </div>
        <p className="text-sm text-lime-300">scrub: true でスクロール量に完全追従</p>
      </section>

      <div className="h-[60vh] flex items-start justify-center p-8 text-sm text-zinc-500">
        ↑ reveal 完了後の領域
      </div>
    </div>
  );
}
