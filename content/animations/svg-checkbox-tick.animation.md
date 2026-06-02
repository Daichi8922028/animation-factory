---
id: svg-checkbox-tick
name: SVG Checkbox Tick Draw
version: 1.0.0
release: v1.2
variant: vanilla-css
description: |
  チェックボックスの枠と tick（チェック線）を stroke-dashoffset で「描く」micro-interaction。
  クリック（state-change）で on/off をトグルし、on で線が引かれ off で巻き戻る。
  フォームの同意チェック、設定トグル、ToDo の完了マークなどに。

taxonomy:
  layer: [css]
  ux_role:
    primary: micro-interaction
    secondary: [feedback]
  trigger: [click]
  media: [svg]
  authoring: code

behavior:
  lifecycle: toggle
  reversible: true
  replay: every-entry

tags:
  - checkbox
  - svg
  - tick
  - checkmark
  - stroke-dashoffset
  - toggle
  - micro-interaction

trigger:
  primary: click
  touch_fallback: tap-toggle
  config:
    toggle: true

runtime:
  language: css
  framework: none
  framework_version: null
  bundler: null
dependencies: []
peer_dependencies: []

implementations:
  - tier: 1
    name: "Vanilla CSS (stroke-dashoffset transition)"
    dependencies: []
    browser_support: { baseline: widely-available, baseline_year: 2017 }
    performance: { gpu_accelerated: false, layout_thrash: false, cost: low }
    degrades_to: 2
  - tier: 2
    name: "即時切替（opacity のみ）"
    dependencies: []
    browser_support: { baseline: widely-available, baseline_year: 2015 }
    performance: { gpu_accelerated: false, layout_thrash: false, cost: low }
    degradation: "stroke の描画アニメを諦め、tick を opacity で即時表示/非表示するだけの簡易代替"

browser_support:
  baseline: widely-available
  baseline_year: 2017
  notes: "代表値は Tier 1。SVG stroke-dasharray/offset の transition は全モダンブラウザで安定"

performance:
  gpu_accelerated: false
  layout_thrash: false
  cost: low
  notes: "stroke-dashoffset の補間のみ。レイアウトを起こさずペイントも軽量"

parameters:
  - { name: draw_ms, type: number, default: 280, range: [120, 600], description: "tick を描く所要時間" }
  - { name: stroke_width, type: number, default: 3, range: [2, 6], description: "枠と tick の線幅" }
  - { name: accent, type: color, default: "#a3e635", description: "on 状態のアクセント色（lime-300）" }

a11y:
  respects_reduced_motion: true
  fallback: "描画アニメを止め、on/off を tick の表示・非表示で即時切替"
  focus_safe: true
  notes: "視覚的なチェック状態に頼らず、ネイティブ input[type=checkbox] の checked と aria-checked で状態を伝える。フォーカスリングを残す"

license: MIT
authors: ["@daichi"]
sources:
  - { title: "MDN: stroke-dashoffset", url: "https://developer.mozilla.org/en-US/docs/Web/SVG/Attribute/stroke-dashoffset" }
attribution_required: false

preview:
  url: https://animation-factory.app/preview/svg-checkbox-tick
  loop: true
  duration_ms: 1800

related:
  alternatives: [input-success-checkmark, svg-line-draw, toggle-switch]
  composes_with:
    - { id: shake, note: "未チェックで送信した時に枠を shake させると無効を伝えやすい" }
  requires: []

sections:
  skip: [variants]

ai:
  intent_examples:
    - "チェックボックスのチェックマークが描かれるようにしたい"
    - "tick が stroke で引かれるカスタムチェックボックス"
    - "同意チェックを押すとチェック線がアニメで出る"
  apply_targets: ["checkbox", "agree-checkbox", "todo-item", "settings-toggle"]
  do_not_apply_to: ["radio-group", "submit-button", "body-text", "navigation"]
---

## Overview

カスタムチェックボックスの **枠** と **tick（チェック線）** を、SVG の `stroke-dasharray` / `stroke-dashoffset` で「描く」micro-interaction。`click`（= state-change）で on/off をトグルし、on では線が引かれ、off では `dashoffset` を戻して巻き戻る（reversible）。

ネイティブ `<input type="checkbox">` を視覚的に隠して上に SVG を重ねるため、**キーボード操作・フォーカス・フォーム送信** はネイティブ挙動のまま維持できる。

使う場面: 同意チェック、設定のトグル、ToDo の完了マーク。
避けたい場面: ラジオ（単一選択は別パターン）、送信ボタン、本文。`input-success-checkmark`（バリデーション成功の単発フィードバック）とは役割が異なる。

## Preview

公開プレビュー: https://animation-factory.app/preview/svg-checkbox-tick

## Implementation

### Vanilla CSS（Tier 1）

ネイティブ checkbox を `peer` 的に隠し、`:checked` で SVG の `stroke-dashoffset` を 0 に動かす。`pathLength="1"` を使うと実寸に依らず `dasharray: 1` で正規化できる。

```html
<label class="svg-check">
  <input type="checkbox" class="svg-check__input" />
  <svg class="svg-check__svg" viewBox="0 0 24 24" aria-hidden="true">
    <rect class="svg-check__box" x="3" y="3" width="18" height="18" rx="4" pathLength="1" />
    <path class="svg-check__tick" d="M6 12.5 L10.5 17 L18 7.5" pathLength="1" />
  </svg>
  <span>利用規約に同意する</span>
</label>
```

```css
.svg-check__input {
  position: absolute;
  opacity: 0;
  width: 0;
  height: 0;
}
.svg-check__svg {
  width: 28px;
  height: 28px;
  fill: none;
  stroke: #71717a; /* zinc-500 */
  stroke-width: 3;
  stroke-linecap: round;
  stroke-linejoin: round;
}
.svg-check__tick {
  /* pathLength=1 に正規化。1 隠して 0 で全部描く */
  stroke-dasharray: 1;
  stroke-dashoffset: 1;
  transition: stroke-dashoffset 280ms ease-in-out;
}
/* :checked で tick を描き、色をアクセントに */
.svg-check__input:checked ~ .svg-check__svg .svg-check__tick {
  stroke: #a3e635; /* lime-300 */
  stroke-dashoffset: 0;
}
.svg-check__input:checked ~ .svg-check__svg .svg-check__box {
  stroke: #a3e635;
}
/* キーボードフォーカスを残す */
.svg-check__input:focus-visible ~ .svg-check__svg {
  outline: 2px solid #a3e635;
  outline-offset: 2px;
  border-radius: 6px;
}
@media (prefers-reduced-motion: reduce) {
  .svg-check__tick { transition: none; }
}
```

### 即時切替（Tier 2 / 縮退）

`stroke-dashoffset` のアニメを諦め、tick を `opacity` で即時表示するだけの簡易版。Reduce Motion 時の見た目とも一致する。

```css
.svg-check__tick { opacity: 0; transition: none; }
.svg-check__input:checked ~ .svg-check__svg .svg-check__tick { opacity: 1; }
```

## Usage

```tsx
<label className="svg-check">
  <input type="checkbox" className="svg-check__input" />
  <svg className="svg-check__svg" viewBox="0 0 24 24" aria-hidden="true">
    <rect className="svg-check__box" x="3" y="3" width="18" height="18" rx="4" pathLength={1} />
    <path className="svg-check__tick" d="M6 12.5 L10.5 17 L18 7.5" pathLength={1} />
  </svg>
  <span>利用規約に同意する</span>
</label>
```

## AI Apply Prompt

### Context
`{{target_selector}}` のチェックボックスを、tick が stroke で描かれるカスタム UI に置き換える。状態はネイティブ `<input type="checkbox">` が保持する。

### Steps
1. 既存の `<input type="checkbox">` を `<label>` でラップし、`aria-hidden` の SVG（枠 `<rect>` + tick `<path>`、いずれも `pathLength=1`）を隣に置く。
2. 上記 CSS を `{{target_file}}` に追記。`input` は視覚的に隠すが DOM とフォーカスは残す（`display:none` にしない）。
3. `:checked ~ .svg-check__svg .svg-check__tick { stroke-dashoffset: 0 }` でトグル on の描画を定義。off で `1` に戻して reversible に。
4. Reduce Motion 時は `transition: none` で即時切替に縮退（Tier 2 と同じ見た目）。

### Examples

Before: 素の `<input type="checkbox">`
After: `<label class="svg-check">` でラップし、tick が描かれる SVG を重ねる

### Verify
- クリック / Space で on/off がトグルし、on で tick が描かれ off で巻き戻る
- Tab でフォーカスでき、`:focus-visible` のリングが出る
- フォーム送信で `name`/`value` がネイティブどおり送られる
- Reduce Motion ON で描画アニメが消え、tick が即時に表示/非表示される

## Accessibility

- 状態保持はネイティブ `<input type="checkbox">` に委ね、`checked` / `aria-checked` を SVG で上書きしない（SVG は `aria-hidden`）。
- `input` は `opacity:0` で視覚的に隠すが `display:none` にはしない。キーボード操作・フォーカス・スクリーンリーダーの読み上げを維持するため。
- `:focus-visible` のアウトラインを必ず残す。色（lime-300）だけに頼らず、tick の有無で状態が分かる。
- Reduce Motion では描画 transition を無効化し、即時切替に縮退する。

## Performance Notes

- `stroke-dashoffset` の補間のみで、レイアウトもコンポジット層の追加も起こさない。ペイントは小さな SVG パス 1 本ぶんで軽量。
- `pathLength="1"` で正規化しているため、`dasharray`/`dashoffset` をパスの実寸に合わせて測り直す必要がない。
- GPU 合成は使わない（transform/opacity ではない）が、対象が小さく頻度も低いため `cost: low`。

## Changelog

- 2026-06-02 (created): 初版。v1.2（Tier B）、SVG micro-interaction 拡充。stroke-dashoffset によるチェックボックス tick 描画。
