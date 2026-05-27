"use client";

import { motion } from "motion/react";
import { useEffect, useState } from "react";

/** fade-in のプレビュー。params: { duration_ms, delay_ms }。auto-loop。 */
export function FadeInDemo({ params }: { params?: Record<string, unknown> }) {
  const duration =
    typeof params?.duration_ms === "number" ? params.duration_ms : 400;
  const delay = typeof params?.delay_ms === "number" ? params.delay_ms : 0;

  const [seq, setSeq] = useState(0);
  useEffect(() => {
    const interval = Math.max(duration + delay + 800, 1200);
    const t = setInterval(() => setSeq((s) => s + 1), interval);
    return () => clearInterval(t);
  }, [duration, delay]);

  return (
    <div className="min-h-screen flex items-center justify-center p-8">
      <motion.div
        key={seq}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{
          duration: duration / 1000,
          delay: delay / 1000,
          ease: "easeOut",
        }}
        className="rounded-xl border border-white/10 bg-white/5 px-8 py-6 max-w-sm text-center"
      >
        <h3 className="text-lg text-zinc-100">ふわっと現れる</h3>
        <p className="mt-2 text-sm text-zinc-400">
          opacity 0 → 1 / {duration}ms
          {delay > 0 && ` / delay ${delay}ms`}
        </p>
      </motion.div>
    </div>
  );
}
