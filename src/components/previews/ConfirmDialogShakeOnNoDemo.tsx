"use client";

import { motion, useAnimationControls, useReducedMotion } from "motion/react";
import { useCallback, useEffect } from "react";

/**
 * confirm-dialog-shake-on-no のプレビュー。
 * 背景クリック/ESC = 曖昧な dismiss を拒否し、枠を shake してボタン選択を促す。
 * デモでは一定間隔で dismiss 試行を再現して shake を見せる。
 */
export function ConfirmDialogShakeOnNoDemo() {
  const controls = useAnimationControls();
  const reduce = useReducedMotion();

  const guard = useCallback(() => {
    if (reduce) {
      controls.start({
        borderColor: [
          "rgba(248,113,113,0.7)",
          "rgba(255,255,255,0.1)",
        ],
        transition: { duration: 0.5 },
      });
      return;
    }
    controls.start({
      x: [0, -8, 8, -6, 6, -4, 4, 0],
      transition: { duration: 0.36, ease: "easeInOut" },
    });
  }, [controls, reduce]);

  // デモ: 背景クリックによる dismiss 試行を周期的に再現
  useEffect(() => {
    const t = setInterval(guard, 2600);
    return () => clearInterval(t);
  }, [guard]);

  return (
    <div className="min-h-screen relative flex items-center justify-center p-8 bg-zinc-950 text-zinc-100">
      <div
        className="absolute inset-0 grid place-items-center bg-black/60"
        onClick={guard}
        role="presentation"
      >
        <motion.div
          role="alertdialog"
          aria-modal="true"
          aria-labelledby="cds-title"
          aria-describedby="cds-desc"
          animate={controls}
          onClick={(e) => e.stopPropagation()}
          className="w-[21rem] rounded-xl border border-white/10 bg-zinc-900 px-6 py-5 shadow-2xl shadow-black/60"
        >
          <h3 id="cds-title" className="text-base font-semibold">
            プロジェクトを削除しますか？
          </h3>
          <p id="cds-desc" className="mt-1.5 text-sm text-zinc-400">
            この操作は取り消せません。背景クリックでは閉じません — ボタンで明示的に選択してください。
          </p>
          <div className="mt-5 flex justify-end gap-2">
            <button
              type="button"
              className="rounded-md border border-white/10 px-3 py-1.5 text-sm text-zinc-300 hover:bg-white/5 focus-visible:ring-2 focus-visible:ring-white/30 outline-none"
            >
              キャンセル
            </button>
            <button
              type="button"
              className="rounded-md border border-red-400/40 bg-red-500/15 px-3 py-1.5 text-sm text-red-300 hover:bg-red-500/25 focus-visible:ring-2 focus-visible:ring-red-400/40 outline-none"
            >
              削除する
            </button>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
