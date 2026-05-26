import styles from "@/components/effects/hover-lift.module.css";

/**
 * hover-lift の Tier 1（Vanilla CSS）プレビュー。CSS Module でカプセル化。
 * ボタンに乗せたり Tab フォーカスで :focus-visible 経路も確認できる。
 */
export function HoverLiftDemo() {
  const labels = ["Plan A", "Plan B", "Plan C"];
  return (
    <div className="min-h-screen flex items-center justify-center p-8 gap-4 flex-wrap">
      {labels.map((label) => (
        <button
          key={label}
          className={`${styles.card} rounded-lg border border-white/10 bg-white/5 px-6 py-5 text-sm text-zinc-200 cursor-pointer`}
        >
          {label}
        </button>
      ))}
    </div>
  );
}
