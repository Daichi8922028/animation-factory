---
id: slide-in-right
name: Slide In Right
version: 1.0.0
release: v1.0
variant: react-motion
description: |
  右から（または左から）水平にスライドして登場する entrance アニメーション。
  サイドパネル、列挙系セクション、横方向の特集ブロックに。

taxonomy:
  layer: [css, js-runtime, library]
  ux_role:
    primary: state-transition
    secondary: [feedback]
  trigger: [viewport]
  media: [dom-css]
  authoring: code

behavior:
  lifecycle: oneshot
  reversible: false
  replay: once

tags:
  - slide
  - entrance
  - translate-x
  - horizontal
  - section

trigger:
  primary: viewport
  touch_fallback: always-on
  config:
    amount: 0.2

runtime:
  language: typescript
  framework: react
  framework_version: ">=18"
dependencies:
  - { name: motion, version: "^11.0.0", purpose: "アニメ駆動" }
peer_dependencies:
  - { name: react, version: ">=18" }

implementations:
  - tier: 1
    name: "React + Motion"
    dependencies: [ { name: motion, version: "^11.0.0" } ]
    browser_support: { baseline: widely-available, baseline_year: 2020 }
    performance: { gpu_accelerated: true, layout_thrash: false, cost: low }
    degrades_to: 2
  - tier: 2
    name: "Vanilla CSS"
    dependencies: []
    browser_support: { baseline: widely-available, baseline_year: 2017 }
    performance: { gpu_accelerated: true, layout_thrash: false, cost: low }
    degradation: "viewport トリガーは利かない。マウント時に keyframe を流す"

browser_support:
  baseline: widely-available
  baseline_year: 2020
  notes: "代表値は Tier 1"

performance:
  gpu_accelerated: true
  layout_thrash: false
  cost: low
  notes: "translateX と opacity のみ。Layout を引き起こさない"

parameters:
  - { name: from_x_px,   type: number, default: 32, range: [8, 120],    description: "水平オフセット。正で右から、負で左から" }
  - { name: duration_ms, type: number, default: 500, range: [120, 1500], description: "登場の長さ" }
  - { name: easing,      type: enum,   default: "easeOut",
      values: ["linear","easeIn","easeOut","easeInOut"] }

a11y:
  respects_reduced_motion: true
  fallback: "translateX を 0 に固定、duration を 0.01s"
  focus_safe: true
  notes: "横スライドは文章の読み方向（LTR/RTL）に影響しうる。RTL レイアウトでは方向を反転する"

license: MIT
authors: ["@daichi"]
sources: []
attribution_required: false

preview:
  url: https://animation-factory.app/preview/slide-in-right
  loop: true
  duration_ms: 1200

related:
  alternatives: [fade-up, fade-in, scale-in]
  composes_with:
    - { id: entrance-stagger-fade, note: "複数要素を順に slide-in でずらすと存在感が出る" }
  requires: []

sections:
  skip: [variants]

ai:
  intent_examples:
    - "横からスライドして登場するセクションが欲しい"
    - "右から滑り込む登場アニメ"
  apply_targets: ["section", "side-panel", "card", "feature-block"]
  do_not_apply_to: ["text-input", "modal-backdrop", "above-the-fold-hero"]
---

## Overview

`translateX(32px)` から 0 へ、`opacity 0` から `1` へ補間する水平スライドの登場演出。fade-up が「上に向けた登場」なら、slide-in-right は「奥行きと方向性」を出す entrance。

使う場面: サイドパネル、列挙されたカード、横方向の特集ブロック。
避けたい場面: モーダル背景（左右の動きが本体を引きずる）、入力 UI、本文。

## Preview

公開プレビュー: https://animation-factory.app/preview/slide-in-right

## Implementation

### React + Motion

```tsx
import { motion } from "motion/react";

export function SlideInRight({
  children,
  fromXPx = 32,
  durationMs = 500,
}: {
  children: React.ReactNode;
  fromXPx?: number;
  durationMs?: number;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, x: fromXPx }}
      whileInView={{ opacity: 1, x: 0 }}
      viewport={{ once: true, amount: 0.2 }}
      transition={{ duration: durationMs / 1000, ease: "easeOut" }}
    >
      {children}
    </motion.div>
  );
}
```

### Vanilla CSS

```css
@keyframes slide-in-right {
  from { opacity: 0; transform: translateX(32px); }
  to   { opacity: 1; transform: translateX(0); }
}
.slide-in-right {
  animation: slide-in-right 500ms ease-out both;
}
@media (prefers-reduced-motion: reduce) {
  .slide-in-right { animation-duration: 0.01ms; transform: none; }
}
```

## Usage

```tsx
<SlideInRight><FeatureCard /></SlideInRight>
```

## AI Apply Prompt

### Context
`{{target_selector}}` を右からスライドさせて登場させる。

### Steps
1. `motion@^11` を `{{package_manager}}` で追加。
2. `SlideInRight` を `{{target_file}}` に追加し、対象要素を包む。
3. RTL ロケールでは `fromXPx` を負に。

### Examples

Before: `<section>…</section>`
After: `<SlideInRight><section>…</section></SlideInRight>`

### Verify
- 初回ビューポート進入で右からスライド
- Reduce Motion で動かず即時表示
- スクロールバックで再生しない（once: true）

## Accessibility

`useReducedMotion()` を尊重。RTL レイアウトでは方向を反転する設計を AI 側でも明示する。

## Performance Notes

`opacity` + `transform: translateX` のみ補間。GPU 内で完結。

## Changelog

- 2026-05-26 (created): 初版。Phase 3 D1 第 3 弾、entrance-exit 拡充。
