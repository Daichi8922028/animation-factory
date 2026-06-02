---
id: svg-blob-morph
name: SVG Blob Morph
version: 1.0.0
release: v1.2
variant: react-motion
description: |
  有機的な blob の SVG path（d 属性）を複数形状へ連続モーフし、ゆっくり形を変え続ける装飾アニメーション。
  ヒーロー背景、CTA の地、空き領域のアクセントに。autoplay / continuous で生命感を出す。

taxonomy:
  layer: [library, js-runtime]
  ux_role:
    primary: decorative
    secondary: [ambient]
  trigger: [autoplay]
  media: [svg]
  authoring: code

behavior:
  lifecycle: continuous
  reversible: false
  replay: every-entry

tags:
  - svg
  - blob
  - morph
  - path
  - organic
  - decorative
  - background

trigger:
  primary: autoplay
  touch_fallback: always-on
  config:
    loop: true

runtime:
  language: typescript
  framework: react
  framework_version: ">=18"
dependencies:
  - { name: motion, version: "^12.0.0", purpose: "path の d をキーフレーム補間してモーフ駆動" }
peer_dependencies:
  - { name: react, version: ">=18" }

implementations:
  - tier: 1
    name: "React + Motion (d keyframes)"
    dependencies: [ { name: motion, version: "^12.0.0" } ]
    browser_support: { baseline: widely-available, baseline_year: 2020 }
    performance: { gpu_accelerated: false, layout_thrash: false, cost: medium }
    degrades_to: 2
  - tier: 2
    name: "SVG SMIL (<animate attributeName=d>)"
    dependencies: []
    browser_support: { baseline: widely-available, baseline_year: 2018 }
    performance: { gpu_accelerated: false, layout_thrash: false, cost: low }
    degradation: "JS なしの宣言的モーフ。timing 制御や Reduce Motion 分岐は粗くなり、停止制御も難しい"

browser_support:
  baseline: widely-available
  baseline_year: 2020
  notes: "代表値は Tier 1（Motion）。path の d 補間は同一コマンド構造（点数・命令列が一致）が前提"

performance:
  gpu_accelerated: false
  layout_thrash: false
  cost: medium
  notes: "d の補間は Paint で完結し Composite ではない。大きい blob を多数同時に動かすと Paint コストが上がるため数を絞る"

parameters:
  - { name: duration_ms, type: number, default: 8000, range: [3000, 20000], description: "全形状を一巡するループ時間" }
  - { name: shape_count, type: number, default: 4, range: [2, 8], description: "巡回する blob 形状の数（各 path は同一コマンド構造で揃える）" }
  - { name: easing, type: enum, default: "easeInOut",
      values: ["linear", "easeIn", "easeOut", "easeInOut"], description: "形状間の補間イージング" }

a11y:
  respects_reduced_motion: true
  fallback: "モーフを停止し、最初の blob 形状を静止表示（duration 0）"
  focus_safe: true
  notes: "装飾用途。意味を持たないため role=\"img\" + aria-label か、純装飾なら aria-hidden=\"true\" を付ける"

license: MIT
authors: ["@daichi"]
sources:
  - { title: "Motion: Animate SVG paths (d)", url: "https://motion.dev/docs/react-svg" }
attribution_required: false

preview:
  url: https://animation-factory.app/preview/svg-blob-morph
  loop: true
  duration_ms: 8000

related:
  alternatives: [svg-line-draw, gsap-morph-svg-icon, scale-in]
  composes_with:
    - { id: blur-in, note: "blob を背景に置き、前景コンテンツを blur-in で出すとシネマティック" }
    - { id: fade-up, note: "blob の上に乗せる見出し・本文を fade-up で順次登場させる" }
  requires: []

sections:
  skip: [variants]

ai:
  intent_examples:
    - "有機的な blob が背景でゆっくり形を変え続ける装飾"
    - "SVG の path をモーフさせたい"
    - "ヒーローの地に動く blob シェイプを敷きたい"
  apply_targets: ["hero-background", "cta-section", "decorative-shape", "key-visual-bg"]
  do_not_apply_to: ["body-text", "form", "data-table", "navigation-bar", "icon-button"]
---

## Overview

中心周りの有機的な閉曲線（blob）を表す SVG `<path>` の `d` 属性を、複数形状のキーフレーム間で連続補間してモーフし続ける。各 `d` を **同一のコマンド構造**（同じ数の `C` 3 次ベジェなど）で揃えるのがコツで、これにより Motion が点同士を 1:1 で補間でき、形が破綻しない。`autoplay` で常時ゆるやかに動き、`continuous` lifecycle として生命感のある装飾になる。

使う場面: ヒーロー背景 / CTA セクションの地 / 余白のアクセント / キービジュアル背景。
避けたい場面: 本文・フォーム・データテーブル・ナビ（動く装飾が可読性と操作を妨げる）。

## Preview

公開プレビュー: https://animation-factory.app/preview/svg-blob-morph

## Implementation

### React + Motion (d keyframes)

```tsx
"use client";
import { motion, useReducedMotion } from "motion/react";

// すべて "M … C … C … C … C … Z" の同一コマンド構造で揃える（点数・命令列を一致させる）。
const SHAPES = [
  "M100 28 C140 24 176 52 178 96 C180 140 148 176 100 176 C52 176 24 138 26 96 C28 54 60 32 100 28 Z",
  "M100 22 C150 30 170 60 172 104 C174 148 140 182 96 178 C52 174 30 140 28 98 C26 56 50 14 100 22 Z",
  "M100 30 C138 18 178 48 176 92 C174 136 152 174 102 176 C52 178 22 150 26 102 C30 54 62 42 100 30 Z",
];

export function BlobMorph() {
  const reduce = useReducedMotion();
  const sequence = [...SHAPES, SHAPES[0]]; // 先頭へ戻して閉ループ

  return (
    <svg viewBox="0 0 200 200" role="img" aria-label="装飾の blob">
      <motion.path
        fill="#a3e635"
        initial={{ d: SHAPES[0] }}
        animate={reduce ? { d: SHAPES[0] } : { d: sequence }}
        transition={
          reduce
            ? { duration: 0 }
            : { duration: 8, ease: "easeInOut", repeat: Infinity, repeatType: "loop" }
        }
      />
    </svg>
  );
}
```

### SVG SMIL（縮退 / JS なし）

```html
<!-- 宣言的モーフ。Reduce Motion 分岐や停止制御は粗くなる。 -->
<svg viewBox="0 0 200 200" aria-hidden="true">
  <path fill="#a3e635" d="M100 28 C140 24 176 52 178 96 C180 140 148 176 100 176 C52 176 24 138 26 96 C28 54 60 32 100 28 Z">
    <animate attributeName="d" dur="8s" repeatCount="indefinite"
      values="
        M100 28 C140 24 176 52 178 96 C180 140 148 176 100 176 C52 176 24 138 26 96 C28 54 60 32 100 28 Z;
        M100 22 C150 30 170 60 172 104 C174 148 140 182 96 178 C52 174 30 140 28 98 C26 56 50 14 100 22 Z;
        M100 28 C140 24 176 52 178 96 C180 140 148 176 100 176 C52 176 24 138 26 96 C28 54 60 32 100 28 Z" />
  </path>
</svg>
```

## Usage

```tsx
<div className="relative">
  <BlobMorph /> {/* 背景装飾として absolute 配置するのが定番 */}
  <div className="relative z-10">{/* 前景コンテンツ */}</div>
</div>
```

## AI Apply Prompt

### Context
`{{target_selector}}` の背景に、ゆっくり形を変える有機的な blob を 1 つ敷く。

### Steps
1. `motion@^12` を `{{package_manager}}` で追加（未導入なら）。
2. 上記コンポーネントを `{{target_file}}` に追加。サーバコンポーネントから呼ぶ場合は `"use client"` を確認。
3. `SHAPES` の各 `d` は **同一コマンド構造**（同じ数・順序の `C` など）で用意する。構造が違うと補間が破綻する。
4. ループを閉じるため `sequence` の末尾に先頭形状を足す（`[...SHAPES, SHAPES[0]]`）。
5. `useReducedMotion()` の分岐で、Reduce Motion 時は `duration: 0` かつ単一形状を維持する。
6. 装飾なら `aria-hidden="true"`、意味を持たせるなら `role="img"` + `aria-label` を付ける。

### Examples

Before: 静的な `<svg><path d="…" /></svg>`
After: `<motion.path animate={{ d: sequence }} … />` で連続モーフ

### Verify
- blob が複数形状を滑らかに巡回し、先頭に戻ってシームレスにループする
- 形が破綻しない（各 `d` のコマンド構造が一致している）
- Reduce Motion ON で動かず、最初の形状が静止表示される
- 背景装飾として前景テキストの可読性を妨げていない
- unmount 後にアニメが残らない（Motion が自動でクリーンアップ）

## Accessibility

- 純装飾なら `aria-hidden="true"` を SVG に付け、スクリーンリーダーから隠す。意味を持たせる場合のみ `role="img"` + `aria-label`。
- Reduce Motion 設定では連続モーフを止め、最初の形状を静止表示する（`duration: 0`、単一の `d`）。
- 動く装飾の上に本文やフォームを重ねない。重ねる場合は十分なコントラストと静止した前景レイヤーを確保する。

## Performance Notes

- `d` の補間は Paint で完結し Composite ではないため、`transform` 系より相対的に重い。1 画面で動かす blob は 1〜2 個に絞る。
- 形状数（`shape_count`）と `duration` のバランスで滑らかさを調整。形状が多いほど 1 区間が短くなり、動きが速く見える。
- `filter: blur` や `drop-shadow` を重ねると Paint コストがさらに増える。装飾の質感が要る場合のみ控えめに。
- Motion はコンポーネント unmount 時にアニメーションを自動停止するため、手動クリーンアップは不要。

## Changelog

- 2026-06-02 (created): 初版。v1.2（Tier B）、SVG blob の d モーフ。Tier 1 Motion / Tier 2 SMIL 縮退。
