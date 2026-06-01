---
id: marquee
name: Marquee
version: 1.0.0
release: v1.0
variant: vanilla-css
description: |
  ロゴストリップやお知らせバーで定番の、無限に流れる横スクロール。
  純 CSS の transform: translateX 無限ループ + 重複コンテンツで「途切れない」演出。

taxonomy:
  layer: [css]
  ux_role:
    primary: attention
    secondary: [decorative]
  trigger: [autoplay]
  media: [dom-css]
  authoring: code

behavior:
  lifecycle: continuous
  reversible: false
  replay: every-entry

tags:
  - marquee
  - ticker
  - infinite
  - logo-strip
  - announcement
  - scroll

trigger:
  primary: autoplay
  touch_fallback: always-on
  config:
    direction: "left"

runtime:
  language: css
  framework: none
  framework_version: null
  bundler: null
dependencies: []
peer_dependencies: []

implementations:
  - tier: 1
    name: "Vanilla CSS"
    dependencies: []
    browser_support: { baseline: widely-available, baseline_year: 2015 }
    performance: { gpu_accelerated: true, layout_thrash: false, cost: low }

browser_support:
  baseline: widely-available
  baseline_year: 2015
  notes: "代表値は Tier 1。`<marquee>` HTML 要素は非推奨、CSS で実装"

performance:
  gpu_accelerated: true
  layout_thrash: false
  cost: low
  notes: "transform: translateX のみ。GPU 内で完結。コンテンツを 2 倍複製して途切れなくする"

parameters:
  - { name: speed_pxs, type: number, default: 50, range: [10, 200], description: "1 秒あたりの移動 px" }
  - { name: direction, type: enum, default: "left", values: ["left","right"], description: "流れる向き" }
  - { name: pause_on_hover, type: boolean, default: true, description: "ホバーで一時停止" }

a11y:
  respects_reduced_motion: true
  fallback: "ループを停止して静的表示"
  focus_safe: true
  notes: "動く文字列の読みづらさに配慮。重要な情報は marquee 内に置かない（補助のみ）。`aria-label` でグループの意味を伝える"

license: MIT
authors: ["@daichi"]
sources: []
attribution_required: false

preview:
  url: https://animation-factory.app/preview/marquee
  loop: true
  duration_ms: 4000

related:
  alternatives: []
  composes_with: []
  requires: []

sections:
  skip: [variants]

ai:
  intent_examples:
    - "ロゴストリップを無限スクロールしたい"
    - "お知らせバーをループで流す"
    - "ティッカー（流れる文字）"
  apply_targets: ["logo-strip", "announcement-bar", "ticker", "scrolling-testimonials"]
  do_not_apply_to: ["form-input", "read-critical-info", "navigation"]
---

## Overview

横一列のコンテンツを `transform: translateX(-50%)` まで無限に流す。コンテンツを **2 倍に複製**することで、ループの繋ぎ目が途切れない。`@keyframes` で `0% → -50%` をループ。ホバーで一時停止すると読める。

使う場面: ロゴストリップ、お知らせ／お得情報の流れるバー、テスティモニアル横スクロール。
避けたい場面: フォーム入力、重要情報の主表示（読みづらい）、ナビゲーション。

## Preview

公開プレビュー: https://animation-factory.app/preview/marquee

## Implementation

### Vanilla CSS

```html
<div class="marquee" aria-label="ロゴストリップ">
  <div class="marquee-track">
    <div class="marquee-content">
      <span>Stripe</span><span>Linear</span><span>Vercel</span>
      <span>Apple</span><span>Nike</span><span>Notion</span>
    </div>
    <!-- 同じ内容をもう一度 -->
    <div class="marquee-content" aria-hidden="true">
      <span>Stripe</span><span>Linear</span><span>Vercel</span>
      <span>Apple</span><span>Nike</span><span>Notion</span>
    </div>
  </div>
</div>
```

```css
.marquee { overflow: hidden; }
.marquee-track {
  display: flex;
  width: max-content;
  animation: marquee-flow 20s linear infinite;
}
.marquee-content { display: flex; gap: 3rem; padding: 0 1.5rem; }

@keyframes marquee-flow {
  to { transform: translateX(-50%); }
}

.marquee:hover .marquee-track { animation-play-state: paused; }

@media (prefers-reduced-motion: reduce) {
  .marquee-track { animation: none; }
}
```

## Usage

```html
<div class="marquee" aria-label="導入企業">…</div>
```

## AI Apply Prompt

### Context
`{{target_selector}}` を無限スクロールのマーキーにする。

### Steps
1. コンテンツを HTML で **2 倍に複製**（2 つ目は `aria-hidden="true"`）。
2. 上記 CSS を追記。
3. ホバー一時停止と Reduce Motion 対応を確認。

### Examples

Before: 静的なロゴ並び
After: `.marquee > .marquee-track > .marquee-content × 2`

### Verify
- 横方向にループ、繋ぎ目が途切れない
- ホバーで一時停止
- Reduce Motion で完全停止
- SR は 2 つ目（aria-hidden）を読まない

## Accessibility

動く文字列は読みづらい。重要情報は静的に置く。aria-label でグループ意味を、複製側に aria-hidden を付ける。

## Performance Notes

`transform: translateX` のみ。`will-change: transform` を track に付与すると安定する（要素数が多い時）。

## Changelog

- 2026-05-27 (created): 初版。Phase 3 D1 第 5 弾、attention 拡充。
