---
id: svg-gooey-merge
name: SVG Gooey Merge
version: 1.0.0
release: v1.2
variant: vanilla-css
description: |
  SVG フィルタ（feGaussianBlur + feColorMatrix）の "gooey" 効果で、移動する複数の円が
  近づくと粘性をもって融合し、離れると分裂するループ装飾。ローダー、背景演出、ブランド装飾に。

taxonomy:
  layer: [css]
  ux_role:
    primary: decorative
    secondary: [ambient]
  trigger: [autoplay]
  media: [svg]
  authoring: code

behavior:
  lifecycle: continuous
  reversible: false
  replay: every-entry

tags:
  - svg
  - gooey
  - metaball
  - filter
  - fegaussianblur
  - fecolormatrix
  - blob

trigger:
  primary: autoplay
  touch_fallback: always-on
  config:
    duration_ms: 4000

runtime:
  language: css
  framework: none
  framework_version: null
  bundler: null
dependencies: []
peer_dependencies: []

implementations:
  - tier: 1
    name: "Vanilla CSS + SVG filter (gooey)"
    dependencies: []
    browser_support: { baseline: widely-available, baseline_year: 2018 }
    performance: { gpu_accelerated: false, layout_thrash: false, cost: medium }
    degrades_to: 2
  - tier: 2
    name: "フィルタ無し（円の往復のみ）"
    dependencies: []
    browser_support: { baseline: widely-available, baseline_year: 2015 }
    performance: { gpu_accelerated: true, layout_thrash: false, cost: low }
    degradation: "feGaussianBlur/feColorMatrix を外し、円が重なるだけ。融合の粘性表現は失われるが負荷は下がる"

browser_support:
  baseline: widely-available
  baseline_year: 2018
  notes: "代表値は Tier 1。SVG filter は広くサポート。feColorMatrix の alpha しきい値で gooey を作る"

performance:
  gpu_accelerated: false
  layout_thrash: false
  cost: medium
  notes: "SVG filter（blur + colormatrix）はラスタライズ負荷がある。要素数・領域を絞り、transform のみ補間する"

parameters:
  - { name: blur_std, type: number, default: 8, range: [4, 20], description: "feGaussianBlur の stdDeviation。大きいほど融合が強い" }
  - { name: duration_ms, type: number, default: 4000, range: [2000, 8000], description: "1 ループの長さ" }
  - { name: blob_count, type: number, default: 3, range: [2, 5], description: "移動する円の数" }

a11y:
  respects_reduced_motion: true
  fallback: "アニメーションを停止し、円を静止配置で表示。装飾のため情報欠落はなし"
  focus_safe: true
  notes: "純装飾。aria-hidden=\"true\" を付与し、スクリーンリーダーから隠す。意味は持たせない"

license: MIT
authors: ["@daichi"]
sources:
  - { title: "The Gooey Effect (CSS-Tricks)", url: "https://css-tricks.com/gooey-effect/" }
attribution_required: false

preview:
  url: https://animation-factory.app/preview/svg-gooey-merge
  loop: true
  duration_ms: 4000

related:
  alternatives: [svg-line-draw, blur-in, pulse-attention]
  composes_with:
    - { id: fade-in, note: "ローダーやヒーロー背景に置き、コンテンツを fade-in で重ねると自然" }
  requires: []

sections:
  skip: [variants]

ai:
  intent_examples:
    - "近づくと融合する粘性のある円のローダー"
    - "SVG フィルタで gooey なメタボール背景を作りたい"
    - "blob が溶け合う装飾アニメーション"
  apply_targets: ["loader", "hero-background", "decorative-blob"]
  do_not_apply_to: ["body-text", "form", "data-table", "navigation-bar"]
---

## Overview

SVG の `<filter>` に `feGaussianBlur` でぼかしをかけ、`feColorMatrix` の alpha チャンネルを急峻なしきい値に変換することで、重なった図形の境界を粘性をもって滑らかに接続する **gooey（メタボール）** 効果を作る。各円を `transform: translate` でゆっくり往復させ、近づくと融合・離れると分裂するループ装飾になる。

使う場面: ローダー、ヒーロー背景、ブランド装飾、空き状態（empty state）の彩り。
避けたい場面: 本文、フォーム、データテーブル、ナビバー（純装飾であり意味を持たないため）。

## Preview

公開プレビュー: https://animation-factory.app/preview/svg-gooey-merge

## Implementation

### Vanilla CSS + SVG filter（Tier 1）

```tsx
"use client";

export function GooeyMerge() {
  return (
    <svg width="240" height="120" viewBox="0 0 240 120" aria-hidden="true">
      <defs>
        <filter id="gooey">
          <feGaussianBlur in="SourceGraphic" stdDeviation="8" result="blur" />
          <feColorMatrix
            in="blur"
            mode="matrix"
            values="1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 20 -10"
            result="goo"
          />
          <feBlend in="SourceGraphic" in2="goo" />
        </filter>
      </defs>
      <g filter="url(#gooey)" fill="#a3e635">
        <circle className="blob blob-a" cx="90" cy="60" r="22" />
        <circle className="blob blob-b" cx="150" cy="60" r="22" />
        <circle className="blob blob-c" cx="120" cy="60" r="16" />
      </g>
    </svg>
  );
}
```

```css
@keyframes blob-a { 0%, 100% { transform: translateX(-26px); } 50% { transform: translateX(8px); } }
@keyframes blob-b { 0%, 100% { transform: translateX(26px); } 50% { transform: translateX(-8px); } }
@keyframes blob-c { 0%, 100% { transform: translateY(-14px); } 50% { transform: translateY(14px); } }

.blob { transform-box: fill-box; transform-origin: center; }
.blob-a { animation: blob-a 4s ease-in-out infinite; }
.blob-b { animation: blob-b 4s ease-in-out infinite; }
.blob-c { animation: blob-c 3.2s ease-in-out infinite; }

@media (prefers-reduced-motion: reduce) {
  .blob { animation: none; }
}
```

`feColorMatrix` の最終行 `0 0 0 20 -10` が肝。alpha を 20 倍に増幅して -10 でオフセットし、ぼかしの裾を切り落として「融合した塊」に整形する。

### フィルタ無し（Tier 2 / 縮退）

```css
/* feGaussianBlur / feColorMatrix を外し、g から filter を取り除く。
   円が単純に重なるだけ。融合の粘性表現は失われるが、ラスタライズ負荷がなくなる。 */
.gooey-group { filter: none; }
.blob { transform-box: fill-box; transform-origin: center; }
/* @keyframes / .blob-* は Tier 1 と同じものを流用 */
```

## Usage

```tsx
<GooeyMerge />
```

純装飾。`aria-hidden="true"` を SVG ルートに付け、レイアウト上は固定サイズの飾り枠に収める。

## AI Apply Prompt

### Context
`{{target_selector}}` に gooey で融合する円のループ装飾（ローダー / 背景）を追加する。

### Steps
1. 上記の inline `<svg>`（`<filter id="gooey">` 付き）を `{{target_file}}` に追加。`feColorMatrix` の `values` 最終行は `0 0 0 20 -10` を維持。
2. 上記 `@keyframes` と `.blob-*` を CSS に追記。`transform-box: fill-box` を忘れると `transform-origin: center` が効かない。
3. SVG ルートに `aria-hidden="true"` を付与（純装飾）。
4. Reduce Motion 分岐（`.blob { animation: none }`）を維持。
5. 重い場合は対象領域を縮小、または Tier 2（filter なし）に縮退。

### Examples

Before: 静的な円や単色のローダー
After: gooey で近づくと融合・離れると分裂する円のループ

### Verify
- 円が往復し、近づくと境界が滑らかに融合、離れると分裂する
- Reduce Motion ON で動きが止まり、静止配置で表示される
- スクリーンリーダーが装飾 SVG を読み上げない（`aria-hidden`）
- スクロールやレイアウトに影響しない固定サイズで収まっている

## Accessibility

純装飾のため `aria-hidden="true"` を付与し、意味は一切持たせない。Reduce Motion 時は `animation: none` でアニメーションを完全停止し、静止した図形として表示する（情報欠落なし）。色だけに依存する情報は載せない。

## Performance Notes

- SVG filter（`feGaussianBlur` + `feColorMatrix`）はフレームごとのラスタライズ負荷があり、`cost: medium`。フィルタ対象の `<g>` と viewBox 領域は小さく保つ。
- 補間は `transform: translate` のみで、レイアウトを発生させない（`layout_thrash: false`）。
- 多数の blob や巨大領域に適用すると重くなる。負荷が問題なら Tier 2（filter なし）に縮退する。

## Changelog

- 2026-06-02 (created): 初版。v1.2（Tier B）SVG filter gooey 拡充。
