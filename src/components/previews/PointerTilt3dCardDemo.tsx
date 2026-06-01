"use client";

import { useEffect, useRef } from "react";
import styles from "./PointerTilt3dCardDemo.module.css";

/** pointer-tilt-3d-card のプレビュー。ポインタ追従の 3D 傾斜 + 無操作時はゆっくり自動巡回。 */
export function PointerTilt3dCardDemo() {
  const ref = useRef<HTMLDivElement>(null);
  const auto = useRef(true);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    let raf = 0;
    let start: number | null = null;
    const tick = (t: number) => {
      if (start === null) start = t;
      if (auto.current) {
        const e = (t - start) / 1000;
        el.style.setProperty("--rx", `${Math.sin(e * 1.1) * 9}deg`);
        el.style.setProperty("--ry", `${Math.cos(e * 1.4) * 12}deg`);
        el.style.setProperty("--gx", `${50 + Math.cos(e * 1.4) * 35}%`);
        el.style.setProperty("--gy", `${50 + Math.sin(e * 1.1) * 35}%`);
      }
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, []);

  const onMove = (e: React.PointerEvent) => {
    auto.current = false;
    const el = ref.current;
    if (!el) return;
    const r = el.getBoundingClientRect();
    const px = (e.clientX - r.left) / r.width;
    const py = (e.clientY - r.top) / r.height;
    el.style.setProperty("--ry", `${(px - 0.5) * 24}deg`);
    el.style.setProperty("--rx", `${(0.5 - py) * 24}deg`);
    el.style.setProperty("--gx", `${px * 100}%`);
    el.style.setProperty("--gy", `${py * 100}%`);
  };

  return (
    <div
      className="min-h-screen flex items-center justify-center bg-zinc-950 p-8 text-zinc-100"
      style={{ perspective: "800px" }}
    >
      <div
        ref={ref}
        className={styles.card}
        onPointerMove={onMove}
        onPointerLeave={() => {
          auto.current = true;
        }}
      >
        <div className={styles.glare} aria-hidden />
        <div className="relative z-10">
          <p className="text-xs uppercase tracking-widest text-lime-300/80">Featured</p>
          <h3 className="mt-2 text-xl font-semibold">3D Tilt Card</h3>
          <p className="mt-1 text-sm text-zinc-400">ポインタに追従して立体的に傾く</p>
        </div>
      </div>
    </div>
  );
}
