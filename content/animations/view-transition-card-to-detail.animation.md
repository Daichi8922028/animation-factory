---
id: view-transition-card-to-detail
name: View Transition Card to Detail
version: 1.0.0
release: v1.1
variant: vanilla-css
description: |
  カード一覧から詳細へ遷移する際、選んだカードが共有要素として詳細のヒーローへ拡大しながら繋がる。
  view-transition-shared をリスト→詳細フローに拡張した、e コマース/ギャラリー定番の navigation。

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
  reversible: true
  replay: every-entry

tags:
  - view-transitions
  - shared-element
  - card-to-detail
  - hero
  - gallery
  - morph
  - navigation

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
    name: "View Transitions API (shared name on active card)"
    dependencies: []
    browser_support: { baseline: newly-available, baseline_year: 2024 }
    performance: { gpu_accelerated: true, layout_thrash: false, cost: low }
    degrades_to: 2
  - tier: 2
    name: "Motion layoutId"
    dependencies: [ { name: motion, version: "^11.0.0" } ]
    browser_support: { baseline: widely-available, baseline_year: 2020 }
    degradation: "未対応ブラウザでは layoutId でカード→ヒーローの FLIP morph"
    performance: { gpu_accelerated: true, layout_thrash: false, cost: low }

browser_support:
  baseline: newly-available
  baseline_year: 2024
  notes: "Chrome 111+ / Safari 18+。アクティブなカードと詳細ヒーローに同じ view-transition-name を一時的に付ける"

performance:
  gpu_accelerated: true
  layout_thrash: false
  cost: low
  notes: "共有 name は遷移の瞬間だけ active 要素に付与。複数カードに同名を残さない（衝突回避）"

parameters:
  - { name: duration_ms,     type: number, default: 420, range: [200, 900], description: "morph の長さ" }
  - { name: shared_name,     type: string, default: "card-hero", description: "共有 view-transition-name" }
  - { name: easing,          type: string, default: "cubic-bezier(.2,.8,.2,1)", description: "easing" }

a11y:
  respects_reduced_motion: true
  fallback: "View Transition を発火させず即時に詳細表示"
  focus_safe: true
  notes: "遷移後は詳細の見出しへフォーカスを移す。共有要素の alt/aria-label を一覧と詳細で一致させる。戻る導線を明示"

license: MIT
authors: ["@daichi"]
sources:
  - { title: "View Transitions: shared elements — Chrome", url: "https://developer.chrome.com/docs/web-platform/view-transitions/" }
attribution_required: false

preview:
  url: https://animation-factory.app/preview/view-transition-card-to-detail
  loop: true
  duration_ms: 3000

related:
  alternatives: [view-transition-shared, modal-scale-blur, image-zoom]
  composes_with:
    - { id: view-transition-shared, note: "view-transition-shared の基礎をカード一覧→詳細フローに適用" }
  requires: [view-transition-shared]

sections:
  skip: [variants]

ai:
  intent_examples:
    - "カードをタップすると詳細のヒーローへ拡大して繋がる"
    - "商品一覧から詳細への共有要素トランジション"
    - "ギャラリーのサムネが詳細画像へ morph する"
  apply_targets: ["product-grid", "gallery", "card-list", "blog-index"]
  do_not_apply_to: ["dense-table", "tooltip", "toast"]
---

## Overview

カード一覧で選んだカードに、遷移の瞬間だけ詳細ヒーローと同じ `view-transition-name` を付ける。`startViewTransition()` 内で一覧→詳細を切替えると、そのカードが詳細のヒーロー位置・サイズへ拡大しながら繋がる。e コマースの商品詳細、ギャラリー、ブログ index→記事に向く。

使う場面: 商品グリッド→詳細、ギャラリー→ライトボックス、記事一覧→本文。
避けたい場面: 密なテーブル、ツールチップ。

## Preview

公開プレビュー: https://animation-factory.app/preview/view-transition-card-to-detail

## Implementation

### View Transitions API

```tsx
// 遷移直前にアクティブカードへ共有 name を付け、詳細ヒーローにも同じ name を当てる
function open(id: string) {
  setActiveName(id); // .card[data-active] { view-transition-name: card-hero }
  const doc = document as Document & { startViewTransition?: (cb: () => void) => unknown };
  doc.startViewTransition ? doc.startViewTransition(() => setMode("detail")) : setMode("detail");
}
```

```css
.cardActive { view-transition-name: card-hero; }
.detailHero { view-transition-name: card-hero; }
::view-transition-old(card-hero),
::view-transition-new(card-hero) { animation-duration: 420ms; }
@media (prefers-reduced-motion: reduce) {
  ::view-transition-group(card-hero) { animation: none; }
}
```

### Motion layoutId（縮退）

未対応ブラウザではカードと詳細ヒーローに同じ `layoutId` を付けて FLIP。

## Usage

```tsx
<button onClick={() => open(item.id)}><Card item={item} /></button>
```

## AI Apply Prompt

### Context
`{{card_grid}}` から詳細への遷移を共有要素 morph にする。

### Steps
1. 遷移直前にアクティブカードへ共有 `view-transition-name` を付与（他カードには付けない）。
2. 詳細ヒーローに同じ name を当て、切替を `startViewTransition` でラップ。
3. 遷移後に詳細見出しへフォーカス移動、戻る導線を用意。

### Verify
- カードが詳細ヒーローへ拡大して繋がる
- 同名の衝突がない（active 要素のみ）
- Reduce Motion / 未対応で即時表示

## Accessibility

共有 name は遷移の瞬間だけ active 要素に付ける（複数に残すと衝突）。遷移後は詳細見出しへフォーカス。alt/aria-label を一覧と詳細で一致させ、戻る導線を明示。

## Performance Notes

共有要素は 1 ペアのみ。スナップショットは transform 補間で reflow を避ける。詳細画像は遷移前にプリロードしておくと morph が滑らか。

## Changelog

- 2026-06-01 (created): 初版。v1.1 Batch 5（View Transitions API 進化）第 2 弾。view-transition-shared のカード→詳細拡張。
