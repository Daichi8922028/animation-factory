"use client";

import { useEffect, useRef, useState } from "react";
import styles from "./ViewTransitionWipeCustomDemo.module.css";

const SLIDES = [
  { title: "Chapter 01", sub: "はじまり", grad: "linear-gradient(135deg,#0ea5e9,#6366f1)" },
  { title: "Chapter 02", sub: "展開", grad: "linear-gradient(135deg,#f59e0b,#ef4444)" },
  { title: "Chapter 03", sub: "結末", grad: "linear-gradient(135deg,#10b981,#84cc16)" },
];

function startVT(cb: () => void) {
  const reduce =
    typeof window !== "undefined" &&
    window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;
  const doc = document as Document & {
    startViewTransition?: (cb: () => void) => unknown;
  };
  if (!reduce && typeof doc.startViewTransition === "function") doc.startViewTransition(cb);
  else cb();
}

/** view-transition-wipe-custom のプレビュー。clip-path のワイプで新スライドが拭うように現れる。 */
export function ViewTransitionWipeCustomDemo() {
  const [i, setI] = useState(0);
  const ref = useRef(0);
  useEffect(() => {
    ref.current = i;
  }, [i]);

  useEffect(() => {
    const t = setInterval(() => {
      const next = (ref.current + 1) % SLIDES.length;
      startVT(() => setI(next));
    }, 2400);
    return () => clearInterval(t);
  }, []);

  const s = SLIDES[i];
  return (
    <div className="min-h-screen flex items-center justify-center bg-zinc-950 p-8 text-zinc-100">
      <div className={styles.stage} style={{ background: s.grad }}>
        <p className="text-xs uppercase tracking-[0.3em] text-white/70">{s.sub}</p>
        <h3 className="mt-2 text-3xl font-bold text-white">{s.title}</h3>
      </div>
    </div>
  );
}
