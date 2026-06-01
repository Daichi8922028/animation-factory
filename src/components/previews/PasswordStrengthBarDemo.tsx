"use client";

import { motion } from "motion/react";
import { useEffect, useState } from "react";

const COLORS = ["#f87171", "#fb923c", "#facc15", "#a3e635"];
const LABELS = ["とても弱い", "弱い", "普通", "強い", "とても強い"];
const SAMPLE = "Tr0ub4dour&3";

function scorePw(pw: string): number {
  let s = 0;
  if (pw.length >= 6) s += 1;
  if (pw.length >= 10) s += 1;
  if (/[A-Z]/.test(pw) && /[a-z]/.test(pw)) s += 1;
  if (/\d/.test(pw) && /[^A-Za-z0-9]/.test(pw)) s += 1;
  return Math.min(s, 4);
}

/** password-strength-bar のプレビュー。見本パスワードを 1 文字ずつ打つ様子を再現し強度バーを実演。 */
export function PasswordStrengthBarDemo() {
  const [pw, setPw] = useState("");

  useEffect(() => {
    let i = 0;
    const t = setInterval(() => {
      i = i >= SAMPLE.length ? 0 : i + 1;
      setPw(SAMPLE.slice(0, i));
    }, 320);
    return () => clearInterval(t);
  }, []);

  const score = scorePw(pw);

  return (
    <div className="min-h-screen flex items-center justify-center p-8 bg-zinc-950 text-zinc-100">
      <div className="w-72">
        <label htmlFor="psb" className="mb-1 block text-xs text-zinc-400">
          パスワード
        </label>
        <input
          id="psb"
          type="text"
          value={pw}
          readOnly
          className="w-full rounded-lg border border-white/10 bg-zinc-950 px-3 py-2 font-mono text-sm text-zinc-100 outline-none"
        />
        <div
          className="mt-2 flex gap-1"
          role="meter"
          aria-valuemin={0}
          aria-valuemax={4}
          aria-valuenow={score}
        >
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="h-1.5 flex-1 overflow-hidden rounded bg-white/10">
              <motion.div
                className="h-full origin-left"
                initial={false}
                animate={{
                  scaleX: i < score ? 1 : 0,
                  backgroundColor: COLORS[Math.max(score - 1, 0)],
                }}
                transition={{ type: "spring", stiffness: 300, damping: 26 }}
              />
            </div>
          ))}
        </div>
        <span aria-live="polite" className="mt-1.5 block text-xs text-zinc-400">
          強度: {LABELS[score]}
        </span>
      </div>
    </div>
  );
}
