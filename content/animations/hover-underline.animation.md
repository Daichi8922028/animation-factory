---
id: hover-underline
name: Hover Underline
version: 1.0.0
release: alpha
variant: vanilla-css
description: |
  リンクやメニュー項目の下線が、ホバーで左→右に伸びる micro-interaction。
  ナビメニュー、フッターリンク、本文中の外部リンクに。

taxonomy:
  layer: [css]
  ux_role:
    primary: micro-interaction
    secondary: [navigation]
  trigger: [pointer]
  media: [dom-css]
  authoring: code

behavior:
  lifecycle: continuous
  reversible: true
  replay: every-entry

tags:
  - hover
  - underline
  - link
  - nav
  - text-decoration
  - reveal

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
    name: "Vanilla CSS"
    dependencies: []
    browser_support: { baseline: widely-available, baseline_year: 2015 }
    performance: { gpu_accelerated: true, layout_thrash: false, cost: low }

browser_support:
  baseline: widely-available
  baseline_year: 2015
  notes: "代表値は Tier 1（純 CSS）。擬似要素 + transform: scaleX で実装"

performance:
  gpu_accelerated: true
  layout_thrash: false
  cost: low
  notes: "transform: scaleX のみ補間。Layout/Paint を引き起こさない"

parameters:
  - { name: thickness_px, type: number, default: 2, range: [1, 4], description: "下線の太さ" }
  - { name: duration_ms,  type: number, default: 240, range: [80, 500], description: "進入／離脱の長さ" }
  - { name: origin,       type: enum, default: "left",
      values: ["left","right","center","both-edges"],
      description: "scaleX の origin。両端から伸ばすなら both-edges で擬似要素 2 枚" }

a11y:
  respects_reduced_motion: true
  fallback: "transition を 0.01s。下線そのものは出すので状態は伝わる"
  focus_safe: true
  notes: "focus-visible にも同じ下線を当ててキーボード利用者と揃える"

license: MIT
authors: ["@daichi"]
sources: []
attribution_required: false

preview:
  url: https://animation-factory.app/preview/hover-underline
  loop: true
  duration_ms: 1200

related:
  alternatives: [hover-lift, hover-glow]
  composes_with: []
  requires: []

sections:
  skip: [variants]

ai:
  intent_examples:
    - "ナビリンクの下線がホバーで伸びる"
    - "ホバーで下線が左から右へ"
    - "メニューに hover underline を入れたい"
  apply_targets: ["nav-link", "menu-item", "inline-link", "footer-link"]
  do_not_apply_to: ["button", "card", "image-link"]
---

## Overview

リンクの下に擬似要素で疑似下線を持たせ、`transform: scaleX(0 → 1)` で左→右に伸ばす。`text-decoration` の transition は補間不可なので、擬似要素 + scaleX が王道。

使う場面: グローバルナビ、フッターリンク、本文中の外部リンク。
避けたい場面: ボタン（テキスト装飾としての下線は CTA に不適）、カード、画像リンク。

## Preview

公開プレビュー: https://animation-factory.app/preview/hover-underline

## Implementation

### Vanilla CSS

```css
.hover-underline {
  position: relative;
  text-decoration: none;
  color: inherit;
}
.hover-underline::after {
  content: "";
  position: absolute;
  left: 0;
  right: 0;
  bottom: -2px;
  height: 2px;
  background: currentColor;
  transform: scaleX(0);
  transform-origin: left center;
  transition: transform 240ms ease-out;
}

@media (hover: hover) {
  .hover-underline:hover::after { transform: scaleX(1); }
}
.hover-underline:focus-visible::after { transform: scaleX(1); }

/* 離脱時に右へ抜ける */
.hover-underline:not(:hover):not(:focus-visible)::after {
  transform-origin: right center;
}

@media (prefers-reduced-motion: reduce) {
  .hover-underline::after { transition-duration: 0.01ms; }
}
```

## Usage

```html
<a href="/about" class="hover-underline">About</a>
```

## AI Apply Prompt

### Context
`{{target_selector}}` のリンクにホバー下線アニメを付ける。純 CSS、依存追加なし。

### Steps
1. `{{target_file}}` の対象 `<a>` に `hover-underline` クラスを追加。
2. 上記 CSS をスタイルシートに追記。
3. 親の `line-height` が詰まっていると `bottom: -2px` が切れる場合があるので確認。

### Examples

Before: `<a href="/x">link</a>`
After: `<a href="/x" class="hover-underline">link</a>`

### Verify
- ホバーで下線が左から右へ伸びる
- 離れると右に向かって消える（origin が切り替わるため自然）
- Tab フォーカスで同じ視覚（focus-visible）
- Reduce Motion で transition がほぼ無し

## Accessibility

`text-decoration` 由来の下線を消した分、`:focus-visible` で必ず代替視覚を出す（上記 CSS）。タッチ端末では発火しない仕様で、リンクの判別は色やテキストで担保する。

## Performance Notes

`transform: scaleX` のみ補間。`width` の transition は Layout を伴うため避ける。

## Changelog

- 2026-05-26 (created): 初版。Phase 3 D1 第 3 弾、hover-press 拡充。
