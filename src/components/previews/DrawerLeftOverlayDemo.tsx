"use client";

import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { useEffect, useState } from "react";

const NAV = ["ダッシュボード", "プロジェクト", "メンバー", "設定"];

/** drawer-left-overlay のプレビュー。左から滑り込むドロワー + 背景 dim を自動開閉。 */
export function DrawerLeftOverlayDemo() {
  const [open, setOpen] = useState(true);
  const reduce = useReducedMotion();

  useEffect(() => {
    const t = setInterval(() => setOpen((v) => !v), 2400);
    return () => clearInterval(t);
  }, []);

  return (
    <div className="min-h-screen relative flex items-center justify-center overflow-hidden bg-zinc-950 text-zinc-100">
      <button
        onClick={() => setOpen((v) => !v)}
        className="relative rounded-md border border-white/15 bg-white/5 px-4 py-2 text-sm hover:bg-white/10"
      >
        {open ? "閉じる" : "☰ メニュー"}
      </button>

      <AnimatePresence>
        {open && (
          <>
            <motion.div
              key="bd"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="absolute inset-0 z-10 bg-black/60"
              onClick={() => setOpen(false)}
            />
            <motion.aside
              key="dw"
              role="dialog"
              aria-modal="true"
              aria-label="ナビゲーション"
              initial={reduce ? { opacity: 0 } : { x: -260 }}
              animate={reduce ? { opacity: 1 } : { x: 0 }}
              exit={reduce ? { opacity: 0 } : { x: -260 }}
              transition={reduce ? { duration: 0.12 } : { type: "spring", stiffness: 320, damping: 34 }}
              className="absolute inset-y-0 left-0 z-20 w-60 border-r border-white/10 bg-zinc-900 p-4 shadow-2xl shadow-black/60"
            >
              <p className="px-2 pb-2 text-xs font-semibold text-zinc-500">MENU</p>
              <nav className="flex flex-col gap-1">
                {NAV.map((n) => (
                  <a
                    key={n}
                    href="#"
                    className="rounded-md px-3 py-2 text-sm text-zinc-300 hover:bg-white/5"
                  >
                    {n}
                  </a>
                ))}
              </nav>
            </motion.aside>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
