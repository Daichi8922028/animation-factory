---
id: fade-in
name: Fade In
version: 1.0.0
release: v1.0
variant: react-motion
description: |
  単一要素を不透明度 0 → 1 で滑らかに表示する、最も基本的な登場アニメーション。
  Motion の whileInView で viewport トリガー、Tier 2 は純 CSS。

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
  - fade-in
  - entrance
  - simple
  - opacity

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
  notes: "opacity のみ。Layout/Paint を引き起こさない"

parameters:
  - { name: duration_ms, type: number, default: 400, range: [100, 1500], description: "フェードイン長さ" }
  - { name: delay_ms,    type: number, default: 0,   range: [0, 2000],   description: "開始までの遅延" }

a11y:
  respects_reduced_motion: true
  fallback: "duration を 0.01s に短縮し即時表示"
  focus_safe: true
  notes: "Motion は useReducedMotion() を尊重。pointer トリガーではないため focus ミラーは不要"

license: MIT
authors: ["@daichi"]
sources: []
attribution_required: false

preview:
  url: https://animation-factory.app/preview/fade-in
  thumbnail: ./assets/fade-in.webp
  loop: true
  duration_ms: 800

related:
  alternatives: [entrance-stagger-fade]
  composes_with:
    - { id: hover-lift, note: "登場後、子要素に hover-lift を重ねるのが定番" }
  requires: []

sections:
  skip: [variants, examples_in_the_wild]

ai:
  intent_examples:
    - "要素をふわっと表示したい"
    - "シンプルな fade in を入れたい"
  apply_targets: ["section", "image", "card", "any-block"]
  do_not_apply_to: ["text-input", "modal-backdrop"]
---

## Overview

最もシンプルな登場アニメーション。要素がビューポートに入ったタイミングで opacity 0 → 1 に滑らかに変化させる。装飾的な複雑さがない分、どんな要素にも乗せられる。

使う場面: セクション全体・図版・カードのさり気ない登場 / 強い演出を避けたい本文ブロック。
避けたい場面: 連続するリストアイテム（弱く見える → [[entrance-stagger-fade]]）/ ヒーロー（もっと強い演出が要る）。

## Preview

公開プレビュー: https://animation-factory.app/preview/fade-in

## Implementation

### React + Motion

```tsx
import { motion } from "motion/react";

export function FadeIn({
  children,
  durationMs = 400,
  delayMs = 0,
}: {
  children: React.ReactNode;
  durationMs?: number;
  delayMs?: number;
}) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      whileInView={{ opacity: 1 }}
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
@keyframes fade-in {
  from { opacity: 0; }
  to   { opacity: 1; }
}
.fade-in {
  animation: fade-in 400ms ease-out both;
}
@media (prefers-reduced-motion: reduce) {
  .fade-in { animation-duration: 0.01ms; }
}
```

## Usage

```tsx
<FadeIn>
  <Card title="…" />
</FadeIn>
```

## AI Apply Prompt

### Context
`{{target_selector}}` にシンプルな fade-in を付ける。

### Steps
1. `motion@^11` を `{{package_manager}}` で追加。
2. 上記 `FadeIn` を `{{target_file}}` に追加し、対象要素を包む。
3. duration を明示指定したいなら `durationMs` を渡す。

### Examples

Before: `<section>…</section>`
After: `<FadeIn><section>…</section></FadeIn>`

### Verify
- 初回ビューポート進入で 1 回だけフェードイン
- Reduce Motion ON で即時表示
- スクロールバックで二度目は再生しない

## Accessibility

Motion は `useReducedMotion()` をデフォルトで尊重。CSS 版は `prefers-reduced-motion` で `duration` を 0.01ms に。

## Performance Notes

`opacity` のみ補間。GPU 内で完結し、Layout を引き起こさない。

## Changelog

- 2026-05-23 (created): 初版。スキーマ v1.0、release alpha。
