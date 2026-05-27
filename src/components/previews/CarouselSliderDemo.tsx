"use client";

import { AnimatePresence, motion } from "motion/react";
import { useEffect, useState } from "react";

const SLIDES = [
  { id: 1, label: "First", grad: "from-emerald-400/30 to-lime-300/20" },
  { id: 2, label: "Second", grad: "from-cyan-400/30 to-sky-300/20" },
  { id: 3, label: "Third", grad: "from-violet-400/30 to-pink-300/20" },
];

const variants = {
  enter: (dir: number) => ({ x: dir > 0 ? 80 : -80, opacity: 0 }),
  center: { x: 0, opacity: 1 },
  exit: (dir: number) => ({ x: dir > 0 ? -80 : 80, opacity: 0 }),
};

/** carousel-slider のプレビュー。direction-aware で前後切替、2 秒ごとに自動。 */
export function CarouselSliderDemo() {
  const [[i, dir], setState] = useState<[number, number]>([0, 0]);

  useEffect(() => {
    const t = setInterval(() => {
      setState(([cur]) => [(cur + 1) % SLIDES.length, +1]);
    }, 2000);
    return () => clearInterval(t);
  }, []);

  const go = (delta: number) =>
    setState([(i + delta + SLIDES.length) % SLIDES.length, delta]);

  const slide = SLIDES[i];

  return (
    <section
      role="region"
      aria-roledescription="carousel"
      aria-label={`Slide ${i + 1} of ${SLIDES.length}`}
      className="min-h-screen flex flex-col items-center justify-center gap-5 p-8 bg-zinc-950 text-zinc-100"
    >
      <div className="relative w-80 h-48 overflow-hidden rounded-2xl border border-white/10">
        <AnimatePresence custom={dir} mode="wait" initial={false}>
          <motion.div
            key={slide.id}
            custom={dir}
            variants={variants}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{ duration: 0.28, ease: "easeOut" }}
            className={`absolute inset-0 grid place-items-center text-2xl font-semibold bg-gradient-to-br ${slide.grad}`}
          >
            {slide.label}
          </motion.div>
        </AnimatePresence>
      </div>

      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={() => go(-1)}
          aria-label="Previous slide"
          className="rounded-full border border-white/15 px-3 py-1 text-sm hover:bg-white/5"
        >
          ←
        </button>
        <span className="text-xs text-zinc-500" aria-live="polite">
          {i + 1} / {SLIDES.length}
        </span>
        <button
          type="button"
          onClick={() => go(+1)}
          aria-label="Next slide"
          className="rounded-full border border-white/15 px-3 py-1 text-sm hover:bg-white/5"
        >
          →
        </button>
      </div>
    </section>
  );
}
