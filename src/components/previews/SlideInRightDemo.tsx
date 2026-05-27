"use client";

import { motion } from "motion/react";
import { useEffect, useState } from "react";

/** slide-in-right のプレビュー。params: { from_x_px, duration_ms }。auto-loop。 */
export function SlideInRightDemo({
  params,
}: {
  params?: Record<string, unknown>;
}) {
  const fromX = typeof params?.from_x_px === "number" ? params.from_x_px : 32;
  const duration =
    typeof params?.duration_ms === "number" ? params.duration_ms : 500;

  const [seq, setSeq] = useState(0);
  useEffect(() => {
    const t = setInterval(
      () => setSeq((s) => s + 1),
      Math.max(duration + 600, 1200),
    );
    return () => clearInterval(t);
  }, [fromX, duration]);

  return (
    <div className="min-h-screen flex items-center justify-center p-8">
      <motion.div
        key={seq}
        initial={{ opacity: 0, x: fromX }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: duration / 1000, ease: "easeOut" }}
        className="rounded-xl border border-white/10 bg-white/5 px-8 py-6 max-w-sm"
      >
        <h3 className="text-lg text-zinc-100">右からスライド</h3>
        <p className="mt-2 text-sm text-zinc-400">
          translateX {fromX} → 0 / {duration}ms
        </p>
      </motion.div>
    </div>
  );
}
