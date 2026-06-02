"use client";

import { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

/**
 * gsap-pin-text-reveal の Tier 1（GSAP + ScrollTrigger）プレビュー。
 * iframe 内でスクロール可能。pin したセクション内で複数行が scrub に応じて順次 reveal。
 * Reduce Motion ON では pin を作らず、全行を初期表示にして通常スクロールへ縮退。
 * gsap.context() + ctx.revert() で unmount 時に必ずクリーンアップ。
 */
export function GsapPinTextRevealDemo() {
  const rootRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!rootRef.current) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    gsap.registerPlugin(ScrollTrigger);

    const ctx = gsap.context(() => {
      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: ".pin-section",
          start: "top top",
          end: "+=1200",
          pin: true,
          scrub: true,
        },
      });
      tl.from(".reveal-line-1", { opacity: 0, y: 28, filter: "blur(6px)" })
        .from(".reveal-line-2", { opacity: 0, y: 28, filter: "blur(6px)" }, "+=0.2")
        .from(".reveal-line-3", { opacity: 0, y: 28, filter: "blur(6px)" }, "+=0.2")
        .from(".reveal-line-4", { opacity: 0, y: 28, filter: "blur(6px)" }, "+=0.2");
    }, rootRef);

    // pin 中もサムネイルが動くよう、外側スクロールを rAF で自動往復させる。
    let raf = 0;
    let start = 0;
    const period = 6000; // 1 往復 6 秒
    const tick = (t: number) => {
      if (!start) start = t;
      const max = document.documentElement.scrollHeight - window.innerHeight;
      const phase = ((t - start) % period) / period; // 0..1
      const tri = phase < 0.5 ? phase * 2 : (1 - phase) * 2; // 0→1→0
      window.scrollTo(0, max * tri);
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);

    return () => {
      cancelAnimationFrame(raf);
      ctx.revert();
    };
  }, []);

  return (
    <div ref={rootRef} className="min-h-screen bg-zinc-950 text-zinc-100">
      <div className="flex h-[35vh] items-end justify-center p-8 text-sm text-zinc-500">
        ↓ スクロールするとセクションが pin され、文章が順に現れます
      </div>

      <section className="pin-section flex min-h-screen flex-col items-center justify-center gap-5 border-y border-white/10 bg-gradient-to-b from-zinc-900 to-zinc-950 px-8">
        <p className="reveal-line-1 max-w-xl text-center text-3xl font-semibold tracking-tight">
          スクロールが、語りになる。
        </p>
        <p className="reveal-line-2 max-w-md text-center text-base text-zinc-300">
          ScrollTrigger でセクションを pin し、進行量に応じて一文ずつ立ち上げる。
        </p>
        <p className="reveal-line-3 max-w-md text-center text-base text-zinc-300">
          戻れば文章も巻き戻る。読みのテンポが手元のスクロールと同期する。
        </p>
        <p className="reveal-line-4 text-sm font-medium text-lime-300">
          scrub: true — 完全追従の storytelling。
        </p>
      </section>

      <div className="flex h-[60vh] items-start justify-center p-8 text-sm text-zinc-500">
        ↑ pin 解除後の領域
      </div>
    </div>
  );
}
