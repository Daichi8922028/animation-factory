"use client";

import { AnimatePresence, motion } from "motion/react";
import { useEffect, useState } from "react";

/** modal-fade のプレビュー。3 秒ごとに自動で開閉ループ + 手動ボタン。 */
export function ModalFadeDemo() {
  const [open, setOpen] = useState(true);

  useEffect(() => {
    const t = setInterval(() => setOpen((v) => !v), 1800);
    return () => clearInterval(t);
  }, []);

  return (
    <div className="min-h-screen relative flex items-center justify-center p-8 bg-zinc-950 text-zinc-100">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="rounded-md border border-white/15 bg-white/5 px-4 py-2 text-sm hover:bg-white/10"
      >
        {open ? "閉じる" : "モーダルを開く"}
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            role="dialog"
            aria-modal="true"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.22 }}
            className="absolute inset-0 z-10 grid place-items-center bg-black/70 backdrop-blur-sm"
            onClick={() => setOpen(false)}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.94 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.94 }}
              transition={{ duration: 0.22, ease: "easeOut" }}
              onClick={(e) => e.stopPropagation()}
              className="rounded-xl border border-white/10 bg-zinc-900 px-8 py-7 max-w-sm shadow-2xl shadow-black/60"
            >
              <h3 className="text-lg font-semibold">確認ダイアログ</h3>
              <p className="mt-2 text-sm text-zinc-400">
                この処理を実行します。背景クリックまたは外側で閉じます。
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
