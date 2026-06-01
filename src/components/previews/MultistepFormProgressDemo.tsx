"use client";

import { motion } from "motion/react";
import { useEffect, useState } from "react";

const LABELS = ["アカウント", "プロフィール", "確認"];

/** multistep-form-progress のプレビュー。0→1→2→完了→リセットを自動巡回。 */
export function MultistepFormProgressDemo() {
  const total = 3;
  const [current, setCurrent] = useState(0);

  useEffect(() => {
    const t = setInterval(
      () => setCurrent((c) => (c + 1) % (total + 1)),
      1300,
    );
    return () => clearInterval(t);
  }, []);

  return (
    <div className="min-h-screen flex items-center justify-center p-8 bg-zinc-950 text-zinc-100">
      <ol className="flex items-start">
        {Array.from({ length: total }).map((_, i) => {
          const done = i < current;
          const active = i === current;
          return (
            <li
              key={i}
              className="flex items-start"
              aria-current={active ? "step" : undefined}
            >
              <div className="flex w-20 flex-col items-center gap-1.5">
                <motion.span
                  className="grid h-8 w-8 place-items-center rounded-full text-sm font-medium"
                  animate={{
                    scale: active ? 1.12 : 1,
                    backgroundColor: done || active ? "#a3e635" : "rgba(255,255,255,0.1)",
                    color: done || active ? "#0a0a0a" : "#a1a1aa",
                  }}
                  transition={{ type: "spring", stiffness: 320, damping: 24 }}
                >
                  {done ? "✓" : i + 1}
                </motion.span>
                <span className="text-[11px] text-zinc-500">{LABELS[i]}</span>
              </div>
              {i < total - 1 && (
                <span className="mt-4 -mx-4 h-0.5 w-8 overflow-hidden rounded bg-white/10">
                  <motion.span
                    className="block h-full origin-left bg-lime-300"
                    animate={{ scaleX: done ? 1 : 0 }}
                    transition={{ duration: 0.28 }}
                  />
                </span>
              )}
            </li>
          );
        })}
      </ol>
    </div>
  );
}
