"use client";

import { motion } from "motion/react";
import { useEffect, useState } from "react";

/** fade-up の Tier 1（React + Motion）プレビュー。translateY → 0、自動 loop。
 *  params: { distance_px, duration_ms } を受け取ったら反映 + 再生 key 更新。 */
export function FadeUpDemo({ params }: { params?: Record<string, unknown> }) {
  const distance =
    typeof params?.distance_px === "number" ? params.distance_px : 16;
  const duration =
    typeof params?.duration_ms === "number" ? params.duration_ms : 500;

  const [seq, setSeq] = useState(0);
  useEffect(() => {
    const interval = Math.max(duration + 600, 1200);
    const t = setInterval(() => setSeq((s) => s + 1), interval);
    return () => clearInterval(t);
  }, [distance, duration]);

  return (
    <div className="min-h-screen flex items-center justify-center p-8">
      <motion.div
        key={`${distance}-${duration}-${seq}`}
        initial={{ opacity: 0, y: distance }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: duration / 1000, ease: "easeOut" }}
        className="rounded-xl border border-white/10 bg-white/5 px-8 py-6 max-w-sm text-center"
      >
        <h3 className="text-lg text-zinc-100">下からふわっと</h3>
        <p className="mt-2 text-sm text-zinc-400">
          distance {distance}px / {duration}ms。
        </p>
      </motion.div>
    </div>
  );
}
