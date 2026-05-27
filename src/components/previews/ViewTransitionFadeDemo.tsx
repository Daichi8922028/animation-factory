"use client";

import { useEffect, useState } from "react";

/**
 * view-transition-fade のプレビュー。
 * 2 秒ごとにビューを切替し、対応ブラウザでは startViewTransition で cross-fade。
 * 未対応では即時切替で表示。
 */
export function ViewTransitionFadeDemo() {
  const [view, setView] = useState<"a" | "b">("a");

  useEffect(() => {
    const t = setInterval(() => {
      const next = view === "a" ? "b" : "a";
      const update = () => setView(next);
      const doc = document as Document & {
        startViewTransition?: (cb: () => void) => unknown;
      };
      if (typeof doc.startViewTransition === "function") {
        doc.startViewTransition(update);
      } else {
        update();
      }
    }, 1800);
    return () => clearInterval(t);
  }, [view]);

  return (
    <div className="min-h-screen flex items-center justify-center p-8 bg-zinc-950 text-zinc-100">
      <div className="w-full max-w-md">
        <p className="text-[10px] uppercase tracking-widest text-zinc-500 mb-3">
          view: {view}
        </p>
        {view === "a" ? (
          <article className="rounded-xl border border-white/10 bg-white/5 p-8">
            <h3 className="text-xl font-semibold">Overview</h3>
            <p className="mt-2 text-sm text-zinc-400">
              View Transitions API がブラウザ側でスナップショットを撮影し、cross-fade で繋ぎます。
            </p>
          </article>
        ) : (
          <article className="rounded-xl border border-lime-300/30 bg-lime-300/5 p-8">
            <h3 className="text-xl font-semibold text-lime-200">Details</h3>
            <p className="mt-2 text-sm text-lime-100/80">
              Firefox など未対応ブラウザでは即時切替（fallback）になります。
            </p>
          </article>
        )}
      </div>
    </div>
  );
}
