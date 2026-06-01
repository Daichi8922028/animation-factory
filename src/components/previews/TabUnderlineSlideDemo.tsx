"use client";

import { motion, useReducedMotion } from "motion/react";
import { useEffect, useState } from "react";

const TABS = ["概要", "価格", "ドキュメント", "FAQ"];

/** tab-underline-slide のプレビュー。layoutId のアンダーラインがアクティブタブへ自動巡回でスライド。 */
export function TabUnderlineSlideDemo() {
  const [active, setActive] = useState(0);
  const reduce = useReducedMotion();

  useEffect(() => {
    const t = setInterval(() => setActive((a) => (a + 1) % TABS.length), 1600);
    return () => clearInterval(t);
  }, []);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center gap-6 bg-zinc-950 p-8 text-zinc-100">
      <div role="tablist" className="flex gap-1 border-b border-white/10">
        {TABS.map((t, i) => (
          <button
            key={t}
            role="tab"
            aria-selected={i === active}
            onClick={() => setActive(i)}
            className={`relative px-4 py-2.5 text-sm transition-colors ${
              i === active ? "text-lime-300" : "text-zinc-400 hover:text-zinc-200"
            }`}
          >
            {t}
            {i === active && (
              <motion.span
                layoutId="tus-underline"
                className="absolute inset-x-2 -bottom-px h-0.5 rounded bg-lime-300"
                transition={reduce ? { duration: 0 } : { type: "spring", stiffness: 380, damping: 30 }}
              />
            )}
          </button>
        ))}
      </div>
      <p className="text-sm text-zinc-500">アクティブ: {TABS[active]}</p>
    </div>
  );
}
