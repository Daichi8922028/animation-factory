---
id: scale-in
name: Scale In
version: 1.0.0
release: v1.0
variant: react-motion
description: |
  要素が中央からわずかに拡大しつつ opacity 0 → 1 で登場する。
  モーダル、トースト、ダイアログ、アイコンの「ポンッ」と現れる登場に。

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
  - scale
  - entrance
  - pop
  - modal
  - icon
  - dialog

trigger:
  primary: viewport
  touch_fallback: always-on
  config:
    amount: 0.3

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
    degradation: "viewport トリガー無し。マウント時に直接 keyframe を流す"

browser_support:
  baseline: widely-available
  baseline_year: 2020
  notes: "代表値は Tier 1"

performance:
  gpu_accelerated: true
  layout_thrash: false
  cost: low
  notes: "opacity と scale。transform-origin を center にする"

parameters:
  - { name: from_scale,  type: number, default: 0.92, range: [0.5, 1.0],   description: "開始時のスケール" }
  - { name: duration_ms, type: number, default: 320,  range: [120, 800],   description: "登場の長さ" }
  - { name: easing,      type: enum,   default: "easeOut",
      values: ["linear","easeIn","easeOut","easeInOut","backOut"] }

a11y:
  respects_reduced_motion: true
  fallback: "scale を 1 に固定、duration を 0.01s に短縮"
  focus_safe: true
  notes: "モーダル用途では focus トラップ・ESC 閉じを別途実装する（このアニメ自体は視覚のみ）"

license: MIT
authors: ["@daichi"]
sources: []
attribution_required: false

preview:
  url: https://animation-factory.app/preview/scale-in
  loop: true
  duration_ms: 1000

related:
  alternatives: [fade-in, fade-up, blur-in]
  composes_with:
    - { id: pulse-attention, note: "登場直後にアテンションを引きたい時に組み合わせる" }
  requires: []

sections:
  skip: [variants]

ai:
  intent_examples:
    - "モーダルが開く時にポンと出したい"
    - "アイコンを拡大しつつ表示"
    - "トーストを軽く登場させたい"
  apply_targets: ["modal", "dialog", "toast", "icon", "badge"]
  do_not_apply_to: ["large-image", "full-screen-section"]
---

## Overview

中央から拡大しつつ fade で登場する。`from_scale: 0.92` 程度の控えめな拡大で、要素が「現れた」感を強調する。モーダルやダイアログのような **明示的に開く UI** で多用される。

使う場面: モーダル / ダイアログ / トースト / 通知バッジ / アイコンボタン。
避けたい場面: 大きな画像（拡大の動きで重く見える）、フルスクリーンセクション（中央拡大が違和感）。

## Preview

公開プレビュー: https://animation-factory.app/preview/scale-in

## Implementation

### React + Motion

```tsx
import { motion } from "motion/react";

export function ScaleIn({
  children,
  fromScale = 0.92,
  durationMs = 320,
}: {
  children: React.ReactNode;
  fromScale?: number;
  durationMs?: number;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: fromScale }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: durationMs / 1000, ease: "easeOut" }}
      style={{ transformOrigin: "center" }}
    >
      {children}
    </motion.div>
  );
}
```

### Vanilla CSS

```css
@keyframes scale-in {
  from { opacity: 0; transform: scale(0.92); }
  to   { opacity: 1; transform: scale(1); }
}
.scale-in {
  animation: scale-in 320ms ease-out both;
  transform-origin: center;
}
@media (prefers-reduced-motion: reduce) {
  .scale-in {
    animation-duration: 0.01ms;
    transform: none;
  }
}
```

## Usage

```tsx
<ScaleIn>
  <Dialog>…</Dialog>
</ScaleIn>
```

## AI Apply Prompt

### Context
`{{target_selector}}` を中央から拡大しつつ登場させる。モーダル／トースト用途を想定。

### Steps
1. `motion@^11` を `{{package_manager}}` で追加。
2. 上記 `ScaleIn` を `{{target_file}}` に追加し、対象要素を包む。
3. モーダル本体に乗せる場合は、AnimatePresence と併用してアンマウント時も逆再生する。

### Examples

Before: `<Dialog>…</Dialog>`
After: `<ScaleIn><Dialog>…</Dialog></ScaleIn>`

### Verify
- 開いた瞬間にわずかに拡大しつつ fade in
- Reduce Motion ON で拡大なし、即時表示
- 連続して開閉してもチラつかない（transform-origin 中央）

## Accessibility

`useReducedMotion()` を尊重。モーダル用途では focus トラップ・ESC で閉じる・背景の inert 化など、視覚以外のアクセシビリティ責務は別実装が必要（このアニメは「現れ方」のみ担当）。

## Performance Notes

`opacity` と `scale` の補間のみ。`transform-origin: center` を明示しておくと、親レイアウトに依存せず安定する。

## Changelog

- 2026-05-26 (created): 初版。Phase 3 D1 第 1 弾、entrance-exit 拡充。
