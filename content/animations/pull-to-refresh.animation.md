---
id: pull-to-refresh
name: Pull to Refresh
version: 1.0.0
release: v1.1
variant: react-motion
description: |
  リスト最上部から下に引っ張ると、閾値を超えたところでスピナーが現れ、離すと更新が走るモバイル定番ジェスチャ。
  引っ張り量に応じてインジケータが回転・拡大し、離すと spring で戻る drag feedback。

taxonomy:
  layer: [css, js-runtime, library]
  ux_role:
    primary: feedback
    secondary: [attention]
  trigger: [drag]
  media: [dom-css]
  authoring: code

behavior:
  lifecycle: oneshot
  reversible: true
  replay: every-entry

tags:
  - pull-to-refresh
  - drag
  - refresh
  - spinner
  - mobile
  - gesture
  - feedback

trigger:
  primary: drag
  touch_fallback: tap-toggle
  config: { axis: "y", threshold_px: 72 }

runtime:
  language: typescript
  framework: react
  framework_version: ">=18"
dependencies:
  - { name: motion, version: "^11.0.0", purpose: "drag + useTransform でインジケータ駆動" }
peer_dependencies:
  - { name: react, version: ">=18" }

implementations:
  - tier: 1
    name: "React + Motion (drag y + useTransform)"
    dependencies: [ { name: motion, version: "^11.0.0" } ]
    browser_support: { baseline: widely-available, baseline_year: 2020 }
    performance: { gpu_accelerated: true, layout_thrash: false, cost: low }
    degrades_to: 2
  - tier: 2
    name: "Pointer Events + transform（自前）"
    dependencies: []
    browser_support: { baseline: widely-available, baseline_year: 2019 }
    degradation: "pointerdown/move/up で deltaY を取り、translateY と回転を transform で適用"
    performance: { gpu_accelerated: true, layout_thrash: false, cost: low }

browser_support:
  baseline: widely-available
  baseline_year: 2020
  notes: "代表値は Tier 1。スクロール最上部でのみ発火させ、通常スクロールと競合させない"

performance:
  gpu_accelerated: true
  layout_thrash: false
  cost: low
  notes: "translateY + rotate の transform のみ。引っ張り量→回転は useTransform でメモ化"

parameters:
  - { name: threshold_px,  type: number, default: 72,  range: [48, 120],  description: "更新が走る引っ張り閾値(px)" }
  - { name: max_pull_px,   type: number, default: 120, range: [80, 200],  description: "最大引っ張り量(px)" }
  - { name: stiffness,     type: number, default: 320, range: [150, 500], description: "戻り spring の硬さ" }

a11y:
  respects_reduced_motion: true
  fallback: "回転/spring を抑え、テキスト『更新中…』を aria-live で通知。更新ボタンも別途提供"
  focus_safe: true
  notes: "ジェスチャには必ず明示的な更新ボタンの代替を用意。状態は aria-live=\"polite\" で『引っ張って更新 / 更新中 / 完了』を伝える"

license: MIT
authors: ["@daichi"]
sources:
  - { title: "Motion: drag", url: "https://motion.dev/docs/react-gestures#drag" }
  - { title: "MDN: overscroll-behavior", url: "https://developer.mozilla.org/en-US/docs/Web/CSS/overscroll-behavior" }
attribution_required: false

preview:
  url: https://animation-factory.app/preview/pull-to-refresh
  loop: true
  duration_ms: 3000

related:
  alternatives: [spinner-dots, bottom-sheet-snap-points, drag-swipe-card]
  composes_with:
    - { id: spinner-dots, note: "更新中の表示に spinner-dots を流用できる" }
  requires: []

sections:
  skip: [variants]

ai:
  intent_examples:
    - "リストを下に引っ張って更新するモバイル UI"
    - "pull to refresh のスピナー演出"
    - "引っ張り量に応じてインジケータが回るリフレッシュ"
  apply_targets: ["mobile-list", "feed", "timeline"]
  do_not_apply_to: ["desktop-table", "form", "modal"]
---

## Overview

スクロール最上部で下方向にドラッグすると、引っ張り量に応じてインジケータが下りて回転・拡大し、閾値を超えて離すと「更新中」へ。終わると spring で元に戻る。`useTransform` で引っ張り量→回転/不透明度を導出する。通常スクロールと競合しないよう、最上部でのみ発火させる。

使う場面: モバイルのフィード/タイムライン/リスト。
避けたい場面: デスクトップのテーブル、フォーム、モーダル。

## Preview

公開プレビュー: https://animation-factory.app/preview/pull-to-refresh

## Implementation

### React + Motion (drag y + useTransform)

```tsx
"use client";
import { animate, motion, useMotionValue, useTransform } from "motion/react";

export function PullToRefresh({ onRefresh, children }:
  { onRefresh: () => Promise<void>; children: React.ReactNode }) {
  const y = useMotionValue(0);
  const rotate = useTransform(y, [0, 120], [0, 360]);
  const opacity = useTransform(y, [0, 40, 72], [0, 0.6, 1]);
  const release = async () => {
    if (y.get() >= 72) { animate(y, 56, { type: "spring" }); await onRefresh(); }
    animate(y, 0, { type: "spring", stiffness: 320, damping: 30 });
  };
  return (
    <div className="relative overflow-hidden">
      <motion.div style={{ opacity, rotate }} className="absolute left-1/2 top-2 -translate-x-1/2" aria-live="polite">⟳</motion.div>
      <motion.div drag="y" style={{ y }} dragConstraints={{ top: 0, bottom: 120 }}
        dragElastic={0.4} onDragEnd={release}>{children}</motion.div>
    </div>
  );
}
```

### Pointer Events（縮退）

`pointerdown/move/up` で deltaY を取り、`translateY` + `rotate` を手で適用。

## Usage

```tsx
<PullToRefresh onRefresh={reload}>{list}</PullToRefresh>
```

## AI Apply Prompt

### Context
`{{list}}` に pull-to-refresh を足す。

### Steps
1. `motion@^11` を追加。
2. `drag="y"` + `useTransform(y → rotate/opacity)`、`onDragEnd` で閾値判定。
3. 明示的な更新ボタンと `aria-live` の状態通知も用意。

### Verify
- 最上部で下に引くとインジケータが回り、閾値超えで更新
- 離すと spring で戻る
- Reduce Motion で回転抑制 + テキスト通知、ボタン代替あり

## Accessibility

ジェスチャには更新ボタンの代替を必ず用意。`aria-live="polite"` で「引っ張って更新 / 更新中 / 完了」を伝える。Reduce Motion で回転/spring を弱める。

## Performance Notes

`translateY` + `rotate` の transform のみ。`useTransform` で派生値をメモ化し、毎フレームの再計算を最小化。`overscroll-behavior: contain` で親スクロールへの伝播を防ぐ。

## Changelog

- 2026-06-01 (created): 初版。v1.1 Batch 4（トリガー多様化: drag）第 3 弾。
