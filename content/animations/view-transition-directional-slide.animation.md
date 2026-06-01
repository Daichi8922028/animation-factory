---
id: view-transition-directional-slide
name: View Transition Directional Slide
version: 1.0.0
release: v1.1
variant: vanilla-css
description: |
  ページ遷移で「進む」と「戻る」を区別し、ネイティブアプリのように方向の異なるスライドで切替える。
  View Transitions API + :root の方向フラグで、forward は新ページが右から、back は左から入る。

taxonomy:
  layer: [css, js-runtime]
  ux_role:
    primary: navigation
    secondary: [state-transition]
  trigger: [state-change]
  media: [dom-css]
  authoring: code

behavior:
  lifecycle: oneshot
  reversible: true
  replay: every-entry

tags:
  - view-transitions
  - directional
  - slide
  - forward-back
  - page-transition
  - navigation
  - spa

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
    name: "View Transitions API (direction flag on :root)"
    dependencies: []
    browser_support: { baseline: newly-available, baseline_year: 2024 }
    performance: { gpu_accelerated: true, layout_thrash: false, cost: low }
    degrades_to: 2
  - tier: 2
    name: "Motion AnimatePresence (custom direction)"
    dependencies: [ { name: motion, version: "^11.0.0" } ]
    browser_support: { baseline: widely-available, baseline_year: 2020 }
    degradation: "未対応では AnimatePresence の custom で向きを切替えて x スライド"
    performance: { gpu_accelerated: true, layout_thrash: false, cost: low }

browser_support:
  baseline: newly-available
  baseline_year: 2024
  notes: "Chrome 111+ / Safari 18+。履歴方向（push/pop）を判定して :root に forward/back を付ける"

performance:
  gpu_accelerated: true
  layout_thrash: false
  cost: low
  notes: "全画面 root スナップショットの translateX。重い画面は遷移前に主要素だけプリレンダ"

parameters:
  - { name: duration_ms,  type: number, default: 300, range: [180, 600], description: "スライドの長さ" }
  - { name: offset_pct,   type: number, default: 100, range: [20, 100],  description: "画面外への移動量(%)" }
  - { name: dim,          type: number, default: 0,   range: [0, 0.4],   description: "退場側の暗転量" }

a11y:
  respects_reduced_motion: true
  fallback: "方向スライドを発火させず即時遷移（fade も無し）"
  focus_safe: true
  notes: "遷移後に新ページの h1/主要素へフォーカス。方向は視覚効果で、ルーティングの意味は URL/履歴が担保。スワイプ戻ると整合させる"

license: MIT
authors: ["@daichi"]
sources:
  - { title: "View Transitions: customizing — Chrome", url: "https://developer.chrome.com/docs/web-platform/view-transitions/" }
attribution_required: false

preview:
  url: https://animation-factory.app/preview/view-transition-directional-slide
  loop: true
  duration_ms: 3000

related:
  alternatives: [view-transition-progressive-disclosure, view-transition-shared, slide-in-right]
  composes_with:
    - { id: view-transition-shared, note: "方向スライドの中で共有要素 morph を併用する" }
  requires: []

sections:
  skip: [variants]

ai:
  intent_examples:
    - "進むと戻るで遷移の向きが変わるページ切替"
    - "ネイティブアプリ風の forward/back スライド"
    - "履歴方向に応じた方向付きページトランジション"
  apply_targets: ["spa-routes", "mobile-app-views", "tabbed-pages"]
  do_not_apply_to: ["modal", "tooltip", "toast"]
---

## Overview

SPA のページ遷移で、履歴の進む/戻るを判定して `:root` に `forward`/`back` を付け、`startViewTransition()` で画面を差し替える。CSS で方向別のスライドを定義し、進む時は新ページが右から入って旧が左へ、戻る時は逆向きに。ネイティブアプリのような空間的な前後関係を表現する。

使う場面: SPA のルート遷移、モバイル Web のビュー切替、タブ間ページ。
避けたい場面: モーダル（方向の意味がない）、ツールチップ。

## Preview

公開プレビュー: https://animation-factory.app/preview/view-transition-directional-slide

## Implementation

### View Transitions API (direction flag on :root)

```tsx
function navigate(dir: "forward" | "back", to: string) {
  document.documentElement.dataset.dir = dir;
  const doc = document as Document & { startViewTransition?: (cb: () => void) => unknown };
  const run = () => router.push(to); // or setView(to)
  doc.startViewTransition ? doc.startViewTransition(run) : run();
}
```

```css
:root[data-dir="forward"]::view-transition-old(root) { animation: slide-out-left 300ms both; }
:root[data-dir="forward"]::view-transition-new(root) { animation: slide-in-right 300ms both; }
:root[data-dir="back"]::view-transition-old(root)    { animation: slide-out-right 300ms both; }
:root[data-dir="back"]::view-transition-new(root)    { animation: slide-in-left 300ms both; }
@keyframes slide-out-left { to { transform: translateX(-100%); } }
@keyframes slide-in-right { from { transform: translateX(100%); } }
@keyframes slide-out-right { to { transform: translateX(100%); } }
@keyframes slide-in-left { from { transform: translateX(-100%); } }
```

### Motion AnimatePresence（縮退）

未対応では `AnimatePresence` の `custom` に方向を渡して x スライド。

## Usage

```tsx
<button onClick={() => navigate("forward", "/next")}>次へ</button>
<button onClick={() => navigate("back", "/prev")}>戻る</button>
```

## AI Apply Prompt

### Context
`{{router}}` の遷移を履歴方向で出し分ける。

### Steps
1. push/pop を判定して `:root[data-dir]` に forward/back を付与。
2. `::view-transition-old/new(root)` を方向別に定義し、遷移を `startViewTransition` でラップ。
3. 遷移後に新ページ h1 へフォーカス、Reduce Motion で即時化。

### Verify
- 進む/戻るで逆向きにスライド
- 未対応/Reduce Motion で即時遷移
- 遷移後にフォーカスが移る

## Accessibility

方向は視覚効果。ルーティングの意味は URL/履歴が担保し、遷移後は新ページ主要素へフォーカス。OS の戻るジェスチャと方向を整合させる。Reduce Motion で発火させない。

## Performance Notes

`root` スナップショットの translateX 補間。重い画面では主要素だけ先にプリレンダしておくと滑らか。`view-transition-name: root` の暗黙スナップショットを活用。

## Changelog

- 2026-06-01 (created): 初版。v1.1 Batch 5（View Transitions API 進化）第 4 弾。履歴方向で出し分ける方向付きスライド。
