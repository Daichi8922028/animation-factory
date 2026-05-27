import styles from "./ImageZoomDemo.module.css";

/** image-zoom のプレビュー。画像は擬似グラデでサムネを表現。 */
export function ImageZoomDemo() {
  return (
    <div className="min-h-screen flex items-center justify-center p-8 bg-zinc-950">
      <a href="#" className={`${styles.card} max-w-sm w-full`}>
        <div className={styles.frame}>
          <div className={styles.image} role="img" aria-label="サムネイル（プレビュー）" />
        </div>
        <div className={styles.body}>
          <h3 className="text-base text-zinc-100">記事タイトル</h3>
          <p className="text-xs text-zinc-500 mt-1">サムネにポインタを乗せると拡大します</p>
        </div>
      </a>
    </div>
  );
}
