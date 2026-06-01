---
id: view-transition-shared
name: View Transition Shared Element
version: 1.0.0
release: v1.0
variant: vanilla-css
description: |
  View Transitions API の `view-transition-name` で、画面遷移を跨いで同じ要素が
  ヒーロー的に「動いて来る」共有要素トランジション。iOS 風のリスト→詳細遷移。

taxonomy:
  layer: [css, js-runtime]
  ux_role:
    primary: navigation
    secondary: [storytelling]
  trigger: [state-change]
  media: [dom-css]
  authoring: code

behavior:
  lifecycle: oneshot
  reversible: false
  replay: every-entry

tags:
  - view-transitions
  - shared-element
  - hero-transition
  - list-detail
  - ios-style
  - morph

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
    name: "Motion layoutId (FLIP)"
    dependencies: [ { name: motion, version: "^11.0.0" } ]
    browser_support: { baseline: widely-available, baseline_year: 2020 }
    performance: { gpu_accelerated: true, layout_thrash: false, cost: low }
    degradation: "未対応ブラウザでは Motion の layoutId で同等の FLIP 補間"

browser_support:
  baseline: newly-available
  baseline_year: 2024
  notes: "Chrome 111+ / Safari 18+ / Firefox 実験フラグ。`view-transition-name` を共有"

performance:
  gpu_accelerated: true
  layout_thrash: false
  cost: low
  notes: "old/new スナップショットの transform 補間で完結。Layout を引き起こさない"

parameters:
  - { name: duration_ms, type: number, default: 400, range: [200, 1000], description: "old/new の長さ" }
  - { name: transition_name, type: string, default: "hero", description: "共有する view-transition-name の値" }

a11y:
  respects_reduced_motion: true
  fallback: "View Transition を発火させず、即時切替"
  focus_safe: true
  notes: "遷移後に focus を新画面の主要要素に移す。共有要素の `alt` / `aria-label` は両方に一致させる"

license: MIT
authors: ["@daichi"]
sources:
  - { title: "View Transitions: shared elements — Chrome Developers", url: "https://developer.chrome.com/docs/web-platform/view-transitions/" }
attribution_required: false

preview:
  url: https://animation-factory.app/preview/view-transition-shared
  loop: true
  duration_ms: 2800

related:
  alternatives: [view-transition-fade]
  composes_with:
    - { id: view-transition-fade, note: "shared 要素以外は通常の cross-fade で繋ぐと両立する" }
  requires: []

sections:
  skip: [variants]

ai:
  intent_examples:
    - "リストから詳細へカードがヒーロー的に動いて遷移"
    - "iOS 風の共有要素トランジション"
    - "サムネが詳細ページの大画像に morph"
  apply_targets: ["list-item-to-detail", "card-to-hero", "thumbnail-to-large"]
  do_not_apply_to: ["body-text", "form-input", "background-decoration"]
---

## Overview

遷移前後の両方の画面で、同じ要素に同じ `view-transition-name` を指定する。ブラウザは「同名要素が遷移前後で別位置にある」と認識し、自動で位置・サイズを補間する。

使う場面: 商品一覧→詳細、フォト一覧→拡大ビュー、リストのサムネ→ヒーロー画像。
避けたい場面: テキスト本文（補間がぎこちなく見える）、フォーム要素、装飾背景。

## Preview

公開プレビュー: https://animation-factory.app/preview/view-transition-shared

## Implementation

### View Transitions API（HTML 同一ページ内）

```css
.thumb {
  view-transition-name: hero;
}
.hero-img {
  view-transition-name: hero;
}

::view-transition-old(hero),
::view-transition-new(hero) {
  animation-duration: 400ms;
  animation-timing-function: cubic-bezier(.2, .8, .2, 1);
}

@media (prefers-reduced-motion: reduce) {
  ::view-transition-old(hero),
  ::view-transition-new(hero) {
    animation: none;
  }
}
```

```tsx
function openDetail(id: string) {
  if (!("startViewTransition" in document)) {
    setSelected(id);
    return;
  }
  // @ts-expect-error: newly-available
  document.startViewTransition(() => setSelected(id));
}
```

複数のヒーロー要素を同時に扱うなら、`view-transition-name` をユニーク化:

```css
.thumb[data-id="42"] { view-transition-name: hero-42; }
.hero-img[data-id="42"] { view-transition-name: hero-42; }
```

### Motion layoutId（縮退）

未対応ブラウザは `layoutId` で同等の FLIP を実現。

```tsx
{listMode
  ? <motion.img layoutId="hero" src={thumb} />
  : <motion.img layoutId="hero" src={large} />}
```

## Usage

```tsx
<button onClick={() => openDetail(item.id)}>
  <img className="thumb" data-id={item.id} src={item.thumb} alt="" />
</button>
```

## AI Apply Prompt

### Context
`{{target_selector}}` のサムネと、詳細画面のヒーロー画像を `view-transition-name` で繋ぐ。

### Steps
1. 両方の要素に同じ `view-transition-name`（または `data-id` 由来のユニーク値）を CSS で付ける。
2. 状態変更を `document.startViewTransition` で囲う。
3. 未対応ブラウザ向けに Motion `layoutId` 経路も用意。
4. Reduce Motion 対応の `@media` を併設。

### Examples

Before: 単純な setState で切替
After: `document.startViewTransition(() => setState(…))` + 共有 `view-transition-name`

### Verify
- 対応ブラウザでサムネ → ヒーローが滑らかに morph
- 未対応で Motion `layoutId` フォールバック
- Reduce Motion で morph なし、即時切替

## Accessibility

共有要素の `alt` を両画面で一致させる。遷移後に focus を新画面の主要見出しに移す。

## Performance Notes

`view-transition-name` 付与は静的でも動的でも OK。動的な場合は `useLayoutEffect` 内で付ける。複数の name はパフォーマンス影響なし。

## Changelog

- 2026-05-27 (created): 初版。Phase 3 D1 第 4 弾、ナビゲーション拡充。
