"use client";

import styles from "./CssScrollProgressBarDemo.module.css";

/**
 * css-scroll-progress-bar の Tier 1（純 CSS、scroll-timeline: scroll()）プレビュー。
 * ルートスクローラの縦進行に連動して上部の進捗バーが 0→100% に伸びる。JS ゼロ実装。
 * scroll-timeline 未対応ブラウザではフルバー表示にフォールバック（@supports 分岐）。
 * Reduce Motion 時は連続アニメを止め、静的な進捗インジケータに縮退（CSS module 側で処理）。
 */
export function CssScrollProgressBarDemo() {
  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100">
      {/* sticky な進捗バー本体。スクロール進行に応じて scaleX が 0→1 に補間される。 */}
      <div className={`${styles.bar}`} aria-hidden="true" />

      <div className="h-[24vh] flex items-end justify-center px-8 pb-4 text-sm text-zinc-500">
        ↓ スクロールすると上部のバーが進捗を示します
      </div>

      <article className="mx-auto max-w-md px-8 pb-[40vh]">
        <h3 className="text-2xl font-semibold tracking-tight text-zinc-100">
          スクロール進捗バー
        </h3>
        <p className="mt-2 text-sm text-lime-300">
          scroll-timeline: scroll(root) で JS ゼロ実装
        </p>

        {Array.from({ length: 8 }).map((_, i) => (
          <section key={i} className={`${styles.section} py-6`}>
            <h4 className="text-base text-zinc-100">セクション {i + 1}</h4>
            <p className="mt-2 text-sm leading-relaxed text-zinc-400">
              ページの読書進捗を上部のバーで可視化します。スクロール量に応じて
              バーが横に伸び、現在地を JavaScript なしで伝えます。長い記事や
              ドキュメントで、読者がどこまで読んだかの目安になります。
            </p>
            <p className="mt-2 text-sm leading-relaxed text-zinc-400">
              animation-timeline がスクロール位置をアニメーションの進行に直結
              するため、スクロールイベントの購読や rAF ループは不要です。
            </p>
          </section>
        ))}

        <p className={`${styles.hint} mt-6`}>
          ※ scroll-timeline 未対応ブラウザではバーがフル表示にフォールバックします（@supports 分岐）。
        </p>
      </article>
    </div>
  );
}
