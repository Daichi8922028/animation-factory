"use client";

import { AnimatePresence, motion, useMotionValue, useTransform } from "motion/react";
import { useState } from "react";

/** drag-swipe-card のプレビュー。3 枚積み重ね、スワイプで消える、なくなったら復活。 */
type Card = { id: number; label: string };
const INITIAL: Card[] = [
  { id: 1, label: "Card A" },
  { id: 2, label: "Card B" },
  { id: 3, label: "Card C" },
];

export function DragSwipeCardDemo() {
  const [cards, setCards] = useState<Card[]>(INITIAL);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center gap-6 p-8 bg-zinc-950 text-zinc-100">
      <div className="relative w-72 h-44">
        <AnimatePresence>
          {cards.map((c) => (
            <SwipeCard
              key={c.id}
              label={c.label}
              onDismiss={() => setCards((cs) => cs.filter((x) => x.id !== c.id))}
            />
          ))}
        </AnimatePresence>
        {cards.length === 0 && (
          <div className="absolute inset-0 grid place-items-center text-xs text-zinc-500">
            すべて dismiss しました
          </div>
        )}
      </div>
      <button
        type="button"
        onClick={() => setCards(INITIAL)}
        className="text-xs text-zinc-400 hover:text-zinc-100 border border-white/10 rounded-md px-3 py-1.5"
      >
        Reset
      </button>
      <p className="text-xs text-zinc-500">左右にドラッグして dismiss</p>
    </div>
  );
}

function SwipeCard({ label, onDismiss }: { label: string; onDismiss: () => void }) {
  const x = useMotionValue(0);
  const opacity = useTransform(x, [-180, 0, 180], [0, 1, 0]);
  const rotate = useTransform(x, [-180, 0, 180], [-15, 0, 15]);

  return (
    <motion.div
      drag="x"
      dragConstraints={{ left: 0, right: 0 }}
      dragElastic={1}
      style={{ x, opacity, rotate }}
      exit={{ x: x.get() > 0 ? 400 : -400, opacity: 0 }}
      whileTap={{ cursor: "grabbing" }}
      onDragEnd={(_, info) => {
        if (Math.abs(info.offset.x) > 120 || Math.abs(info.velocity.x) > 500) {
          onDismiss();
        }
      }}
      className="absolute inset-0 rounded-xl bg-gradient-to-br from-zinc-800 to-zinc-900 border border-white/10 grid place-items-center cursor-grab shadow-xl shadow-black/40"
    >
      <span className="text-lg">{label}</span>
    </motion.div>
  );
}
