---
id: fade-up
name: Fade Up
version: 1.0.0
release: alpha
variant: react-motion
description: |
  下方向（y: 16px 前後）から fade で登場する、最も汎用的な entrance アニメーション。
  ヒーロー、セクション見出し、カードのプライマリ登場に。

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
  - fade
  - entrance
  - translate-y
  - hero
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
    degradation: "viewport トリガーは利かない。常時表示の状態へ縮退"

browser_support:
  baseline: widely-available
  baseline_year: 2020
  notes: "代表値は Tier 1"

performance:
  gpu_accelerated: true
  layout_thrash: false
  cost: low
  notes: "opacity と translateY のみ。Layout/Paint を引き起こさない"

parameters:
  - { name: distance_px, type: number, default: 16, range: [4, 64],   description: "下方向のオフセット" }
  - { name: duration_ms, type: number, default: 500, range: [100, 1500], description: "登場の長さ" }
  - { name: delay_ms,    type: number, default: 0,   range: [0, 2000],   description: "開始までの遅延" }

a11y:
  respects_reduced_motion: true
  fallback: "translateY を 0 に固定、duration を 0.01s に短縮"
  focus_safe: true
  notes: "Motion は useReducedMotion() を尊重。pointer ではないため focus ミラーは不要"

license: MIT
authors: ["@daichi"]
sources: []
attribution_required: false

preview:
  url: https://animation-factory.app/preview/fade-up
  loop: true
  duration_ms: 1200

related:
  alternatives: [fade-in, entrance-stagger-fade, scale-in, blur-in]
  composes_with:
    - { id: hover-lift, note: "登場後、子要素に hover-lift を重ねるのが定番" }
  requires: []

sections:
  skip: [variants]

ai:
  intent_examples:
    - "下からふわっと現れる登場アニメを入れたい"
    - "ヒーローを軽く動きで強調したい"
    - "セクション見出しを fade up で登場させたい"
  apply_targets: ["hero", "section-heading", "card", "image"]
  do_not_apply_to: ["text-input", "modal-backdrop", "list-item-dense"]
---

## Overview

最も汎用的な登場演出。下方向に少しだけずらした位置から opacity 0 → 1、translateY 16 → 0 で滑らかに現れる。fade-in 単体より「方向性」が出るため、ヒーローやセクションの主役に向く。

使う場面: ヒーロー、セクション見出し、主役級のカード。
避けたい場面: 大量に並ぶリスト（弱く見える → [[entrance-stagger-fade]] で順番をつける）、本文ブロック（控えめにしたい → [[fade-in]]）。

## Preview

公開プレビュー: https://animation-factory.app/preview/fade-up

## Implementation

### React + Motion

```tsx
import { motion } from "motion/react";

export function FadeUp({
  children,
  distancePx = 16,
  durationMs = 500,
  delayMs = 0,
}: {
  children: React.ReactNode;
  distancePx?: number;
  durationMs?: number;
  delayMs?: number;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: distancePx }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.2 }}
      transition={{ duration: durationMs / 1000, delay: delayMs / 1000, ease: "easeOut" }}
    >
      {children}
    </motion.div>
  );
}
```

### Vanilla CSS

```css
@keyframes fade-up {
  from { opacity: 0; transform: translateY(16px); }
  to   { opacity: 1; transform: translateY(0); }
}
.fade-up {
  animation: fade-up 500ms ease-out both;
}
@media (prefers-reduced-motion: reduce) {
  .fade-up {
    animation-duration: 0.01ms;
    transform: none;
  }
}
```

## Usage

```tsx
<FadeUp>
  <h1>ヒーロー</h1>
</FadeUp>
```

## AI Apply Prompt

### Context
`{{target_selector}}` を下からふわっと登場させる。

### Steps
1. `motion@^11` を `{{package_manager}}` で追加。
2. 上記 `FadeUp` を `{{target_file}}` に追加し、対象要素を包む。
3. 強調したいなら `distancePx={24}` 〜 `32` を渡す。

### Examples

Before: `<h1>ヒーロー</h1>`
After: `<FadeUp><h1>ヒーロー</h1></FadeUp>`

### Verify
- 初回ビューポート進入で 1 回だけ実行（once: true）
- Reduce Motion ON で translateY なし、即時表示
- 主役要素に乗っているか（リスト全要素に付与しない）

## Accessibility

Motion は `useReducedMotion()` を尊重。CSS 版は `prefers-reduced-motion` で `transform` を `none` にし、移動なし即時表示へ縮退する。

## Performance Notes

`opacity` + `transform: translateY` のみ補間。GPU 内で完結し、Layout/Paint を引き起こさない。

## Changelog

- 2026-05-26 (created): 初版。Phase 3 D1 第 1 弾、entrance-exit 拡充。
