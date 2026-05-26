"use client";

import { AnimatePresence, motion } from "motion/react";
import { useState } from "react";

/** accordion-collapse の Tier 1 デモ。AnimatePresence + height で展開・折りたたみ。 */
export function AccordionCollapseDemo() {
  const items = [
    {
      q: "送料はいくらですか？",
      a: "全国一律 500 円です。5000 円以上で無料になります。",
    },
    {
      q: "返品は可能ですか？",
      a: "未開封品に限り、商品到着から 14 日以内であれば返品できます。",
    },
  ];

  return (
    <div className="min-h-screen flex items-center justify-center p-8">
      <div className="w-full max-w-md flex flex-col gap-2">
        {items.map((it, i) => (
          <AccordionItem key={i} title={it.q} body={it.a} />
        ))}
      </div>
    </div>
  );
}

function AccordionItem({ title, body }: { title: string; body: string }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="rounded-lg border border-white/10 bg-white/5">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        className="w-full flex items-center justify-between px-4 py-3 text-left text-sm text-zinc-100 cursor-pointer"
      >
        <span>{title}</span>
        <span
          className="text-zinc-500 transition-transform"
          style={{ transform: open ? "rotate(45deg)" : "rotate(0deg)" }}
          aria-hidden
        >
          +
        </span>
      </button>
      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            key="body"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.22, ease: "easeOut" }}
            style={{ overflow: "hidden" }}
          >
            <p className="px-4 pb-3 text-sm text-zinc-400">{body}</p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
