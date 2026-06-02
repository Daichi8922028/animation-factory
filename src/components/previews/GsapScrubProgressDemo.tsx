"use client";

import { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

/**
 * gsap-scrub-progress の Tier 1（GSAP + ScrollTrigger）プレビュー。
 * iframe 内でスクロール可能。scrub でスクロール量に進捗バー（と数値 %）が直結して伸びる。
 * サムネイルを活発に見せるため、Reduce Motion OFF 時は内側スクローラを自動往復させる。
 * gsap.context() + ctx.revert() で unmount 時に必ずクリーンアップ。
 */
export function GsapScrubProgressDemo() {
  const rootRef = useRef<HTMLDivElement>(null);
  const scrollerRef = useRef<HTMLDivElement>(null);
  const barRef = useRef<HTMLDivElement>(null);
  const labelRef = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const scroller = scrollerRef.current;
    if (!scroller) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    gsap.registerPlugin(ScrollTrigger);

    const ctx = gsap.context(() => {
      gsap.fromTo(
        barRef.current,
        { scaleX: 0 },
        {
          scaleX: 1,
          ease: "none",
          scrollTrigger: {
            scroller,
            trigger: ".scrub-content",
            start: "top top",
            end: "bottom bottom",
            scrub: true,
            onUpdate: (self) => {
              if (labelRef.current) {
                labelRef.current.textContent =
                  Math.round(self.progress * 100) + "%";
              }
            },
          },
        },
      );
    }, rootRef);

    // サムネイルを動かすため、内側スクローラをゆっくり自動往復させる。
    // 実ユーザーのスクロール操作も ScrollTrigger がそのまま拾う。
    let dir = 1;
    const auto = window.setInterval(() => {
      const max = scroller.scrollHeight - scroller.clientHeight;
      if (max <= 0) return;
      let next = scroller.scrollTop + dir * Math.max(4, max / 90);
      if (next >= max) {
        next = max;
        dir = -1;
      } else if (next <= 0) {
        next = 0;
        dir = 1;
      }
      scroller.scrollTop = next;
    }, 32);

    return () => {
      window.clearInterval(auto);
      ctx.revert();
    };
  }, []);

  return (
    <div
      ref={rootRef}
      className="relative min-h-screen bg-zinc-950 text-zinc-100 overflow-hidden"
    >
      {/* 固定の進捗バー + 数値 */}
      <div className="absolute top-0 left-0 right-0 z-10">
        <div className="h-1.5 w-full bg-white/10">
          <div
            ref={barRef}
            className="h-full origin-left bg-lime-300"
            style={{ transform: "scaleX(0)" }}
          />
        </div>
        <div className="flex items-center justify-between px-4 py-2 text-xs text-zinc-400">
          <span className="tracking-wide">読了進捗</span>
          <span ref={labelRef} className="font-mono text-lime-300">
            0%
          </span>
        </div>
      </div>

      {/* スクロール可能な本文（scrub の連動元） */}
      <div
        ref={scrollerRef}
        className="scrub-scroller h-screen overflow-y-auto pt-14"
      >
        <div className="scrub-content mx-auto max-w-md px-6 pb-24">
          <h3 className="text-2xl font-semibold tracking-tight text-zinc-100">
            スクロールで進む進捗バー
          </h3>
          <p className="mt-3 text-sm text-zinc-400">
            ScrollTrigger の scrub でスクロール量にバーと数値 % が直結します。
          </p>
          {Array.from({ length: 9 }).map((_, i) => (
            <section key={i} className="mt-8">
              <div className="text-xs font-mono text-lime-300/80">
                §{i + 1}
              </div>
              <p className="mt-2 leading-relaxed text-zinc-300">
                スクロール量に応じて上部のバーが伸び、数値が更新されます。前後に
                スクロールすれば進捗も双方向に追従します。scrub: true で完全直結、
                数値指定でスムージング遅延を加えられます。
              </p>
            </section>
          ))}
        </div>
      </div>
    </div>
  );
}
