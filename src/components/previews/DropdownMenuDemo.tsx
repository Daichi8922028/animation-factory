"use client";

import { AnimatePresence, motion } from "motion/react";
import { useEffect, useState } from "react";

const ITEMS = ["プロフィール", "設定", "ヘルプ", "ログアウト"];

/** dropdown-menu のプレビュー。1.8 秒ごとに開閉ループ。 */
export function DropdownMenuDemo() {
  const [open, setOpen] = useState(true);

  useEffect(() => {
    const t = setInterval(() => setOpen((v) => !v), 1800);
    return () => clearInterval(t);
  }, []);

  return (
    <div className="min-h-screen flex items-start justify-center pt-24 p-8 bg-zinc-950 text-zinc-100">
      <div className="relative inline-block">
        <button
          type="button"
          aria-haspopup="menu"
          aria-expanded={open}
          onClick={() => setOpen((v) => !v)}
          className="rounded-md border border-white/15 bg-white/5 px-4 py-2 text-sm hover:bg-white/10"
        >
          ユーザー ▾
        </button>
        <AnimatePresence>
          {open && (
            <motion.ul
              role="menu"
              initial={{ opacity: 0, y: 6 }}
              animate={{
                opacity: 1,
                y: 0,
                transition: { staggerChildren: 0.035 },
              }}
              exit={{ opacity: 0, y: 6 }}
              transition={{ duration: 0.18 }}
              className="absolute right-0 mt-2 min-w-44 rounded-lg border border-white/10 bg-zinc-900 p-1.5 shadow-xl shadow-black/40"
            >
              {ITEMS.map((label) => (
                <motion.li
                  key={label}
                  role="menuitem"
                  initial={{ opacity: 0, x: -4 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="px-3 py-2 text-sm rounded hover:bg-white/5 cursor-pointer"
                >
                  {label}
                </motion.li>
              ))}
            </motion.ul>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
