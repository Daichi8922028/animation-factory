"use client";

import { motion, useMotionValue, useSpring } from "motion/react";

/** magnetic-button のプレビュー。ボタン中心からポインタへのオフセットを 0.4 倍で追従。 */
export function MagneticButtonDemo() {
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const sx = useSpring(x, { stiffness: 220, damping: 18 });
  const sy = useSpring(y, { stiffness: 220, damping: 18 });

  return (
    <div className="min-h-screen flex flex-col items-center justify-center gap-6 p-8 bg-zinc-950 text-zinc-100">
      <p className="text-xs text-zinc-500">ポインタを近づけてください</p>
      <motion.button
        type="button"
        onPointerMove={(e) => {
          const r = e.currentTarget.getBoundingClientRect();
          const cx = r.left + r.width / 2;
          const cy = r.top + r.height / 2;
          const dx = e.clientX - cx;
          const dy = e.clientY - cy;
          const d = Math.sqrt(dx * dx + dy * dy);
          if (d > 100) {
            x.set(0);
            y.set(0);
            return;
          }
          x.set(dx * 0.4);
          y.set(dy * 0.4);
        }}
        onPointerLeave={() => {
          x.set(0);
          y.set(0);
        }}
        style={{ x: sx, y: sy }}
        className="rounded-full px-8 py-3.5 bg-lime-300 text-zinc-900 font-medium text-base shadow-lg shadow-black/40"
      >
        続ける →
      </motion.button>
    </div>
  );
}
