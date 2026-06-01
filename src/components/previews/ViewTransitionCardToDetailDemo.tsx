"use client";

import { useEffect, useRef, useState } from "react";

const CARDS = [
  { id: "a", name: "Sunset", grad: "linear-gradient(135deg,#f97316,#ec4899)" },
  { id: "b", name: "Ocean", grad: "linear-gradient(135deg,#06b6d4,#3b82f6)" },
  { id: "c", name: "Forest", grad: "linear-gradient(135deg,#84cc16,#10b981)" },
  { id: "d", name: "Grape", grad: "linear-gradient(135deg,#a78bfa,#6366f1)" },
];

const HERO = "vtc2d-hero";

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

type View = { mode: "list" | "detail"; active: number };

/** view-transition-card-to-detail のプレビュー。一覧⇔詳細で選択カードがヒーローへ morph。 */
export function ViewTransitionCardToDetailDemo() {
  const [view, setView] = useState<View>({ mode: "list", active: 0 });
  const ref = useRef(view);
  useEffect(() => {
    ref.current = view;
  }, [view]);

  useEffect(() => {
    const t = setInterval(() => {
      const v = ref.current;
      const next: View =
        v.mode === "list"
          ? { mode: "detail", active: v.active }
          : { mode: "list", active: (v.active + 1) % CARDS.length };
      startVT(() => setView(next));
    }, 2200);
    return () => clearInterval(t);
  }, []);

  return (
    <div className="min-h-screen flex items-center justify-center bg-zinc-950 p-8 text-zinc-100">
      <div className="w-80">
        {view.mode === "list" ? (
          <div className="grid grid-cols-2 gap-3">
            {CARDS.map((c, i) => (
              <div
                key={c.id}
                style={{
                  background: c.grad,
                  ...(i === view.active ? { viewTransitionName: HERO } : {}),
                }}
                className="grid h-24 place-items-end rounded-xl p-2 text-xs font-medium text-white/90"
              >
                {c.name}
              </div>
            ))}
          </div>
        ) : (
          <div>
            <div
              style={{ background: CARDS[view.active].grad, viewTransitionName: HERO }}
              className="h-44 rounded-2xl"
            />
            <h3 className="mt-4 text-lg font-semibold">{CARDS[view.active].name}</h3>
            <p className="mt-1 text-sm text-zinc-400">
              選んだカードが共有要素として詳細ヒーローへ拡大しながら繋がります。
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
