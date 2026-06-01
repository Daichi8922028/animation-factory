---
id: view-transition-wipe-custom
name: View Transition Custom Wipe
version: 1.0.0
release: v1.1
variant: vanilla-css
description: |
  画面/セクションの切替を、clip-path のワイプで新コンテンツが拭うように現れる演出にする。
  View Transitions API の ::view-transition-new() を clip-path でアニメートしたカスタムトランジション。

taxonomy:
  layer: [css, js-runtime]
  ux_role:
    primary: state-transition
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
  - wipe
  - clip-path
  - reveal
  - custom
  - transition
  - cinematic

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
    name: "View Transitions API (clip-path on ::view-transition-new)"
    dependencies: []
    browser_support: { baseline: newly-available, baseline_year: 2024 }
    performance: { gpu_accelerated: true, layout_thrash: false, cost: low }
    degrades_to: 2
  - tier: 2
    name: "CSS clip-path transition（自前オーバーレイ）"
    dependencies: []
    browser_support: { baseline: widely-available, baseline_year: 2019 }
    degradation: "未対応では新コンテンツを重ねて clip-path を transition でワイプ"
    performance: { gpu_accelerated: true, layout_thrash: false, cost: low }

browser_support:
  baseline: newly-available
  baseline_year: 2024
  notes: "Chrome 111+ / Safari 18+。::view-transition-new(root) を clip-path inset/circle/polygon で開く"

performance:
  gpu_accelerated: true
  layout_thrash: false
  cost: low
  notes: "clip-path のアニメは合成で完結。複雑な polygon より inset/circle が軽い"

parameters:
  - { name: duration_ms,  type: number, default: 520, range: [300, 1000], description: "ワイプの長さ" }
  - { name: angle_deg,    type: number, default: 0,   range: [0, 360],   description: "ワイプ方向（0=左→右）" }
  - { name: shape,        type: string, default: "inset", description: "inset / circle / polygon" }

a11y:
  respects_reduced_motion: true
  fallback: "ワイプを発火させず即時切替（または短い fade）"
  focus_safe: true
  notes: "派手なワイプは前庭障害に配慮し Reduce Motion で必ず無効化。意味は内容で完結させ、ワイプは装飾に留める"

license: MIT
authors: ["@daichi"]
sources:
  - { title: "Customizing view transitions with clip-path — Chrome", url: "https://developer.chrome.com/docs/web-platform/view-transitions/" }
  - { title: "MDN: clip-path", url: "https://developer.mozilla.org/en-US/docs/Web/CSS/clip-path" }
attribution_required: false

preview:
  url: https://animation-factory.app/preview/view-transition-wipe-custom
  loop: true
  duration_ms: 3000

related:
  alternatives: [view-transition-fade, view-transition-directional-slide, image-zoom]
  composes_with:
    - { id: view-transition-directional-slide, note: "方向スライドとワイプを組み合わせて演出を強める" }
  requires: []

sections:
  skip: [variants]

ai:
  intent_examples:
    - "新しい画面が左から拭うように現れる"
    - "clip-path のワイプで切り替わるトランジション"
    - "円形に開いて次のセクションが見えるエフェクト"
  apply_targets: ["section-switch", "hero-swap", "slideshow", "chapter-transition"]
  do_not_apply_to: ["form-step", "tooltip", "data-table"]
---

## Overview

`startViewTransition()` で切替えるとき、`::view-transition-new(root)` の `clip-path` を閉じた状態から開いた状態へアニメートし、新コンテンツが拭う（wipe）ように現れる。`inset()` の左→右、`circle()` の中心から拡大、`polygon()` の斜めワイプなど、形を変えて演出できる。章の切替やヒーローの差し替えなど、強めの演出に。

使う場面: セクション/章の切替、ヒーロー差し替え、スライドショー。
避けたい場面: フォームのステップ（派手すぎる）、ツールチップ、データテーブル。

## Preview

公開プレビュー: https://animation-factory.app/preview/view-transition-wipe-custom

## Implementation

### View Transitions API (clip-path on ::view-transition-new)

```tsx
function swap(next: number) {
  const doc = document as Document & { startViewTransition?: (cb: () => void) => unknown };
  const run = () => setIndex(next);
  doc.startViewTransition ? doc.startViewTransition(run) : run();
}
```

```css
.stage { view-transition-name: vtw-stage; }
::view-transition-new(vtw-stage) {
  animation: vtw-wipe 520ms cubic-bezier(.2,.8,.2,1) both;
}
::view-transition-old(vtw-stage) { animation: none; } /* 旧は据え置き、新が上に開く */
@keyframes vtw-wipe {
  from { clip-path: inset(0 100% 0 0); }   /* 右端まで隠す */
  to   { clip-path: inset(0 0 0 0); }       /* 全面表示 */
}
@media (prefers-reduced-motion: reduce) {
  ::view-transition-new(vtw-stage) { animation: none; }
}
```

### CSS clip-path transition（縮退）

未対応では新コンテンツを重ねて `clip-path` を `transition` でワイプ。

## Usage

```tsx
<button onClick={() => swap((index + 1) % slides.length)}>次へ</button>
```

## AI Apply Prompt

### Context
`{{stage}}` の切替を clip-path ワイプにする。

### Steps
1. ステージ要素に `view-transition-name`、`::view-transition-new` に clip-path のキーフレームを定義。
2. 切替を `startViewTransition` でラップ。形は inset/circle/polygon から選ぶ。
3. Reduce Motion で必ず無効化、意味は内容で完結させる。

### Verify
- 切替で新コンテンツが拭うように開く
- 未対応/Reduce Motion で即時 or 短い fade
- 内容自体はワイプ無しでも理解できる

## Accessibility

派手なワイプは前庭障害に配慮し Reduce Motion で必ず無効化。ワイプは装飾で、情報は内容が担保。切替後はフォーカスを新コンテンツへ。

## Performance Notes

`clip-path` のアニメは合成で完結し reflow なし。複雑な `polygon()` より `inset()`/`circle()` が軽い。旧スナップショットは据え置き、新だけを開くと負荷が低い。

## Changelog

- 2026-06-01 (created): 初版。v1.1 Batch 5（View Transitions API 進化）第 5 弾。clip-path カスタムワイプ。
