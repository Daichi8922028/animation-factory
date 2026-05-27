---
id: blur-in
name: Blur In
version: 1.0.0
release: alpha
variant: react-motion
description: |
  要素が強めのぼかし（blur 12px 前後）から fade で現れる、印象的な登場アニメーション。
  ヒーロー、フォトギャラリー、トランジション演出に。

taxonomy:
  layer: [css, js-runtime, library]
  ux_role:
    primary: state-transition
    secondary: [decorative]
  trigger: [viewport]
  media: [dom-css]
  authoring: code

behavior:
  lifecycle: oneshot
  reversible: false
  replay: once

tags:
  - blur
  - entrance
  - filter
  - hero
  - photography
  - cinematic

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
    performance: { gpu_accelerated: false, layout_thrash: false, cost: medium }
    degrades_to: 2
  - tier: 2
    name: "Vanilla CSS"
    dependencies: []
    browser_support: { baseline: widely-available, baseline_year: 2018 }
    performance: { gpu_accelerated: false, layout_thrash: false, cost: medium }
    degradation: "viewport トリガー無し。マウント時に keyframe を流す"

browser_support:
  baseline: widely-available
  baseline_year: 2020
  notes: "代表値は Tier 1。filter: blur はモバイルでコストがやや高め"

performance:
  gpu_accelerated: false
  layout_thrash: false
  cost: medium
  notes: "filter: blur は Composite 内で完結するが GPU での負荷は transform より重い。大量同時実行は避ける"

parameters:
  - { name: from_blur_px, type: number, default: 12,  range: [2, 32],     description: "開始時のぼかし量" }
  - { name: duration_ms,  type: number, default: 600, range: [200, 1500], description: "登場の長さ" }

a11y:
  respects_reduced_motion: true
  fallback: "blur 0 / opacity 1 で即時表示。ぼかし演出を完全に除去"
  focus_safe: true
  notes: "ぼかし中はテキストが判読しづらいため、フォーム要素やボタンには適用しない"

license: MIT
authors: ["@daichi"]
sources: []
attribution_required: false

preview:
  url: https://animation-factory.app/preview/blur-in
  loop: true
  duration_ms: 1500

related:
  alternatives: [fade-in, fade-up, scale-in]
  composes_with:
    - { id: scroll-reveal, note: "セクション単位で blur-in を viewport トリガーで掛けるとシネマティック" }
  requires: []

sections:
  skip: [variants]

ai:
  intent_examples:
    - "ぼかしから現れるシネマティックな登場"
    - "ヒーロー写真をぼかしから合焦させたい"
  apply_targets: ["hero", "photo", "section-heading", "key-visual"]
  do_not_apply_to: ["text-input", "button", "small-text", "data-table"]
---

## Overview

`filter: blur(12px)` 程度の強めのぼかしから 0 へ、同時に opacity も 0 → 1 で登場する。映像作品の「ピントが合う」演出に近く、写真・ヒーロー・キービジュアル系で印象を強める。

使う場面: ヒーロー画像、フォトギャラリーの冒頭、ブランドキービジュアル。
避けたい場面: テキスト入力欄、ボタン、本文。ぼかし中に意味が読み取れないため UX を阻害する。

## Preview

公開プレビュー: https://animation-factory.app/preview/blur-in

## Implementation

### React + Motion

```tsx
import { motion } from "motion/react";

export function BlurIn({
  children,
  fromBlurPx = 12,
  durationMs = 600,
}: {
  children: React.ReactNode;
  fromBlurPx?: number;
  durationMs?: number;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, filter: `blur(${fromBlurPx}px)` }}
      whileInView={{ opacity: 1, filter: "blur(0px)" }}
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
@keyframes blur-in {
  from { opacity: 0; filter: blur(12px); }
  to   { opacity: 1; filter: blur(0); }
}
.blur-in {
  animation: blur-in 600ms ease-out both;
}
@media (prefers-reduced-motion: reduce) {
  .blur-in {
    animation-duration: 0.01ms;
    filter: none;
  }
}
```

## Usage

```tsx
<BlurIn>
  <img src="/hero.jpg" alt="" />
</BlurIn>
```

## AI Apply Prompt

### Context
`{{target_selector}}` をぼかしから合焦する形で登場させる。シネマティック演出。

### Steps
1. `motion@^11` を `{{package_manager}}` で追加。
2. 上記 `BlurIn` を `{{target_file}}` に追加し、対象要素を包む。
3. 対象がフォーム要素やボタンなら、適用を中止する（読みにくくなるため）。

### Examples

Before: `<img src="/hero.jpg" alt="…" />`
After: `<BlurIn><img src="/hero.jpg" alt="…" /></BlurIn>`

### Verify
- 強めのぼかしから合焦してくる演出が見える
- Reduce Motion ON で blur 0、即時表示
- モバイル実機で 60fps を割らない（同時 3 枚以上は注意）

## Accessibility

Reduce Motion 設定では `filter` を `none` に固定し、即時表示へ縮退。テキストや入力 UI には適用しない方針を AI 側にも明示（do_not_apply_to）。

## Performance Notes

`filter: blur` は Composite で扱われるが、GPU 上の演算負荷が `transform` より重い。同時に多数走らせるとモバイルでフレーム落ちしうるため、ヒーロー級の数要素に限定する。

## Changelog

- 2026-05-26 (created): 初版。Phase 3 D1 第 1 弾、entrance-exit 拡充。
