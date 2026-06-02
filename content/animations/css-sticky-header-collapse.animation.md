---
id: css-sticky-header-collapse
name: CSS Sticky Header Collapse
version: 1.0.0
release: v1.2
variant: css-scroll-driven
description: |
  scroll-timeline（animation-timeline: scroll()）で、sticky ヘッダがスクロール進行に応じて
  高さ・余白・ロゴサイズを縮めて collapse する純 CSS 演出。JS ゼロでスクロール量に直結し、
  ヘッダの state-transition（展開 → 縮小）を表現する。
taxonomy:
  layer: [css]
  ux_role:
    primary: state-transition
    secondary: [navigation, feedback]
  trigger: [scroll-progress]
  media: [dom-css]
  authoring: code

behavior:
  lifecycle: scroll-linked
  reversible: true
  replay: every-entry

tags:
  - sticky-header
  - scroll-timeline
  - animation-timeline
  - collapse
  - shrink
  - header
  - scroll-driven

trigger:
  primary: scroll-progress
  touch_fallback: always-on
  config:
    timeline: "scroll(root block)"
    range: "0 200px"

runtime:
  language: css
  framework: none
  framework_version: null
  bundler: null
dependencies: []
peer_dependencies: []

implementations:
  - tier: 1
    name: "Scroll-driven CSS (animation-timeline: scroll())"
    dependencies: []
    browser_support: { baseline: newly-available, baseline_year: 2024 }
    performance: { gpu_accelerated: false, layout_thrash: false, cost: low }
    degrades_to: 2
  - tier: 2
    name: "CSS position: sticky（固定のみ・縮退）"
    dependencies: []
    browser_support: { baseline: widely-available, baseline_year: 2018 }
    performance: { gpu_accelerated: true, layout_thrash: false, cost: low }
    degradation: "scroll-timeline 未対応では collapse せず、展開状態の sticky ヘッダのまま張り付くだけ"

browser_support:
  baseline: newly-available
  baseline_year: 2024
  notes: "代表値は Tier 1（animation-timeline: scroll()）。Chrome 115+/Edge で newly-available。Safari/Firefox 未対応では @supports 分岐で展開状態にフォールバック"

performance:
  gpu_accelerated: false
  layout_thrash: false
  cost: low
  notes: "コンポジタスレッドで進行するためメインスレッドのスクロールハンドラ不要。height/padding を補間する場合はレイアウトを伴うため、transform/scale 中心に設計すると軽い"

parameters:
  - { name: collapse_range_px, type: number, default: 200, range: [80, 600], description: "ヘッダが縮みきるまでのスクロール距離" }
  - { name: expanded_height_px, type: number, default: 96, range: [64, 160], description: "展開時のヘッダ高さ" }
  - { name: collapsed_height_px, type: number, default: 56, range: [40, 80], description: "縮小後のヘッダ高さ" }

a11y:
  respects_reduced_motion: true
  fallback: "縮小アニメーションを無効化し、縮小状態（または展開状態）を固定で表示。レイアウトの跳ねを避ける"
  focus_safe: true
  notes: "高さ補間中もフォーカス順・操作対象は変化しない。collapse でラベルやリンクを DOM から外さず、視覚的サイズのみ変える"

license: MIT
authors: ["@daichi"]
sources:
  - { title: "Scroll-driven animations (MDN)", url: "https://developer.mozilla.org/en-US/docs/Web/CSS/animation-timeline" }
  - { title: "scroll-timeline 仕様（W3C）", url: "https://www.w3.org/TR/scroll-animations-1/" }
attribution_required: false

preview:
  url: https://animation-factory.app/preview/css-sticky-header-collapse
  loop: true
  duration_ms: 2400

related:
  alternatives: [sticky-shrink-header, gsap-scroll-pin, css-scroll-driven, scroll-reveal]
  composes_with:
    - { id: hover-underline, note: "縮小後ヘッダ内のナビリンクに hover-underline を併用すると自然" }
  requires: []

sections:
  skip: [variants]

ai:
  intent_examples:
    - "スクロールするとヘッダが縮むようにしたい"
    - "sticky ヘッダをスクロール進行に応じて collapse させたい"
    - "JS なしの scroll-timeline でヘッダを縮める"
  apply_targets: ["site-header", "app-bar", "navigation-bar"]
  do_not_apply_to: ["body-text", "footer", "modal", "form-field"]
---

## Overview

ページ先頭で背の高い（展開状態の）sticky ヘッダが、スクロール進行に合わせて高さ・余白・ロゴサイズを縮め、最終的にコンパクトなバーへ **collapse** する。`animation-timeline: scroll()` でスクロール量とアニメーション進行を直結するため、JS のスクロールハンドラは不要。ヘッダの「展開 → 縮小」という **state-transition** を、メインスレッドを使わずに表現できる。

使う場面: コンテンツファーストにしたいサイトヘッダ / アプリのトップバー / ドキュメントのナビ。
避けたい場面: 本文、フッタ、モーダル内、入力フォーム。

## Preview

公開プレビュー: https://animation-factory.app/preview/css-sticky-header-collapse

## Implementation

### Scroll-driven CSS（animation-timeline: scroll()）

```css
@keyframes header-collapse {
  to {
    height: 56px;
    padding-block: 6px;
  }
}
@keyframes logo-shrink {
  to { scale: 0.72; }
}

.site-header {
  position: sticky;
  top: 0;
  height: 96px;
  padding-block: 20px;
  /* 未対応ブラウザ向けデフォルト = 展開状態のまま張り付く */
}

@supports (animation-timeline: scroll()) {
  .site-header {
    animation: header-collapse linear both;
    animation-timeline: scroll(root block);
    /* 先頭から 200px スクロールで縮みきる */
    animation-range: 0 200px;
  }
  .site-header .logo {
    transform-origin: left center;
    animation: logo-shrink linear both;
    animation-timeline: scroll(root block);
    animation-range: 0 200px;
  }
}

@media (prefers-reduced-motion: reduce) {
  .site-header,
  .site-header .logo {
    animation: none;
  }
}
```

### CSS position: sticky（縮退）

```css
/* scroll-timeline 未対応の縮退。collapse せず、展開状態の sticky ヘッダのまま張り付くだけ。
   @supports ブロックの外側に置けば、未対応ブラウザでもヘッダは機能する。 */
.site-header {
  position: sticky;
  top: 0;
  height: 96px;
}
```

## Usage

```tsx
<header className="site-header">
  <span className="logo">Brand</span>
  <nav>{/* links */}</nav>
</header>
```

## AI Apply Prompt

### Context
`{{target_selector}}`（サイトヘッダ）をスクロール進行に応じて collapse させる。JS なし、`animation-timeline: scroll()` を使用。

### Steps
1. ヘッダを `position: sticky; top: 0;` にし、展開時の高さ・余白をデフォルトとして指定（`@supports` の外）。
2. `@supports (animation-timeline: scroll())` 内で `animation-timeline: scroll(root block)` と `animation-range` を指定し、`header-collapse` / `logo-shrink` を適用。
3. `animation-range`（例 `0 200px`）で縮みきるスクロール距離を調整。
4. `@media (prefers-reduced-motion: reduce)` で `animation: none;` を必ず併設。

### Examples

Before: 高さ固定の sticky ヘッダ
After: スクロールで高さ・ロゴが縮む collapse ヘッダ（未対応ブラウザは展開状態のまま動作）

### Verify
- スクロールするとヘッダ高さ・ロゴが滑らかに縮む
- スクロールを戻すと展開状態に戻る（reversible）
- 未対応ブラウザ（Safari/Firefox）で展開状態の sticky ヘッダとして機能し、崩れない
- Reduce Motion ON で縮小アニメーションが止まり、レイアウトが跳ねない
- collapse 後もナビリンクのフォーカス順・操作対象が変わらない

## Accessibility

- 視覚的な高さ変化のみで、DOM 構造やフォーカス順は変えない（リンクを取り除かない）。
- `prefers-reduced-motion: reduce` で `animation: none;` にし、レイアウトの急な跳ねを避ける。
- 高さ補間中もタップ/クリック対象の中心がズレすぎないよう、`collapse_range_px` は十分に取る。

## Performance Notes

- scroll-driven animation はコンポジタスレッドで進行し、メインスレッドのスクロールイベント購読が不要なため軽い。
- `height` / `padding` の補間はレイアウトを伴うため、可能なら `transform: scale()` 中心で縮小を表現するとさらに軽くなる（ロゴは `scale` を使用）。
- JS のリスナや observer を一切持たないため、unmount 時のクリーンアップが不要。

## Changelog

- 2026-06-02 (created): 初版。v1.2（Tier B）、scroll-timeline による sticky ヘッダ collapse。
