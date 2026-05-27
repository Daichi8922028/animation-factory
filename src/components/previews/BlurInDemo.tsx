"use client";

import { motion } from "motion/react";
import { useEffect, useState } from "react";

/** blur-in の Tier 1（React + Motion）プレビュー。
 *  params: { from_blur_px, duration_ms } を受け取ったら反映 + 再生 key 更新。 */
export function BlurInDemo({ params }: { params?: Record<string, unknown> }) {
  const fromBlur =
    typeof params?.from_blur_px === "number" ? params.from_blur_px : 12;
  const duration =
    typeof params?.duration_ms === "number" ? params.duration_ms : 600;

  const [seq, setSeq] = useState(0);
  useEffect(() => {
    const interval = Math.max(duration + 800, 1400);
    const t = setInterval(() => setSeq((s) => s + 1), interval);
    return () => clearInterval(t);
  }, [fromBlur, duration]);

  return (
    <div className="min-h-screen flex items-center justify-center p-8">
      <motion.div
        key={`${fromBlur}-${duration}-${seq}`}
        initial={{ opacity: 0, filter: `blur(${fromBlur}px)` }}
        animate={{ opacity: 1, filter: "blur(0px)" }}
        transition={{ duration: duration / 1000, ease: "easeOut" }}
        className="rounded-2xl border border-white/10 bg-gradient-to-br from-emerald-400/15 via-lime-300/10 to-cyan-400/15 px-10 py-10 max-w-md text-center"
      >
        <h3 className="text-2xl text-zinc-100 font-semibold tracking-tight">
          Cinematic Reveal
        </h3>
        <p className="mt-3 text-sm text-zinc-300">
          blur {fromBlur}px → 0 / {duration}ms。
        </p>
      </motion.div>
    </div>
  );
}
