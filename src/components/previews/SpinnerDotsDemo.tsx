import styles from "./SpinnerDotsDemo.module.css";

/** spinner-dots デモ。純 CSS @keyframes、依存なし。 */
export function SpinnerDotsDemo() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-8 gap-4">
      <div
        className={styles.dots}
        role="status"
        aria-label="読み込み中"
      >
        <span></span>
        <span></span>
        <span></span>
      </div>
      <p className="text-xs text-zinc-500">読み込み中…</p>
    </div>
  );
}
