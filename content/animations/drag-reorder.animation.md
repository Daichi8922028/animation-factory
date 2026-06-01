---
id: drag-reorder
name: Drag Reorder
version: 1.0.0
release: v1.0
variant: react-motion
description: |
  リストをドラッグ＆ドロップで並び替え。Motion の Reorder で順序変更の補間まで宣言的に。
  Notion 風ブロック、Trello カラム、優先度リストの並び替えに。

taxonomy:
  layer: [library, js-runtime]
  ux_role:
    primary: state-transition
    secondary: [micro-interaction]
  trigger: [pointer]
  media: [dom-css]
  authoring: code

behavior:
  lifecycle: continuous
  reversible: true
  replay: every-entry

tags:
  - drag
  - reorder
  - sortable
  - list
  - flip
  - notion

trigger:
  primary: pointer
  touch_fallback: always-on
  config: {}

runtime:
  language: typescript
  framework: react
  framework_version: ">=18"
dependencies:
  - { name: motion, version: "^11.0.0", purpose: "Reorder + layout" }
peer_dependencies:
  - { name: react, version: ">=18" }

implementations:
  - tier: 1
    name: "React + Motion (Reorder)"
    dependencies: [ { name: motion, version: "^11.0.0" } ]
    browser_support: { baseline: widely-available, baseline_year: 2020 }
    performance: { gpu_accelerated: true, layout_thrash: false, cost: low }
    degrades_to: 2
  - tier: 2
    name: "dnd-kit"
    dependencies: [ { name: "@dnd-kit/sortable", version: "^8.0.0" } ]
    browser_support: { baseline: widely-available, baseline_year: 2020 }
    performance: { gpu_accelerated: true, layout_thrash: false, cost: low }
    degradation: "高機能。複数カラム間 D&D や ARIA 完備が要るなら dnd-kit"

browser_support:
  baseline: widely-available
  baseline_year: 2020
  notes: "代表値は Tier 1（Motion Reorder）。FLIP は内部で transform 補間"

performance:
  gpu_accelerated: true
  layout_thrash: false
  cost: low
  notes: "並び替え中は drag した要素のみ rAF 更新、他は FLIP で transform 補間"

parameters:
  - { name: layout_transition_ms, type: number, default: 220, range: [120, 500], description: "他要素が動くときの transition" }

a11y:
  respects_reduced_motion: true
  fallback: "drag を無効化。↑↓ ボタンや矢印キーでの並び替えを必ず併設"
  focus_safe: true
  notes: "ARIA の grabbed/dropeffect は非推奨。Reorder UI は kbd 操作（↑↓）と aria-live で位置を読み上げる設計を併設する"

license: MIT
authors: ["@daichi"]
sources: []
attribution_required: false

preview:
  url: https://animation-factory.app/preview/drag-reorder
  loop: true
  duration_ms: 2600

related:
  alternatives: [drag-swipe-card]
  composes_with: []
  requires: []

sections:
  skip: [variants]

ai:
  intent_examples:
    - "リストをドラッグで並び替えたい"
    - "Notion 風のブロック並び替え"
    - "Trello のカード並び替え"
  apply_targets: ["sortable-list", "kanban-card", "settings-priority-list", "block-editor"]
  do_not_apply_to: ["read-only-list", "navigation", "table-rows-data-driven"]
---

## Overview

`Reorder.Group` と `Reorder.Item` だけで並び替え UI が完結する。値が変わると Motion の layout 機構が他要素を transform で滑らかに補間する（FLIP）。

使う場面: 設定の優先度リスト、Notion 風ブロック、Trello カードの並び替え。
避けたい場面: 読み取り専用リスト、ナビゲーション、データ駆動テーブル。

## Preview

公開プレビュー: https://animation-factory.app/preview/drag-reorder

## Implementation

### React + Motion

```tsx
"use client";
import { Reorder } from "motion/react";
import { useState } from "react";

export function ReorderList() {
  const [items, setItems] = useState(["Task A", "Task B", "Task C"]);
  return (
    <Reorder.Group axis="y" values={items} onReorder={setItems}>
      {items.map((it) => (
        <Reorder.Item key={it} value={it} className="bg-white/5 rounded px-4 py-2 mb-2 cursor-grab">
          {it}
        </Reorder.Item>
      ))}
    </Reorder.Group>
  );
}
```

### dnd-kit（縮退）

複数カラム間ドラッグや本格的な ARIA が要るなら `@dnd-kit/sortable`。

## Usage

```tsx
<ReorderList />
```

## AI Apply Prompt

### Context
`{{target_selector}}` のリストをドラッグで並び替えできるようにする。

### Steps
1. `motion@^11` を `{{package_manager}}` で追加。
2. `Reorder.Group` + `Reorder.Item` でラップ。
3. キーボード操作（↑/↓ や hold + 矢印）を別途実装し、aria-live で位置変更を読み上げる。

### Examples

Before: `<ul>{items.map(…)}</ul>`
After: `<Reorder.Group values={items} onReorder={setItems}>…</Reorder.Group>`

### Verify
- ドラッグで並び替え、離すと layout が transform で補間
- 並び順は state と同期
- Reduce Motion で transform 補間が無効、即時切替
- キーボード操作で同じ並び替えができる

## Accessibility

drag 単独だと SR ユーザは並べ替えられない。`↑/↓` キー操作と、`aria-live="polite"` で「『Task A』 を 2 番目に移動」のような読み上げを併設。

## Performance Notes

Motion の layout は FLIP（First-Last-Invert-Play）で transform 補間に変換するため、Layout 更新を引き起こさない。

## Changelog

- 2026-05-27 (created): 初版。Phase 3 D1 第 5 弾、Tier A gesture 拡充。
