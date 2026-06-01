---
id: pulse-attention
name: Pulse Attention
version: 1.0.0
release: v1.0
variant: vanilla-css
description: |
  バッジやドットを定期的に脈動させ、ユーザーの注意を集める。
  純 CSS の transform: scale + opacity。"うるさくない" 強度に抑えるのが要点。

taxonomy:
  layer: [css]
  ux_role:
    primary: attention
    secondary: [feedback]
  trigger: [time]
  media: [dom-css]
  authoring: code

behavior:
  lifecycle: continuous
  reversible: false
  replay: every-entry

tags:
  - pulse
  - attention
  - badge
  - notification
  - heartbeat

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
  - { name: duration_ms,    type: number, default: 1800, range: [800, 3000], description: "1 周期の長さ" }
  - { name: max_scale,      type: number, default: 1.6,  range: [1.1, 2.5],  description: "ピーク時の拡大率" }
  - { name: peak_opacity,   type: number, default: 0.4,  range: [0.1, 0.8],  description: "ピーク時の不透明度" }

a11y:
  respects_reduced_motion: true
  fallback: "脈動を停止し、ドット自体は残す（情報の有無は伝わる）"
  focus_safe: true
  notes: "視覚的注意のみ。意味的通知が必要なら `aria-live='polite'` を併用"

license: MIT
authors: ["@daichi"]
sources: []
attribution_required: false

preview:
  url: https://animation-factory.app/preview/pulse-attention
  thumbnail: ./assets/pulse-attention.webp
  loop: true
  duration_ms: 1800

related:
  alternatives: []
  composes_with:
    - { id: hover-lift, note: "通知バッジ付きのカードでよくセットになる" }
  requires: []

sections:
  skip: [variants, examples_in_the_wild]

ai:
  intent_examples:
    - "通知バッジに脈動を付けたい"
    - "ハートビート的なアテンション"
  apply_targets: ["notification-badge", "live-dot", "new-indicator"]
  do_not_apply_to: ["large-headlines", "本文テキスト"]
---

## Overview

注意を引きたい要素（通知バッジ・ライブ配信中ドット・新着インジケータ）に、ゆっくりした脈動を加える。強すぎる動きは UX を壊すので、ピークの opacity を 0.4 程度に抑えて控えめに。

避けたい場面: 大きな見出し・本文（読みの邪魔）/ 同時に複数並ぶ（アテンションが分散して逆効果）。

## Preview

公開プレビュー: https://animation-factory.app/preview/pulse-attention

## Implementation

### Vanilla CSS

```css
@keyframes pulse-ring {
  0%   { transform: scale(0.8); opacity: 0.4; }
  100% { transform: scale(1.6); opacity: 0; }
}
.pulse-dot {
  position: relative;
  display: inline-block;
  width: 8px;
  height: 8px;
  background: currentColor;
  border-radius: 50%;
}
.pulse-dot::after {
  content: "";
  position: absolute;
  inset: 0;
  border-radius: 50%;
  background: currentColor;
  animation: pulse-ring 1.8s ease-out infinite;
}
@media (prefers-reduced-motion: reduce) {
  .pulse-dot::after { animation: none; opacity: 0; }
}
```

## Usage

```html
<span class="pulse-dot" style="color: rgb(132 204 22);"></span>
```

## AI Apply Prompt

### Context
`{{target_selector}}` に脈動するドット（通知/ライブ表示用）を置く。依存なし。

### Steps
1. 上記 CSS を追加。
2. 通知ドットの位置に `<span class="pulse-dot"></span>` を置く。色は親の `color` で決まる。
3. 同時に複数並べない（最大 1〜2 個）。

### Examples

Before: `<span class="badge">New</span>`
After:  `<span class="badge"><span class="pulse-dot"></span> New</span>`

### Verify
- ゆったり 1.8s 周期で脈動
- 色が currentColor で親に追従
- Reduce Motion ON で停止（ドット本体は残る）

## Accessibility

視覚効果のみ。「ライブ配信中」など意味のある状態は別途 `aria-live` 等で伝える。

## Performance Notes

`transform` と `opacity` のみ。GPU 内で完結。

## Changelog

- 2026-05-23 (created): 初版。スキーマ v1.0、release alpha。
