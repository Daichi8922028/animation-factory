"use client";

import { motion } from "motion/react";
import { useEffect, useState } from "react";

/** bounce-in のプレビュー。spring stiffness/damping を params で操作可能。 */
export function BounceInDemo({ params }: { params?: Record<string, unknown> }) {
  const fromScale =
    typeof params?.from_scale === "number" ? params.from_scale : 0.3;
  const stiffness =
    typeof params?.stiffness === "number" ? params.stiffness : 300;
  const damping = typeof params?.damping === "number" ? params.damping : 12;

  const [seq, setSeq] = useState(0);
  useEffect(() => {
    const t = setInterval(() => setSeq((s) => s + 1), 1800);
    return () => clearInterval(t);
  }, []);

  return (
    <div className="min-h-screen flex items-center justify-center gap-10 p-8 bg-zinc-950 text-zinc-100">
      <button
        type="button"
        className="relative rounded-lg border border-white/10 bg-white/5 px-5 py-3 text-sm"
      >
        通知
        <motion.span
          key={`a-${seq}-${fromScale}-${stiffness}-${damping}`}
          initial={{ opacity: 0, scale: fromScale }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ type: "spring", stiffness, damping }}
          className="absolute -top-2 -right-2 bg-lime-300 text-zinc-900 text-[10px] font-bold rounded-full w-5 h-5 grid place-items-center"
          aria-label="3 件の新着"
        >
          3
        </motion.span>
      </button>

      <motion.div
        key={`b-${seq}-${fromScale}-${stiffness}-${damping}`}
        initial={{ opacity: 0, scale: fromScale }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ type: "spring", stiffness, damping, delay: 0.08 }}
        className="rounded-full w-14 h-14 bg-emerald-400/15 border border-emerald-300/40 grid place-items-center text-2xl text-emerald-300"
        aria-label="成功"
      >
        ✓
      </motion.div>
    </div>
  );
}
