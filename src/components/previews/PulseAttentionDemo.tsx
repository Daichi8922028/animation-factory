import styles from "./PulseAttentionDemo.module.css";

/** pulse-attention デモ。控えめな脈動するドット（通知/ライブ表示用）。 */
export function PulseAttentionDemo() {
  return (
    <div className="min-h-screen flex items-center justify-center p-8 gap-3">
      <span className={styles.dot} aria-hidden />
      <span className="text-sm text-zinc-300 tracking-wider">LIVE</span>
    </div>
  );
}
