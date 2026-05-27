import styles from "@/components/effects/hover-glow.module.css";

/**
 * hover-glow の Tier 1（純 CSS）プレビュー。CSS Module でカプセル化。
 * 擬似要素の opacity で光を出し入れする方式。
 */
export function HoverGlowDemo() {
  return (
    <div className="min-h-screen flex items-center justify-center p-8 gap-6 flex-wrap bg-zinc-950">
      <button
        className={`${styles.card} rounded-xl border border-white/10 bg-white/5 px-8 py-5 text-base text-zinc-100 cursor-pointer`}
      >
        Primary CTA
      </button>
      <button
        className={`${styles.card} rounded-xl border border-lime-300/30 bg-lime-300/10 px-8 py-5 text-base text-lime-200 cursor-pointer`}
      >
        続ける →
      </button>
    </div>
  );
}
