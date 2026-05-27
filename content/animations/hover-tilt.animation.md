---
id: hover-tilt
name: Hover Tilt
version: 1.0.0
release: alpha
variant: react-motion
description: |
  ポインタ位置に応じてカードが 3D 風に傾く micro-interaction。
  Apple / Stripe 系のカードホバー演出の定番。

taxonomy:
  layer: [css, js-runtime, library]
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
  - hover
  - tilt
  - 3d
  - perspective
  - card
  - parallax

trigger:
  primary: pointer
  touch_fallback: disabled
  config:
    perspective_px: 800

runtime:
  language: typescript
  framework: react
  framework_version: ">=18"
dependencies:
  - { name: motion, version: "^11.0.0", purpose: "transform 補間" }
peer_dependencies:
  - { name: react, version: ">=18" }

implementations:
  - tier: 1
    name: "React + Motion"
    dependencies: [ { name: motion, version: "^11.0.0" } ]
    browser_support: { baseline: widely-available, baseline_year: 2020 }
    performance: { gpu_accelerated: true, layout_thrash: false, cost: low }
    degrades_to: 2
  - tier: 2
    name: "Vanilla CSS (固定角度)"
    dependencies: []
    browser_support: { baseline: widely-available, baseline_year: 2015 }
    performance: { gpu_accelerated: true, layout_thrash: false, cost: low }
    degradation: "ポインタ追従はできない。:hover で軽い固定角度の傾きへ縮退"

browser_support:
  baseline: widely-available
  baseline_year: 2020
  notes: "代表値は Tier 1。perspective + rotate{X,Y} の合成"

performance:
  gpu_accelerated: true
  layout_thrash: false
  cost: low
  notes: "pointermove を rAF でスロットルするか useMotionValue 経由で reactive にする"

parameters:
  - { name: max_tilt_deg, type: number, default: 10,  range: [4, 25],   description: "最大傾き角度（X / Y それぞれ）" }
  - { name: perspective_px, type: number, default: 800, range: [300, 1600], description: "perspective 強度。小さいほど強くパース" }
  - { name: spring_stiffness, type: number, default: 220, range: [80, 500], description: "戻り spring の硬さ" }

a11y:
  respects_reduced_motion: true
  fallback: "rotate を無効化、focus-visible で軽い outline のみ"
  focus_safe: true
  notes: "回転は VR モーション酔いに近い体験を生むため Reduce Motion 必須尊重。タッチ端末は完全無効化"

license: MIT
authors: ["@daichi"]
sources: []
attribution_required: false

preview:
  url: https://animation-factory.app/preview/hover-tilt
  loop: true
  duration_ms: 1500

related:
  alternatives: [hover-lift, hover-glow]
  composes_with:
    - { id: hover-glow, note: "tilt + glow で強い CTA 表現になる（重ねすぎ注意）" }
  requires: []

sections:
  skip: [variants]

ai:
  intent_examples:
    - "カードがマウス追従で 3D 風に傾くやつ"
    - "プロダクト紹介カードに parallax 風の hover"
    - "Stripe や Apple のカードみたいな傾き"
  apply_targets: ["product-card", "feature-card", "showcase-tile"]
  do_not_apply_to: ["text-input", "small-button", "data-table-row"]
---

## Overview

カードの中心からポインタ位置までのオフセットを `rotateX` / `rotateY` にマップして、3D 風の parallax を出す。perspective を親に持たせ、子要素の transform 合成で表現する。

使う場面: プロダクト紹介カード、機能ハイライト、ショーケースタイル。
避けたい場面: 入力、小ボタン、密なテーブル行。

## Preview

公開プレビュー: https://animation-factory.app/preview/hover-tilt

## Implementation

### React + Motion

```tsx
"use client";
import { motion, useMotionValue, useTransform, useSpring } from "motion/react";

export function HoverTilt({
  children,
  maxTiltDeg = 10,
}: { children: React.ReactNode; maxTiltDeg?: number }) {
  const mx = useMotionValue(0); // -0.5 .. 0.5
  const my = useMotionValue(0);
  const rotX = useSpring(useTransform(my, (v) => -v * maxTiltDeg * 2), { stiffness: 220, damping: 18 });
  const rotY = useSpring(useTransform(mx, (v) =>  v * maxTiltDeg * 2), { stiffness: 220, damping: 18 });

  return (
    <div style={{ perspective: 800 }}>
      <motion.div
        onPointerMove={(e) => {
          const r = e.currentTarget.getBoundingClientRect();
          mx.set((e.clientX - r.left) / r.width - 0.5);
          my.set((e.clientY - r.top) / r.height - 0.5);
        }}
        onPointerLeave={() => { mx.set(0); my.set(0); }}
        style={{ rotateX: rotX, rotateY: rotY, transformStyle: "preserve-3d" }}
      >
        {children}
      </motion.div>
    </div>
  );
}
```

### Vanilla CSS（固定角度・縮退）

```css
.tilt-card { transition: transform 220ms ease-out; will-change: transform; }
@media (hover: hover) {
  .tilt-card:hover { transform: perspective(800px) rotateX(4deg) rotateY(-4deg); }
}
@media (prefers-reduced-motion: reduce) { .tilt-card:hover { transform: none; } }
```

## Usage

```tsx
<HoverTilt maxTiltDeg={12}>
  <Card />
</HoverTilt>
```

## AI Apply Prompt

### Context
`{{target_selector}}` にポインタ追従の 3D tilt を付ける。

### Steps
1. `motion@^11` を `{{package_manager}}` で追加。
2. `HoverTilt` を `{{target_file}}` に追加し、対象を包む。
3. 親に `perspective` が要る点を確認（コンポーネント内で持たせている）。

### Examples

Before: `<Card />`
After: `<HoverTilt><Card /></HoverTilt>`

### Verify
- ポインタ移動でカードが傾く、離れると元に戻る（spring）
- タッチ端末では発火しない（pointer + hover 前提）
- Reduce Motion ON で rotate しない

## Accessibility

Reduce Motion で完全無効化。focus-visible には rotate を当てない。VR 酔い対策として `max_tilt_deg` を 12 以下に推奨。

## Performance Notes

`pointermove` は useMotionValue で reactive に扱うことで再レンダーを避ける。`rAF` スロットル不要。

## Changelog

- 2026-05-26 (created): 初版。Phase 3 D1 第 3 弾、hover-press 拡充。
