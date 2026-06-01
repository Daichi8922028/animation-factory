---
id: view-transition-list-reorder
name: View Transition List Reorder
version: 1.0.0
release: v1.1
variant: vanilla-css
description: |
  リストの並び替え（ソート）時に、各行が View Transitions API で旧位置から新位置へ滑って入れ替わる。
  行ごとに view-transition-name を振ることで、ブラウザが行単位の morph を自動生成する。

taxonomy:
  layer: [css, js-runtime]
  ux_role:
    primary: state-transition
    secondary: [navigation]
  trigger: [state-change]
  media: [dom-css]
  authoring: code

behavior:
  lifecycle: oneshot
  reversible: true
  replay: every-entry

tags:
  - view-transitions
  - list
  - reorder
  - sort
  - morph
  - table
  - rows

trigger:
  primary: state-change
  touch_fallback: always-on
  config: {}

runtime:
  language: typescript
  framework: react
  framework_version: ">=18"
dependencies: []
peer_dependencies:
  - { name: react, version: ">=18" }

implementations:
  - tier: 1
    name: "View Transitions API (per-row name)"
    dependencies: []
    browser_support: { baseline: newly-available, baseline_year: 2024 }
    performance: { gpu_accelerated: true, layout_thrash: false, cost: low }
    degrades_to: 2
  - tier: 2
    name: "Motion layout（FLIP リオーダー）"
    dependencies: [ { name: motion, version: "^11.0.0" } ]
    browser_support: { baseline: widely-available, baseline_year: 2020 }
    degradation: "未対応ブラウザでは motion の layout で各行を FLIP 補間"
    performance: { gpu_accelerated: true, layout_thrash: false, cost: low }

browser_support:
  baseline: newly-available
  baseline_year: 2024
  notes: "Chrome 111+ / Safari 18+。各行に一意の view-transition-name を付け、startViewTransition 内で並びを更新する"

performance:
  gpu_accelerated: true
  layout_thrash: false
  cost: low
  notes: "ブラウザが old/new スナップショットを transform 補間。行数が多い場合は表示中の行だけに name を付ける"

parameters:
  - { name: duration_ms,     type: number, default: 360, range: [200, 700], description: "並び替え遷移の長さ" }
  - { name: name_prefix,     type: string, default: "row", description: "各行 view-transition-name の接頭辞" }
  - { name: easing,          type: string, default: "cubic-bezier(.2,.8,.2,1)", description: "遷移の easing" }

a11y:
  respects_reduced_motion: true
  fallback: "View Transition を発火させず即時並び替え。並び順の変化は aria-live で通知してもよい"
  focus_safe: true
  notes: "ソート操作のトリガー（列ヘッダ等）に aria-sort。フォーカス中の行があれば遷移後も同じ行にフォーカスを保つ"

license: MIT
authors: ["@daichi"]
sources:
  - { title: "View Transitions API — MDN", url: "https://developer.mozilla.org/en-US/docs/Web/API/View_Transition_API" }
  - { title: "List reorder with view transitions — Chrome", url: "https://developer.chrome.com/docs/web-platform/view-transitions/" }
attribution_required: false

preview:
  url: https://animation-factory.app/preview/view-transition-list-reorder
  loop: true
  duration_ms: 3000

related:
  alternatives: [drag-reorder, view-transition-shared, tab-underline-slide]
  composes_with:
    - { id: drag-reorder, note: "ドラッグ並び替えの確定時に view transition で滑らかに収める" }
  requires: []

sections:
  skip: [variants]

ai:
  intent_examples:
    - "リストをソートすると行が滑って入れ替わる"
    - "テーブルの並び替えを View Transitions で滑らかに"
    - "行ごとに morph する並び替えアニメ"
  apply_targets: ["sortable-list", "data-table", "leaderboard"]
  do_not_apply_to: ["static-list", "tooltip", "toast"]
---

## Overview

リストやテーブルを並び替えるとき、各行に一意の `view-transition-name` を付けておき、`startViewTransition()` の中で並び順を更新する。ブラウザが各行の旧位置/新位置を比較し、行単位で滑らかに移動させる。順位表やソート可能テーブルで効果的。

使う場面: ソート可能なテーブル、ランキング/リーダーボード、フィルタで並びが変わるリスト。
避けたい場面: 静的リスト、ツールチップ、トースト。

## Preview

公開プレビュー: https://animation-factory.app/preview/view-transition-list-reorder

## Implementation

### View Transitions API (per-row name)

```tsx
"use client";
function reorder(next: Item[], setItems: (i: Item[]) => void) {
  const doc = document as Document & { startViewTransition?: (cb: () => void) => unknown };
  if (typeof doc.startViewTransition === "function") doc.startViewTransition(() => setItems(next));
  else setItems(next);
}
```

```css
/* 各行に一意の name（id 等で生成） */
.row { view-transition-name: var(--vt-name); }
::view-transition-old(*), ::view-transition-new(*) {
  animation-duration: 360ms;
}
@media (prefers-reduced-motion: reduce) {
  ::view-transition-group(*) { animation: none; }
}
```

### Motion layout（縮退）

未対応ブラウザでは各行を `<motion.li layout>` にして FLIP で補間。

## Usage

```tsx
<button onClick={() => reorder([...items].sort(byScore), setItems)} aria-sort="descending">並び替え</button>
```

## AI Apply Prompt

### Context
`{{list}}` のソートを View Transitions で滑らかにする。

### Steps
1. 各行に一意の `view-transition-name`（id ベース）を付与。
2. 並び替えの state 更新を `startViewTransition` でラップ。
3. ソートトリガーに `aria-sort`、Reduce Motion で即時化。

### Verify
- 並び替えで各行が旧→新位置へ滑る
- 未対応ブラウザでも即時に並び替わる
- Reduce Motion でアニメ無し

## Accessibility

ソートのトリガーに `aria-sort`。並び替え後もフォーカス行を保持。順序変化は必要なら `aria-live` で通知。Reduce Motion で発火させない。

## Performance Notes

ブラウザがスナップショットを transform 補間するため reflow を抑えられる。多行の場合は可視行だけに `view-transition-name` を付け、スナップショット数を抑える。

## Changelog

- 2026-06-01 (created): 初版。v1.1 Batch 5（View Transitions API 進化）第 1 弾。行単位の並び替え morph。
