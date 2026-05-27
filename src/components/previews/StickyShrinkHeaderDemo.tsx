"use client";

import { useEffect, useState } from "react";
import styles from "./StickyShrinkHeaderDemo.module.css";

/** sticky-shrink-header のプレビュー。iframe 内でスクロールするとヘッダが縮む。 */
export function StickyShrinkHeaderDemo() {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 16);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <div className="bg-zinc-950 text-zinc-100">
      <header
        className={`${styles.header} ${scrolled ? styles.scrolled : ""}`}
      >
        <div className="max-w-3xl mx-auto flex items-center justify-between">
          <span className={`${styles.brand} font-semibold tracking-tight`}>
            animation factory
          </span>
          <nav className="flex gap-4 text-xs text-zinc-400">
            <span>browse</span>
            <span>docs</span>
            <span>github</span>
          </nav>
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-6 py-12 space-y-6">
        <p className="text-sm text-zinc-500">↓ スクロールでヘッダが縮みます</p>
        {Array.from({ length: 8 }).map((_, i) => (
          <section
            key={i}
            className="rounded-xl border border-white/10 bg-white/5 px-6 py-10"
          >
            <h3 className="text-lg">Section {i + 1}</h3>
            <p className="text-sm text-zinc-400 mt-2">
              スクロールでヘッダの padding / background / blur が補間されます。
            </p>
          </section>
        ))}
      </main>
    </div>
  );
}
