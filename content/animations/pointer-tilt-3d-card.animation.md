---
id: pointer-tilt-3d-card
name: Pointer Tilt 3D Card
version: 1.0.0
release: beta
variant: vanilla-css
description: |
  カードがポインタの位置に応じて 3D（perspective）で傾き、光沢（glare）が追従する。
  pointermove で読み取った座標を CSS 変数に渡し、transform: rotateX/rotateY で立体的に反応させる。

taxonomy:
  layer: [css]
  ux_role:
    primary: micro-interaction
    secondary: [attention]
  trigger: [pointer-move]
  media: [dom-css]
  authoring: code

behavior:
  lifecycle: continuous
  reversible: true
  replay: every-entry

tags:
  - tilt
  - 3d
  - perspective
  - pointer
  - card
  - hover
  - parallax

trigger:
  primary: pointer-move
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
    name: "CSS 3D transform + CSS 変数（pointermove で更新）"
    dependencies: []
    browser_support: { baseline: widely-available, baseline_year: 2017 }
    performance: { gpu_accelerated: true, layout_thrash: false, cost: low }
    degrades_to: 2
  - tier: 2
    name: "ホバーのみの軽量 tilt（固定角）"
    dependencies: []
    browser_support: { baseline: widely-available, baseline_year: 2015 }
    degradation: ":hover で固定角の rotateX/Y だけ与える。ポインタ追従なしの簡易版"
    performance: { gpu_accelerated: true, layout_thrash: false, cost: low }

browser_support:
  baseline: widely-available
  baseline_year: 2017
  notes: "代表値は Tier 1。transform は GPU 合成。座標→角度の計算のみ JS、描画は CSS"

performance:
  gpu_accelerated: true
  layout_thrash: false
  cost: low
  notes: "rotateX/rotateY/translateZ の transform のみ。pointermove は rAF でスロットルすると安定"

parameters:
  - { name: max_tilt_deg, type: number, default: 12, range: [4, 20],  description: "最大傾き角(度)" }
  - { name: perspective_px, type: number, default: 800, range: [400, 1400], description: "遠近の強さ(px)" }
  - { name: glare,        type: number, default: 1,  range: [0, 1],   description: "光沢の有無(0/1)" }

a11y:
  respects_reduced_motion: true
  fallback: "傾き/glare を無効化し静止。情報はカード内容で完結させ、tilt は装飾に留める"
  focus_safe: true
  notes: "pointer-move 依存なのでタッチ/キーボードでは発火しない＝装飾扱い。重要情報を傾きに依存させない。reduced-motion で停止"

license: MIT
authors: ["@daichi"]
sources:
  - { title: "MDN: perspective", url: "https://developer.mozilla.org/en-US/docs/Web/CSS/perspective" }
  - { title: "MDN: transform rotate3d", url: "https://developer.mozilla.org/en-US/docs/Web/CSS/transform-function/rotate3d" }
attribution_required: false

preview:
  url: https://animation-factory.app/preview/pointer-tilt-3d-card
  loop: true
  duration_ms: 3000

related:
  alternatives: [hover-tilt, hover-lift, cursor-spotlight]
  composes_with:
    - { id: cursor-spotlight, note: "tilt に cursor-spotlight の光沢追従を重ねると立体感が増す" }
  requires: []

sections:
  skip: [variants]

ai:
  intent_examples:
    - "マウスの位置に合わせてカードが 3D で傾く"
    - "ポインタ追従の立体的なホバーカード"
    - "perspective で傾く商品/プロフィールカード"
  apply_targets: ["product-card", "profile-card", "feature-card", "thumbnail"]
  do_not_apply_to: ["body-text", "form-input", "dense-table"]
---

## Overview

カードがポインタの位置に応じて 3D で傾く。`pointermove` で要素内の相対座標を取り、`--rx`/`--ry` の CSS 変数に渡して `transform: perspective() rotateX() rotateY()` を更新。光沢（glare）も同じ座標で動かすと立体感が増す。ポインタから外れると元の平面に戻る。タッチ/キーボードでは発火しない装飾。

使う場面: 商品・プロフィール・機能カードのホバー演出。
避けたい場面: 本文、フォーム、密なテーブル、重要情報を傾きで隠す構成。

## Preview

公開プレビュー: https://animation-factory.app/preview/pointer-tilt-3d-card

## Implementation

### CSS 3D transform + CSS 変数

```css
.tilt {
  --rx: 0deg; --ry: 0deg;
  transform: perspective(800px) rotateX(var(--rx)) rotateY(var(--ry));
  transition: transform 120ms ease-out;
  transform-style: preserve-3d;
}
.tilt .glare {
  background: radial-gradient(circle at var(--gx, 50%) var(--gy, 50%),
    rgb(255 255 255 / 0.25), transparent 60%);
}
@media (prefers-reduced-motion: reduce) {
  .tilt { transform: none; transition: none; }
}
```

```ts
function onMove(e: PointerEvent, el: HTMLElement) {
  const r = el.getBoundingClientRect();
  const px = (e.clientX - r.left) / r.width;   // 0..1
  const py = (e.clientY - r.top) / r.height;   // 0..1
  el.style.setProperty("--ry", `${(px - 0.5) * 24}deg`);
  el.style.setProperty("--rx", `${(0.5 - py) * 24}deg`);
  el.style.setProperty("--gx", `${px * 100}%`);
  el.style.setProperty("--gy", `${py * 100}%`);
}
```

### ホバーのみ簡易版（縮退）

`:hover` で固定角の `rotateX/Y` を与えるだけのポインタ非依存版。

## Usage

```html
<div class="tilt" onpointermove="onMove(event, this)" onpointerleave="reset(this)">…</div>
```

## AI Apply Prompt

### Context
`{{card}}` をポインタ追従で 3D 傾斜させる。

### Steps
1. 上記 CSS を追記、`pointermove` で `--rx`/`--ry`/`--gx`/`--gy` を更新（rAF でスロットル）。
2. `pointerleave` で変数を 0 に戻す。
3. Reduce Motion で transform を無効化、重要情報は傾きに依存させない。

### Verify
- ポインタ位置に応じてカードが傾き glare が追従
- 外れると平面に戻る
- Reduce Motion で静止、タッチで誤発火しない

## Accessibility

pointer-move 依存の純粋な装飾。タッチ/キーボードでは発火しないため、重要情報を傾きに依存させない。`prefers-reduced-motion` で完全停止。

## Performance Notes

`rotateX/rotateY` の transform のみで GPU 合成。`pointermove` は `requestAnimationFrame` でスロットルしてフレーム飽和を防ぐ。`will-change: transform` をホバー中だけ付ける手もある。

## Changelog

- 2026-06-01 (created): 初版。v1.1 Batch 4（トリガー多様化: pointer-move）第 5 弾。hover-tilt の進化版。
