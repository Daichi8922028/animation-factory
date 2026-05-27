"use client";

import { useEffect, useState } from "react";
import styles from "./ViewTransitionSharedDemo.module.css";

/**
 * view-transition-shared のプレビュー。
 * list ⇔ detail を切替えると、共有要素 (.hero) が morph する。
 * 対応ブラウザでなければ即時切替で表示。
 */
export function ViewTransitionSharedDemo() {
  const [mode, setMode] = useState<"list" | "detail">("list");

  useEffect(() => {
    const t = setInterval(() => {
      const next = mode === "list" ? "detail" : "list";
      const update = () => setMode(next);
      const doc = document as Document & {
        startViewTransition?: (cb: () => void) => unknown;
      };
      if (typeof doc.startViewTransition === "function") {
        doc.startViewTransition(update);
      } else {
        update();
      }
    }, 2400);
    return () => clearInterval(t);
  }, [mode]);

  return (
    <div className="min-h-screen flex items-center justify-center p-8 bg-zinc-950 text-zinc-100">
      <div className="w-full max-w-md">
        <p className="text-[10px] uppercase tracking-widest text-zinc-500 mb-3">
          mode: {mode}
        </p>
        {mode === "list" ? (
          <div className="grid grid-cols-3 gap-3">
            <div className={`${styles.hero} ${styles.swatchA} h-20 rounded-lg`} />
            <div className={`${styles.swatchB} h-20 rounded-lg`} />
            <div className={`${styles.swatchB} h-20 rounded-lg`} />
            <div className={`${styles.swatchB} h-20 rounded-lg`} />
            <div className={`${styles.swatchB} h-20 rounded-lg`} />
            <div className={`${styles.swatchB} h-20 rounded-lg`} />
          </div>
        ) : (
          <div>
            <div className={`${styles.hero} ${styles.swatchA} h-56 rounded-xl`} />
            <h3 className="mt-4 text-lg font-semibold">Item A</h3>
            <p className="mt-1 text-sm text-zinc-400">
              共有要素として hero が拡大しながら遷移します。
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
