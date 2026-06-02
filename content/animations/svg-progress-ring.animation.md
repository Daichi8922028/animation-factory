---
id: svg-progress-ring
name: SVG Progress Ring
version: 1.0.0
release: v1.2
variant: react-motion
description: |
  SVG circle の stroke で円形プログレスを 0→100% に進める feedback アニメーション。
  リング外周を strokeDashoffset（または pathLength）で補間し、中央に数値も同期表示する。
  アップロード・ダウンロード・スコア・残り時間など「進捗を 1 つの円で表す」用途に。

taxonomy:
  layer: [library, css]
  ux_role:
    primary: feedback
    secondary: [progress, status]
  trigger: [state-change]
  media: [svg, dom-css]
  authoring: code

behavior:
  lifecycle: continuous
  reversible: true
  replay: every-entry

tags:
  - svg
  - progress
  - ring
  - circular
  - stroke-dashoffset
  - pathlength
  - feedback
  - motion

trigger:
  primary: state-change
  touch_fallback: always-on
  config:
    value: 0
    max: 100

runtime:
  language: typescript
  framework: react
  framework_version: ">=19"
dependencies:
  - { name: motion, version: "^12.40.0", purpose: "strokeDashoffset / pathLength の補間と数値の useTransform 同期" }
peer_dependencies:
  - { name: react, version: ">=18" }

implementations:
  - tier: 1
    name: "motion (strokeDashoffset 補間)"
    dependencies: [ { name: motion, version: "^12.40.0" } ]
    browser_support: { baseline: widely-available, baseline_year: 2020 }
    performance: { gpu_accelerated: false, layout_thrash: false, cost: low }
    degrades_to: 2
  - tier: 2
    name: "Vanilla CSS transition (stroke-dashoffset)"
    dependencies: []
    browser_support: { baseline: widely-available, baseline_year: 2017 }
    performance: { gpu_accelerated: false, layout_thrash: false, cost: low }
    degradation: "数値カウンタの滑らかな同期や spring イージングは出せない。値を CSS 変数で渡し transition で stroke-dashoffset を補間する簡易版"

browser_support:
  baseline: widely-available
  baseline_year: 2020
  notes: "代表値は Tier 1（motion）。SVG stroke-dasharray/offset 自体は古くから安定。pathLength は 2020 以降確実"

performance:
  gpu_accelerated: false
  layout_thrash: false
  cost: low
  notes: "stroke-dashoffset の補間は Paint で完結（Composite ではない）。単一リングなら 60fps 余裕"

parameters:
  - { name: value, type: number, default: 0, range: [0, 100], description: "現在の進捗（0–100%）" }
  - { name: size_px, type: number, default: 120, range: [48, 240], description: "リングの直径（px）" }
  - { name: stroke_width, type: number, default: 10, range: [4, 24], description: "リングの線幅（px）" }

a11y:
  respects_reduced_motion: true
  fallback: "補間アニメを切り、目標値の最終形を即時表示。数値テキストも即時に確定値へ"
  focus_safe: true
  notes: "role=\"progressbar\" + aria-valuenow/min/max でスクリーンリーダーに進捗を伝える。視覚的な円だけに頼らない"

license: MIT
authors: ["@daichi"]
sources:
  - { title: "MDN: stroke-dashoffset", url: "https://developer.mozilla.org/en-US/docs/Web/SVG/Attribute/stroke-dashoffset" }
  - { title: "Motion: SVG animation", url: "https://motion.dev/docs/react-svg" }
attribution_required: false

preview:
  url: https://animation-factory.app/preview/svg-progress-ring
  loop: true
  duration_ms: 2400

related:
  alternatives: [progress-bar, count-up, svg-line-draw, page-loading-bar]
  composes_with:
    - { id: count-up, note: "リング中央の数値を count-up で揃えると進捗とカウンタが一体に見える" }
    - { id: fade-in, note: "完了（100%）後にラベルやチェックを fade-in で出す流れが定番" }
  requires: []

sections:
  skip: [variants]

ai:
  intent_examples:
    - "アップロードの進捗を円形リングで 0 から 100% まで表示したい"
    - "中央に数値が出る円形プログレスを SVG で作りたい"
    - "ドーナツ型のプログレスインジケータが回りながら埋まる演出"
  apply_targets: ["upload-indicator", "score-dial", "loading-ring", "timer"]
  do_not_apply_to: ["body-text", "navigation-bar", "data-table"]
---

## Overview

SVG の `<circle>` の外周長を `stroke-dasharray` に設定し、`stroke-dashoffset` を「全周（0%）」から「0（100%）」へ補間することで、リングが埋まっていくように見せる。中央には進捗の数値を同期表示する。線形プログレスバーよりコンパクトで、円形のスペース（カード隅・ダイヤル・タイマー）に収まる **feedback / progress** 表現。

リングは `transform: rotate(-90deg)` で 12 時方向を起点にし、`strokeLinecap: round` で先端を丸める。Tier 1 では motion の `useTransform` で offset と表示数値を同じ進捗値から導出するため、円と数字が必ず一致する。

使う場面: アップロード/ダウンロード進捗、スコアダイヤル、残り時間タイマー、ローディングリング。
避けたい場面: 本文、ナビバー、進捗の概念がない静的な装飾。

## Preview

公開プレビュー: https://animation-factory.app/preview/svg-progress-ring

## Implementation

### motion（strokeDashoffset 補間, Tier 1）

```tsx
"use client";
import { motion, useReducedMotion } from "motion/react";

export function ProgressRing({
  value,
  size = 120,
  stroke = 10,
}: {
  value: number; // 0..100
  size?: number;
  stroke?: number;
}) {
  const reduce = useReducedMotion();
  const r = (size - stroke) / 2;
  const circumference = 2 * Math.PI * r;
  const offset = circumference * (1 - value / 100);

  return (
    <svg
      width={size}
      height={size}
      viewBox={`0 0 ${size} ${size}`}
      role="progressbar"
      aria-valuenow={Math.round(value)}
      aria-valuemin={0}
      aria-valuemax={100}
    >
      <g transform={`rotate(-90 ${size / 2} ${size / 2})`} fill="none">
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          stroke="rgba(255,255,255,0.1)"
          strokeWidth={stroke}
        />
        <motion.circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          stroke="#a3e635"
          strokeWidth={stroke}
          strokeLinecap="round"
          strokeDasharray={circumference}
          // reduced-motion なら補間せず目標値へ即時に
          initial={false}
          animate={{ strokeDashoffset: offset }}
          transition={reduce ? { duration: 0 } : { type: "spring", stiffness: 80, damping: 18 }}
        />
      </g>
    </svg>
  );
}
```

### Vanilla CSS transition（stroke-dashoffset, Tier 2 縮退）

```html
<svg viewBox="0 0 120 120" class="ring" style="--value: 0.65">
  <circle class="ring-track" cx="60" cy="60" r="55" />
  <circle class="ring-fill"  cx="60" cy="60" r="55" />
</svg>
```

```css
/* 数値カウンタの同期や spring は出せないが、円の充填だけなら JS なしで成立 */
.ring { transform: rotate(-90deg); }
.ring circle { fill: none; stroke-width: 10; }
.ring-track { stroke: rgba(255,255,255,0.1); }
.ring-fill {
  stroke: #a3e635;
  stroke-linecap: round;
  /* C = 2πr ≈ 345.6 (r=55) */
  stroke-dasharray: 345.6;
  stroke-dashoffset: calc(345.6 * (1 - var(--value)));
  transition: stroke-dashoffset 600ms ease-out;
}
@media (prefers-reduced-motion: reduce) {
  .ring-fill { transition: none; }
}
```

## Usage

```tsx
const [value, setValue] = useState(0);
// アップロード進行などの状態変化で setValue(percent) を呼ぶ
<ProgressRing value={value} />
```

## AI Apply Prompt

### Context
`{{target_selector}}` に円形プログレスリングを置き、状態変化（進捗）に応じて 0→100% で外周を埋め、中央に数値を表示する。

### Steps
1. `motion@^12.40` を `{{package_manager}}` で追加（未導入なら）。
2. 上記 `ProgressRing` コンポーネントを `{{target_file}}` に追加。`"use client"` を先頭に確認。
3. 半径 `r` から外周 `C = 2πr` を計算し、`strokeDasharray=C`、`strokeDashoffset=C*(1 - value/100)` で充填量を表す。
4. `transform="rotate(-90 cx cy)"` で 12 時方向起点にし、`strokeLinecap="round"` で先端を丸める。
5. `role="progressbar"` と `aria-valuenow/min/max` を SVG に付与。
6. `useReducedMotion()` が true なら `transition` を `{ duration: 0 }` にして即時に最終値へ。

### Examples

Before: `<span>{percent}%</span>`（数値だけ）
After: `<ProgressRing value={percent} />`（円が埋まり、中央に数値が同期）

### Verify
- 進捗値の変化に追従して外周が 12 時方向から時計回りに埋まる
- 中央の数値が円の充填量と一致する
- 100% で完全な閉じたリングになる
- Reduce Motion ON で補間せず目標値へ即座に切り替わる
- スクリーンリーダーで `aria-valuenow` が読み上げられる

## Accessibility

- SVG に `role="progressbar"` と `aria-valuenow` / `aria-valuemin` / `aria-valuemax` を付け、視覚的な円だけに頼らず進捗を伝える。
- Reduce Motion 設定では補間（spring / transition）を切り、目標値の最終形を即時表示する。数値テキストも確定値で出す。
- 色（lime）だけで状態を表さず、数値テキストを併設する。

## Performance Notes

- `stroke-dashoffset` の補間は Paint で完結する（Composite ではない）。単一リングなら 60fps に余裕がある。
- 多数のリングを同時に動かす場合は同時更新数を抑え、`will-change` の濫用を避ける。
- motion の `useTransform` で offset と表示数値を同じ進捗値から導出すると、円と数字のズレが構造的に発生しない。

## Changelog

- 2026-06-02 (created): 初版。v1.2（Tier B）SVG 円形プログレス。motion で strokeDashoffset を補間し数値と同期。
