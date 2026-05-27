"use client";

import { motion } from "motion/react";
import { useEffect, useState } from "react";

/** toggle-switch のプレビュー。1.6 秒ごとに自動切替 + 手動。 */
function Toggle({
  on,
  onClick,
  label,
}: { on: boolean; onClick: () => void; label: string }) {
  return (
    <div className="flex items-center gap-3">
      <span className="text-sm text-zinc-300 w-32">{label}</span>
      <button
        type="button"
        role="switch"
        aria-checked={on}
        onClick={onClick}
        className="relative inline-flex items-center w-11 h-6 rounded-full transition-colors"
        style={{
          background: on ? "rgb(132,204,22)" : "rgb(63,63,70)",
        }}
      >
        <motion.span
          layout
          transition={{ type: "spring", stiffness: 500, damping: 30 }}
          className="absolute h-5 w-5 rounded-full bg-white shadow-md"
          style={{ left: on ? "calc(100% - 22px)" : "2px" }}
        />
      </button>
      <span className="text-xs text-zinc-500 w-10">{on ? "On" : "Off"}</span>
    </div>
  );
}

export function ToggleSwitchDemo() {
  const [a, setA] = useState(true);
  const [b, setB] = useState(false);
  const [c, setC] = useState(true);

  useEffect(() => {
    const t = setInterval(() => {
      setA((v) => !v);
      setTimeout(() => setB((v) => !v), 220);
      setTimeout(() => setC((v) => !v), 440);
    }, 1800);
    return () => clearInterval(t);
  }, []);

  return (
    <div className="min-h-screen flex items-center justify-center p-8 bg-zinc-950 text-zinc-100">
      <div className="space-y-5 w-full max-w-sm rounded-xl border border-white/10 bg-white/5 p-6">
        <Toggle on={a} onClick={() => setA((v) => !v)} label="通知を受け取る" />
        <Toggle on={b} onClick={() => setB((v) => !v)} label="ダークモード" />
        <Toggle on={c} onClick={() => setC((v) => !v)} label="自動保存" />
      </div>
    </div>
  );
}
