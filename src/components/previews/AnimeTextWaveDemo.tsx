"use client";

import { useEffect, useRef } from "react";
import { animate, stagger } from "animejs";

/**
 * anime-text-wave の Tier 1（anime.js v4: animate + stagger）プレビュー。
 * テキストを 1 文字ずつ span に分割し、sine 波で連続して上下させる装飾ループ。
 * Reduce Motion ON では animate を呼ばず静止表示に縮退。
 * インスタンスを保持し unmount 時に pause() + revert() でクリーンアップ。
 */
const WORDS = "Anime.js Text Wave";

export function AnimeTextWaveDemo() {
  const waveRef = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const root = waveRef.current;
    if (!root) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const targets = root.querySelectorAll<HTMLSpanElement>(".wave-char");
    const anim = animate(targets, {
      translateY: [0, -18],
      duration: 900,
      loop: true,
      alternate: true,
      ease: "inOutSine",
      delay: stagger(70),
    });

    return () => {
      anim.pause();
      anim.revert();
    };
  }, []);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center gap-10 bg-zinc-950 text-zinc-100 px-8">
      <p className="text-xs uppercase tracking-[0.3em] text-zinc-500">
        anime.js · text wave
      </p>

      <span
        ref={waveRef}
        aria-label={WORDS}
        className="inline-flex text-4xl sm:text-6xl font-semibold tracking-tight text-lime-300"
      >
        {Array.from(WORDS).map((ch, i) => (
          <span
            key={i}
            aria-hidden="true"
            className="wave-char inline-block whitespace-pre"
          >
            {ch === " " ? " " : ch}
          </span>
        ))}
      </span>

      <p className="max-w-sm text-center text-sm text-zinc-400">
        文字を 1 文字ずつ span に分割し、stagger で位相差を与えた sine 波が連続ループします。
      </p>
    </div>
  );
}
