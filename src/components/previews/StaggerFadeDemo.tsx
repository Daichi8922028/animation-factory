"use client";

import { motion } from "motion/react";

/**
 * entrance-stagger-fade の Tier 1（React + Motion）プレビュー。
 * content/animations/entrance-stagger-fade.animation.md の実装を簡略化してデモ表示。
 */
export function StaggerFadeDemo() {
  const items = ["Plan A", "Plan B", "Plan C", "Plan D"];
  return (
    <div className="min-h-screen flex items-center justify-center p-8">
      <motion.ul
        className="grid grid-cols-2 gap-3 w-full max-w-sm"
        initial="hidden"
        animate="visible"
        variants={{
          hidden: {},
          visible: { transition: { staggerChildren: 0.06 } },
        }}
      >
        {items.map((label) => (
          <motion.li
            key={label}
            variants={{
              hidden: { opacity: 0, y: 16 },
              visible: { opacity: 1, y: 0 },
            }}
            transition={{ duration: 0.4, ease: "easeOut" }}
            className="rounded-lg border border-white/10 bg-white/5 px-4 py-3 text-sm text-zinc-200"
          >
            {label}
          </motion.li>
        ))}
      </motion.ul>
    </div>
  );
}
