---
id: css-scroll-progress-bar
name: CSS Scroll Progress Bar
version: 1.0.0
release: v1.2
variant: css-scroll-driven
description: |
  ページ読書進捗バーを scroll-timeline: scroll() で JS ゼロ実装。ルートスクローラの
  縦進行に連動して上部の細いバーが 0→100% に伸び、読者に現在地を示す feedback 演出。
  長文記事・ドキュメント・ランディングページの可読性補助に。

taxonomy:
  layer: [css]
  ux_role:
    primary: feedback
    secondary: [scroll-progress]
  trigger: [scroll-progress]
  media: [dom-css]
  authoring: code

behavior:
  lifecycle: scroll-linked
  reversible: true
  replay: every-entry

tags:
  - scroll-progress
  - progress-bar
  - scroll-timeline
  - reading-progress
  - css-only
  - animation-timeline

trigger:
  primary: scroll-progress
  touch_fallback: always-on
  config:
    timeline: "scroll(root block)"
    range: "0% 100%"

runtime:
  language: css
  framework: none
  framework_version: null
  bundler: null
dependencies: []
peer_dependencies: []

implementations:
  - tier: 1
    name: "CSS scroll-timeline (scroll())"
    dependencies: []
    browser_support: { baseline: newly-available, baseline_year: 2024 }
    performance: { gpu_accelerated: true, layout_thrash: false, cost: low }
    degrades_to: 2
  - tier: 2
    name: "JS scroll listener + transform"
    dependencies: []
    browser_support: { baseline: widely-available, baseline_year: 2017 }
    performance: { gpu_accelerated: true, layout_thrash: false, cost: medium }
    degradation: "scroll イベント購読で scrollY/scrollHeight を計算し scaleX を更新。未対応ブラウザでも進捗バーを再現できるが、メインスレッドでの計算が増える"

browser_support:
  baseline: newly-available
  baseline_year: 2024
  notes: "代表値は Tier 1（CSS scroll-timeline）。Chrome/Edge 115+, Firefox は段階対応。Safari 未対応では @supports でフォールバック"

performance:
  gpu_accelerated: true
  layout_thrash: false
  cost: low
  notes: "scaleX のみ補間し transform で完結。scroll-timeline はコンポジタスレッドで進行するため JS スクロールハンドラ不要"

parameters:
  - { name: bar_height_px, type: number, default: 4, range: [2, 8], description: "進捗バーの高さ" }
  - { name: timeline_axis, type: enum, default: "block", values: ["block", "inline", "y", "x"], description: "scroll() のスクロール軸。縦読みは block" }
  - { name: accent_color, type: color, default: "#a3e635", description: "バーのアクセント色（lime-300）" }

a11y:
  respects_reduced_motion: true
  fallback: "Reduce Motion 時は連続アニメを止め、静的で控えめな進捗インジケータに縮退。バーの存在自体は維持"
  focus_safe: true
  notes: "純粋な視覚補助。バーは aria-hidden とし、進捗を機能要件にしない。実際の読み位置はネイティブスクロールが担保する"

license: MIT
authors: ["@daichi"]
sources:
  - { title: "MDN: animation-timeline", url: "https://developer.mozilla.org/en-US/docs/Web/CSS/animation-timeline" }
  - { title: "scroll-timeline: scroll() (MDN)", url: "https://developer.mozilla.org/en-US/docs/Web/CSS/animation-timeline/scroll" }
attribution_required: false

preview:
  url: https://animation-factory.app/preview/css-scroll-progress-bar
  loop: true
  duration_ms: 2000

related:
  alternatives: [page-loading-bar, progress-bar, gsap-scrub-progress, css-scroll-driven, gsap-scroll-pin]
  composes_with:
    - { id: sticky-shrink-header, note: "縮むヘッダの直下に進捗バーを置くと、読書中のヘッダ領域に自然に統合できる" }
  requires: []

sections:
  skip: [variants]

ai:
  intent_examples:
    - "ページ上部に読書進捗バーを JS なしで付けたい"
    - "スクロール量に応じて伸びるプログレスバー"
    - "記事ページの読了率を可視化する細いバー"
  apply_targets: ["article-page", "long-form-doc", "landing-page"]
  do_not_apply_to: ["short-page", "modal", "form", "data-table"]
---

## Overview

ページ最上部に固定した細いバーが、ルートスクローラの縦スクロール進行に直結して `scaleX(0)` → `scaleX(1)` に伸びる。読者に「どこまで読んだか」を示す **feedback** 演出で、`scroll-timeline: scroll(root block)` を使い **JavaScript ゼロ** で実装する。スクロールイベントの購読や `requestAnimationFrame` ループが一切不要なのが要点。

使う場面: 長文記事 / ドキュメント / 縦長ランディングページの読書進捗補助。
避けたい場面: 短いページ（進捗の意味が薄い）、モーダル内、フォーム、ナビバー。

## Preview

公開プレビュー: https://animation-factory.app/preview/css-scroll-progress-bar

## Implementation

### CSS scroll-timeline (scroll())

```css
@keyframes grow-progress {
  from { transform: scaleX(0); }
  to   { transform: scaleX(1); }
}

.scroll-progress-bar {
  position: sticky;
  top: 0;
  left: 0;
  z-index: 10;
  height: 4px;
  transform-origin: 0 50%;
  background: linear-gradient(90deg, #a3e635, #65a30d);
  /* デフォルト（未対応想定）はフル表示。進捗の存在自体は伝わる */
  transform: scaleX(1);
}

@supports (animation-timeline: scroll()) {
  .scroll-progress-bar {
    animation: grow-progress linear both;
    /* ルートスクローラの縦進行に直結。JS 不要 */
    animation-timeline: scroll(root block);
    transform: scaleX(0);
  }
}

@media (prefers-reduced-motion: reduce) {
  .scroll-progress-bar {
    animation: none;
    transform: scaleX(1);
    opacity: 0.6;
  }
}
```

```html
<div class="scroll-progress-bar" aria-hidden="true"></div>
<article><!-- 長文コンテンツ --></article>
```

### JS scroll listener + transform（縮退）

```ts
/* scroll-timeline 未対応ブラウザ向け。@supports not で分岐して読み込む想定。
   scroll/scrollHeight から進捗率を出して scaleX を更新する。 */
const bar = document.querySelector<HTMLElement>(".scroll-progress-bar");
function update() {
  const max = document.documentElement.scrollHeight - window.innerHeight;
  const ratio = max > 0 ? window.scrollY / max : 0;
  if (bar) bar.style.transform = `scaleX(${ratio})`;
}
window.addEventListener("scroll", update, { passive: true });
update();
```

## Usage

```tsx
// 進捗バーをページ最上部に置き、後続に長文コンテンツを流す
<div className="scroll-progress-bar" aria-hidden="true" />
<article>{/* ... */}</article>
```

## AI Apply Prompt

### Context
`{{target_page}}` の最上部に読書進捗バーを CSS だけで追加し、スクロール進行に連動させる。

### Steps
1. 上記 CSS を `{{target_file}}` のスタイルに追記。
2. ページ最上部（`article` の直前）に `<div class="scroll-progress-bar" aria-hidden="true"></div>` を配置。
3. バーは `position: sticky; top: 0` でスクロール時も上部に残す。`transform-origin: 0 50%` で左基点に伸ばす。
4. `@supports (animation-timeline: scroll())` の中だけで scroll-timeline を有効化し、外側はフル表示のフォールバックを維持。
5. `@media (prefers-reduced-motion: reduce)` で連続アニメを止め、静的な進捗表示に縮退させる。

### Examples

Before: 長文記事に進捗インジケータがない
After: 上部に scroll(root) 連動の進捗バーが伸び、読了位置が分かる

### Verify
- スクロールに連動してバーが左から右へ伸び、最下部で 100% になる
- scroll-timeline 未対応ブラウザでバーがフル表示でも崩れない（@supports フォールバック）
- Reduce Motion ON で連続アニメが止まり、静的な進捗表示になる
- JavaScript を無効にしても（Tier 1 のままなら）バーが動作する
- バーが `aria-hidden` で、スクリーンリーダーの読み上げを汚さない

## Accessibility

- バーは純粋な視覚補助のため `aria-hidden="true"` とし、進捗を機能要件にしない。実際の読み位置はネイティブスクロールが担保する。
- `prefers-reduced-motion` 時は連続アニメを止め、静的で控えめなインジケータに縮退（バーの存在自体は維持）。
- 細いバーのみで状態を伝えるため、色覚に依存しすぎないようコントラストを確保する。

## Performance Notes

- `scaleX` のみ補間し `transform` で完結するため、レイアウトもペイントも発生しない（コンポジタのみ）。
- scroll-timeline はコンポジタスレッドで進行するため、スクロールイベント購読や rAF ループが不要で、メインスレッドを占有しない。
- Tier 2（JS フォールバック）は `scroll` リスナで毎フレーム計算が走るため、`passive: true` を付け、必要なら `requestAnimationFrame` でスロットルする。

## Changelog

- 2026-06-02 (created): 初版。v1.2（Tier B）、scroll-timeline 系 feedback アニメの拡充。
