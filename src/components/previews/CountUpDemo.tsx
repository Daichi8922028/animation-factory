"use client";

import { animate, motion, useMotionValue, useTransform } from "motion/react";
import { useEffect, useState } from "react";

/** count-up のプレビュー。params: { to, duration_ms } で先頭の値を上書きできる。 */
export function CountUpDemo({ params }: { params?: Record<string, unknown> }) {
  const userTo = typeof params?.to === "number" ? params.to : null;
  const duration =
    typeof params?.duration_ms === "number" ? params.duration_ms : 1400;

  const [seq, setSeq] = useState(0);

  useEffect(() => {
    const t = setInterval(() => setSeq((s) => s + 1), Math.max(duration + 1000, 1800));
    return () => clearInterval(t);
  }, [duration]);

  return (
    <div className="min-h-screen flex items-center justify-center p-8 bg-zinc-950 text-zinc-100">
      <div className="grid grid-cols-3 gap-6 w-full max-w-2xl">
        <Stat key={`a-${seq}`} label="導入" to={userTo ?? 12345} suffix="件" durationMs={duration} />
        <Stat key={`b-${seq}`} label="売上" to={9876543} prefix="¥" durationMs={duration} />
        <Stat key={`c-${seq}`} label="完了率" to={94.5} suffix="%" decimals={1} durationMs={duration} />
      </div>
    </div>
  );
}

function Stat({
  label,
  to,
  prefix = "",
  suffix = "",
  decimals = 0,
  durationMs,
}: {
  label: string;
  to: number;
  prefix?: string;
  suffix?: string;
  decimals?: number;
  durationMs: number;
}) {
  const value = useMotionValue(0);
  const text = useTransform(value, (n) =>
    `${prefix}${n.toLocaleString("ja-JP", {
      minimumFractionDigits: decimals,
      maximumFractionDigits: decimals,
    })}${suffix}`,
  );

  useEffect(() => {
    const ctrl = animate(value, to, { duration: durationMs / 1000, ease: "easeOut" });
    return () => ctrl.stop();
  }, [to, durationMs, value]);

  return (
    <div className="rounded-xl border border-white/10 bg-white/5 p-5 text-center">
      <p className="text-[10px] uppercase tracking-widest text-zinc-500">
        {label}
      </p>
      <motion.p
        className="mt-2 text-3xl font-semibold text-zinc-100"
        style={{ fontVariantNumeric: "tabular-nums" }}
        aria-label={`${prefix}${to}${suffix}`}
      >
        {text}
      </motion.p>
    </div>
  );
}
