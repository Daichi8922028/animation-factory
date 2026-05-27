---
id: svg-line-draw
name: SVG Line Draw
version: 1.0.0
release: beta
variant: vanilla-css
description: |
  SVG パスを `stroke-dasharray` + `stroke-dashoffset` で「描かれる」ように見せる古典的演出。
  ロゴ、アイコン、装飾線、グラフ罫線、チェックマークの登場に。

taxonomy:
  layer: [css]
  ux_role:
    primary: state-transition
    secondary: [decorative]
  trigger: [viewport]
  media: [svg]
  authoring: code

behavior:
  lifecycle: oneshot
  reversible: false
  replay: every-entry

tags:
  - svg
  - stroke
  - draw
  - line
  - logo
  - icon
  - checkmark

trigger:
  primary: viewport
  touch_fallback: always-on
  config:
    amount: 0.4

runtime:
  language: css
  framework: none
  framework_version: null
  bundler: null
dependencies: []
peer_dependencies: []

implementations:
  - tier: 1
    name: "Vanilla CSS + IntersectionObserver"
    dependencies: []
    browser_support: { baseline: widely-available, baseline_year: 2017 }
    performance: { gpu_accelerated: false, layout_thrash: false, cost: low }
    degrades_to: 2
  - tier: 2
    name: "GSAP DrawSVG"
    dependencies: [ { name: gsap, version: "^3.13.0" } ]
    browser_support: { baseline: widely-available, baseline_year: 2020 }
    performance: { gpu_accelerated: false, layout_thrash: false, cost: low }
    degradation: "結果は同等。複数パスの精密な timing 制御が必要なら GSAP に寄せる"

browser_support:
  baseline: widely-available
  baseline_year: 2017
  notes: "代表値は Tier 1。SVG `pathLength` は 2020 以降確実。代替で getTotalLength() を JS で取得可"

performance:
  gpu_accelerated: false
  layout_thrash: false
  cost: low
  notes: "stroke-dashoffset の補間は Paint で完結。短いパスなら 60fps 余裕"

parameters:
  - { name: duration_ms,  type: number, default: 1200, range: [400, 4000], description: "描画にかける時間" }
  - { name: easing,       type: enum,   default: "ease-in-out",
      values: ["linear","ease-in","ease-out","ease-in-out"] }
  - { name: stroke_width, type: number, default: 2,    range: [1, 8],      description: "線の太さ" }

a11y:
  respects_reduced_motion: true
  fallback: "アニメを無効化し、最終形（線が完全に描かれた状態）を即時表示"
  focus_safe: true
  notes: "装飾用途のため `aria-hidden=\"true\"` を併用。意味のあるロゴ／アイコンには title/desc を残す"

license: MIT
authors: ["@daichi"]
sources: []
attribution_required: false

preview:
  url: https://animation-factory.app/preview/svg-line-draw
  loop: true
  duration_ms: 2200

related:
  alternatives: [fade-in, scale-in]
  composes_with:
    - { id: fade-in, note: "線が描かれ終わった後にラベル fade-in でロゴ完成、の流れが定番" }
  requires: []

sections:
  skip: [variants]

ai:
  intent_examples:
    - "ロゴが線で描かれていく演出"
    - "チェックマークが SVG で描画されるアニメ"
    - "アイコンを線で書き起こす"
  apply_targets: ["logo", "icon", "decorative-line", "checkmark", "underline"]
  do_not_apply_to: ["complex-illustration", "filled-shape", "raster-image"]
---

## Overview

SVG パスに `pathLength="1"` を設定し、`stroke-dasharray: 1; stroke-dashoffset: 1` で「線が引かれていない」初期状態にする。`stroke-dashoffset` を 0 に近づけることで線が描かれていくように見える。ロゴアニメや手書き風のアイコン演出の基本テクニック。

使う場面: ロゴの登場、チェックマークの確定演出、装飾ラインのアクセント。
避けたい場面: 塗りで構成されたアイコン（線がない）、ラスター画像（SVG 限定）、複雑な多パス図版（管理コスト高）。

## Preview

公開プレビュー: https://animation-factory.app/preview/svg-line-draw

## Implementation

### Vanilla CSS + IntersectionObserver

```html
<svg viewBox="0 0 100 100" fill="none" stroke="currentColor" stroke-width="2"
     class="line-draw" aria-hidden="true">
  <path d="M20 50 L45 75 L80 25" pathLength="1" />
</svg>
```

```css
.line-draw path {
  stroke-dasharray: 1;
  stroke-dashoffset: 1;
  transition: stroke-dashoffset 1200ms ease-in-out;
}

/* viewport に入ったらクラス付与で 0 へ補間 */
.line-draw.is-in path {
  stroke-dashoffset: 0;
}

@media (prefers-reduced-motion: reduce) {
  .line-draw path {
    transition: none;
    stroke-dashoffset: 0; /* 最終形を即時表示 */
  }
}
```

```ts
// IntersectionObserver で viewport トリガー
const el = document.querySelector(".line-draw");
if (el) {
  const io = new IntersectionObserver((entries) => {
    for (const e of entries) {
      if (e.isIntersecting) {
        e.target.classList.add("is-in");
        io.unobserve(e.target);
      }
    }
  }, { threshold: 0.4 });
  io.observe(el);
}
```

### GSAP DrawSVG（精密制御が要る場合）

```ts
import gsap from "gsap";
// DrawSVG は GSAP のプラグイン（要 import / register）。
// 複数パスの timing を timeline で揃えたい時に便利。
```

## Usage

```html
<svg viewBox="0 0 100 100" class="line-draw" aria-hidden="true">
  <path d="M20 50 L45 75 L80 25" pathLength="1" stroke="currentColor" stroke-width="2" fill="none" />
</svg>
```

## AI Apply Prompt

### Context
`{{target_selector}}` の SVG パスを「描かれる」ように見せる。

### Steps
1. 対象 SVG の `<path>` に `pathLength="1"` を追加（JS で getTotalLength() しなくて済む）。
2. 上記 CSS を `{{target_file}}` のスタイルシートに追加し、SVG に `line-draw` クラスを付与。
3. viewport トリガーが必要なら上記 IntersectionObserver スニペットを追記。`once` の挙動（一度きり）は `unobserve()` で実現。
4. 装飾用途なら `aria-hidden="true"` を SVG に付ける。意味のあるロゴなら `<title>` を残す。

### Examples

Before: `<svg><path d="…" /></svg>` （静止表示）
After: `<svg class="line-draw"><path d="…" pathLength="1" /></svg>` （viewport 進入で描画）

### Verify
- 初回ビューポート進入で線が左から右（または始点から終点）へ描かれる
- 二度目以降のスクロールバックでは再生しない（`unobserve` 済み）
- Reduce Motion ON で線が初期状態から完成形へ瞬時に切り替わる（アニメなし）
- `stroke-width` が想定通り。CSS で `stroke-width: 2` を上書きしていないか

## Accessibility

- 装飾線・装飾アイコンは `aria-hidden="true"` を付ける。スクリーンリーダーで読み上げない。
- 意味を持つロゴやアイコンは `<title>` `<desc>` を SVG 内に残す。
- Reduce Motion 設定では「描かれていく」演出を切り、最終形を即時表示する。

## Performance Notes

- `stroke-dashoffset` の補間は Paint で完結する。Composite ではないが、短いパスなら 60fps 余裕。
- 多数（数十）の path を同時に描画するなら timing をずらす（`transition-delay` または GSAP timeline）。
- `pathLength="1"` を使うと、`stroke-dasharray: 1` と組み合わせて長さに依存しない指定ができる（実長を JS 計測する必要がない）。

## Changelog

- 2026-05-26 (created): 初版。Phase 3 D1 第 2 弾、Tier B（SVG 構造の手間で B 区分）。
