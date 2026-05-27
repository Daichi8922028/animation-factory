"use client";

import { AnimatePresence, motion } from "motion/react";
import { useEffect, useId, useState } from "react";

function Tooltip({
  content,
  children,
  open,
}: { content: string; children: React.ReactNode; open: boolean }) {
  const id = useId();
  return (
    <span
      className="relative inline-block"
      aria-describedby={open ? id : undefined}
    >
      {children}
      <AnimatePresence>
        {open && (
          <motion.span
            id={id}
            role="tooltip"
            initial={{ opacity: 0, scale: 0.92, y: 4 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.92, y: 4 }}
            transition={{ duration: 0.14, ease: "easeOut" }}
            className="absolute left-1/2 -translate-x-1/2 -top-9 rounded-md bg-zinc-800 text-zinc-100 text-xs px-2 py-1 whitespace-nowrap shadow-lg"
          >
            {content}
          </motion.span>
        )}
      </AnimatePresence>
    </span>
  );
}

/** tooltip-pop のプレビュー。3 つのボタンを順にツールチップ表示。 */
export function TooltipPopDemo() {
  const [idx, setIdx] = useState(0);
  const labels = ["保存", "コピー", "削除"];

  useEffect(() => {
    const t = setInterval(() => setIdx((i) => (i + 1) % (labels.length + 1)), 1200);
    return () => clearInterval(t);
  }, [labels.length]);

  return (
    <div className="min-h-screen flex items-center justify-center gap-8 p-8 bg-zinc-950 text-zinc-100">
      {labels.map((label, i) => (
        <Tooltip key={label} content={label} open={idx === i}>
          <button
            type="button"
            className="rounded-md border border-white/15 bg-white/5 w-10 h-10 grid place-items-center hover:bg-white/10"
            aria-label={label}
          >
            {label === "保存" ? "💾" : label === "コピー" ? "⧉" : "✕"}
          </button>
        </Tooltip>
      ))}
    </div>
  );
}
