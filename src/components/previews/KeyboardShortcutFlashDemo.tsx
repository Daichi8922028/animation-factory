"use client";

import { useEffect, useState } from "react";
import styles from "./KeyboardShortcutFlashDemo.module.css";

const KEYS = [
  { id: "k", label: "⌘ K", hint: "コマンドパレット" },
  { id: "s", label: "⌘ S", hint: "保存" },
  { id: "slash", label: "/", hint: "検索" },
];

/** keyboard-shortcut-flash のプレビュー。ショートカット押下を順番に再現して kbd を flash。 */
export function KeyboardShortcutFlashDemo() {
  const [flash, setFlash] = useState<string | null>(null);

  useEffect(() => {
    let i = 0;
    const t = setInterval(() => {
      setFlash(KEYS[i % KEYS.length].id);
      i += 1;
    }, 950);
    return () => clearInterval(t);
  }, []);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center gap-5 bg-zinc-950 p-8 text-zinc-100">
      <p className="text-xs text-zinc-500">ショートカット押下を flash で可視化</p>
      <div className="flex flex-col gap-3">
        {KEYS.map((k) => (
          <div key={k.id} className="flex items-center gap-3">
            <kbd className={`${styles.kbd} ${flash === k.id ? styles.flash : ""}`}>
              {k.label}
            </kbd>
            <span className="text-sm text-zinc-400">{k.hint}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
