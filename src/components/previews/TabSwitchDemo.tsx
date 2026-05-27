"use client";

import { AnimatePresence, motion } from "motion/react";
import { useEffect, useState } from "react";

const TABS = [
  { id: "overview", label: "概要", body: "プロジェクトのハイレベルな目的と進捗。" },
  { id: "details", label: "詳細", body: "技術スタックと API のリファレンス。" },
  { id: "history", label: "履歴", body: "最近の変更と意思決定ログ。" },
] as const;

type TabId = (typeof TABS)[number]["id"];

/** tab-switch のプレビュー。indicator が layoutId で滑らかに移動。 */
export function TabSwitchDemo() {
  const [active, setActive] = useState<TabId>("overview");

  useEffect(() => {
    const t = setInterval(() => {
      setActive((cur) => {
        const i = TABS.findIndex((t) => t.id === cur);
        return TABS[(i + 1) % TABS.length].id;
      });
    }, 2200);
    return () => clearInterval(t);
  }, []);

  const current = TABS.find((t) => t.id === active)!;

  return (
    <div className="min-h-screen flex items-center justify-center p-8 bg-zinc-950 text-zinc-100">
      <div className="w-full max-w-md">
        <div role="tablist" className="border-b border-white/10 flex gap-1">
          {TABS.map((t) => (
            <button
              key={t.id}
              role="tab"
              aria-selected={active === t.id}
              onClick={() => setActive(t.id)}
              className={`relative px-4 py-2 text-sm transition-colors ${
                active === t.id ? "text-zinc-100" : "text-zinc-500 hover:text-zinc-300"
              }`}
            >
              {t.label}
              {active === t.id && (
                <motion.span
                  layoutId="tab-switch-demo-indicator"
                  className="absolute inset-x-0 -bottom-px h-0.5 bg-lime-300"
                  transition={{ duration: 0.24, ease: "easeOut" }}
                />
              )}
            </button>
          ))}
        </div>

        <AnimatePresence mode="wait">
          <motion.div
            key={active}
            role="tabpanel"
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            transition={{ duration: 0.18 }}
            className="mt-5 text-sm text-zinc-300 leading-relaxed"
          >
            {current.body}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}
