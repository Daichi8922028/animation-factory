---
id: css-scroll-snap-gallery
name: CSS Scroll Snap Gallery
version: 1.0.0
release: v1.2
variant: css-scroll-driven
description: |
  横スクロールの scroll-snap ギャラリー。各カードに view-timeline を貼り、
  自身がビューポート中央へ来たときだけ拡大・不透明化して強調する。JS アニメーション
  ライブラリ不要の純 CSS スクロール連動。プロダクト一覧・作品ギャラリー・特集カードに。

taxonomy:
  layer: [css]
  ux_role:
    primary: state-transition
    secondary: [storytelling, navigation]
  trigger: [scroll-progress]
  media: [dom-css]
  authoring: code

behavior:
  lifecycle: scroll-linked
  reversible: true
  replay: every-entry

tags:
  - scroll-snap
  - view-timeline
  - horizontal-gallery
  - scroll-driven
  - carousel
  - css-only
  - snap-points

trigger:
  primary: scroll-progress
  touch_fallback: always-on
  config:
    snap_type: "x mandatory"
    snap_align: center

runtime:
  language: css
  framework: none
  framework_version: null
  bundler: null
dependencies: []
peer_dependencies: []

implementations:
  - tier: 1
    name: "CSS scroll-snap + view-timeline"
    dependencies: []
    browser_support: { baseline: newly-available, baseline_year: 2024 }
    performance: { gpu_accelerated: true, layout_thrash: false, cost: low }
    degrades_to: 2
  - tier: 2
    name: "CSS scroll-snap のみ（強調なし）"
    dependencies: []
    browser_support: { baseline: widely-available, baseline_year: 2020 }
    performance: { gpu_accelerated: false, layout_thrash: false, cost: low }
    degradation: "snap は効くが中央カードの拡大強調は出ない。等倍・全表示で並ぶだけの簡易代替"

browser_support:
  baseline: newly-available
  baseline_year: 2024
  notes: "代表値は Tier 1。animation-timeline: view() は Chrome 115+ / Firefox 144+ 対応。Safari 等は @supports で Tier 2 相当に縮退"

performance:
  gpu_accelerated: true
  layout_thrash: false
  cost: low
  notes: "transform / opacity のみ補間し、進行はコンポジタスレッドの view-timeline で駆動。スクロールイベント購読なしで JS ゼロ"

parameters:
  - { name: snap_align, type: enum, default: "center", values: ["start", "center", "end"], description: "カードが止まる位置。中央強調なら center" }
  - { name: card_width_px, type: number, default: 220, range: [120, 360], description: "各カードの固定幅" }
  - { name: peak_scale, type: number, default: 1.06, range: [1.0, 1.3], description: "中央到達時の最大拡大率" }

a11y:
  respects_reduced_motion: true
  fallback: "Reduce Motion 時は拡大強調と smooth スクロールを無効化、等倍・全表示で並べる"
  focus_safe: true
  notes: "強調は視覚効果のみで、各カードの内容・到達順・フォーカス順は変わらない。キーボードでの横スクロール到達性を確保し、tabindex でカードを操作可能にする場合は視覚順と Tab 順を一致させる"

license: MIT
authors: ["@daichi"]
sources:
  - { title: "CSS scroll-driven animations (MDN)", url: "https://developer.mozilla.org/en-US/docs/Web/CSS/CSS_scroll-driven_animations" }
  - { title: "CSS Scroll Snap (MDN)", url: "https://developer.mozilla.org/en-US/docs/Web/CSS/CSS_scroll_snap" }
attribution_required: false

preview:
  url: https://animation-factory.app/preview/css-scroll-snap-gallery
  loop: true
  duration_ms: 2600

related:
  alternatives: [css-scroll-driven, gsap-scroll-horizontal, carousel-slider]
  composes_with:
    - { id: fade-up, note: "カード内テキストを fade-up で重ねると進入がより豊かになる" }
    - { id: image-zoom, note: "中央強調と画像 hover ズームを併用してフォーカスを誘導" }
  requires: []

sections:
  skip: [variants]

ai:
  intent_examples:
    - "横スクロールのギャラリーで中央のカードだけ大きく見せたい"
    - "scroll-snap でカードを 1 枚ずつ吸着させ、中央で強調したい"
    - "JS なしのスクロール連動カルーセルが欲しい"
  apply_targets: ["card-gallery", "product-carousel", "feature-showcase"]
  do_not_apply_to: ["form", "data-table", "navigation-bar", "body-text"]
---

## Overview

横スクロールのコンテナに `scroll-snap-type: x mandatory` を効かせ、各カードを `scroll-snap-align: center` で 1 枚ずつ吸着させる。さらに各カード自身を `view-timeline`（横軸）として登録し、自身がビューポートを横断する進行（0% → 中央 → 100%）に `transform: scale()` と `opacity` を連動させて、**中央付近のカードだけを拡大強調**する。進行はコンポジタ駆動のため JS アニメーションライブラリは不要。

使う場面: 作品・プロダクトの横ギャラリー / 特集カードの回遊 / モバイルでのカード閲覧。
避けたい場面: フォーム、データテーブル、本文、ナビゲーションバー（吸着が操作を阻害する）。

## Preview

公開プレビュー: https://animation-factory.app/preview/css-scroll-snap-gallery

## Implementation

### CSS scroll-snap + view-timeline（Tier 1）

```css
.track {
  display: flex;
  gap: 1rem;
  overflow-x: auto;
  scroll-snap-type: x mandatory;
  scroll-behavior: smooth;
  /* 先頭/末尾カードも中央に止まれるよう左右に余白 */
  padding-inline: clamp(1rem, 38%, 40%);
}

.card {
  flex: 0 0 auto;
  width: 220px;
  scroll-snap-align: center;
  /* デフォルト（未対応想定）は等倍・全表示 */
  transform: none;
  opacity: 1;
}

@supports (animation-timeline: view(inline)) {
  .card {
    view-timeline-name: --card;
    view-timeline-axis: inline;
    animation: card-emphasis linear both;
    animation-timeline: --card;
    animation-range: cover 0% cover 100%;
  }
}

@keyframes card-emphasis {
  0%   { transform: scale(0.86); opacity: 0.45; }
  50%  { transform: scale(1.06); opacity: 1;    } /* 中央でピーク */
  100% { transform: scale(0.86); opacity: 0.45; }
}

@media (prefers-reduced-motion: reduce) {
  .track { scroll-behavior: auto; }
  .card  { animation: none; transform: none; opacity: 1; }
}
```

HTML は単純な横並び（JS 不要）:

```tsx
<div className="track">
  {items.map((it) => (
    <article key={it.id} className="card">{it.label}</article>
  ))}
</div>
```

### CSS scroll-snap のみ（Tier 2・縮退）

```css
/* animation-timeline 未対応ブラウザ向け。snap は効くが中央強調は出ない。 */
.track {
  display: flex;
  gap: 1rem;
  overflow-x: auto;
  scroll-snap-type: x mandatory;
}
.card {
  flex: 0 0 auto;
  width: 220px;
  scroll-snap-align: center;
  /* 拡大強調なし。等倍・全表示で並ぶだけ */
}
```

## Usage

```tsx
<div className="track">
  {products.map((p) => (
    <article key={p.id} className="card">{p.name}</article>
  ))}
</div>
```

## AI Apply Prompt

### Context
`{{target_selector}}` を横スクロールの scroll-snap ギャラリーにし、中央のカードを view-timeline で拡大強調する。

### Steps
1. コンテナに `display:flex; overflow-x:auto; scroll-snap-type:x mandatory;` と左右の中央寄せ padding を付ける。
2. 各カードに `flex:0 0 auto; width:<card_width_px>; scroll-snap-align:<snap_align>;` を付ける。
3. `@supports (animation-timeline: view(inline))` 内で各カードに `view-timeline-name/axis` と `card-emphasis` の `@keyframes`（50% でピーク `<peak_scale>`）を結ぶ。
4. 未対応ブラウザ向けに、`@supports` 外のデフォルトは等倍・全表示にしておく。
5. `@media (prefers-reduced-motion: reduce)` で強調と smooth スクロールを無効化する分岐を必ず入れる。

### Examples

Before: 横並びカードだが吸着も強調もない
After: scroll-snap で 1 枚ずつ吸着し、中央のカードだけ拡大強調

### Verify
- 横スクロールでカードが 1 枚ずつ中央に吸着する
- 中央付近のカードだけが拡大・不透明になり、端のカードは縮小・減衰する
- Safari 等の未対応ブラウザで等倍・全表示のまま破綻なく並ぶ
- Reduce Motion ON で拡大強調と smooth スクロールが止まる
- JS アニメーションライブラリを一切追加していない

## Accessibility

- 強調は視覚効果のみ。各カードの内容・到達順・フォーカス順は変化しない。
- `scroll-snap` がキーボード／支援技術のスクロール到達を阻害しないことを確認する。カードを操作可能にする場合は視覚順と Tab 順を一致させる。
- Reduce Motion 時は `@media (prefers-reduced-motion: reduce)` で強調・smooth スクロールを止め、等倍・全表示にする。

## Performance Notes

- 進行はコンポジタ駆動の `view-timeline` が担い、スクロールイベントを JS で購読しないため軽い。
- 補間は `transform` / `opacity` のみで、レイアウトを発生させない（layout thrash なし）。
- `will-change: transform` はカード枚数が多い場合のみ補助的に。常用は避ける。

## Changelog

- 2026-06-02 (created): 初版。v1.2（Tier B）、scroll-driven 系の横ギャラリー拡充。
