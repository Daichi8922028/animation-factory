"use client";

import { useEffect, useRef } from "react";
import styles from "@/components/effects/scroll-reveal.module.css";

/**
 * scroll-reveal の Tier 1（CSS Scroll-Driven）+ Tier 2（IO）デモ。
 * iframe 内でスクロールするとセクションが順に reveal される。
 */
export function ScrollRevealDemo() {
  const rootRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;
    if (typeof CSS !== "undefined" && CSS.supports("animation-timeline: view()")) {
      return; // Tier 1 が効くので JS フォールバックは不要
    }
    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          if (e.isIntersecting) {
            e.target.classList.add(styles.isRevealed);
            io.unobserve(e.target);
          }
        }
      },
      { threshold: 0.15 },
    );
    root.querySelectorAll<HTMLElement>(`.${styles.reveal}`).forEach((el) => io.observe(el));
    return () => io.disconnect();
  }, []);

  const sections = Array.from({ length: 6 }, (_, i) => i + 1);

  return (
    <div ref={rootRef} className="px-6 py-12">
      <div className="max-w-md mx-auto flex flex-col gap-16">
        <p className="text-xs text-zinc-500 text-center">
          ↓ スクロールしてください
        </p>
        {sections.map((n) => (
          <section
            key={n}
            className={`${styles.reveal} rounded-xl border border-white/10 bg-white/5 p-8`}
          >
            <h3 className="text-lg text-zinc-100">Section {n}</h3>
            <p className="text-sm text-zinc-400 mt-2">
              要素がビューポートを通過する進捗に連動して、下からふわっと現れる。
            </p>
          </section>
        ))}
        <div className="h-32" />
      </div>
    </div>
  );
}
