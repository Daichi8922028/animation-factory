---
id: popover-anchor-positioning
name: Popover with CSS Anchor Positioning
version: 1.0.0
release: beta
variant: vanilla-css
description: |
  CSS Anchor Positioning でトリガー要素に紐づけてポップオーバーを配置し、@starting-style で軽く落として登場させる。
  JS の位置計算（getBoundingClientRect / floating-ui）なしで、宣言的にアンカー配置できる新世代の手法。

taxonomy:
  layer: [css]
  ux_role:
    primary: state-transition
    secondary: [micro-interaction]
  trigger: [click]
  media: [dom-css]
  authoring: code

behavior:
  lifecycle: toggle
  reversible: true
  replay: every-entry

tags:
  - popover
  - anchor-positioning
  - css-anchor
  - dropdown
  - menu
  - positioning
  - popover-api

trigger:
  primary: click
  touch_fallback: tap-toggle
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
    name: "CSS Anchor Positioning + @starting-style"
    dependencies: []
    browser_support: { baseline: limited, baseline_year: 2024 }
    performance: { gpu_accelerated: true, layout_thrash: false, cost: low }
    degrades_to: 2
  - tier: 2
    name: "相対配置フォールバック（position: absolute）"
    dependencies: []
    browser_support: { baseline: widely-available, baseline_year: 2017 }
    degradation: "@supports not (anchor-name) で、ラッパに position: relative、パネルを top:100% に絶対配置。floating-ui を使えば衝突回避も可能"
    performance: { gpu_accelerated: true, layout_thrash: false, cost: low }

browser_support:
  baseline: limited
  baseline_year: 2024
  notes: "CSS Anchor Positioning は Chrome 125+ で先行。Safari/Firefox は未対応のため @supports で絶対配置にフォールバック。Popover API（top-layer / light-dismiss）は別途広く使える"

performance:
  gpu_accelerated: true
  layout_thrash: false
  cost: low
  notes: "配置はブラウザのレイアウトエンジンが解決し JS の毎フレーム再計算が不要。登場は opacity + translate のみ"

parameters:
  - { name: gap_px,         type: number, default: 8,   range: [0, 24],   description: "アンカーとパネルの間隔(px)" }
  - { name: from_offset_px, type: number, default: 6,   range: [0, 16],   description: "登場時に上から落とすオフセット(px)" }
  - { name: duration_ms,    type: number, default: 160, range: [80, 320], description: "登場トランジションの長さ" }

a11y:
  respects_reduced_motion: true
  fallback: "translate を無効化し opacity 即時表示。配置は維持"
  focus_safe: true
  notes: "Popover API（popover 属性）を併用すると ESC / light-dismiss / top-layer が標準で得られる。トリガーに aria-expanded、パネルに role=menu / menuitem を付ける"

license: MIT
authors: ["@daichi"]
sources:
  - { title: "MDN: CSS anchor positioning", url: "https://developer.mozilla.org/en-US/docs/Web/CSS/CSS_anchor_positioning" }
  - { title: "MDN: Popover API", url: "https://developer.mozilla.org/en-US/docs/Web/API/Popover_API" }
  - { title: "Chrome: Introducing the CSS anchor positioning API", url: "https://developer.chrome.com/blog/anchor-positioning-api" }
attribution_required: false

preview:
  url: https://animation-factory.app/preview/popover-anchor-positioning
  loop: true
  duration_ms: 2200

related:
  alternatives: [dropdown-menu, tooltip-pop, modal-fade]
  composes_with:
    - { id: dropdown-menu, note: "dropdown-menu の位置決めを JS から CSS anchor positioning に置き換えられる" }
  requires: []

sections:
  skip: [variants]

ai:
  intent_examples:
    - "ボタンに紐づくポップオーバーを CSS だけで配置したい"
    - "JS の位置計算なしでアンカー配置するメニュー"
    - "Popover API + CSS Anchor Positioning でドロップダウンを出す"
  apply_targets: ["popover", "dropdown", "menu", "rich-tooltip"]
  do_not_apply_to: ["modal-dialog", "full-page-overlay", "toast"]
---

## Overview

`anchor-name` をトリガー要素に、`position-anchor` + `anchor()` をパネルに指定して、**ブラウザのレイアウトエンジンに配置を解決させる**。`getBoundingClientRect()` の手計算や floating-ui のような JS ライブラリ無しで、トグル可能なポップオーバー/ドロップダウンを作れる。登場は `@starting-style` で `opacity` と `translate` を補間。

未対応ブラウザ（Safari / Firefox）には `@supports not (anchor-name)` で `position: absolute` の相対配置にフォールバックする。`Popover API`（`popover` 属性）を併用すれば top-layer・ESC・light-dismiss も標準で得られる。

使う場面: メニュー、リッチツールチップ、日付ピッカーなどトリガーに追従させたいポップオーバー。
避けたい場面: モーダルダイアログ（中央固定で良い）、全画面オーバーレイ、トースト。

## Preview

公開プレビュー: https://animation-factory.app/preview/popover-anchor-positioning

## Implementation

### CSS Anchor Positioning + `@starting-style`

```html
<button class="anchor-btn" popovertarget="menu" aria-expanded="false">メニュー</button>
<div id="menu" popover class="panel" role="menu">…</div>
```

```css
.anchor-btn { anchor-name: --pop-anchor; }

.panel {
  position: fixed;                 /* anchor 配置には絶対/固定が必要 */
  position-anchor: --pop-anchor;
  top: anchor(bottom);
  left: anchor(left);
  margin-top: 8px;

  opacity: 0;
  translate: 0 -6px;
  transition: opacity 160ms ease-out, translate 160ms ease-out,
              overlay 160ms allow-discrete, display 160ms allow-discrete;
}
.panel:popover-open {
  opacity: 1;
  translate: 0 0;
}
@starting-style {
  .panel:popover-open { opacity: 0; translate: 0 -6px; }
}

/* 非対応ブラウザ: 相対配置にフォールバック */
@supports not (anchor-name: --x) {
  .wrap { position: relative; }
  .panel { position: absolute; top: 100%; left: 0; }
}
```

### 相対配置フォールバック（縮退）

`@supports not (anchor-name)` 内で `position: relative` のラッパ + `top: 100%` の絶対配置。衝突回避（画面端で反転）が必要なら floating-ui を使う。

## Usage

```html
<div class="wrap">
  <button class="anchor-btn" popovertarget="menu">メニュー</button>
  <div id="menu" popover class="panel" role="menu">
    <button role="menuitem">設定</button>
  </div>
</div>
```

## AI Apply Prompt

### Context
`{{trigger_selector}}` にひも付くポップオーバーを CSS Anchor Positioning で配置する。

### Steps
1. トリガーに `anchor-name: --x`、パネルに `position-anchor: --x` + `top: anchor(bottom)`。
2. パネルに `popover` 属性、トリガーに `popovertarget` を付けて Popover API を活用。
3. `@starting-style` + `transition ... allow-discrete` で登場/退場を補間。
4. `@supports not (anchor-name)` で絶対配置のフォールバックを必ず用意。

### Examples

Before: `floating-ui` で JS 計算して `style.transform` を毎フレーム更新
After: CSS の `anchor()` でレイアウトエンジンに配置を任せる

### Verify
- Chrome 125+ でボタン直下にパネルが配置され、開閉で落ちて出る
- Safari/Firefox でも絶対配置で破綻せず表示される
- ESC / 外側クリックで閉じる（Popover API）
- Reduce Motion で translate 無し、opacity 即時

## Accessibility

`Popover API` 併用で ESC・light-dismiss・top-layer が標準。トリガーに `aria-expanded`、パネルに `role="menu"` / 各項目に `role="menuitem"`。フォーカスは項目間を矢印キーで移動できると望ましい。Reduce Motion で translate を外す。

## Performance Notes

配置計算をブラウザのレイアウトエンジンに委譲するため、スクロール/リサイズ時の JS 再計算が不要。登場は `opacity` + `translate` のみで GPU 完結。`anchor()` 非対応環境では絶対配置に切り替わるだけでコストは変わらない。

## Changelog

- 2026-06-01 (created): 初版。v1.1 Batch 1（Navigation 基礎）第 4 弾。CSS Anchor Positioning + Popover API + @starting-style による宣言的ポップオーバー配置。
