"use client";

import { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

/**
 * gsap-scroll-horizontal の Tier 1（GSAP + ScrollTrigger）プレビュー。
 * iframe 内で縦スクロール可能。pin + scrub で縦スクロールを横移動に変換する。
 * Reduce Motion ON では ScrollTrigger を作らず通常の縦スクロールに縮退。
 * gsap.context() + ctx.revert() で unmount 時に必ずクリーンアップ。
 */
const PANELS = [
  { n: "01", title: "横スクロール", body: "縦スクロールを横移動に変換します。" },
  { n: "02", title: "pin + scrub", body: "セクションを pin し、進行を同期します。" },
  { n: "03", title: "panel 列", body: "translateX で GPU 合成のまま流します。" },
  { n: "04", title: "storytelling", body: "製品ツアーや章立てに向きます。" },
];

export function GsapScrollHorizontalDemo() {
  const rootRef = useRef<HTMLDivElement>(null);
  const sectionRef = useRef<HTMLDivElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!rootRef.current || !sectionRef.current || !trackRef.current) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    gsap.registerPlugin(ScrollTrigger);

    const ctx = gsap.context(() => {
      const track = trackRef.current!;
      const distance = () => track.scrollWidth - track.offsetWidth;

      gsap.to(track, {
        x: () => -distance(),
        ease: "none",
        scrollTrigger: {
          trigger: sectionRef.current,
          start: "top top",
          end: () => "+=" + distance(),
          pin: true,
          scrub: 1,
          invalidateOnRefresh: true,
        },
      });
    }, rootRef);

    return () => ctx.revert();
  }, []);

  return (
    <div ref={rootRef} className="min-h-screen bg-zinc-950 text-zinc-100">
      <div className="flex h-[40vh] items-end justify-center p-8 text-sm text-zinc-500">
        ↓ スクロールすると panel が横に流れます
      </div>

      <section
        ref={sectionRef}
        className="h-screen overflow-hidden border-y border-white/10"
      >
        <div
          ref={trackRef}
          className="flex h-full gap-6 px-6 will-change-transform"
        >
          {PANELS.map((p) => (
            <article
              key={p.n}
              className="flex w-[88vw] shrink-0 flex-col justify-center gap-4 rounded-2xl border border-white/10 bg-gradient-to-br from-zinc-900 to-zinc-950 p-10"
            >
              <span className="text-6xl font-bold tracking-tight text-lime-300">
                {p.n}
              </span>
              <h3 className="text-2xl font-semibold tracking-tight">
                {p.title}
              </h3>
              <p className="max-w-sm text-base text-zinc-300">{p.body}</p>
            </article>
          ))}
        </div>
      </section>

      <div className="flex h-[60vh] items-start justify-center p-8 text-sm text-zinc-500">
        ↑ pin 解除後の領域
      </div>
    </div>
  );
}
