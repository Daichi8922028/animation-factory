---
id: magnetic-button
name: Magnetic Button
version: 1.0.0
release: alpha
variant: react-motion
description: |
  ボタンがカーソルに引き寄せられるように追従する micro-interaction。
  ランディングページの CTA 強調や、Awwwards 系の遊び心ある演出に。

taxonomy:
  layer: [library, js-runtime]
  ux_role:
    primary: micro-interaction
    secondary: [feedback]
  trigger: [pointer]
  media: [dom-css]
  authoring: code

behavior:
  lifecycle: continuous
  reversible: true
  replay: every-entry

tags:
  - magnetic
  - hover
  - cta
  - cursor
  - parallax
  - micro

trigger:
  primary: pointer
  touch_fallback: disabled
  config: {}

runtime:
  language: typescript
  framework: react
  framework_version: ">=18"
dependencies:
  - { name: motion, version: "^11.0.0", purpose: "useMotionValue + spring" }
peer_dependencies:
  - { name: react, version: ">=18" }

implementations:
  - tier: 1
    name: "React + Motion (spring)"
    dependencies: [ { name: motion, version: "^11.0.0" } ]
    browser_support: { baseline: widely-available, baseline_year: 2020 }
    performance: { gpu_accelerated: true, layout_thrash: false, cost: low }

browser_support:
  baseline: widely-available
  baseline_year: 2020
  notes: "代表値は Tier 1。ボタンの中心からポインタまでの差分に減衰係数を掛けて translateX/Y"

performance:
  gpu_accelerated: true
  layout_thrash: false
  cost: low
  notes: "useMotionValue で再レンダーを避け、pointer 周辺だけで spring 駆動"

parameters:
  - { name: strength, type: number, default: 0.4, range: [0.1, 1.0], description: "追従の強さ（0.4 で控えめ、1.0 で完全追従）" }
  - { name: range_px, type: number, default: 80, range: [40, 200], description: "反応するポインタ距離" }
  - { name: stiffness, type: number, default: 220, range: [100, 600], description: "戻り spring" }

a11y:
  respects_reduced_motion: true
  fallback: "追従を無効化。:hover で軽い scale だけ残す"
  focus_safe: true
  notes: "タッチ端末では発火しない。focus-visible はカーソル無関係なので通常の outline を出す"

license: MIT
authors: ["@daichi"]
sources: []
attribution_required: false

preview:
  url: https://animation-factory.app/preview/magnetic-button
  loop: true
  duration_ms: 2400

related:
  alternatives: [hover-tilt, hover-glow]
  composes_with:
    - { id: hover-glow, note: "magnetic + glow で「主役 CTA」の表現に" }
  requires: []

sections:
  skip: [variants]

ai:
  intent_examples:
    - "CTA ボタンがカーソルに引き寄せられる"
    - "Awwwards っぽい magnetic hover"
    - "遊び心のあるボタン hover"
  apply_targets: ["hero-cta", "primary-button", "featured-link"]
  do_not_apply_to: ["icon-button-small", "form-submit-button", "navigation"]
---

## Overview

ボタン中心からポインタへのオフセットを `strength`（0..1）でスケールし、`translateX/Y` に適用。離れたら spring で元位置へ戻る。`range_px` の範囲外なら反応しない（無限に追従しない）。

使う場面: ランディングページのヒーロー CTA、特集セクションのリンク、製品紹介の主要 CTA。
避けたい場面: 小さいアイコンボタン、フォーム submit、ナビゲーション（誤操作の温床）。

## Preview

公開プレビュー: https://animation-factory.app/preview/magnetic-button

## Implementation

### React + Motion

```tsx
"use client";
import { motion, useMotionValue, useSpring } from "motion/react";

export function MagneticButton({
  children, strength = 0.4, rangePx = 80,
}: { children: React.ReactNode; strength?: number; rangePx?: number }) {
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const sx = useSpring(x, { stiffness: 220, damping: 18 });
  const sy = useSpring(y, { stiffness: 220, damping: 18 });

  return (
    <motion.button
      type="button"
      onPointerMove={(e) => {
        const r = e.currentTarget.getBoundingClientRect();
        const cx = r.left + r.width / 2;
        const cy = r.top + r.height / 2;
        const dx = e.clientX - cx;
        const dy = e.clientY - cy;
        const d = Math.sqrt(dx * dx + dy * dy);
        if (d > rangePx) { x.set(0); y.set(0); return; }
        x.set(dx * strength);
        y.set(dy * strength);
      }}
      onPointerLeave={() => { x.set(0); y.set(0); }}
      style={{ x: sx, y: sy }}
      className="rounded-full px-6 py-3 bg-lime-300 text-zinc-900 font-medium"
    >
      {children}
    </motion.button>
  );
}
```

## Usage

```tsx
<MagneticButton>続ける →</MagneticButton>
```

## AI Apply Prompt

### Context
`{{target_selector}}` の CTA を magnetic hover にする。

### Steps
1. `motion@^11` を `{{package_manager}}` で追加。
2. `MagneticButton` を `{{target_file}}` に追加。
3. 小さい要素・フォーム submit には使わない（誤操作）。

### Examples

Before: `<button className="cta">続ける</button>`
After: `<MagneticButton>続ける →</MagneticButton>`

### Verify
- ポインタが範囲内に入るとボタンが追従
- 離れると spring で戻る
- タッチ端末で発火しない
- Reduce Motion で追従なし、通常の hover のみ

## Accessibility

`useReducedMotion` で追従無効化。focus-visible は通常 outline、追従とは無関係。

## Performance Notes

`useMotionValue` で再レンダーなし、pointer 周辺で spring 駆動するため軽い。

## Changelog

- 2026-05-27 (created): 初版。Phase 3 D1 第 5 弾、Tier A hover 系拡充。
