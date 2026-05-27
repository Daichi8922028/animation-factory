import styles from "./MarqueeDemo.module.css";

/** marquee のプレビュー。params: { speed_pxs } をインライン CSS 変数で渡せる。 */
const LOGOS = ["Stripe", "Linear", "Vercel", "Apple", "Nike", "Notion", "Figma", "Slack"];

export function MarqueeDemo({ params }: { params?: Record<string, unknown> }) {
  const speed = typeof params?.speed_pxs === "number" ? params.speed_pxs : 50;
  // 大体の総幅（重複込み） / 速度 = 1 周あたりの秒数
  const totalWidthPx = LOGOS.length * 140; // 1 ロゴ約 140px の見積もり
  const durationS = Math.max(totalWidthPx / Math.max(speed, 1), 4);

  return (
    <div className="min-h-screen flex items-center justify-center p-8 bg-zinc-950">
      <div
        className={`${styles.wrap} max-w-3xl`}
        aria-label="ロゴストリップ"
        style={{ ["--marquee-duration" as string]: `${durationS}s` }}
      >
        <div className={styles.track}>
          <div className={styles.content}>
            {LOGOS.map((l) => (
              <span key={l}>{l}</span>
            ))}
          </div>
          <div className={styles.content} aria-hidden="true">
            {LOGOS.map((l) => (
              <span key={`dup-${l}`}>{l}</span>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
