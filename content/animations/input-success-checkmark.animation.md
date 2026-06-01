---
id: input-success-checkmark
name: Input Success Checkmark
version: 1.0.0
release: v1.1
variant: react-motion
description: |
  入力が検証を通った瞬間、欄の右側に緑のチェックマークが SVG ストロークで描かれながらスライドインする
  成功 feedback。input-validation-shake（エラー）と対になる肯定フィードバック。

taxonomy:
  layer: [css, js-runtime, library]
  ux_role:
    primary: feedback
    secondary: [micro-interaction]
  trigger: [state-change]
  media: [svg, dom-css]
  authoring: code

behavior:
  lifecycle: oneshot
  reversible: false
  replay: every-entry

tags:
  - input
  - form
  - success
  - checkmark
  - svg
  - feedback
  - validation

trigger:
  primary: state-change
  touch_fallback: always-on
  config: {}

runtime:
  language: typescript
  framework: react
  framework_version: ">=18"
dependencies:
  - { name: motion, version: "^11.0.0", purpose: "pathLength と opacity/translate のアニメ" }
peer_dependencies:
  - { name: react, version: ">=18" }

implementations:
  - tier: 1
    name: "React + Motion (SVG pathLength draw)"
    dependencies: [ { name: motion, version: "^11.0.0" } ]
    browser_support: { baseline: widely-available, baseline_year: 2020 }
    performance: { gpu_accelerated: true, layout_thrash: false, cost: low }
    degrades_to: 2
  - tier: 2
    name: "Vanilla CSS (stroke-dashoffset)"
    dependencies: []
    browser_support: { baseline: widely-available, baseline_year: 2016 }
    degradation: "stroke-dasharray/offset の transition で線画。スライドインは transform"
    performance: { gpu_accelerated: true, layout_thrash: false, cost: low }

browser_support:
  baseline: widely-available
  baseline_year: 2020
  notes: "代表値は Tier 1。SVG path の pathLength を Motion が補間。アイコンは inline SVG"

performance:
  gpu_accelerated: true
  layout_thrash: false
  cost: low
  notes: "pathLength と transform/opacity の補間のみ。SVG は単一 path で軽量"

parameters:
  - { name: draw_duration_ms, type: number, default: 360, range: [200, 600], description: "チェック描画の長さ" }
  - { name: slide_px,         type: number, default: 8,   range: [0, 20],    description: "スライドインの距離(px)" }
  - { name: stroke_width,     type: number, default: 3,   range: [2, 5],     description: "チェックの線幅" }

a11y:
  respects_reduced_motion: true
  fallback: "描画/スライドを無効化し、チェックを即時表示。aria-live で『有効です』を通知"
  focus_safe: true
  notes: "成功は色とアイコンの両方で示す。aria-live=\"polite\" でテキスト通知。装飾 SVG には aria-hidden"

license: MIT
authors: ["@daichi"]
sources:
  - { title: "Motion: SVG path animation", url: "https://motion.dev/docs/react-animation#svg" }
attribution_required: false

preview:
  url: https://animation-factory.app/preview/input-success-checkmark
  loop: true
  duration_ms: 2400

related:
  alternatives: [input-validation-shake, svg-line-draw, bounce-in]
  composes_with:
    - { id: input-validation-shake, note: "成功=checkmark / 失敗=shake で対のフィードバック" }
  requires: []

sections:
  skip: [variants]

ai:
  intent_examples:
    - "入力が正しいとき緑のチェックが描かれる"
    - "バリデーション成功のチェックマーク演出"
    - "フォームの成功 feedback をアイコンで出したい"
  apply_targets: ["form-field", "text-input", "verification-code"]
  do_not_apply_to: ["error-state", "destructive-action", "navigation"]
---

## Overview

入力が検証を通ると、欄の右に緑のチェックが `pathLength` 0→1 で描かれつつ、少しスライドイン + fade する。`input-validation-shake`（否定）と対になる肯定 feedback。成功は色だけでなくアイコンと（必要なら）テキストで多重に伝える。

使う場面: 形式検証 OK、確認コード一致、ユーザー名の空き確認。
避けたい場面: エラー状態、破壊的操作、ナビ。

## Preview

公開プレビュー: https://animation-factory.app/preview/input-success-checkmark

## Implementation

### React + Motion (SVG pathLength draw)

```tsx
"use client";
import { motion } from "motion/react";

export function SuccessCheck({ show }: { show: boolean }) {
  if (!show) return null;
  return (
    <motion.svg
      width="20" height="20" viewBox="0 0 24 24"
      initial={{ opacity: 0, x: 8 }} animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.2 }} aria-hidden
    >
      <motion.path
        d="M4 12.5l5 5L20 6" fill="none" stroke="#a3e635" strokeWidth={3}
        strokeLinecap="round" strokeLinejoin="round"
        initial={{ pathLength: 0 }} animate={{ pathLength: 1 }}
        transition={{ duration: 0.36, ease: "easeOut" }}
      />
    </motion.svg>
  );
}
```

### Vanilla CSS（縮退・stroke-dashoffset）

```css
.check path { stroke-dasharray: 30; stroke-dashoffset: 30; transition: stroke-dashoffset 360ms ease-out; }
.check.show path { stroke-dashoffset: 0; }
```

## Usage

```tsx
<div className="field">
  <input value={value} onChange={...} aria-invalid={!valid} />
  <SuccessCheck show={valid} />
</div>
```

## AI Apply Prompt

### Context
`{{field_selector}}` が有効になった瞬間にチェックマークを描く。

### Steps
1. `motion@^11` を追加。
2. `SuccessCheck` を入力欄の右に配置し、`valid` state で表示。
3. `aria-live="polite"` のテキストも併設、SVG は `aria-hidden`。

### Verify
- 有効化で右からチェックが描かれつつスライドイン
- Reduce Motion で即時表示
- スクリーンリーダーに「有効」が伝わる

## Accessibility

色（緑）+ アイコン + テキストの多重通知。装飾 SVG は `aria-hidden`、状態は `aria-live="polite"`。Reduce Motion で描画を即時化。

## Performance Notes

`pathLength` と `opacity`/`transform` の補間のみ。SVG は単一 path。`show=false` でアンマウントし常駐させない。

## Changelog

- 2026-06-01 (created): 初版。v1.1 Batch 2（Form interaction）第 3 弾。成功 feedback の SVG チェック描画。
