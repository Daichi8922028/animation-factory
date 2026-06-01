---
id: input-focus-pop
name: Input Focus Pop
version: 1.0.0
release: beta
variant: vanilla-css
description: |
  テキスト入力にフォーカスすると、プレースホルダ風のラベルが上に float し、border/ring が拡張して
  「ここが今アクティブ」を伝える定番のフォーム micro-interaction。CSS だけで完結。

taxonomy:
  layer: [css]
  ux_role:
    primary: micro-interaction
    secondary: [feedback]
  trigger: [focus]
  media: [dom-css]
  authoring: code

behavior:
  lifecycle: toggle
  reversible: true
  replay: every-entry

tags:
  - input
  - form
  - floating-label
  - focus
  - label
  - micro-interaction
  - field

trigger:
  primary: focus
  touch_fallback: always-on
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
    name: "Vanilla CSS (:focus + :not(:placeholder-shown))"
    dependencies: []
    browser_support: { baseline: widely-available, baseline_year: 2020 }
    performance: { gpu_accelerated: true, layout_thrash: false, cost: low }
    degrades_to: 2
  - tier: 2
    name: "JS で filled state を class 管理"
    dependencies: []
    browser_support: { baseline: widely-available, baseline_year: 2017 }
    degradation: ":placeholder-shown 非対応環境では input の value 有無を JS で見て filled クラスを付与"
    performance: { gpu_accelerated: true, layout_thrash: false, cost: low }

browser_support:
  baseline: widely-available
  baseline_year: 2020
  notes: "代表値は Tier 1。:placeholder-shown と transform で完結。JS 不要"

performance:
  gpu_accelerated: true
  layout_thrash: false
  cost: low
  notes: "label は transform: translateY + scale のみ。border は box-shadow(ring) で layout に影響させない"

parameters:
  - { name: label_lift_px, type: number, default: 18, range: [12, 28], description: "ラベルが浮き上がる距離(px)" }
  - { name: ring_width_px, type: number, default: 2,  range: [1, 4],   description: "フォーカスリングの太さ(px)" }
  - { name: duration_ms,   type: number, default: 180, range: [80, 320], description: "遷移の長さ" }

a11y:
  respects_reduced_motion: true
  fallback: "label の移動を即時に。ring は維持（フォーカス可視性は残す）"
  focus_safe: true
  notes: "label は必ず <label for> で input と紐付ける。プレースホルダだけに頼らない。focus リングは reduced-motion でも残す"

license: MIT
authors: ["@daichi"]
sources:
  - { title: "MDN: :placeholder-shown", url: "https://developer.mozilla.org/en-US/docs/Web/CSS/:placeholder-shown" }
attribution_required: false

preview:
  url: https://animation-factory.app/preview/input-focus-pop
  loop: true
  duration_ms: 2400

related:
  alternatives: [hover-underline, tooltip-pop, input-validation-shake]
  composes_with:
    - { id: input-validation-shake, note: "フォーカス演出はこれ、エラー時は input-validation-shake を重ねる" }
  requires: []

sections:
  skip: [variants]

ai:
  intent_examples:
    - "入力欄にフォーカスするとラベルが上に浮き上がる"
    - "Material 風のフローティングラベル"
    - "フォーカス時に枠が強調されるフォーム"
  apply_targets: ["text-input", "form-field", "textarea", "search-box"]
  do_not_apply_to: ["checkbox", "radio", "button"]
---

## Overview

入力欄が空のときはラベルがプレースホルダ位置にあり、フォーカスまたは値が入ると上へ `translateY` + `scale` で float する。同時に focus ring（box-shadow）が広がってアクティブを示す。`:placeholder-shown` と `:focus` の組み合わせで JS なしに実現できる。

使う場面: フォームのテキスト入力、検索ボックス、textarea。
避けたい場面: チェックボックス/ラジオ（ラベルが動く意味がない）、ボタン。

## Preview

公開プレビュー: https://animation-factory.app/preview/input-focus-pop

## Implementation

### Vanilla CSS

```css
.field { position: relative; }
.field input {
  padding: 18px 12px 6px;
  border: 1px solid var(--border);
  border-radius: 8px;
  transition: box-shadow 180ms, border-color 180ms;
}
.field label {
  position: absolute;
  left: 12px;
  top: 14px;
  color: var(--muted);
  transform-origin: left center;
  transition: transform 180ms ease-out, color 180ms;
  pointer-events: none;
}
/* フォーカス時 or 値あり: ラベルを上へ */
.field input:focus + label,
.field input:not(:placeholder-shown) + label {
  transform: translateY(-12px) scale(0.82);
}
.field input:focus {
  border-color: var(--accent);
  box-shadow: 0 0 0 2px color-mix(in srgb, var(--accent) 35%, transparent);
}
@media (prefers-reduced-motion: reduce) {
  .field label, .field input { transition-duration: 0.01ms; }
}
```

> input には空の `placeholder=" "`（スペース）を入れて `:placeholder-shown` を機能させる。

## Usage

```html
<div class="field">
  <input id="email" type="email" placeholder=" " />
  <label for="email">メールアドレス</label>
</div>
```

## AI Apply Prompt

### Context
`{{field_selector}}` をフローティングラベル付きの入力にする。

### Steps
1. 上記 CSS を `{{target_file}}` に追記。
2. 各 input に `placeholder=" "` と、対応する `<label for>` を追加。
3. accent / border 色を CSS 変数に合わせる。

### Verify
- 空の状態でラベルがプレースホルダ位置
- フォーカス or 入力でラベルが上に float、ring が出る
- Reduce Motion でラベル移動は即時、ring は残る

## Accessibility

`<label for>` で必ず紐付け、プレースホルダのみのラベルにしない。focus ring は reduced-motion でも残し、キーボード利用者の現在地を保つ。

## Performance Notes

label は `transform`、ring は `box-shadow` で描画し、`width`/`height` を触らないので reflow が起きない。

## Changelog

- 2026-06-01 (created): 初版。v1.1 Batch 2（Form interaction）第 1 弾。CSS only のフローティングラベル。
