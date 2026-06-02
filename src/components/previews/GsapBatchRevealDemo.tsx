"use client";

import { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

/**
 * gsap-batch-reveal の Tier 1（GSAP ScrollTrigger.batch）プレビュー。
 * iframe 内でスクロール可能。ビューポート進入時にカード群を batch で束ねて stagger reveal。
 * Reduce Motion ON では ScrollTrigger を作らずカードを初期可視のまま表示。
 * gsap.context() + ctx.revert() で unmount 時に必ずクリーンアップ。
 *
 * サムネイルを賑やかにするため、reveal 完了後に自動で先頭へスクロールバックして
 * 再 reveal をループさせる（once は使わず、毎フレームの進入で再生）。
 */

const CARDS = Array.from({ length: 12 }, (_, i) => i);

export function GsapBatchRevealDemo() {
  const rootRef = useRef<HTMLDivElement>(null);
  const scrollerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const root = rootRef.current;
    const scroller = scrollerRef.current;
    if (!root || !scroller) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    gsap.registerPlugin(ScrollTrigger);

    let loopId = 0;
    let cancelled = false;
    // 再帰 onComplete で作られるタイムラインは gsap.context() の同期実行外で
    // 生成されるため ctx には捕捉されない。手動で参照を保持し unmount で kill する。
    let activeTl: gsap.core.Timeline | null = null;

    const ctx = gsap.context(() => {
      gsap.set(".reveal-card", { opacity: 0, y: 28 });

      ScrollTrigger.batch(".reveal-card", {
        scroller,
        start: "top 90%",
        batchMax: 6,
        onEnter: (batch) =>
          gsap.to(batch, {
            opacity: 1,
            y: 0,
            duration: 0.6,
            ease: "power2.out",
            stagger: 0.1,
            overwrite: true,
          }),
        onLeaveBack: (batch) =>
          gsap.to(batch, {
            opacity: 0,
            y: 28,
            duration: 0.3,
            overwrite: true,
          }),
      });

      // オートプレイ: 下までスクロール → 少し待って先頭へ戻る、を繰り返す。
      const autoplay = () => {
        if (cancelled) return;
        const max = scroller.scrollHeight - scroller.clientHeight;
        activeTl = gsap
          .timeline({ onComplete: autoplay })
          .to(scroller, {
            scrollTop: max,
            duration: 3,
            ease: "none",
            onUpdate: () => ScrollTrigger.update(),
          })
          .to(scroller, {
            scrollTop: 0,
            duration: 1.2,
            ease: "power2.inOut",
            delay: 0.6,
            onUpdate: () => ScrollTrigger.update(),
          });
      };
      loopId = window.setTimeout(autoplay, 700);
    }, rootRef);

    return () => {
      cancelled = true;
      window.clearTimeout(loopId);
      activeTl?.kill();
      ctx.revert();
    };
  }, []);

  return (
    <div
      ref={rootRef}
      className="min-h-screen bg-zinc-950 text-zinc-100 flex items-center justify-center p-6"
    >
      <div className="w-full max-w-md">
        <p className="mb-3 text-xs uppercase tracking-widest text-zinc-500">
          ScrollTrigger.batch
        </p>
        <div
          ref={scrollerRef}
          className="h-[70vh] overflow-y-auto rounded-2xl border border-white/10 bg-gradient-to-b from-zinc-900 to-zinc-950 p-5"
        >
          <div className="flex h-[30vh] items-end justify-center pb-4 text-sm text-zinc-500">
            ↓ スクロールでカードが一斉に出現
          </div>

          <div className="grid grid-cols-2 gap-3">
            {CARDS.map((i) => (
              <article
                key={i}
                className="reveal-card flex h-24 flex-col justify-between rounded-xl border border-white/10 bg-zinc-800/60 p-3"
              >
                <span className="text-2xl font-semibold text-lime-300">
                  {String(i + 1).padStart(2, "0")}
                </span>
                <span className="text-xs text-zinc-400">batch reveal</span>
              </article>
            ))}
          </div>

          <div className="flex h-[24vh] items-start justify-center pt-6 text-sm text-zinc-600">
            ↑ ビューポートに入った行ごとに stagger
          </div>
        </div>
      </div>
    </div>
  );
}
