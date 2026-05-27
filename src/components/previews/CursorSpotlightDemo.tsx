"use client";

import { useEffect, useRef } from "react";
import styles from "./CursorSpotlightDemo.module.css";

/** cursor-spotlight のプレビュー。pointermove で CSS 変数を更新。 */
export function CursorSpotlightDemo() {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const onMove = (e: PointerEvent) => {
      const r = el.getBoundingClientRect();
      el.style.setProperty("--mx", `${e.clientX - r.left}px`);
      el.style.setProperty("--my", `${e.clientY - r.top}px`);
    };
    el.addEventListener("pointermove", onMove);
    return () => el.removeEventListener("pointermove", onMove);
  }, []);

  return (
    <div ref={ref} className={`${styles.spotlight} bg-zinc-950 text-zinc-100`}>
      <div className={`${styles.content} min-h-screen flex flex-col items-center justify-center gap-3 p-8`}>
        <h2 className="text-4xl font-semibold tracking-tight">Move your cursor</h2>
        <p className="text-sm text-zinc-400 max-w-md text-center">
          ポインタ位置を CSS 変数で更新し、radial-gradient で追従するスポットライトを描いています。
        </p>
      </div>
    </div>
  );
}
