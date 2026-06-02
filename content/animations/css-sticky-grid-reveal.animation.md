---
id: css-sticky-grid-reveal
name: CSS Sticky Grid Reveal
version: 1.0.0
release: v1.2
variant: css-scroll-driven
description: |
  position: sticky で固定したグリッドの各セルを、view-timeline でスクロール進入に
  応じて順次 reveal / scale するスクロリーテリング演出。JS ゼロ、純 CSS の scroll-driven
  animation で実装する Codrops 風の sticky grid。
taxonomy:
  layer: [css]
  ux_role:
    primary: storytelling
    secondary: [scroll-progress]
  trigger: [scroll-progress]
  media: [dom-css]
  authoring: code

behavior:
  lifecycle: scroll-linked
  reversible: true
  replay: every-entry

tags:
  - sticky
  - grid
  - scroll-driven
  - view-timeline
  - storytelling
  - reveal
  - codrops

trigger:
  primary: scroll-progress
  touch_fallback: always-on
  config:
    timeline: view()
    range: "entry 0% cover 40%"

runtime:
  language: css
  framework: none
  framework_version: null
  bundler: null
dependencies: []
peer_dependencies: []

implementations:
  - tier: 1
    name: "CSS scroll-driven (sticky + view-timeline)"
    dependencies: []
    browser_support: { baseline: newly-available, baseline_year: 2024 }
    performance: { gpu_accelerated: true, layout_thrash: false, cost: low }
    degrades_to: 2
  - tier: 2
    name: "CSS position: sticky のみ（即時表示）"
    dependencies: []
    browser_support: { baseline: widely-available, baseline_year: 2018 }
    performance: { gpu_accelerated: true, layout_thrash: false, cost: low }
    degradation: "view-timeline 未対応では各セルの順次 reveal は出せず、sticky 固定のままセルは最初から表示される（@supports 分岐の既定値）"

browser_support:
  baseline: newly-available
  baseline_year: 2024
  notes: "代表値は Tier 1（animation-timeline: view()）。Chrome 115+ / Edge 115+ で対応。Safari・Firefox 未対応では Tier 2（即時表示）に縮退"

performance:
  gpu_accelerated: true
  layout_thrash: false
  cost: low
  notes: "scroll-driven animation はコンポジタスレッドで駆動され、scroll イベントを購読しない。補間は opacity / transform のみで GPU 内に完結"

parameters:
  - { name: columns, type: number, default: 3, range: [2, 4], description: "グリッドの列数" }
  - { name: stagger_pct, type: number, default: 8, range: [0, 20], description: "セル間の進行オフセット（animation-range の delay 相当）" }
  - { name: reveal_range, type: string, default: "entry 0% cover 40%", values: ["entry 0% cover 30%", "entry 0% cover 40%", "entry 10% cover 50%"], description: "各セルが reveal を完了するスクロール区間" }

a11y:
  respects_reduced_motion: true
  fallback: "reduce 時は animation を無効化し、全セルを opacity:1 / transform:none で即時表示。sticky 固定自体は維持"
  focus_safe: true
  notes: "sticky 領域内に対話要素を置く場合は Tab 順とビジュアル順を一致させる。reveal は視覚演出のみで、内容の可読性に依存させない"

license: MIT
authors: ["@daichi"]
sources:
  - { title: "MDN: CSS scroll-driven animations", url: "https://developer.mozilla.org/en-US/docs/Web/CSS/animation-timeline" }
  - { title: "Scroll-driven Animations (scroll-driven-animations.style)", url: "https://scroll-driven-animations.style/" }
attribution_required: false

preview:
  url: https://animation-factory.app/preview/css-sticky-grid-reveal
  loop: true
  duration_ms: 2600

related:
  alternatives: [css-scroll-driven, gsap-scroll-pin, scroll-reveal]
  composes_with:
    - { id: fade-up, note: "個々のセルの reveal を fade-up 系の keyframe で表現すると自然" }
    - { id: entrance-stagger-fade, note: "sticky 解除後に続くセクションを stagger で受け渡すと連続感が出る" }
  requires: []

sections:
  skip: [variants]

ai:
  intent_examples:
    - "グリッドを画面に固定して、スクロールでセルを順番に出したい"
    - "JS なしの scroll-driven で sticky なグリッドを reveal したい"
    - "Codrops 風の sticky grid スクロール演出"
  apply_targets: ["gallery-grid", "feature-grid", "case-study-section"]
  do_not_apply_to: ["form", "data-table", "navigation-bar", "short-page"]
---

## Overview

`position: sticky` でグリッドコンテナをビューポートに固定し、外側のスクロール進行を view-timeline（`animation-timeline: view()`）経由で各セルの **reveal / scale** に変換する。JS は一切使わず、scroll-driven animation だけで Codrops 風の sticky grid を構成する。各セルに `animation-range` のオフセットを与えることで、スクロールに応じてセルが順次浮かび上がる。

使う場面: ギャラリーグリッド / 機能紹介の格子レイアウト / ケーススタディの導入。
避けたい場面: フォーム、データテーブル、ナビバー、極端に短いページ（固定で進めなくなる感）。

## Preview

公開プレビュー: https://animation-factory.app/preview/css-sticky-grid-reveal

## Implementation

### CSS scroll-driven (sticky + view-timeline)

```css
/* 親をスクロール領域にし、グリッドを sticky で固定。各セルを view-timeline で reveal */
.sticky-stage {
  /* スクロール量を稼ぐための高さ。固定中にセルが順次出る */
  min-height: 220vh;
}
.sticky-grid {
  position: sticky;
  top: 0;
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 1rem;
  min-height: 100vh;
  place-content: center;
}

@keyframes cell-reveal {
  from { opacity: 0; transform: translateY(28px) scale(0.92); }
  to   { opacity: 1; transform: translateY(0)   scale(1); }
}

.sticky-cell {
  /* 既定（未対応・Tier 2）では表示状態 */
  opacity: 1;
  transform: none;
}

@supports (animation-timeline: view()) {
  .sticky-cell {
    animation: cell-reveal linear both;
    animation-timeline: view();
    animation-range: entry 0% cover 40%;
  }
  /* セル間に進行オフセット（stagger）を与える */
  .sticky-cell:nth-child(2) { animation-range: entry 8%  cover 48%; }
  .sticky-cell:nth-child(3) { animation-range: entry 16% cover 56%; }
  .sticky-cell:nth-child(4) { animation-range: entry 24% cover 64%; }
  .sticky-cell:nth-child(5) { animation-range: entry 32% cover 72%; }
  .sticky-cell:nth-child(6) { animation-range: entry 40% cover 80%; }
}

@media (prefers-reduced-motion: reduce) {
  .sticky-cell {
    animation: none;
    opacity: 1;
    transform: none;
  }
}
```

```html
<div class="sticky-stage">
  <div class="sticky-grid">
    <article class="sticky-cell">1</article>
    <article class="sticky-cell">2</article>
    <article class="sticky-cell">3</article>
    <article class="sticky-cell">4</article>
    <article class="sticky-cell">5</article>
    <article class="sticky-cell">6</article>
  </div>
</div>
```

### CSS position: sticky のみ（縮退）

```css
/* view-timeline 未対応ブラウザ向け。sticky で固定はするが、セルは最初から表示。
   上記の @supports 外で .sticky-cell を opacity:1 / transform:none に保つことで自動的にこの状態になる。 */
.sticky-grid {
  position: sticky;
  top: 0;
  min-height: 100vh;
}
.sticky-cell {
  opacity: 1;
  transform: none; /* 順次 reveal はなし、即時表示 */
}
```

## Usage

```tsx
<div className="sticky-stage">
  <div className="sticky-grid">
    {items.map((it) => (
      <article key={it.id} className="sticky-cell">{it.label}</article>
    ))}
  </div>
</div>
```

## AI Apply Prompt

### Context
`{{target_selector}}` のグリッドを sticky で固定し、各セルをスクロール進入に応じて順次 reveal する。JS は追加しない。

### Steps
1. グリッドの親に `.sticky-stage`（`min-height: 220vh` 等のスクロール領域）を、グリッド本体に `.sticky-grid`（`position: sticky; top: 0`）を付与する。
2. 上記 CSS を `{{target_file}}` に追記。各セルに `.sticky-cell` を付け、`@supports (animation-timeline: view())` 内で `animation-timeline: view()` と `animation-range` を設定する。
3. `nth-child` で `animation-range` のオフセットをずらし、stagger を作る。
4. `@supports` の外側の既定値を `opacity:1 / transform:none` にして未対応ブラウザのフォールバックを担保する。
5. `@media (prefers-reduced-motion: reduce)` で animation を無効化する分岐を維持する。

### Examples

Before: 通常のグリッド（スクロールで一括表示）
After: `.sticky-stage` + `.sticky-grid` + `.sticky-cell` で固定 + 順次 reveal

### Verify
- グリッドがビューポートに固定され、スクロールでセルが順に浮かび上がる
- Chrome/Edge で view-timeline により reveal、Safari/Firefox では即時表示（崩れない）
- Reduce Motion ON で全セルが即時表示、sticky は維持
- JS を追加していない（scroll イベント購読なし）

## Accessibility

- scroll-driven animation は `prefers-reduced-motion` を自動尊重しないため、上記の `@media` 分岐で **明示的に** 無効化する。
- reveal は視覚演出のみ。セルの内容は reveal の有無に関わらず読める状態（既定 `opacity:1`）にしておく。
- sticky 領域内に対話要素を置く場合は Tab 順とビジュアル順を一致させる。

## Performance Notes

- scroll-driven animation はコンポジタスレッドで駆動され、`scroll` イベントを購読しないため JS ベースの scroll 連動より軽い。
- 補間は `opacity` / `transform` のみで GPU 内に完結し、レイアウトを再計算しない（layout thrash なし）。
- `@supports` で対応ブラウザにのみ animation を適用し、未対応では静的表示に縮退するため追加コストはない。

## Changelog

- 2026-06-02 (created): 初版。v1.2（Tier B）、純 CSS scroll-driven の sticky grid reveal を追加。
