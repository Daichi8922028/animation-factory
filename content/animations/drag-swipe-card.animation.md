---
id: drag-swipe-card
name: Drag Swipe Card
version: 1.0.0
release: alpha
variant: react-motion
description: |
  カードを左右にドラッグし、しきい値を超えたら dismiss、戻したら spring で復帰する。
  通知のスワイプ消し、Tinder 風カード、モバイル UI の定番。

taxonomy:
  layer: [library, js-runtime]
  ux_role:
    primary: micro-interaction
    secondary: [state-transition]
  trigger: [pointer]
  media: [dom-css]
  authoring: code

behavior:
  lifecycle: continuous
  reversible: true
  replay: every-entry

tags:
  - drag
  - swipe
  - dismiss
  - gesture
  - mobile
  - card

trigger:
  primary: pointer
  touch_fallback: always-on
  config:
    threshold_px: 120

runtime:
  language: typescript
  framework: react
  framework_version: ">=18"
dependencies:
  - { name: motion, version: "^11.0.0", purpose: "drag prop + spring 復帰" }
peer_dependencies:
  - { name: react, version: ">=18" }

implementations:
  - tier: 1
    name: "React + Motion (drag)"
    dependencies: [ { name: motion, version: "^11.0.0" } ]
    browser_support: { baseline: widely-available, baseline_year: 2020 }
    performance: { gpu_accelerated: true, layout_thrash: false, cost: low }

browser_support:
  baseline: widely-available
  baseline_year: 2020
  notes: "代表値は Tier 1。pointer events で touch/mouse 両対応"

performance:
  gpu_accelerated: true
  layout_thrash: false
  cost: low
  notes: "translateX + opacity のみ。Motion が rAF で値を駆動"

parameters:
  - { name: threshold_px, type: number, default: 120, range: [40, 320], description: "dismiss するしきい値" }
  - { name: exit_velocity, type: number, default: 500, range: [100, 1500], description: "高速スワイプで dismiss する速度しきい値" }
  - { name: stiffness, type: number, default: 300, range: [100, 800], description: "戻り spring" }

a11y:
  respects_reduced_motion: true
  fallback: "ドラッグでの移動は無効化。専用の dismiss ボタンを別途用意する"
  focus_safe: true
  notes: "ジェスチャ単独では a11y が壊れる。同等機能を持つキーボード操作（Delete キーで dismiss 等）を必ず併設"

license: MIT
authors: ["@daichi"]
sources: []
attribution_required: false

preview:
  url: https://animation-factory.app/preview/drag-swipe-card
  loop: true
  duration_ms: 2400

related:
  alternatives: [toast-slide]
  composes_with:
    - { id: drag-reorder, note: "ドラッグ系の同類。スワイプ削除と並び替えで使い分け" }
  requires: []

sections:
  skip: [variants]

ai:
  intent_examples:
    - "通知を左右スワイプで消したい"
    - "Tinder 風のカードスワイプ"
    - "モバイルでドラッグして dismiss"
  apply_targets: ["notification-card", "list-item", "removable-tag"]
  do_not_apply_to: ["body-text", "form-field", "navigation"]
---

## Overview

Motion の `drag="x"` でカードに水平ドラッグを許可、`dragConstraints` で範囲を制限。離した位置やしきい値・速度に応じて、`exit` で画面外へ流すか、spring で元位置に戻す。

使う場面: 通知 / メールのスワイプ削除、Tinder 風レコメンド、削除可能なタグ。
避けたい場面: 本文、フォーム要素、ナビゲーション（誤操作の温床）。

## Preview

公開プレビュー: https://animation-factory.app/preview/drag-swipe-card

## Implementation

### React + Motion

```tsx
"use client";
import { motion, useMotionValue, useTransform } from "motion/react";

export function DragSwipeCard({
  children,
  onDismiss,
  thresholdPx = 120,
}: {
  children: React.ReactNode;
  onDismiss?: (dir: "left" | "right") => void;
  thresholdPx?: number;
}) {
  const x = useMotionValue(0);
  const opacity = useTransform(x, [-thresholdPx * 1.5, 0, thresholdPx * 1.5], [0, 1, 0]);

  return (
    <motion.div
      drag="x"
      dragConstraints={{ left: 0, right: 0 }}
      dragElastic={1}
      style={{ x, opacity }}
      onDragEnd={(_, info) => {
        const power = Math.abs(info.offset.x) > thresholdPx || Math.abs(info.velocity.x) > 500;
        if (power) onDismiss?.(info.offset.x > 0 ? "right" : "left");
      }}
      whileTap={{ cursor: "grabbing" }}
    >
      {children}
    </motion.div>
  );
}
```

## Usage

```tsx
<DragSwipeCard onDismiss={() => remove(id)}>
  <NotificationItem />
</DragSwipeCard>
```

## AI Apply Prompt

### Context
`{{target_selector}}` を左右スワイプで dismiss できるようにする。

### Steps
1. `motion@^11` を `{{package_manager}}` で追加。
2. `DragSwipeCard` を `{{target_file}}` に追加。
3. キーボードでも dismiss できるアクション（Delete キー、削除ボタン）を必ず併設。

### Examples

Before: 静的なリストアイテム
After: `<DragSwipeCard onDismiss={…}>` で包む

### Verify
- ドラッグでカードが追従、しきい値超えで消える
- 高速スワイプでも dismiss
- 戻すと spring で元位置
- Reduce Motion でドラッグ無効化 or 即時 dismiss

## Accessibility

ジェスチャ単独で a11y は完結しない。Delete キー / 削除ボタンを併設。スクリーンリーダーで「削除可能」を `aria-describedby` で示唆。

## Performance Notes

`translateX` + `opacity` のみ。`useMotionValue` で再レンダーを避ける。

## Changelog

- 2026-05-27 (created): 初版。Phase 3 D1 第 5 弾、Tier A gesture 拡充。
