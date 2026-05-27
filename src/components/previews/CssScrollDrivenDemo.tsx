import styles from "./CssScrollDrivenDemo.module.css";

/**
 * css-scroll-driven の Tier 1（純 CSS、animation-timeline: view()）プレビュー。
 * 6 枚のカードを順にスクロールで進行させる。Safari など未対応では即時表示にフォールバック。
 */
export function CssScrollDrivenDemo() {
  return (
    <div className="bg-zinc-950 text-zinc-100">
      <div className="h-[30vh] flex items-end justify-center p-8 text-sm text-zinc-500">
        ↓ スクロールするとカードが進入進行で reveal します
      </div>

      <div className="grid gap-6 max-w-md mx-auto px-8 pb-[40vh]">
        {Array.from({ length: 6 }).map((_, i) => (
          <article
            key={i}
            className={`${styles.card} rounded-xl border border-white/10 bg-white/5 px-6 py-5`}
          >
            <h4 className="text-base text-zinc-100">Item {i + 1}</h4>
            <p className="mt-1 text-sm text-zinc-400">
              スクロール量に応じて、JS ゼロで進行します。
            </p>
          </article>
        ))}
        <p className={styles.hint}>
          ※ Safari など animation-timeline 未対応のブラウザでは即時表示にフォールバックします（@supports 分岐）。
        </p>
      </div>
    </div>
  );
}
