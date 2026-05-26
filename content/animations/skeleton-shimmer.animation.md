---
id: skeleton-shimmer
name: Skeleton Shimmer
version: 1.0.0
release: alpha
variant: vanilla-css
description: |
  読み込み中のコンテンツ位置にプレースホルダ矩形を置き、左から右へ走る
  シマー（光沢）で待機を伝える。純 CSS の linear-gradient + background-position アニメ。

taxonomy:
  layer: [css]
  ux_role:
    primary: feedback
    secondary: []
  trigger: [time]
  media: [dom-css]
  authoring: code

behavior:
  lifecycle: continuous
  reversible: false
  replay: every-entry

tags:
  - skeleton
  - shimmer
  - loading
  - placeholder

trigger:
  primary: time
  touch_fallback: always-on
  config: {}

runtime:
  language: css
  framework: none
dependencies: []
peer_dependencies: []

implementations:
  - tier: 1
    name: "Vanilla CSS"
    dependencies: []
    browser_support: { baseline: widely-available, baseline_year: 2017 }
    performance: { gpu_accelerated: false, layout_thrash: false, cost: low }
    degradation: "background-position の補間は Paint を起こすが影響は小さい"

browser_support:
  baseline: widely-available
  baseline_year: 2017
  notes: "linear-gradient + background-size の補間は全モダンブラウザで動く"

performance:
  gpu_accelerated: false
  layout_thrash: false
  cost: low
  notes: "background-position の再描画。多数並べる場合は枚数を制限する"

parameters:
  - { name: duration_ms, type: number, default: 1400, range: [800, 2400], description: "1 周期の長さ" }
  - { name: radius_px,   type: number, default: 8,    range: [0, 24],     description: "プレースホルダの角丸" }

a11y:
  respects_reduced_motion: true
  fallback: "シマーを止め、無地のグレー矩形のみ表示。`aria-busy='true'` で状態を伝える"
  focus_safe: true
  notes: "親に `aria-busy='true'` を付ける、または要素に `role='status' aria-label='読み込み中'`"

license: MIT
authors: ["@daichi"]
sources: []
attribution_required: false

preview:
  url: https://animation-factory.app/preview/skeleton-shimmer
  thumbnail: ./assets/skeleton-shimmer.webp
  loop: true
  duration_ms: 1400

related:
  alternatives: [spinner-dots]
  composes_with: []
  requires: []

sections:
  skip: [variants, examples_in_the_wild]

ai:
  intent_examples:
    - "スケルトン UI を入れたい"
    - "読み込み中のプレースホルダ"
  apply_targets: ["card-placeholder", "text-line-placeholder", "image-placeholder"]
  do_not_apply_to: ["実コンテンツ", "interactive-controls"]
---

## Overview

実コンテンツが届くまでの間、同じ大きさのグレー矩形を置いてレイアウトを保ち、シマー（光沢）で「読み込み中」を伝える。スピナーよりレイアウトのジャンプを防げる。

避けたい場面: 数百枚並ぶ巨大リスト（描画コストが効いてくる → 仮想スクロール併用）/ インタラクティブな実コントロールの上。

## Preview

公開プレビュー: https://animation-factory.app/preview/skeleton-shimmer

## Implementation

### Vanilla CSS

```css
@keyframes skeleton-shimmer {
  from { background-position: 200% 0; }
  to   { background-position: -200% 0; }
}
.skeleton {
  background:
    linear-gradient(
      90deg,
      rgba(255,255,255,0.04) 0%,
      rgba(255,255,255,0.10) 50%,
      rgba(255,255,255,0.04) 100%
    );
  background-size: 200% 100%;
  border-radius: 8px;
  animation: skeleton-shimmer 1.4s linear infinite;
}
@media (prefers-reduced-motion: reduce) {
  .skeleton {
    animation: none;
    background: rgba(255,255,255,0.06);
  }
}
```

## Usage

```html
<div aria-busy="true" aria-label="読み込み中">
  <div class="skeleton" style="height: 24px; width: 60%;"></div>
  <div class="skeleton" style="height: 14px; width: 90%; margin-top: 12px;"></div>
  <div class="skeleton" style="height: 14px; width: 80%; margin-top: 6px;"></div>
</div>
```

## AI Apply Prompt

### Context
`{{target_selector}}` の読み込み中表示としてスケルトンを置く。実コンテンツと同じ大きさの矩形を並べる。依存なし。

### Steps
1. 上記 CSS を追加。
2. 実コンテンツが届くまでの間、実コンテンツと同じ形状のスケルトン矩形を表示する。
3. 親に `aria-busy="true"` を付け、データ到着時に外す。

### Examples

Before:
```html
<article>{loading ? "..." : <RealContent />}</article>
```

After:
```html
<article aria-busy={loading || undefined}>
  {loading ? <SkeletonBlock /> : <RealContent />}
</article>
```

### Verify
- 矩形のサイズが実コンテンツと一致しレイアウトジャンプが無い
- シマーが左から右へ流れる
- Reduce Motion ON で無地表示に
- データ到着で `aria-busy` を外す

## Accessibility

`aria-busy="true"` で「この領域は更新中」を伝える。データ到着時に必ず外す。

## Performance Notes

`background-position` の補間は Paint を起こすため厳密には GPU 完結ではないが、影響は小さい。100 件超の同時表示なら仮想スクロールを併用する。

## Changelog

- 2026-05-23 (created): 初版。スキーマ v1.0、release alpha。
