---
id: bottom-sheet-snap-points
name: Bottom Sheet Snap Points
version: 1.0.0
release: beta
variant: react-motion
description: |
  下から出るボトムシートを縦ドラッグで peek / half / full の 3 段階にスナップさせる。
  離した位置から最も近いスナップ点へ spring で吸着する、モバイル定番の navigation パターン。

taxonomy:
  layer: [css, js-runtime, library]
  ux_role:
    primary: state-transition
    secondary: [navigation]
  trigger: [drag]
  media: [dom-css]
  authoring: code

behavior:
  lifecycle: toggle
  reversible: true
  replay: every-entry

tags:
  - bottom-sheet
  - drag
  - snap
  - sheet
  - mobile
  - navigation
  - gesture

trigger:
  primary: drag
  touch_fallback: tap-toggle
  config: { axis: "y", snap_points: 3 }

runtime:
  language: typescript
  framework: react
  framework_version: ">=18"
dependencies:
  - { name: motion, version: "^11.0.0", purpose: "drag + useMotionValue + animate でスナップ" }
peer_dependencies:
  - { name: react, version: ">=18" }

implementations:
  - tier: 1
    name: "React + Motion (drag y + snap)"
    dependencies: [ { name: motion, version: "^11.0.0" } ]
    browser_support: { baseline: widely-available, baseline_year: 2020 }
    performance: { gpu_accelerated: true, layout_thrash: false, cost: low }
    degrades_to: 2
  - tier: 2
    name: "CSS Scroll Snap（scroll-snap-align）"
    dependencies: []
    browser_support: { baseline: widely-available, baseline_year: 2019 }
    degradation: "縦スクロールコンテナ + scroll-snap-type: y mandatory で擬似スナップ。慣性はブラウザ任せ"
    performance: { gpu_accelerated: true, layout_thrash: false, cost: low }

browser_support:
  baseline: widely-available
  baseline_year: 2020
  notes: "代表値は Tier 1。translateY で動かし、スナップは onDragEnd で最近傍に animate"

performance:
  gpu_accelerated: true
  layout_thrash: false
  cost: low
  notes: "transform: translateY のみ。height を触らないので reflow なし"

parameters:
  - { name: snap_count,   type: number, default: 3,   range: [2, 4],     description: "スナップ段数（peek/half/full 等）" }
  - { name: stiffness,    type: number, default: 300, range: [120, 500], description: "吸着 spring の硬さ" }
  - { name: damping,      type: number, default: 32,  range: [18, 50],   description: "吸着 spring の減衰" }

a11y:
  respects_reduced_motion: true
  fallback: "spring を無効化し各スナップへ即時移動。ドラッグ以外にボタンで段階切替も提供"
  focus_safe: true
  notes: "ドラッグ操作にはキーボード/ボタン代替を必ず用意。role=\"dialog\"（モーダルシート時）+ ハンドルに aria-label"

license: MIT
authors: ["@daichi"]
sources:
  - { title: "Motion: drag", url: "https://motion.dev/docs/react-gestures#drag" }
  - { title: "MDN: CSS scroll snap", url: "https://developer.mozilla.org/en-US/docs/Web/CSS/CSS_scroll_snap" }
attribution_required: false

preview:
  url: https://animation-factory.app/preview/bottom-sheet-snap-points
  loop: true
  duration_ms: 3000

related:
  alternatives: [drawer-slide, drawer-left-overlay, drag-swipe-card]
  composes_with:
    - { id: drag-swipe-card, note: "drag-swipe-card と同じ Motion drag 基盤。スワイプ系の派生" }
  requires: [drag-swipe-card]

sections:
  skip: [variants]

ai:
  intent_examples:
    - "下から出るシートをドラッグで段階的に開く"
    - "peek / half / full にスナップするボトムシート"
    - "モバイルのドラッグ可能なシート UI"
  apply_targets: ["bottom-sheet", "mobile-modal", "map-panel", "detail-drawer"]
  do_not_apply_to: ["desktop-dropdown", "tooltip", "toast"]
---

## Overview

画面下から出るシートを縦ドラッグで動かし、指を離すと最も近いスナップ点（peek / half / full）へ spring で吸着する。地図アプリの情報パネルや、モバイルの詳細表示で定番。`drag-swipe-card` と同じ Motion の drag 基盤上の派生。

使う場面: モバイルの詳細パネル、地図の情報シート、フィルタパネル。
避けたい場面: デスクトップのドロップダウン、ツールチップ、トースト。

## Preview

公開プレビュー: https://animation-factory.app/preview/bottom-sheet-snap-points

## Implementation

### React + Motion (drag y + snap)

```tsx
"use client";
import { animate, motion, useMotionValue } from "motion/react";

const SNAPS = [220, 120, 10]; // peek, half, full（translateY px）

export function BottomSheet() {
  const y = useMotionValue(SNAPS[0]);
  const snapTo = () => {
    const cur = y.get();
    const target = SNAPS.reduce((a, b) => (Math.abs(b - cur) < Math.abs(a - cur) ? b : a));
    animate(y, target, { type: "spring", stiffness: 300, damping: 32 });
  };
  return (
    <motion.div
      drag="y" style={{ y }}
      dragConstraints={{ top: SNAPS[2], bottom: SNAPS[0] }}
      dragElastic={0.04} onDragEnd={snapTo}
      role="dialog" aria-label="詳細シート"
    >
      <div aria-hidden className="handle" /> {/* つまみ */}
      {/* 内容 */}
    </motion.div>
  );
}
```

### CSS Scroll Snap（縮退）

縦スクロールコンテナに `scroll-snap-type: y mandatory`、各段に `scroll-snap-align: start`。

## Usage

```tsx
<BottomSheet>{/* リストや詳細 */}</BottomSheet>
```

## AI Apply Prompt

### Context
`{{panel}}` を 3 段階スナップのボトムシートにする。

### Steps
1. `motion@^11` を追加。
2. `drag="y"` + `useMotionValue(y)` + `onDragEnd` で最近傍スナップへ `animate`。
3. ドラッグ以外にボタンでも段階切替できるようにする（a11y）。

### Verify
- ドラッグして離すと最寄りの段へ吸着
- Reduce Motion で即時移動
- キーボード/ボタンでも段階切替できる

## Accessibility

ドラッグにはボタン等の代替操作を必ず用意。モーダルシートなら `role="dialog"` + focus 管理。つまみに `aria-label`。Reduce Motion で spring を切る。

## Performance Notes

`translateY`（transform）のみで動かし `height` を変えないため reflow が起きない。`dragElastic` を小さめにして端のゴム感を抑える。

## Changelog

- 2026-06-01 (created): 初版。v1.1 Batch 3（Navigation 拡張）第 1 弾。ドラッグ 3 段階スナップのボトムシート。
