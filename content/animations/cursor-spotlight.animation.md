---
id: cursor-spotlight
name: Cursor Spotlight
version: 1.0.0
release: alpha
variant: vanilla-css
description: |
  マウスカーソルに追従する円形のソフトな光（スポットライト）。
  ランディングページのヒーロー、Tailwind / Vercel / Linear 系の常套句。

taxonomy:
  layer: [css, js-runtime]
  ux_role:
    primary: micro-interaction
    secondary: [decorative]
  trigger: [pointer]
  media: [dom-css]
  authoring: code

behavior:
  lifecycle: continuous
  reversible: true
  replay: every-entry

tags:
  - cursor
  - spotlight
  - follower
  - radial
  - landing
  - decorative

trigger:
  primary: pointer
  touch_fallback: disabled
  config: {}

runtime:
  language: css
  framework: none
  framework_version: null
  bundler: null
dependencies: []
peer_dependencies: []

implementations:
  - tier: 1
    name: "Vanilla CSS + JS (CSS variables)"
    dependencies: []
    browser_support: { baseline: widely-available, baseline_year: 2017 }
    performance: { gpu_accelerated: true, layout_thrash: false, cost: low }

browser_support:
  baseline: widely-available
  baseline_year: 2017
  notes: "代表値は Tier 1。pointermove で CSS 変数を更新、radial-gradient を背景に持つ"

performance:
  gpu_accelerated: true
  layout_thrash: false
  cost: low
  notes: "background-image だが radial-gradient は GPU で合成。`pointermove` を rAF でスロットルすると安定"

parameters:
  - { name: radius_px, type: number, default: 320, range: [120, 800], description: "スポット半径" }
  - { name: color, type: string, default: "rgba(190, 242, 100, 0.18)", description: "中心色（アクセント由来推奨）" }

a11y:
  respects_reduced_motion: true
  fallback: "スポットを固定位置に出すか、完全に非表示。本文の判読性を下げないことが優先"
  focus_safe: true
  notes: "装飾なので `aria-hidden=\"true\"` を必ず。テキストコントラストが影響を受けないか確認する"

license: MIT
authors: ["@daichi"]
sources: []
attribution_required: false

preview:
  url: https://animation-factory.app/preview/cursor-spotlight
  loop: true
  duration_ms: 2400

related:
  alternatives: [hover-glow]
  composes_with: []
  requires: []

sections:
  skip: [variants]

ai:
  intent_examples:
    - "カーソルに追従するスポットライトのある背景"
    - "ランディングページのヒーローを光らせたい"
    - "マウス追従の光"
  apply_targets: ["hero-background", "feature-section-background"]
  do_not_apply_to: ["data-table", "form-section", "always-readable-text"]
---

## Overview

`pointermove` イベントで CSS 変数 `--mx` / `--my` を更新し、`background: radial-gradient(circle at var(--mx) var(--my), …)` でスポットを描画する。要素そのものは透過、子要素のテキストは可読性を保つ。

使う場面: ヒーロー背景、機能紹介セクションのアクセント。
避けたい場面: 表、フォーム、本文（コントラストが落ちる）。

## Preview

公開プレビュー: https://animation-factory.app/preview/cursor-spotlight

## Implementation

### Vanilla CSS + JS

```html
<section class="spotlight" aria-hidden="true">
  <div class="content"><!-- 本体は別 z-index --></div>
</section>
```

```css
.spotlight {
  position: relative;
  background: radial-gradient(
    320px circle at var(--mx, 50%) var(--my, 50%),
    rgba(190, 242, 100, 0.18),
    transparent 70%
  );
}
.spotlight .content { position: relative; z-index: 1; }

@media (hover: none) {
  .spotlight { background: none; }
}
@media (prefers-reduced-motion: reduce) {
  .spotlight { background: none; }
}
```

```ts
const el = document.querySelector<HTMLElement>(".spotlight");
if (el) {
  el.addEventListener("pointermove", (e) => {
    const r = el.getBoundingClientRect();
    el.style.setProperty("--mx", `${e.clientX - r.left}px`);
    el.style.setProperty("--my", `${e.clientY - r.top}px`);
  });
}
```

## Usage

```html
<section class="spotlight">
  <div class="content">
    <h1>Hero</h1>
  </div>
</section>
```

## AI Apply Prompt

### Context
`{{target_selector}}` のヒーロー背景にカーソル追従のスポットライトを乗せる。

### Steps
1. ターゲットのコンテナに `spotlight` クラス。
2. 子コンテンツを `.content` で包み z-index で前に出す。
3. 上記 CSS + JS を追記。
4. touch / Reduce Motion で無効化する `@media` を必ず併設。

### Examples

Before: `<section><h1>…</h1></section>`
After: `<section class="spotlight"><div class="content"><h1>…</h1></div></section>`

### Verify
- マウス追従でスポット位置が滑らかに変わる
- タッチ端末でスポットが出ない
- Reduce Motion でも出ない
- テキストコントラストが落ちない

## Accessibility

装飾扱い、`aria-hidden="true"`。コントラストへの影響を WCAG AA 基準で必ず確認。

## Performance Notes

`pointermove` の頻発で再 paint が走るが、background は GPU 合成。`rAF` スロットルで安定（多くのケースでは未スロットルでも 60fps）。

## Changelog

- 2026-05-27 (created): 初版。Phase 3 D1 第 5 弾、Tier A cursor 系拡充。
