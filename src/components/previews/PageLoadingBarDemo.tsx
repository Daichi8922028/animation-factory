"use client";

import { AnimatePresence, motion, useMotionValue, animate } from "motion/react";
import { useEffect, useState } from "react";

/** page-loading-bar のプレビュー。2 秒ごとに開始 → 完了をループ。 */
export function PageLoadingBarDemo() {
  const [loading, setLoading] = useState(true);
  const progress = useMotionValue(0);

  useEffect(() => {
    let mounted = true;
    const loop = async () => {
      while (mounted) {
        setLoading(true);
        progress.set(0);
        const start = animate(progress, 0.3, { duration: 0.2 });
        await new Promise((r) => setTimeout(r, 1400));
        start.stop();
        const finish = animate(progress, 1, { duration: 0.25, ease: "easeOut" });
        setLoading(false);
        await new Promise((r) => setTimeout(r, 600));
        finish.stop();
      }
    };
    loop();
    return () => {
      mounted = false;
    };
  }, [progress]);

  return (
    <div className="relative min-h-screen bg-zinc-950 text-zinc-100">
      <AnimatePresence>
        {(loading || progress.get() > 0) && (
          <motion.div
            role="progressbar"
            aria-valuetext="読込中"
            initial={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.15 }}
            className="fixed top-0 left-0 right-0 z-50 h-0.5 origin-left bg-lime-300"
            style={{ scaleX: progress }}
          />
        )}
      </AnimatePresence>

      <main className="max-w-3xl mx-auto px-6 py-16 space-y-6">
        <p className="text-sm text-zinc-400">
          画面上部のロードバーが、ルート遷移風に進行 → 完了 → fade-out するループ。
        </p>
        <div className="rounded-xl border border-white/10 bg-white/5 px-6 py-10">
          <h3 className="text-lg">Page Content</h3>
          <p className="text-sm text-zinc-500 mt-2">
            実プロジェクトでは router.events や usePathname の変化で loading を出す。
          </p>
        </div>
      </main>
    </div>
  );
}
