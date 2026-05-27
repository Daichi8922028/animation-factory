---
id: view-transition-fade
name: View Transition Fade
version: 1.0.0
release: beta
variant: vanilla-css
description: |
  View Transitions API（`document.startViewTransition()`）で、画面状態の切替を
  ブラウザネイティブのスナップショット fade で繋ぐ。ルート遷移にもインプレース切替にも。

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
  reversible: false
  replay: every-entry

tags:
  - view-transitions
  - page-transition
  - route-change
  - navigation
  - cross-fade

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
    name: "View Transitions API (browser)"
    dependencies: []
    browser_support: { baseline: newly-available, baseline_year: 2024 }
    performance: { gpu_accelerated: true, layout_thrash: false, cost: low }
    degrades_to: 2
  - tier: 2
    name: "React + Motion (AnimatePresence)"
    dependencies: [ { name: motion, version: "^11.0.0" } ]
    browser_support: { baseline: widely-available, baseline_year: 2020 }
    performance: { gpu_accelerated: true, layout_thrash: false, cost: low }
    degradation: "未対応ブラウザ（Firefox 等）では fade を Motion で代替"

browser_support:
  baseline: newly-available
  baseline_year: 2024
  notes: "Chrome 111+ / Safari 18+。Firefox は実験フラグ。startViewTransition の存在チェックで分岐"

performance:
  gpu_accelerated: true
  layout_thrash: false
  cost: low
  notes: "ブラウザがスナップショットを撮影して合成スレッドで補間。Layout を引き起こさない"

parameters:
  - { name: duration_ms, type: number, default: 300, range: [120, 800], description: "::view-transition-old/new の長さ" }
  - { name: easing,      type: string, default: "ease",  description: "CSS の標準 easing 名" }

a11y:
  respects_reduced_motion: true
  fallback: "View Transition を発火させず、即時切替に縮退"
  focus_safe: true
  notes: "ルート遷移時は focus 管理が壊れやすい。`document.startViewTransition` の `finished` Promise 後に focus を新ページの主要要素へ移す"

license: MIT
authors: ["@daichi"]
sources:
  - { title: "View Transitions API — MDN", url: "https://developer.mozilla.org/en-US/docs/Web/API/View_Transitions_API" }
attribution_required: false

preview:
  url: https://animation-factory.app/preview/view-transition-fade
  loop: true
  duration_ms: 2400

related:
  alternatives: [modal-fade, fade-in]
  composes_with:
    - { id: view-transition-shared, note: "個別要素を共有要素として連続させたい時は shared を併用" }
  requires: []

sections:
  skip: [variants]

ai:
  intent_examples:
    - "ページ遷移時にネイティブの cross-fade"
    - "View Transitions API で画面切替"
    - "Next.js のルート遷移にアニメをつけたい"
  apply_targets: ["route-transition", "tab-content", "page-section-swap"]
  do_not_apply_to: ["always-visible-ui", "form-submission-only"]
---

## Overview

`document.startViewTransition(() => updateDOM())` を呼ぶと、ブラウザが「変更前のスクリーンショット」と「変更後のスクリーンショット」を撮影し、CSS（`::view-transition-old(root)` / `::view-transition-new(root)`）で補間する。デフォルトは cross-fade。

使う場面: ルート遷移、タブ切替、リストとカード詳細の往復、テーマ切替。
避けたい場面: 同一ページ内の頻繁な状態変化（オーバーキル）、視覚に変化のない更新。

## Preview

公開プレビュー: https://animation-factory.app/preview/view-transition-fade

## Implementation

### View Transitions API

```ts
function swap(update: () => void) {
  if (!("startViewTransition" in document)) {
    update();
    return;
  }
  // @ts-expect-error: API は newly-available
  document.startViewTransition(update);
}
```

```css
::view-transition-old(root),
::view-transition-new(root) {
  animation-duration: 300ms;
  animation-timing-function: ease;
}

@media (prefers-reduced-motion: reduce) {
  ::view-transition-old(root),
  ::view-transition-new(root) {
    animation: none;
  }
}
```

### Next.js（router 連携）

```tsx
"use client";
import { useRouter } from "next/navigation";

export function ViewTransitionLink({ href, children }: { href: string; children: React.ReactNode }) {
  const router = useRouter();
  return (
    <a
      href={href}
      onClick={(e) => {
        e.preventDefault();
        const navigate = () => router.push(href);
        if ("startViewTransition" in document) {
          // @ts-expect-error: newly-available
          document.startViewTransition(navigate);
        } else {
          navigate();
        }
      }}
    >
      {children}
    </a>
  );
}
```

### React + Motion（縮退）

未対応ブラウザでは AnimatePresence + fade で代替。

## Usage

```tsx
<button onClick={() => swap(() => setView("detail"))}>詳細を見る</button>
```

## AI Apply Prompt

### Context
`{{target_selector}}` の状態切替を、対応ブラウザではネイティブの View Transition、未対応では即時切替で行う。

### Steps
1. 上記 `swap` ヘルパを `{{target_file}}` に追加。
2. 切替前後を関数で囲い、`swap(() => …)` に渡す。
3. CSS の `::view-transition-old/new(root)` で duration / easing を上書き。
4. Reduce Motion 対応の `@media` を必ず併設。

### Examples

Before: `setView("detail")`
After: `swap(() => setView("detail"))`

### Verify
- Chrome / Safari: cross-fade で切替
- Firefox: 即時切替（fallback）
- Reduce Motion でアニメ無効

## Accessibility

ルート遷移時の focus 管理は別途実装。`finished` Promise 後に新ページの `<h1>` や主要 landmark に focus を移すと良い。

## Performance Notes

スナップショットは合成スレッドで補間されるため、ペイントコストが既に走った後の処理。`will-change` 不要。

## Changelog

- 2026-05-27 (created): 初版。Phase 3 D1 第 4 弾、ナビゲーション拡充。
