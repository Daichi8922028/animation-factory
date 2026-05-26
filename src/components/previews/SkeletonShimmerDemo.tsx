import styles from "./SkeletonShimmerDemo.module.css";

/** skeleton-shimmer デモ。カード形状のプレースホルダ。 */
export function SkeletonShimmerDemo() {
  return (
    <div className="min-h-screen flex items-center justify-center p-8">
      <div
        aria-busy="true"
        aria-label="読み込み中"
        className="w-full max-w-sm rounded-xl border border-white/10 bg-white/5 p-5"
      >
        <div className={styles.block} style={{ height: 24, width: "60%" }} />
        <div
          className={styles.block}
          style={{ height: 14, width: "100%", marginTop: 16 }}
        />
        <div
          className={styles.block}
          style={{ height: 14, width: "90%", marginTop: 8 }}
        />
        <div
          className={styles.block}
          style={{ height: 14, width: "75%", marginTop: 8 }}
        />
      </div>
    </div>
  );
}
