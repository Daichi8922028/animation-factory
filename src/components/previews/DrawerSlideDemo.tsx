"use client";

import { AnimatePresence, motion } from "motion/react";
import { useEffect, useState } from "react";

/** drawer-slide のプレビュー。右からスライドインの drawer を自動開閉。 */
export function DrawerSlideDemo() {
  const [open, setOpen] = useState(true);

  useEffect(() => {
    const t = setInterval(() => setOpen((v) => !v), 2000);
    return () => clearInterval(t);
  }, []);

  return (
    <div className="min-h-screen relative bg-zinc-950 text-zinc-100">
      <div className="p-8">
        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          className="rounded-md border border-white/15 bg-white/5 px-4 py-2 text-sm hover:bg-white/10"
        >
          {open ? "drawer を閉じる" : "drawer を開く"}
        </button>
        <p className="mt-4 text-sm text-zinc-500 max-w-md">
          右からスライドするサイド drawer。背景クリックで閉じます。
        </p>
      </div>

      <AnimatePresence>
        {open && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.22 }}
              className="absolute inset-0 z-10 bg-black/60"
              onClick={() => setOpen(false)}
            />
            <motion.aside
              role="dialog"
              aria-modal="true"
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ duration: 0.26, ease: "easeOut" }}
              className="absolute right-0 top-0 z-20 h-full w-[320px] bg-zinc-900 border-l border-white/10 p-6"
            >
              <h3 className="text-base font-semibold">ナビゲーション</h3>
              <ul className="mt-5 space-y-3 text-sm text-zinc-300">
                <li className="hover:text-lime-300 cursor-pointer">ダッシュボード</li>
                <li className="hover:text-lime-300 cursor-pointer">プロジェクト</li>
                <li className="hover:text-lime-300 cursor-pointer">設定</li>
                <li className="hover:text-lime-300 cursor-pointer">サインアウト</li>
              </ul>
            </motion.aside>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
