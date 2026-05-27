---
id: bounce-in
name: Bounce In
version: 1.0.0
release: alpha
variant: react-motion
description: |
  通知バッジや小さい要素がポンっとバウンドしながら登場する attention アニメ。
  カウンタの増分、お知らせ、新着シグナルに。

taxonomy:
  layer: [css, js-runtime, library]
  ux_role:
    primary: attention
    secondary: [state-transition]
  trigger: [state-change]
  media: [dom-css]
  authoring: code

behavior:
  lifecycle: oneshot
  reversible: false
  replay: every-entry

tags:
  - bounce
  - spring
  - badge
  - notification
  - pop
  - attention

trigger:
  primary: state-change
  touch_fallback: always-on
  config: {}

runtime:
  language: typescript
  framework: react
  framework_version: ">=18"
dependencies:
  - { name: motion, version: "^11.0.0", purpose: "spring 駆動" }
peer_dependencies:
  - { name: react, version: ">=18" }

implementations:
  - tier: 1
    name: "React + Motion (spring)"
    dependencies: [ { name: motion, version: "^11.0.0" } ]
    browser_support: { baseline: widely-available, baseline_year: 2020 }
    performance: { gpu_accelerated: true, layout_thrash: false, cost: low }
    degrades_to: 2
  - tier: 2
    name: "Vanilla CSS (cubic-bezier)"
    dependencies: []
    browser_support: { baseline: widely-available, baseline_year: 2017 }
    performance: { gpu_accelerated: true, layout_thrash: false, cost: low }
    degradation: "厳密な spring ではなく overshoot cubic-bezier で近似"

browser_support:
  baseline: widely-available
  baseline_year: 2020
  notes: "代表値は Tier 1"

performance:
  gpu_accelerated: true
  layout_thrash: false
  cost: low
  notes: "scale + opacity のみ。Layout を引き起こさない"

parameters:
  - { name: from_scale, type: number, default: 0.3, range: [0.1, 0.9], description: "開始スケール" }
  - { name: stiffness,  type: number, default: 300, range: [100, 600], description: "spring 硬さ" }
  - { name: damping,    type: number, default: 12,  range: [6, 30], description: "spring 減衰" }

a11y:
  respects_reduced_motion: true
  fallback: "scale を 1 に固定、opacity のみ補間"
  focus_safe: true
  notes: "視覚アクセントとして使い、テキスト情報も伴わせる"

license: MIT
authors: ["@daichi"]
sources: []
attribution_required: false

preview:
  url: https://animation-factory.app/preview/bounce-in
  loop: true
  duration_ms: 1600

related:
  alternatives: [scale-in, pulse-attention]
  composes_with:
    - { id: pulse-attention, note: "登場後に pulse で継続的に注意を引くと自然" }
  requires: []

sections:
  skip: [variants]

ai:
  intent_examples:
    - "通知バッジが小さくポンっと登場"
    - "新着アイテムを bounce で強調"
    - "カウンタが増えた瞬間に弾む"
  apply_targets: ["notification-badge", "new-indicator", "counter", "icon-badge"]
  do_not_apply_to: ["large-section", "image", "navigation"]
---

## Overview

`scale 0.3 → 1.0` を spring で駆動し、軽いオーバーシュートと揺り戻しで「ポンっ」と弾む登場を作る。小さく注意を引きたい要素（バッジ・通知ドット）に向く。

使う場面: 通知バッジ、新着アイテム、カウンタの増分、サクセスアイコン。
避けたい場面: 大きいセクション、本文、画像。

## Preview

公開プレビュー: https://animation-factory.app/preview/bounce-in

## Implementation

### React + Motion

```tsx
import { motion } from "motion/react";

export function BounceIn({ children }: { children: React.ReactNode }) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.3 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ type: "spring", stiffness: 300, damping: 12 }}
      style={{ transformOrigin: "center" }}
    >
      {children}
    </motion.div>
  );
}
```

### Vanilla CSS

```css
@keyframes bounce-in {
  0%   { opacity: 0; transform: scale(0.3); }
  60%  { opacity: 1; transform: scale(1.08); }
  80%  { transform: scale(0.96); }
  100% { transform: scale(1); }
}
.bounce-in {
  animation: bounce-in 420ms cubic-bezier(.34, 1.56, .64, 1) both;
}
@media (prefers-reduced-motion: reduce) {
  .bounce-in { animation: none; opacity: 1; transform: none; }
}
```

## Usage

```tsx
<BounceIn>
  <Badge>3</Badge>
</BounceIn>
```

## AI Apply Prompt

### Context
`{{target_selector}}` を spring で bounce-in 登場させる。

### Steps
1. `motion@^11` を `{{package_manager}}` で追加。
2. `BounceIn` を `{{target_file}}` に追加。
3. 値変化トリガーで再発火させるなら `key` を変える。

### Examples

Before: `<Badge>3</Badge>`
After: `<BounceIn><Badge>3</Badge></BounceIn>`

### Verify
- 初回マウントで弾む登場
- key 変更で再アニメ
- Reduce Motion でオーバーシュートなし

## Accessibility

視覚アニメに頼らず、aria-live や aria-label でも内容を伝える。Reduce Motion でオーバーシュート無効。

## Performance Notes

`scale` のみ補間。spring は Motion がフレーム毎の値を計算（rAF）。

## Changelog

- 2026-05-27 (created): 初版。Phase 3 D1 第 4 弾、attention 拡充。
