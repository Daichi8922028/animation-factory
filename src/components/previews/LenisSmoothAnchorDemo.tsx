"use client";

import { useEffect, useRef } from "react";
import Lenis from "lenis";

/**
 * lenis-smooth-anchor の Tier 1（Lenis）プレビュー。
 * iframe 内でネストした scroll container（wrapper + content）上で動かす。
 * 一定間隔で次セクションへ lenis.scrollTo() し、慣性スムーススクロールで巡回。
 * lenis.on("scroll") で背景レイヤーをパララックス。
 * Reduce Motion ON では Lenis を生成せず、ネイティブスクロールに縮退。
 * 必ず cancelAnimationFrame + lenis.destroy() で unmount 時にクリーンアップ。
 */
const SECTIONS = [
  { id: "intro", label: "Intro", accent: false },
  { id: "features", label: "Features", accent: true },
  { id: "pricing", label: "Pricing", accent: false },
  { id: "contact", label: "Contact", accent: true },
] as const;

export function LenisSmoothAnchorDemo() {
  const wrapperRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const parallaxRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const wrapper = wrapperRef.current;
    const content = contentRef.current;
    if (!wrapper || !content) return;

    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduce) return;

    const lenis = new Lenis({
      wrapper,
      content,
      lerp: 0.08,
      smoothWheel: true,
    });

    // 背景レイヤーをスクロール量に応じてゆっくり動かす（パララックス）。
    const onScroll = ({ scroll }: Lenis) => {
      if (parallaxRef.current) {
        parallaxRef.current.style.transform = `translateY(${scroll * -0.25}px)`;
      }
    };
    lenis.on("scroll", onScroll);

    let rafId = 0;
    const raf = (time: number) => {
      lenis.raf(time);
      rafId = requestAnimationFrame(raf);
    };
    rafId = requestAnimationFrame(raf);

    // 一定間隔で次セクションへスムーススクロール。末尾まで行ったら先頭へ戻る。
    let index = 0;
    const cycle = window.setInterval(() => {
      index = (index + 1) % SECTIONS.length;
      const target = content.querySelector<HTMLElement>(`#sec-${SECTIONS[index].id}`);
      if (target) {
        lenis.scrollTo(target, { duration: 1.2 });
      }
    }, 2200);

    return () => {
      window.clearInterval(cycle);
      cancelAnimationFrame(rafId);
      lenis.off("scroll", onScroll);
      lenis.destroy();
    };
  }, []);

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 flex items-center justify-center p-6">
      <div className="relative w-full max-w-sm h-[420px] overflow-hidden rounded-2xl border border-white/10 shadow-2xl">
        {/* パララックスする背景レイヤー（スクロールでゆっくり移動） */}
        <div
          ref={parallaxRef}
          aria-hidden
          className="pointer-events-none absolute inset-x-0 -top-24 h-[160%] bg-[radial-gradient(circle_at_30%_20%,rgba(163,230,53,0.12),transparent_60%),radial-gradient(circle_at_70%_80%,rgba(163,230,53,0.08),transparent_55%)] will-change-transform"
        />

        {/* ネストした scroll container: wrapper（固定高・overflow）+ content（縦に積む） */}
        <div ref={wrapperRef} className="relative h-full overflow-y-auto">
          <div ref={contentRef}>
            {SECTIONS.map((sec) => (
              <section
                key={sec.id}
                id={`sec-${sec.id}`}
                className="flex h-[420px] flex-col items-center justify-center gap-3 px-8 text-center"
              >
                <span className="text-xs font-mono uppercase tracking-[0.3em] text-zinc-500">
                  {sec.id}
                </span>
                <h3
                  className={
                    sec.accent
                      ? "text-3xl font-semibold tracking-tight text-lime-300"
                      : "text-3xl font-semibold tracking-tight"
                  }
                >
                  {sec.label}
                </h3>
                <p className="max-w-[16rem] text-sm text-zinc-400">
                  Lenis の慣性スクロールでアンカー間を滑らかに移動します。
                </p>
              </section>
            ))}
          </div>
        </div>

        {/* セクションインジケータ（装飾） */}
        <div className="pointer-events-none absolute bottom-4 left-1/2 flex -translate-x-1/2 gap-1.5">
          {SECTIONS.map((sec) => (
            <span
              key={sec.id}
              className="h-1.5 w-1.5 rounded-full bg-white/25"
            />
          ))}
        </div>
      </div>
    </div>
  );
}
