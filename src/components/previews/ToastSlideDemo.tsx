"use client";

import { AnimatePresence, motion } from "motion/react";
import { useEffect, useState } from "react";

/** toast-slide のプレビュー。params: { auto_dismiss_ms, enter_y_px }。 */
export function ToastSlideDemo({
  params,
}: {
  params?: Record<string, unknown>;
}) {
  const dismiss =
    typeof params?.auto_dismiss_ms === "number" ? params.auto_dismiss_ms : 2400;
  const enterY =
    typeof params?.enter_y_px === "number" ? params.enter_y_px : 24;

  const [open, setOpen] = useState(true);
  const [seq, setSeq] = useState(0);

  useEffect(() => {
    if (!open) return;
    const t = setTimeout(() => setOpen(false), dismiss);
    return () => clearTimeout(t);
  }, [open, dismiss]);

  useEffect(() => {
    if (open) return;
    const t = setTimeout(() => {
      setSeq((s) => s + 1);
      setOpen(true);
    }, 1000);
    return () => clearTimeout(t);
  }, [open]);

  return (
    <div className="min-h-screen relative bg-zinc-950 text-zinc-100">
      <div className="p-8">
        <button
          type="button"
          onClick={() => {
            setSeq((s) => s + 1);
            setOpen(true);
          }}
          className="rounded-md border border-white/15 bg-white/5 px-4 py-2 text-sm hover:bg-white/10"
        >
          toast を表示
        </button>
        <p className="mt-4 text-sm text-zinc-500 max-w-md">
          右下からスライドイン、{dismiss}ms 後に自動で消える。
        </p>
      </div>

      <AnimatePresence>
        {open && (
          <motion.div
            key={seq}
            role="status"
            initial={{ opacity: 0, y: enterY }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: enterY }}
            transition={{ duration: 0.24, ease: "easeOut" }}
            className="absolute right-4 bottom-4 rounded-lg border border-white/10 bg-zinc-900 px-4 py-3 text-sm shadow-lg shadow-black/40"
          >
            <span className="text-lime-300">✓</span> 保存しました
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
