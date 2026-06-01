"use client";

import {
  animate,
  motion,
  useMotionValue,
  useReducedMotion,
  useTransform,
} from "motion/react";
import { useEffect, useState } from "react";

const ITEMS = ["最新ニュース", "アップデート", "おすすめ", "通知", "アクティビティ"];

/** pull-to-refresh のプレビュー。引っ張り→更新→戻りを自動再現 + 縦ドラッグ可能。 */
export function PullToRefreshDemo() {
  const y = useMotionValue(0);
  const opacity = useTransform(y, [0, 30, 70], [0, 0.5, 1]);
  const rotate = useTransform(y, [0, 90], [0, 270]);
  const scale = useTransform(y, [0, 70], [0.6, 1]);
  const [status, setStatus] = useState("引っ張って更新");
  const reduce = useReducedMotion();

  useEffect(() => {
    if (reduce) return;
    let cancelled = false;
    const wait = (ms: number) => new Promise((r) => setTimeout(r, ms));
    (async () => {
      while (!cancelled) {
        await animate(y, 90, { duration: 0.55, ease: "easeOut" }).finished;
        if (cancelled) break;
        setStatus("更新中…");
        await wait(1000);
        if (cancelled) break;
        setStatus("完了 ✓");
        await wait(420);
        if (cancelled) break;
        await animate(y, 0, { type: "spring", stiffness: 300, damping: 28 }).finished;
        setStatus("引っ張って更新");
        await wait(650);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [y, reduce]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-zinc-950 p-8 text-zinc-100">
      <div className="relative h-96 w-72 overflow-hidden rounded-2xl border border-white/10 bg-zinc-900">
        <motion.div
          style={{ opacity, scale }}
          className="pointer-events-none absolute left-1/2 top-3 z-0 -translate-x-1/2 text-center"
        >
          <motion.div style={{ rotate }} className="text-2xl text-lime-300">
            ⟳
          </motion.div>
          <p aria-live="polite" className="mt-1 text-[11px] text-zinc-400">
            {reduce ? "更新" : status}
          </p>
        </motion.div>
        <motion.ul
          drag="y"
          style={{ y }}
          dragConstraints={{ top: 0, bottom: 120 }}
          dragElastic={0.4}
          className="relative z-10 divide-y divide-white/5 bg-zinc-900"
        >
          {ITEMS.map((t) => (
            <li key={t} className="px-4 py-3.5 text-sm text-zinc-300">
              {t}
            </li>
          ))}
        </motion.ul>
      </div>
    </div>
  );
}
