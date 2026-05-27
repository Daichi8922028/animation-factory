"use client";

import { motion } from "motion/react";
import { useEffect, useState } from "react";

/** scale-in の Tier 1（React + Motion）プレビュー。
 *  params: { from_scale, duration_ms } を受け取ったら反映 + 再生 key 更新。 */
export function ScaleInDemo({ params }: { params?: Record<string, unknown> }) {
  const fromScale =
    typeof params?.from_scale === "number" ? params.from_scale : 0.92;
  const duration =
    typeof params?.duration_ms === "number" ? params.duration_ms : 320;

  const [seq, setSeq] = useState(0);
  useEffect(() => {
    const interval = Math.max(duration + 600, 1200);
    const t = setInterval(() => setSeq((s) => s + 1), interval);
    return () => clearInterval(t);
  }, [fromScale, duration]);

  return (
    <div className="min-h-screen flex items-center justify-center p-8">
      <motion.div
        key={`${fromScale}-${duration}-${seq}`}
        initial={{ opacity: 0, scale: fromScale }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: duration / 1000, ease: "easeOut" }}
        style={{ transformOrigin: "center" }}
        className="rounded-xl border border-white/10 bg-white/5 px-8 py-6 max-w-sm text-center shadow-2xl shadow-black/40"
      >
        <h3 className="text-lg text-zinc-100">ポンッと現れる</h3>
        <p className="mt-2 text-sm text-zinc-400">
          scale {fromScale} → 1 / {duration}ms。
        </p>
      </motion.div>
    </div>
  );
}
