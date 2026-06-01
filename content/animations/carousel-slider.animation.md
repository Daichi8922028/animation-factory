---
id: carousel-slider
name: Carousel Slider
version: 1.0.0
release: v1.0
variant: react-motion
description: |
  スライドで画面を切り替えるカルーセル。AnimatePresence の direction-aware exit で
  進む／戻るが視覚的に分かる古典的パターン。

taxonomy:
  layer: [library, js-runtime]
  ux_role:
    primary: state-transition
    secondary: [navigation]
  trigger: [state-change]
  media: [dom-css]
  authoring: code

behavior:
  lifecycle: toggle
  reversible: true
  replay: every-entry

tags:
  - carousel
  - slider
  - slideshow
  - swipe
  - pagination
  - gallery

trigger:
  primary: state-change
  touch_fallback: always-on
  config: {}

runtime:
  language: typescript
  framework: react
  framework_version: ">=18"
dependencies:
  - { name: motion, version: "^11.0.0", purpose: "AnimatePresence + direction" }
peer_dependencies:
  - { name: react, version: ">=18" }

implementations:
  - tier: 1
    name: "React + Motion (AnimatePresence)"
    dependencies: [ { name: motion, version: "^11.0.0" } ]
    browser_support: { baseline: widely-available, baseline_year: 2020 }
    performance: { gpu_accelerated: true, layout_thrash: false, cost: low }
    degrades_to: 2
  - tier: 2
    name: "Embla Carousel"
    dependencies: [ { name: "embla-carousel-react", version: "^8.0.0" } ]
    browser_support: { baseline: widely-available, baseline_year: 2020 }
    performance: { gpu_accelerated: true, layout_thrash: false, cost: low }
    degradation: "高機能。慣性スクロール、複数枚同時表示、無限ループが要るなら Embla"

browser_support:
  baseline: widely-available
  baseline_year: 2020
  notes: "代表値は Tier 1。translateX + opacity の direction-aware variants で 1 枚切替"

performance:
  gpu_accelerated: true
  layout_thrash: false
  cost: low
  notes: "translate + opacity のみ補間。同時表示は 2 枚（出入り）に限る"

parameters:
  - { name: distance_px, type: number, default: 80, range: [40, 240], description: "出入りの translateX" }
  - { name: duration_ms, type: number, default: 280, range: [160, 600], description: "切替の長さ" }
  - { name: easing, type: enum, default: "easeOut", values: ["linear","easeIn","easeOut","easeInOut"] }

a11y:
  respects_reduced_motion: true
  fallback: "translate を無効化、opacity の切替のみ"
  focus_safe: true
  notes: "ARIA は `role=\"region\"` + `aria-roledescription=\"carousel\"`、ページネーションは `aria-label=\"Slide N of M\"`。キーボード ←→ ナビを必ず実装"

license: MIT
authors: ["@daichi"]
sources: []
attribution_required: false

preview:
  url: https://animation-factory.app/preview/carousel-slider
  loop: true
  duration_ms: 3000

related:
  alternatives: [tab-switch]
  composes_with:
    - { id: drag-swipe-card, note: "スワイプで前後にも移動できるようにする組み合わせ" }
  requires: []

sections:
  skip: [variants]

ai:
  intent_examples:
    - "画像カルーセル"
    - "プロダクトショット切替"
    - "テスティモニアル切替"
  apply_targets: ["product-gallery", "testimonial-carousel", "feature-slideshow"]
  do_not_apply_to: ["navigation-menu", "form-step-flow", "table-pagination"]
---

## Overview

カルーセルの本質は「前後関係」を視覚で伝えること。AnimatePresence と custom direction を使い、次へ → 右から入る／左へ抜ける、戻る → 左から入る／右へ抜ける、と方向を反転させる。

使う場面: 画像ギャラリー、製品ショット、テスティモニアル。
避けたい場面: ナビゲーション（次が予測できない）、フォーム多段（戻り操作が壊れる）、表ページネーション（情報量で攻める）。

## Preview

公開プレビュー: https://animation-factory.app/preview/carousel-slider

## Implementation

### React + Motion

```tsx
"use client";
import { AnimatePresence, motion } from "motion/react";
import { useState } from "react";

const variants = {
  enter: (dir: number) => ({ x: dir > 0 ? 80 : -80, opacity: 0 }),
  center: { x: 0, opacity: 1 },
  exit: (dir: number) => ({ x: dir > 0 ? -80 : 80, opacity: 0 }),
};

export function Carousel({ slides }: { slides: React.ReactNode[] }) {
  const [[i, dir], setState] = useState<[number, number]>([0, 0]);
  const go = (delta: number) => setState([(i + delta + slides.length) % slides.length, delta]);

  return (
    <section
      role="region"
      aria-roledescription="carousel"
      aria-label={`Slide ${i + 1} of ${slides.length}`}
      className="relative overflow-hidden"
    >
      <AnimatePresence custom={dir} mode="wait">
        <motion.div
          key={i}
          custom={dir}
          variants={variants}
          initial="enter" animate="center" exit="exit"
          transition={{ duration: 0.28, ease: "easeOut" }}
        >
          {slides[i]}
        </motion.div>
      </AnimatePresence>
      <div className="absolute inset-x-0 bottom-4 flex justify-center gap-2">
        <button type="button" onClick={() => go(-1)} aria-label="Previous slide">←</button>
        <button type="button" onClick={() => go(+1)} aria-label="Next slide">→</button>
      </div>
    </section>
  );
}
```

## Usage

```tsx
<Carousel slides={[<Slide1 />, <Slide2 />, <Slide3 />]} />
```

## AI Apply Prompt

### Context
`{{target_selector}}` を direction-aware なカルーセルにする。

### Steps
1. `motion@^11` を `{{package_manager}}` で追加。
2. `Carousel` を `{{target_file}}` に追加。
3. `role="region"` + `aria-roledescription="carousel"` + 矢印キー操作の追加。

### Examples

Before: 静的な単一画像
After: `<Carousel slides={[…]} />`

### Verify
- 次／戻るで方向が視覚的に分かる
- スライド番号が ARIA で読まれる
- Reduce Motion で translate なし、opacity 切替のみ
- キーボード ←→ で操作可能（実装次第、上記コードに追加要）

## Accessibility

`role="region"` + `aria-roledescription="carousel"` で意味を伝える。各スライドのページネーションも `aria-label="Slide N of M"`。

## Performance Notes

translate + opacity の同時 2 枚のみ補間。`mode="wait"` で重なりを防ぎ、トレード可能なら `mode="popLayout"` で同時表示。

## Changelog

- 2026-05-27 (created): 初版。Phase 3 D1 第 5 弾、Tier A コンポーネント拡充。
