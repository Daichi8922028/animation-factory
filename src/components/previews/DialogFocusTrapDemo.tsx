"use client";

import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { useCallback, useEffect, useRef, useState } from "react";

const FOCUSABLE =
  'a[href], button:not([disabled]), input:not([disabled]), select, textarea, [tabindex]:not([tabindex="-1"])';

/** dialog-focus-trap のプレビュー。Tab/Shift+Tab 循環・ESC 閉じ・フォーカス復帰を実演。 */
export function DialogFocusTrapDemo() {
  const [open, setOpen] = useState(true);
  const reduce = useReducedMotion();
  const dialogRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);

  // 開いたら最初の focusable へ
  useEffect(() => {
    if (!open) return;
    const id = requestAnimationFrame(() => {
      const f = dialogRef.current?.querySelectorAll<HTMLElement>(FOCUSABLE);
      f?.[0]?.focus();
    });
    return () => cancelAnimationFrame(id);
  }, [open]);

  const close = useCallback(() => {
    setOpen(false);
    requestAnimationFrame(() => triggerRef.current?.focus());
  }, []);

  const onKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === "Escape") {
        e.preventDefault();
        close();
        return;
      }
      if (e.key !== "Tab") return;
      const f = Array.from(
        dialogRef.current?.querySelectorAll<HTMLElement>(FOCUSABLE) ?? [],
      );
      if (f.length === 0) return;
      const first = f[0];
      const last = f[f.length - 1];
      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    },
    [close],
  );

  return (
    <div className="min-h-screen relative flex items-center justify-center p-8 bg-zinc-950 text-zinc-100">
      <button
        ref={triggerRef}
        type="button"
        onClick={() => setOpen(true)}
        className="rounded-md border border-white/15 bg-white/5 px-4 py-2 text-sm hover:bg-white/10 focus-visible:ring-2 focus-visible:ring-lime-300/40 outline-none"
      >
        ダイアログを開く
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="absolute inset-0 z-10 grid place-items-center bg-black/60"
            onClick={close}
          >
            <motion.div
              ref={dialogRef}
              role="dialog"
              aria-modal="true"
              aria-labelledby="dft-title"
              onKeyDown={onKeyDown}
              initial={reduce ? { opacity: 0 } : { opacity: 0, y: 8, scale: 0.98 }}
              animate={reduce ? { opacity: 1 } : { opacity: 1, y: 0, scale: 1 }}
              exit={reduce ? { opacity: 0 } : { opacity: 0, y: 8, scale: 0.98 }}
              transition={{ duration: 0.2, ease: "easeOut" }}
              onClick={(e) => e.stopPropagation()}
              className="w-[20rem] rounded-xl border border-white/10 bg-zinc-900 px-6 py-5 shadow-2xl shadow-black/60"
            >
              <h3 id="dft-title" className="text-base font-semibold">
                プロフィール編集
              </h3>
              <p className="mt-1 text-xs text-zinc-400">
                Tab / Shift+Tab はこのダイアログ内を循環。ESC で閉じてトリガーへ復帰します。
              </p>
              <div className="mt-4 space-y-3">
                <label className="block text-xs text-zinc-400">
                  名前
                  <input
                    type="text"
                    defaultValue="山田 太郎"
                    className="mt-1 w-full rounded-md border border-white/10 bg-zinc-950 px-3 py-1.5 text-sm text-zinc-100 outline-none focus-visible:border-lime-300/60 focus-visible:ring-2 focus-visible:ring-lime-300/30"
                  />
                </label>
                <label className="block text-xs text-zinc-400">
                  メール
                  <input
                    type="email"
                    defaultValue="hi@example.com"
                    className="mt-1 w-full rounded-md border border-white/10 bg-zinc-950 px-3 py-1.5 text-sm text-zinc-100 outline-none focus-visible:border-lime-300/60 focus-visible:ring-2 focus-visible:ring-lime-300/30"
                  />
                </label>
              </div>
              <div className="mt-5 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={close}
                  className="rounded-md px-3 py-1.5 text-sm text-zinc-400 hover:text-zinc-100 focus-visible:ring-2 focus-visible:ring-white/30 outline-none"
                >
                  キャンセル
                </button>
                <button
                  type="button"
                  onClick={close}
                  className="rounded-md border border-lime-300/40 bg-lime-300/15 px-3 py-1.5 text-sm text-lime-300 hover:bg-lime-300/25 focus-visible:ring-2 focus-visible:ring-lime-300/40 outline-none"
                >
                  保存
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
