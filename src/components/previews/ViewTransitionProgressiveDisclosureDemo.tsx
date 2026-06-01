"use client";

import { useEffect, useRef, useState } from "react";
import styles from "./ViewTransitionProgressiveDisclosureDemo.module.css";

const STEPS = [
  { title: "アカウント", fields: ["メールアドレス", "パスワード"] },
  { title: "プロフィール", fields: ["表示名", "自己紹介"] },
  { title: "確認", fields: ["内容を確認して送信"] },
];

function startVT(cb: () => void) {
  const reduce =
    typeof window !== "undefined" &&
    window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;
  const doc = document as Document & {
    startViewTransition?: (cb: () => void) => unknown;
  };
  if (!reduce && typeof doc.startViewTransition === "function") doc.startViewTransition(cb);
  else cb();
}

/** view-transition-progressive-disclosure のプレビュー。ステップが forward 方向に左右スライドで進む。 */
export function ViewTransitionProgressiveDisclosureDemo() {
  const [step, setStep] = useState(0);
  const ref = useRef(0);
  useEffect(() => {
    ref.current = step;
  }, [step]);

  useEffect(() => {
    const t = setInterval(() => {
      const next = (ref.current + 1) % STEPS.length;
      document.documentElement.dataset.vt = "forward";
      startVT(() => setStep(next));
    }, 2200);
    return () => clearInterval(t);
  }, []);

  const s = STEPS[step];
  return (
    <div className="min-h-screen flex items-center justify-center bg-zinc-950 p-8 text-zinc-100">
      <div className="w-80 overflow-hidden rounded-xl border border-white/10 bg-zinc-900 p-5">
        <div className="mb-3 flex gap-1.5">
          {STEPS.map((_, i) => (
            <span
              key={i}
              className={`h-1 flex-1 rounded ${i <= step ? "bg-lime-300" : "bg-white/10"}`}
            />
          ))}
        </div>
        <div className={styles.panel}>
          <h3 className="text-base font-semibold">{s.title}</h3>
          <div className="mt-3 space-y-2">
            {s.fields.map((f) => (
              <div
                key={f}
                className="rounded-md border border-white/10 bg-zinc-950 px-3 py-2 text-sm text-zinc-400"
              >
                {f}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
