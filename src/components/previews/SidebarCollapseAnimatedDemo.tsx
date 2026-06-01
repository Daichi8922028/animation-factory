"use client";

import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { useEffect, useState } from "react";

const ITEMS = [
  { icon: "▦", label: "ダッシュボード" },
  { icon: "✎", label: "エディタ" },
  { icon: "◷", label: "履歴" },
  { icon: "⚙", label: "設定" },
];

/** sidebar-collapse-animated のプレビュー。幅アニメで折りたたみ、ラベルを fade、アイコンを残す。 */
export function SidebarCollapseAnimatedDemo() {
  const [collapsed, setCollapsed] = useState(false);
  const reduce = useReducedMotion();

  useEffect(() => {
    const t = setInterval(() => setCollapsed((v) => !v), 2400);
    return () => clearInterval(t);
  }, []);

  return (
    <div className="min-h-screen flex items-center justify-center bg-zinc-950 p-8 text-zinc-100">
      <motion.aside
        animate={{ width: collapsed ? 56 : 220 }}
        transition={reduce ? { duration: 0.12 } : { type: "spring", stiffness: 320, damping: 34 }}
        className="h-80 overflow-hidden rounded-xl border border-white/10 bg-zinc-900 py-3"
      >
        <button
          onClick={() => setCollapsed((v) => !v)}
          aria-expanded={!collapsed}
          className="mx-3 mb-2 rounded-md px-2 py-1 text-xs text-zinc-500 hover:bg-white/5"
        >
          {collapsed ? "»" : "« 折りたたむ"}
        </button>
        <nav className="flex flex-col">
          {ITEMS.map((it) => (
            <a
              key={it.label}
              href="#"
              aria-label={it.label}
              className="flex items-center gap-3 px-4 py-2.5 text-sm text-zinc-300 hover:bg-white/5"
            >
              <span className="w-5 shrink-0 text-center text-base" aria-hidden>
                {it.icon}
              </span>
              <AnimatePresence initial={false}>
                {!collapsed && (
                  <motion.span
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.15 }}
                    className="whitespace-nowrap"
                  >
                    {it.label}
                  </motion.span>
                )}
              </AnimatePresence>
            </a>
          ))}
        </nav>
      </motion.aside>
    </div>
  );
}
