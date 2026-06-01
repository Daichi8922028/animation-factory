"use client";

import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { useEffect, useState } from "react";

/** input-success-checkmark のプレビュー。一定間隔で valid を切り替え、SVG チェックを描画 + スライドイン。 */
export function InputSuccessCheckmarkDemo() {
  const [valid, setValid] = useState(false);
  const reduce = useReducedMotion();

  useEffect(() => {
    let on = false;
    const t = setInterval(() => {
      on = !on;
      setValid(on);
    }, 2000);
    return () => clearInterval(t);
  }, []);

  return (
    <div className="min-h-screen flex items-center justify-center p-8 bg-zinc-950 text-zinc-100">
      <div className="w-72">
        <label htmlFor="isc" className="mb-1 block text-xs text-zinc-400">
          ユーザー名
        </label>
        <div className="relative">
          <input
            id="isc"
            defaultValue="daichi"
            readOnly
            aria-invalid={!valid}
            className="w-full rounded-lg border bg-zinc-950 px-3 py-2 pr-10 text-sm text-zinc-100 outline-none transition-colors"
            style={{ borderColor: valid ? "rgba(163,230,53,0.6)" : "rgba(255,255,255,0.12)" }}
          />
          <span className="absolute right-2.5 top-1/2 -translate-y-1/2">
            <AnimatePresence>
              {valid && (
                <motion.svg
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  aria-hidden
                  initial={reduce ? { opacity: 0 } : { opacity: 0, x: 8 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.2 }}
                >
                  <motion.path
                    d="M4 12.5l5 5L20 6"
                    fill="none"
                    stroke="#a3e635"
                    strokeWidth={3}
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    initial={reduce ? { pathLength: 1 } : { pathLength: 0 }}
                    animate={{ pathLength: 1 }}
                    transition={{ duration: 0.36, ease: "easeOut" }}
                  />
                </motion.svg>
              )}
            </AnimatePresence>
          </span>
        </div>
        <p
          aria-live="polite"
          className="mt-1.5 text-xs"
          style={{ color: valid ? "#a3e635" : "#71717a" }}
        >
          {valid ? "このユーザー名は使えます" : "確認中…"}
        </p>
      </div>
    </div>
  );
}
