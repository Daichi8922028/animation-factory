"use client";

import { useEffect, useRef, useState } from "react";
import styles from "./ShakeDemo.module.css";

/** shake のプレビュー。2 秒ごとに自動で揺らす + 手動ボタン。 */
export function ShakeDemo() {
  const inputRef = useRef<HTMLInputElement>(null);
  const [seq, setSeq] = useState(0);

  useEffect(() => {
    const el = inputRef.current;
    if (!el) return;
    el.classList.remove(styles.isShake);
    void el.offsetWidth;
    el.classList.add(styles.isShake);
  }, [seq]);

  useEffect(() => {
    const t = setInterval(() => setSeq((s) => s + 1), 1800);
    return () => clearInterval(t);
  }, []);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center gap-4 p-8 bg-zinc-950 text-zinc-100">
      <input
        ref={inputRef}
        defaultValue="invalid-input"
        aria-invalid="true"
        className={`${styles.target} rounded-md border border-red-400/40 bg-red-500/5 text-red-200 px-4 py-2 text-sm`}
      />
      <p className="text-xs text-red-300" role="alert">
        ⚠ 入力内容が不正です
      </p>
      <button
        type="button"
        onClick={() => setSeq((s) => s + 1)}
        className="mt-3 rounded-md border border-white/15 bg-white/5 px-4 py-2 text-sm hover:bg-white/10"
      >
        Trigger shake
      </button>
    </div>
  );
}
