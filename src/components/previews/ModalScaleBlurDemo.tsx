"use client";

import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { useEffect, useState } from "react";

/** modal-scale-blur のプレビュー。背景 blur + spring scale で自動開閉ループ + 手動ボタン。 */
export function ModalScaleBlurDemo() {
  const [open, setOpen] = useState(true);
  const reduce = useReducedMotion();

  useEffect(() => {
    const t = setInterval(() => setOpen((v) => !v), 2000);
    return () => clearInterval(t);
  }, []);

  return (
    <div className="min-h-screen relative flex items-center justify-center p-8 bg-zinc-950 text-zinc-100">
      {/* 後ろでぼける背景コンテンツ（blur の効果が分かるように） */}
      <div className="absolute inset-0 grid grid-cols-3 gap-3 p-6 opacity-70 select-none pointer-events-none">
        {Array.from({ length: 9 }).map((_, i) => (
          <div
            key={i}
            className="rounded-lg border border-white/10 bg-gradient-to-br from-zinc-800 to-zinc-900"
          />
        ))}
      </div>

      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="relative rounded-md border border-white/15 bg-white/5 px-4 py-2 text-sm hover:bg-white/10"
      >
        {open ? "閉じる" : "モーダルを開く"}
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            role="dialog"
            aria-modal="true"
            initial={reduce ? { opacity: 0 } : { opacity: 0, backdropFilter: "blur(0px)" }}
            animate={reduce ? { opacity: 1 } : { opacity: 1, backdropFilter: "blur(6px)" }}
            exit={reduce ? { opacity: 0 } : { opacity: 0, backdropFilter: "blur(0px)" }}
            transition={{ duration: 0.24 }}
            className="absolute inset-0 z-10 grid place-items-center bg-black/40"
            onClick={() => setOpen(false)}
          >
            <motion.div
              initial={reduce ? { opacity: 0 } : { opacity: 0, scale: 0.9, filter: "blur(8px)" }}
              animate={reduce ? { opacity: 1 } : { opacity: 1, scale: 1, filter: "blur(0px)" }}
              exit={reduce ? { opacity: 0 } : { opacity: 0, scale: 0.9, filter: "blur(8px)" }}
              transition={reduce ? { duration: 0.12 } : { type: "spring", stiffness: 260, damping: 22 }}
              onClick={(e) => e.stopPropagation()}
              className="rounded-xl border border-white/10 bg-zinc-900/95 px-8 py-7 max-w-sm shadow-2xl shadow-black/60"
            >
              <h3 className="text-lg font-semibold">フォーカスを前面へ</h3>
              <p className="mt-2 text-sm text-zinc-400">
                背景は backdrop-filter でぼかし、中身は spring で scale-in。奥行きのある登場感。
              </p>
              <div className="mt-5 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setOpen(false)}
                  className="text-sm text-zinc-400 hover:text-zinc-100 px-3 py-1.5"
                >
                  キャンセル
                </button>
                <button
                  type="button"
                  className="text-sm bg-lime-300/15 text-lime-300 border border-lime-300/40 rounded-md px-3 py-1.5 hover:bg-lime-300/25"
                >
                  実行
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
