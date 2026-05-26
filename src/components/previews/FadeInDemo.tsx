"use client";

import { motion } from "motion/react";

/** fade-in の Tier 1（React + Motion）プレビュー。whileInView で viewport トリガー。 */
export function FadeInDemo() {
  return (
    <div className="min-h-screen flex items-center justify-center p-8">
      <motion.div
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true, amount: 0.2 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        className="rounded-xl border border-white/10 bg-white/5 px-8 py-6 max-w-sm text-center"
      >
        <h3 className="text-lg text-zinc-100">ふわっと現れる</h3>
        <p className="mt-2 text-sm text-zinc-400">
          ビューポートに入ると opacity 0 → 1 で滑らかに表示。
        </p>
      </motion.div>
    </div>
  );
}
