---
id: spinner-dots
name: Spinner Dots
version: 1.0.0
release: alpha
variant: vanilla-css
description: |
  3 つのドットが順に上下しながら点滅する、定番のローディングスピナー。
  純 CSS @keyframes で完結し依存ゼロ。

taxonomy:
  layer: [css]
  ux_role:
    primary: feedback
    secondary: []
  trigger: [time]
  media: [dom-css]
  authoring: code

behavior:
  lifecycle: continuous
  reversible: false
  replay: every-entry

tags:
  - spinner
  - loading
  - dots
  - pending

trigger:
  primary: time
  touch_fallback: always-on
  config: {}

runtime:
  language: css
  framework: none
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
  notes: "@keyframes / transform は全モダンブラウザ対応"

performance:
  gpu_accelerated: true
  layout_thrash: false
  cost: low
  notes: "transform / opacity のみ。低コスト"

parameters:
  - { name: dot_size_px, type: number, default: 8,    range: [4, 16],    description: "ドット直径" }
  - { name: gap_px,      type: number, default: 6,    range: [2, 12],    description: "ドット間隔" }
  - { name: duration_ms, type: number, default: 1200, range: [600, 2400], description: "1 周期の長さ" }

a11y:
  respects_reduced_motion: true
  fallback: "アニメーション停止。固定 3 ドット表示で『読み込み中』は role/aria に委ねる"
  focus_safe: true
  notes: "コンテナに `role='status'` と `aria-label='読み込み中'` を付ける"

license: MIT
authors: ["@daichi"]
sources: []
attribution_required: false

preview:
  url: https://animation-factory.app/preview/spinner-dots
  thumbnail: ./assets/spinner-dots.webp
  loop: true
  duration_ms: 1200

related:
  alternatives: [skeleton-shimmer]
  composes_with: []
  requires: []

sections:
  skip: [variants, examples_in_the_wild]

ai:
  intent_examples:
    - "ローディングスピナーを入れたい"
    - "シンプルな 3 ドット スピナー"
  apply_targets: ["loading-area", "button-loading-state"]
  do_not_apply_to: ["static-content"]
---

## Overview

3 つのドットが順番に上下にバウンドし、データ取得中であることを示す。CSS @keyframes だけで完結、依存ゼロ。ボタンの待機状態やセクションのローディングプレースホルダに使う。

避けたい場面: 長時間表示（30s 超 — 進捗バーへ）/ 静的コンテンツの装飾。

## Preview

公開プレビュー: https://animation-factory.app/preview/spinner-dots

## Implementation

### Vanilla CSS

```css
@keyframes spinner-dot {
  0%, 80%, 100% { transform: translateY(0); opacity: 0.4; }
  40%          { transform: translateY(-6px); opacity: 1; }
}
.spinner-dots {
  display: inline-flex;
  gap: 6px;
}
.spinner-dots span {
  display: block;
  width: 8px;
  height: 8px;
  background: currentColor;
  border-radius: 50%;
  animation: spinner-dot 1.2s ease-in-out infinite;
}
.spinner-dots span:nth-child(2) { animation-delay: 0.15s; }
.spinner-dots span:nth-child(3) { animation-delay: 0.30s; }
@media (prefers-reduced-motion: reduce) {
  .spinner-dots span { animation: none; opacity: 0.7; }
}
```

## Usage

```html
<div class="spinner-dots" role="status" aria-label="読み込み中">
  <span></span><span></span><span></span>
</div>
```

## AI Apply Prompt

### Context
`{{target_selector}}` に "読み込み中" を示す 3 ドットスピナーを置く。依存なし。

### Steps
1. 上記 CSS をスタイルシートに追加。
2. `{{target_file}}` の対象位置に上記 HTML を入れる。
3. `role="status"` と `aria-label` を必ず保つ。
4. 色は親の `color` で決まる（`currentColor`）。

### Examples

Before: `<div>Loading...</div>`
After: `<div class="spinner-dots" role="status" aria-label="読み込み中"><span></span><span></span><span></span></div>`

### Verify
- 3 ドットが順に弾む
- 親の `color` で色が変わる
- Reduce Motion ON でアニメ停止、要素は表示維持
- スクリーンリーダーが「読み込み中」と読み上げる

## Accessibility

`role="status"` でライブリージョン。`aria-label` で意味を伝える。Reduce Motion ではアニメを止めつつ表示自体は残し、状態を視覚＋音声両方に伝える。

## Performance Notes

`transform` と `opacity` のみ。GPU 内で完結。

## Changelog

- 2026-05-23 (created): 初版。スキーマ v1.0、release alpha。
