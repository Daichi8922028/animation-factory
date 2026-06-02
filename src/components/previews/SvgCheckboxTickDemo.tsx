"use client";

import { useEffect, useState } from "react";
import styles from "./SvgCheckboxTickDemo.module.css";

/**
 * svg-checkbox-tick の Tier 1（純 CSS、stroke-dashoffset transition）プレビュー。
 * 枠と tick を SVG パスで描き、on/off をトグルで自動ループする。
 * Reduce Motion ON では transition を CSS 側（@media）で無効化し、即時切替に縮退する。
 *
 * lint pitfalls 回避:
 *  - setState は setInterval コールバック内のみ（useEffect の同期本体では呼ばない）
 *  - interval は unmount でクリーンアップ
 */
export function SvgCheckboxTickDemo() {
  const [checked, setChecked] = useState(false);

  useEffect(() => {
    // 自動ループ: クリック相当の state-change を一定間隔で発火（同期 setState ではない）
    const id = window.setInterval(() => {
      setChecked((prev) => !prev);
    }, 1400);

    return () => window.clearInterval(id);
  }, []);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center gap-10 bg-zinc-950 text-zinc-100 px-8">
      <div className="flex flex-col items-center gap-6">
        <svg
          className={`${styles.svg} ${checked ? styles.checked : ""}`}
          viewBox="0 0 24 24"
          role="img"
          aria-label={checked ? "チェック済み" : "未チェック"}
        >
          <rect
            className={styles.box}
            x="3"
            y="3"
            width="18"
            height="18"
            rx="4"
            pathLength={1}
          />
          <path
            className={styles.tick}
            d="M6 12.5 L10.5 17 L18 7.5"
            pathLength={1}
          />
        </svg>

        <p className="text-sm tracking-tight text-zinc-400">
          tick が <span className="text-lime-300">stroke-dashoffset</span>{" "}
          で描かれます
        </p>
      </div>

      <p className="text-xs text-zinc-500">
        click（state-change）で on/off をトグル・自動ループ
      </p>
    </div>
  );
}
