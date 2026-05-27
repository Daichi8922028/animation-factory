"use client";

import { useEffect, useState } from "react";
import styles from "./TypewriterDemo.module.css";

const PHRASES = [
  "$ npx animation-factory get fade-up",
  "$ animation-factory list --tier alpha",
  "$ Welcome to the animation catalog.",
];

/** typewriter のプレビュー。3 文を順にタイプ → 一定時間後に次へ。 */
export function TypewriterDemo() {
  const [state, setState] = useState({ phraseIdx: 0, n: 0 });

  const phrase = PHRASES[state.phraseIdx];

  useEffect(() => {
    if (state.n >= phrase.length) {
      const next = setTimeout(
        () =>
          setState((s) => ({
            phraseIdx: (s.phraseIdx + 1) % PHRASES.length,
            n: 0,
          })),
        1400,
      );
      return () => clearTimeout(next);
    }

    const next = setTimeout(
      () => setState((s) => ({ ...s, n: s.n + 1 })),
      50,
    );
    return () => clearTimeout(next);
  }, [phrase.length, state.n]);

  return (
    <div className="min-h-screen flex items-center justify-center p-8 bg-zinc-950">
      <div className="w-full max-w-xl rounded-lg border border-white/10 bg-zinc-900 p-5 font-mono text-sm text-lime-300 shadow-xl shadow-black/40">
        <span aria-label={phrase}>
          <span aria-hidden>{phrase.slice(0, state.n)}</span>
          <span aria-hidden className={styles.caret}>
            |
          </span>
        </span>
      </div>
    </div>
  );
}
