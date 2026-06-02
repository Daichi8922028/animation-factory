"use client";

import { useId } from "react";
import { useReducedMotion } from "motion/react";
import styles from "./SvgGooeyMergeDemo.module.css";

/**
 * svg-gooey-merge の Tier 1（Vanilla CSS + SVG filter gooey）プレビュー。
 * feGaussianBlur + feColorMatrix で alpha しきい値を立て、移動する円が
 * 近づくと粘性をもって融合・離れると分裂するループ装飾。
 * transform のみ補間。Reduce Motion ON では animation を止め静止配置で表示。
 */
export function SvgGooeyMergeDemo() {
  // useReducedMotion は render 中に値を導出する（useEffect 内 setState ではない）
  const reduced = useReducedMotion();
  // SSR/複数マウントでも一意になる filter id
  const rawId = useId();
  const filterId = `gooey-${rawId.replace(/:/g, "")}`;

  return (
    <div className="min-h-screen flex flex-col items-center justify-center gap-8 bg-zinc-950 text-zinc-100">
      <svg
        width="320"
        height="200"
        viewBox="0 0 320 200"
        role="presentation"
        aria-hidden="true"
        className={reduced ? styles.reduced : undefined}
      >
        <defs>
          <filter id={filterId}>
            <feGaussianBlur in="SourceGraphic" stdDeviation="9" result="blur" />
            <feColorMatrix
              in="blur"
              type="matrix"
              values="1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 20 -10"
              result="goo"
            />
            <feBlend in="SourceGraphic" in2="goo" />
          </filter>
        </defs>

        <g filter={`url(#${filterId})`} fill="#a3e635">
          <circle className={`${styles.blob} ${styles.blobA}`} cx="130" cy="100" r="26" />
          <circle className={`${styles.blob} ${styles.blobB}`} cx="190" cy="100" r="26" />
          <circle className={`${styles.blob} ${styles.blobC}`} cx="160" cy="100" r="18" />
          <circle className={`${styles.blob} ${styles.blobD}`} cx="160" cy="100" r="14" />
        </g>
      </svg>

      <p className="text-sm text-zinc-400 max-w-xs text-center px-8">
        SVG フィルタ（feGaussianBlur + feColorMatrix）の gooey で、円が近づくと融合し離れると分裂します。
      </p>
    </div>
  );
}
