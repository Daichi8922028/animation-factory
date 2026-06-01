"use client";

import { animate, useReducedMotion } from "motion/react";
import { useEffect, useState } from "react";

const STATS = [
  { to: 1280, label: "稼働サイト", suffix: "+", decimals: 0 },
  { to: 99.9, label: "稼働率", suffix: "%", decimals: 1 },
  { to: 70, label: "アニメ数", suffix: "", decimals: 0 },
];

function useCountLoop(to: number, decimals: number) {
  const reduce = useReducedMotion();
  const [val, setVal] = useState(0);

  useEffect(() => {
    if (reduce) return;
    let controls = animate(0, to, { duration: 1.4, ease: "easeOut", onUpdate: setVal });
    const loop = setInterval(() => {
      controls.stop();
      setVal(0);
      controls = animate(0, to, { duration: 1.4, ease: "easeOut", onUpdate: setVal });
    }, 3000);
    return () => {
      controls.stop();
      clearInterval(loop);
    };
  }, [to, reduce]);

  const shown = reduce ? to : val;
  return decimals ? shown.toFixed(decimals) : Math.round(shown).toLocaleString();
}

function Stat({ to, label, suffix, decimals }: (typeof STATS)[number]) {
  const v = useCountLoop(to, decimals);
  return (
    <div className="text-center">
      <p className="text-4xl font-bold tabular-nums text-lime-300">
        {v}
        {suffix}
      </p>
      <p className="mt-1.5 text-xs text-zinc-500">{label}</p>
    </div>
  );
}

/** count-up-on-view のプレビュー。ビューポート進入を模して各 KPI を 0 からカウントアップ（ループ）。 */
export function CountUpOnViewDemo() {
  return (
    <div className="min-h-screen flex items-center justify-center gap-10 bg-zinc-950 p-8 text-zinc-100">
      {STATS.map((s) => (
        <Stat key={s.label} {...s} />
      ))}
    </div>
  );
}
