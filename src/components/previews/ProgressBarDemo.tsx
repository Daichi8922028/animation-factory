"use client";

import { useEffect, useState } from "react";
import styles from "./ProgressBarDemo.module.css";

/** progress-bar のプレビュー。determinate (0→1 ループ) + indeterminate を並べる。 */
export function ProgressBarDemo() {
  const [v, setV] = useState(0);

  useEffect(() => {
    const t = setInterval(() => {
      setV((cur) => (cur >= 1 ? 0 : Math.min(1, cur + 0.05)));
    }, 160);
    return () => clearInterval(t);
  }, []);

  return (
    <div className="min-h-screen flex items-center justify-center p-8 bg-zinc-950">
      <div className="w-full max-w-md space-y-7">
        <div>
          <div className="flex items-baseline justify-between mb-2">
            <h3 className="text-sm text-zinc-300">determinate</h3>
            <span className="text-xs text-zinc-500">{Math.round(v * 100)}%</span>
          </div>
          <div
            className={styles.progress}
            role="progressbar"
            aria-valuenow={Math.round(v * 100)}
            aria-valuemin={0}
            aria-valuemax={100}
          >
            <div
              className={styles.bar}
              style={{ ["--value" as string]: v }}
            />
          </div>
        </div>

        <div>
          <h3 className="text-sm text-zinc-300 mb-2">indeterminate</h3>
          <div
            className={`${styles.progress} ${styles.indeterminate}`}
            role="progressbar"
            aria-busy="true"
          />
        </div>
      </div>
    </div>
  );
}
