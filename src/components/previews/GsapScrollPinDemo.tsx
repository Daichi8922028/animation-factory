"use client";

import { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

/**
 * gsap-scroll-pin の Tier 1（GSAP + ScrollTrigger）プレビュー。
 * iframe 内でスクロール可能。Reduce Motion ON では pin を作らず通常スクロールに縮退。
 * gsap.context() + ctx.revert() で unmount 時に必ずクリーンアップ。
 */
export function GsapScrollPinDemo() {
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
          end: "+=800",
          pin: true,
          scrub: true,
        },
      });
      tl.from(".pin-line-1", { opacity: 0, y: 24 })
        .from(".pin-line-2", { opacity: 0, y: 24 }, "+=0.2")
        .from(".pin-line-3", { opacity: 0, y: 24 }, "+=0.2");
    }, rootRef);

    return () => ctx.revert();
  }, []);

  return (
    <div ref={rootRef} className="bg-zinc-950 text-zinc-100">
      <div className="h-[40vh] flex items-end justify-center p-8 text-sm text-zinc-500">
        ↓ スクロールするとセクションが pin されます
      </div>

      <section className="pin-section min-h-screen flex flex-col items-center justify-center gap-4 px-8 bg-gradient-to-b from-zinc-900 to-zinc-950 border-y border-white/10">
        <h3 className="pin-line-1 text-3xl font-semibold tracking-tight">スクロールで進む</h3>
        <p className="pin-line-2 text-base text-zinc-300 max-w-md text-center">
          ScrollTrigger でセクションが pin され、スクロール量に応じて内側が順次登場します。
        </p>
        <p className="pin-line-3 text-sm text-lime-300">scrub: true で完全追従</p>
      </section>

      <div className="h-[60vh] flex items-start justify-center p-8 text-sm text-zinc-500">
        ↑ pin 解除後の領域
      </div>
    </div>
  );
}
