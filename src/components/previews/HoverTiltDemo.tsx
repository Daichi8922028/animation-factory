"use client";

import { motion, useMotionValue, useSpring, useTransform } from "motion/react";

/** hover-tilt のプレビュー。max_tilt_deg を params で受け取れる。 */
export function HoverTiltDemo({ params }: { params?: Record<string, unknown> }) {
  const max = typeof params?.max_tilt_deg === "number" ? params.max_tilt_deg : 12;

  const mx = useMotionValue(0);
  const my = useMotionValue(0);
  const rotX = useSpring(useTransform(my, (v) => -v * max * 2), {
    stiffness: 220,
    damping: 18,
  });
  const rotY = useSpring(useTransform(mx, (v) => v * max * 2), {
    stiffness: 220,
    damping: 18,
  });

  return (
    <div className="min-h-screen flex items-center justify-center p-8 bg-zinc-950">
      <div style={{ perspective: 800 }}>
        <motion.div
          onPointerMove={(e) => {
            const r = e.currentTarget.getBoundingClientRect();
            mx.set((e.clientX - r.left) / r.width - 0.5);
            my.set((e.clientY - r.top) / r.height - 0.5);
          }}
          onPointerLeave={() => {
            mx.set(0);
            my.set(0);
          }}
          style={{ rotateX: rotX, rotateY: rotY, transformStyle: "preserve-3d" }}
          className="rounded-2xl border border-white/10 bg-gradient-to-br from-zinc-800 to-zinc-900 px-10 py-12 max-w-sm shadow-2xl shadow-black/40"
        >
          <h3 className="text-xl text-zinc-100 font-semibold">3D Tilt</h3>
          <p className="mt-2 text-sm text-zinc-400">
            最大 {max}° までポインタ追従で傾く。
          </p>
        </motion.div>
      </div>
    </div>
  );
}
