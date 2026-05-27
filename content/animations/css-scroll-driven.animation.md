---
id: css-scroll-driven
name: CSS Scroll-Driven Reveal
version: 1.0.0
release: beta
variant: vanilla-css
description: |
  `animation-timeline: view()` を使い、ビューポート進入の進行を CSS だけでアニメに繋ぐ。
  JS ゼロでスクロール連動できる新 API。Baseline newly-available のため @supports で安全網。

taxonomy:
  layer: [css]
  ux_role:
    primary: state-transition
    secondary: [scroll-progress]
  trigger: [scroll-progress]
  media: [dom-css]
  authoring: code

behavior:
  lifecycle: scroll-linked
  reversible: true
  replay: every-entry

tags:
  - scroll-driven
  - css-only
  - view-timeline
  - reveal
  - parallax

trigger:
  primary: scroll-progress
  touch_fallback: always-on
  config:
    timeline: "view()"
    range: "entry 0% cover 30%"

runtime:
  language: css
  framework: none
  framework_version: null
  bundler: null
dependencies: []
peer_dependencies: []

implementations:
  - tier: 1
    name: "CSS animation-timeline: view()"
    dependencies: []
    browser_support: { baseline: newly-available, baseline_year: 2024 }
    performance: { gpu_accelerated: true, layout_thrash: false, cost: low }
    degrades_to: 2
  - tier: 2
    name: "JS + IntersectionObserver"
    dependencies: []
    browser_support: { baseline: widely-available, baseline_year: 2019 }
    performance: { gpu_accelerated: true, layout_thrash: false, cost: low }
    degradation: "scroll 進行に厳密追従はせず、viewport 進入時点で 1 回再生に縮退"

browser_support:
  baseline: newly-available
  baseline_year: 2024
  notes: "Chrome 115+ / Edge 115+。Safari 未対応（2026-05 時点）。@supports で必ず分岐させる"

performance:
  gpu_accelerated: true
  layout_thrash: false
  cost: low
  notes: "CSS のみで合成スレッドで処理。スクロールイベント購読がないため最も軽い"

parameters:
  - { name: range,        type: string, default: "entry 0% cover 30%", description: "進行の range（view-timeline の構文）" }
  - { name: from_opacity, type: number, default: 0,   range: [0, 1],   description: "開始時の opacity" }
  - { name: from_y,       type: number, default: 24,  range: [0, 80],  description: "開始時の translateY" }

a11y:
  respects_reduced_motion: true
  fallback: "scroll 連動アニメを無効化し、要素を最終状態で即時表示"
  focus_safe: true
  notes: "スクロール連動はモーション酔いを誘いやすい。Reduce Motion ON で必ず無効化する"

license: MIT
authors: ["@daichi"]
sources:
  - { title: "CSS Scroll-Driven Animations 仕様（W3C CSSWG）", url: "https://drafts.csswg.org/scroll-animations-1/" }
attribution_required: false

preview:
  url: https://animation-factory.app/preview/css-scroll-driven
  loop: true
  duration_ms: 2400

related:
  alternatives: [scroll-reveal, gsap-scroll-pin, fade-up]
  composes_with:
    - { id: fade-up, note: "Safari など未対応ブラウザの @supports フォールバックとして fade-up を当てる" }
  requires: []

sections:
  skip: [variants]

ai:
  intent_examples:
    - "JS ゼロでスクロール連動 reveal を入れたい"
    - "view-timeline を使った最新の CSS スクロールアニメ"
    - "Chrome 限定で軽量なスクロールアニメ"
  apply_targets: ["section", "card", "image", "block-content"]
  do_not_apply_to: ["always-visible", "above-the-fold-hero", "fixed-position-ui"]
---

## Overview

`animation-timeline: view()` は **要素がビューポートに進入する量を直接アニメの進行に流し込む** CSS の新 API。JS ゼロでスクロール連動が組める。Baseline は `newly-available`（Chrome/Edge のみ）。Safari/Firefox では使えないため、**`@supports (animation-timeline: view())` の分岐が必須**。

使う場面: 軽量なリビール、決まったブラウザ（社内ツール等）での演出、JS バンドルを削りたい LP。
避けたい場面: クロスブラウザ要件が厳しい本番（Safari 多数の場合は [[scroll-reveal]] を選ぶ）。

## Preview

公開プレビュー: https://animation-factory.app/preview/css-scroll-driven

## Implementation

### CSS animation-timeline: view()

```css
@keyframes reveal-up {
  from { opacity: 0; transform: translateY(24px); }
  to   { opacity: 1; transform: translateY(0); }
}

/* 対応ブラウザ: animation を view() タイムラインに繋ぐ */
@supports (animation-timeline: view()) {
  .reveal-on-scroll {
    animation: reveal-up linear both;
    animation-timeline: view();
    animation-range: entry 0% cover 30%;
  }
}

/* 未対応ブラウザ向けフォールバック（即時表示） */
@supports not (animation-timeline: view()) {
  .reveal-on-scroll {
    opacity: 1;
    transform: none;
  }
}

@media (prefers-reduced-motion: reduce) {
  .reveal-on-scroll {
    animation: none;
    opacity: 1;
    transform: none;
  }
}
```

### JS + IntersectionObserver（縮退）

```ts
const io = new IntersectionObserver(
  (entries) => entries.forEach((e) => e.isIntersecting && e.target.classList.add("is-in")),
  { threshold: 0.2 },
);
document.querySelectorAll(".reveal-on-scroll").forEach((el) => io.observe(el));
```

## Usage

```html
<section class="reveal-on-scroll">
  <h2>節タイトル</h2>
</section>
```

## AI Apply Prompt

### Context
`{{target_selector}}` を、JS を使わず CSS のみでスクロール連動 reveal する。Safari は未対応。

### Steps
1. 上記 CSS を `{{target_file}}` のスタイルシートに追加。`@supports` ブロックは**必ずペアで**追加する（対応・未対応 + Reduce Motion）。
2. 対象要素に `reveal-on-scroll` クラスを追加。
3. クライアントが Safari 多数なら、Tier 2 の [[scroll-reveal]] へ切替を推奨。

### Examples

Before: `<section>…</section>`
After: `<section class="reveal-on-scroll">…</section>`

### Verify
- Chrome / Edge: スクロールで section が下→中央へ進む間に opacity/y が線形に進行
- Safari: 即時表示（フォールバック）。アニメは無し
- Reduce Motion ON: アニメ無効、最終形を即時表示
- 一度通過した後に戻っても、進行は scroll 位置に追従して逆再生

## Accessibility

- `prefers-reduced-motion: reduce` で必ず無効化する（モーション酔い対策）。
- フォールバックは「即時表示」にして、未対応ブラウザでもコンテンツが見えなくならないようにする。
- `position: fixed` の UI には適用しない（view() タイムラインの範囲計算が崩れる）。

## Performance Notes

- スクロールイベントを購読しないため、`scroll` リスナーや rAF を使う方式より軽い。
- 合成スレッド側でアニメが進行するため、`transform` と `opacity` を使う限り 60fps を維持しやすい。
- `animation-range` の単位（`entry`, `exit`, `cover`, `contain`）で振る舞いを細かく制御できる。

## Changelog

- 2026-05-26 (created): 初版。Phase 3 D1 第 2 弾、Tier B（newly-available API のため B 区分）。
