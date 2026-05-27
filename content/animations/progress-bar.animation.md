---
id: progress-bar
name: Progress Bar
version: 1.0.0
release: alpha
variant: vanilla-css
description: |
  処理の進行度を 0% → 100% で伝えるバー。determinate（値あり）と
  indeterminate（不明な進行）の両方をカバー。

taxonomy:
  layer: [css]
  ux_role:
    primary: feedback
    secondary: []
  trigger: [state-change]
  media: [dom-css]
  authoring: code

behavior:
  lifecycle: continuous
  reversible: false
  replay: every-entry

tags:
  - progress
  - bar
  - loading
  - feedback
  - determinate
  - indeterminate

trigger:
  primary: state-change
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
    name: "Vanilla CSS"
    dependencies: []
    browser_support: { baseline: widely-available, baseline_year: 2015 }
    performance: { gpu_accelerated: true, layout_thrash: false, cost: low }
    degrades_to: 2
  - tier: 2
    name: "React + Motion"
    dependencies: [ { name: motion, version: "^11.0.0" } ]
    browser_support: { baseline: widely-available, baseline_year: 2020 }
    performance: { gpu_accelerated: true, layout_thrash: false, cost: low }
    degradation: "結果は同等。spring 系の柔らかい進行を出したい時の代替"

browser_support:
  baseline: widely-available
  baseline_year: 2015
  notes: "代表値は Tier 1（純 CSS）。determinate は scaleX、indeterminate は @keyframes ループ"

performance:
  gpu_accelerated: true
  layout_thrash: false
  cost: low
  notes: "transform: scaleX のみ補間。width の transition は Layout を伴うため避ける"

parameters:
  - { name: mode,        type: enum, default: "determinate",
      values: ["determinate","indeterminate"], description: "値が判明しているか" }
  - { name: value,       type: number, default: 0, range: [0, 1], description: "determinate の進行度（0..1）" }
  - { name: height_px,   type: number, default: 4, range: [2, 12], description: "バーの太さ" }
  - { name: duration_ms, type: number, default: 1200, range: [400, 3000], description: "indeterminate の 1 ループ長さ" }

a11y:
  respects_reduced_motion: true
  fallback: "indeterminate は静的に薄いゾーン表示へ縮退（流れない）"
  focus_safe: true
  notes: "`role=\"progressbar\"` と `aria-valuenow` / `aria-valuemin` / `aria-valuemax` を付ける。indeterminate は `aria-valuenow` を省略"

license: MIT
authors: ["@daichi"]
sources: []
attribution_required: false

preview:
  url: https://animation-factory.app/preview/progress-bar
  loop: true
  duration_ms: 2400

related:
  alternatives: [spinner-dots, skeleton-shimmer]
  composes_with: []
  requires: []

sections:
  skip: [variants]

ai:
  intent_examples:
    - "アップロードの進捗バー"
    - "ローディングの不明確な進行を示すバー"
    - "サインアップの何ステップ目かを表すバー"
  apply_targets: ["upload-progress", "loading-bar", "step-indicator", "form-progress"]
  do_not_apply_to: ["icon-button", "card", "navigation-link"]
---

## Overview

`determinate` は `value`（0..1）を `transform: scaleX` で表現し、Layout を起こさず滑らかに変化させる。`indeterminate` は不確定な処理用に短いハイライト帯を左→右へ無限に流す `@keyframes` ループで表現する。

使う場面: アップロード、フォーム進行、ロード時間が分かるダウンロード。
避けたい場面: アイコンボタン、ホバー反応、ナビ。

## Preview

公開プレビュー: https://animation-factory.app/preview/progress-bar

## Implementation

### Vanilla CSS — determinate

```html
<div class="progress" role="progressbar"
     aria-valuenow="42" aria-valuemin="0" aria-valuemax="100">
  <div class="progress-bar" style="--value: 0.42"></div>
</div>
```

```css
.progress {
  position: relative;
  height: 4px;
  background: rgba(255, 255, 255, 0.08);
  border-radius: 999px;
  overflow: hidden;
}
.progress-bar {
  position: absolute;
  inset: 0;
  transform-origin: left center;
  transform: scaleX(var(--value, 0));
  background: rgb(190, 242, 100);
  transition: transform 320ms ease-out;
}
```

### Vanilla CSS — indeterminate

```html
<div class="progress" role="progressbar" aria-busy="true"></div>
```

```css
.progress::after {
  content: "";
  position: absolute;
  inset: 0;
  width: 40%;
  background: linear-gradient(90deg, transparent, rgb(190, 242, 100), transparent);
  animation: progress-indeterminate 1200ms linear infinite;
}
@keyframes progress-indeterminate {
  from { transform: translateX(-100%); }
  to   { transform: translateX(250%); }
}

@media (prefers-reduced-motion: reduce) {
  .progress::after { animation: none; opacity: 0.5; transform: translateX(0); }
}
```

## Usage

```tsx
<div className="progress" role="progressbar" aria-valuenow={pct} aria-valuemin={0} aria-valuemax={100}>
  <div className="progress-bar" style={{ ["--value" as string]: pct / 100 }} />
</div>
```

## AI Apply Prompt

### Context
`{{target_selector}}` に進捗バーを表示する。判明している進行度なら determinate、不明なら indeterminate。

### Steps
1. 上記 HTML / CSS を導入。
2. `role="progressbar"` と aria-value* 属性を必ず付ける（indeterminate は aria-busy）。
3. determinate の値は CSS 変数 `--value`（0..1）を更新する。

### Examples

Determinate:
```html
<div class="progress" role="progressbar" aria-valuenow="42">
  <div class="progress-bar" style="--value: 0.42"></div>
</div>
```

Indeterminate:
```html
<div class="progress" role="progressbar" aria-busy="true"></div>
```

### Verify
- determinate: value 変更で transform: scaleX が滑らかに補間
- indeterminate: ハイライト帯が左→右に無限ループ
- Reduce Motion で indeterminate のループが止まる（静止）
- スクリーンリーダーが進捗を読み上げる（aria-valuenow）

## Accessibility

determinate は `aria-valuenow` / `aria-valuemin` / `aria-valuemax` を必ず。indeterminate は `aria-busy="true"`、`aria-valuenow` 省略。Reduce Motion でループ停止。

## Performance Notes

`transform: scaleX` のみ補間。`width` の transition は Layout を伴うので避ける。indeterminate は `translateX` の rAF ベース。

## Changelog

- 2026-05-27 (created): 初版。Phase 3 D1 第 3 弾、feedback 拡充。
