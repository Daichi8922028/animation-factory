"use client";

import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { useEffect, useState } from "react";

const MENU = ["開く", "共有", "名前を変更", "削除"];

/** long-press-context-menu のプレビュー。長押し→進捗リング→メニュー pop を自動巡回で再現。 */
export function LongPressContextMenuDemo() {
  const [phase, setPhase] = useState<"idle" | "holding" | "open">("idle");
  const reduce = useReducedMotion();

  useEffect(() => {
    let cancelled = false;
    const wait = (ms: number) => new Promise((r) => setTimeout(r, ms));
    (async () => {
      while (!cancelled) {
        setPhase("holding");
        await wait(reduce ? 60 : 540);
        if (cancelled) break;
        setPhase("open");
        await wait(1400);
        if (cancelled) break;
        setPhase("idle");
        await wait(700);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [reduce]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-zinc-950 p-8 text-zinc-100">
      <div className="relative">
        <div
          className={`relative grid h-28 w-44 place-items-center rounded-xl border text-sm transition-colors ${
            phase === "holding"
              ? "border-lime-300/50 bg-lime-300/5"
              : "border-white/10 bg-zinc-900"
          }`}
        >
          <span className="text-zinc-300">📄 ドキュメント</span>
          <span className="absolute bottom-2 text-[11px] text-zinc-500">
            {phase === "holding"
              ? "長押し中…"
              : phase === "open"
                ? "メニュー表示"
                : "長押ししてみて"}
          </span>
          {phase === "holding" && !reduce && (
            <svg className="absolute inset-0 h-full w-full" viewBox="0 0 100 100" aria-hidden>
              <motion.rect
                x="3"
                y="3"
                width="94"
                height="94"
                rx="14"
                fill="none"
                stroke="#a3e635"
                strokeWidth="2"
                initial={{ pathLength: 0 }}
                animate={{ pathLength: 1 }}
                transition={{ duration: 0.52, ease: "linear" }}
              />
            </svg>
          )}
        </div>

        <AnimatePresence>
          {phase === "open" && (
            <motion.div
              role="menu"
              initial={reduce ? { opacity: 0 } : { opacity: 0, scale: 0.9, y: -4 }}
              animate={reduce ? { opacity: 1 } : { opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.16 }}
              className="absolute left-1/2 top-full z-10 mt-2 w-40 -translate-x-1/2 rounded-lg border border-white/10 bg-zinc-900 p-1.5 shadow-2xl shadow-black/60"
            >
              {MENU.map((m) => (
                <button
                  key={m}
                  role="menuitem"
                  className={`block w-full rounded-md px-3 py-1.5 text-left text-sm hover:bg-white/5 ${
                    m === "削除" ? "text-red-300" : "text-zinc-300"
                  }`}
                >
                  {m}
                </button>
              ))}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
