---
id: breadcrumb-cascade
name: Breadcrumb Cascade
version: 1.0.0
release: beta
variant: vanilla-css
description: |
  パンくずリストの各階層が、左から少しずつ遅延して順次 fade-in する cascade 演出。
  ページ表示やビューポート進入時に、階層の深さを時間差で印象づける CSS only の navigation。

taxonomy:
  layer: [css]
  ux_role:
    primary: navigation
    secondary: [state-transition]
  trigger: [viewport]
  media: [dom-css]
  authoring: code

behavior:
  lifecycle: oneshot
  reversible: false
  replay: once

tags:
  - breadcrumb
  - navigation
  - cascade
  - stagger
  - fade
  - path
  - hierarchy

trigger:
  primary: viewport
  touch_fallback: always-on
  config: {}

runtime:
  language: css
  framework: none
  framework_version: null
  bundler: null
dependencies: []
peer_dependencies: []

implementations:
  - tier: 1
    name: "Vanilla CSS (@keyframes + animation-delay)"
    dependencies: []
    browser_support: { baseline: widely-available, baseline_year: 2016 }
    performance: { gpu_accelerated: true, layout_thrash: false, cost: low }
    degrades_to: 2
  - tier: 2
    name: "CSS Scroll-Driven (animation-timeline: view())"
    dependencies: []
    browser_support: { baseline: newly-available, baseline_year: 2024 }
    degradation: "ビューポート進入を view() timeline で駆動し、JS の IntersectionObserver も不要にする"
    performance: { gpu_accelerated: true, layout_thrash: false, cost: low }

browser_support:
  baseline: widely-available
  baseline_year: 2016
  notes: "代表値は Tier 1。各 crumb に animation-delay を段階付与。再生トリガーは mount / IntersectionObserver"

performance:
  gpu_accelerated: true
  layout_thrash: false
  cost: low
  notes: "opacity + translateY のみ。要素数はパンくずの階層数ぶんで少ない"

parameters:
  - { name: stagger_ms,   type: number, default: 90,  range: [40, 160],  description: "各階層の遅延差(ms)" }
  - { name: rise_px,      type: number, default: 4,   range: [0, 12],    description: "立ち上がりの縦移動(px)" }
  - { name: duration_ms,  type: number, default: 360, range: [200, 600], description: "1 階層の fade-in 長さ" }

a11y:
  respects_reduced_motion: true
  fallback: "cascade を無効化し全階層を即時表示。順序と現在地は markup（aria-current）で担保"
  focus_safe: true
  notes: "nav[aria-label=\"breadcrumb\"] + ol、最後の項目に aria-current=\"page\"。アニメは装飾で、構造は markup が担保"

license: MIT
authors: ["@daichi"]
sources:
  - { title: "WAI-ARIA APG: Breadcrumb", url: "https://www.w3.org/WAI/ARIA/apg/patterns/breadcrumb/" }
  - { title: "MDN: Scroll-driven animations", url: "https://developer.mozilla.org/en-US/docs/Web/CSS/Guides/Scroll-driven_animations" }
attribution_required: false

preview:
  url: https://animation-factory.app/preview/breadcrumb-cascade
  loop: true
  duration_ms: 2400

related:
  alternatives: [text-reveal-lines, entrance-stagger-fade, tab-underline-slide]
  composes_with:
    - { id: entrance-stagger-fade, note: "entrance-stagger-fade と同じ stagger 思想をパンくずに適用した派生" }
  requires: []

sections:
  skip: [variants]

ai:
  intent_examples:
    - "パンくずが左から順番に出てくる"
    - "階層リンクが時間差で fade-in する"
    - "ページ表示時にパンくずがカスケードする"
  apply_targets: ["breadcrumb", "path-nav", "page-header"]
  do_not_apply_to: ["primary-nav", "tooltip", "toast"]
---

## Overview

パンくずの各階層（Home > カテゴリ > 現在ページ）が、左から `animation-delay` を段階的にずらして順次 fade-in + 軽く上に立ち上がる。階層の深さを時間差で印象づける。再生は mount 時、または IntersectionObserver でビューポート進入時に発火する。

使う場面: ページヘッダのパンくず、ファイルパス表示、階層ナビ。
避けたい場面: 主要グローバルナビ（毎回 cascade はうるさい）、ツールチップ。

## Preview

公開プレビュー: https://animation-factory.app/preview/breadcrumb-cascade

## Implementation

### Vanilla CSS (@keyframes + animation-delay)

```css
@keyframes crumb-in {
  from { opacity: 0; transform: translateY(4px); }
  to   { opacity: 1; transform: translateY(0); }
}
.crumb {
  opacity: 0;
  animation: crumb-in 360ms ease-out forwards;
  animation-delay: calc(var(--i) * 90ms);
}
@media (prefers-reduced-motion: reduce) {
  .crumb { animation: none; opacity: 1; }
}
```

```html
<nav aria-label="breadcrumb"><ol>
  <li class="crumb" style="--i:0"><a href="/">Home</a></li>
  <li class="crumb" style="--i:1"><a href="/docs">Docs</a></li>
  <li class="crumb" style="--i:2" aria-current="page">Schema</li>
</ol></nav>
```

### CSS Scroll-Driven（縮退/発展）

`animation-timeline: view()` で、要素がビューポートに入ったとき自動再生（JS 不要）。

## Usage

各 `<li>` に `--i` を 0,1,2… と付与して順序遅延を与える。

## AI Apply Prompt

### Context
`{{breadcrumb}}` の各階層を順次 fade-in させる。

### Steps
1. 上記 CSS を追記、各 `<li>` に `--i` を採番。
2. `nav[aria-label="breadcrumb"]` + `ol`、最後に `aria-current="page"`。
3. ビューポート発火が要るなら IntersectionObserver か view() timeline。

### Verify
- 各階層が左から時間差で fade-in
- Reduce Motion で全階層即時表示
- 最後の項目が現在地として伝わる

## Accessibility

`nav[aria-label="breadcrumb"]` + `ol`、現在ページに `aria-current="page"`。アニメは装飾なので、Reduce Motion では即時表示し、構造は markup が担保する。

## Performance Notes

`opacity` + `translateY` のみ。要素数は階層数ぶんで少なく軽量。`animation-delay` で JS タイマー不要。

## Changelog

- 2026-06-01 (created): 初版。v1.1 Batch 3（Navigation 拡張）第 5 弾。パンくずの cascade fade-in。
