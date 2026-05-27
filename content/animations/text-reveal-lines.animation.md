---
id: text-reveal-lines
name: Text Reveal (Lines)
version: 1.0.0
release: alpha
variant: react-motion
description: |
  見出しが行ごとに下からスライド & fade で登場するタイポグラフィック演出。
  ランディングのヒーロー、章の冒頭、ブログ記事の H1 に。

taxonomy:
  layer: [library, js-runtime]
  ux_role:
    primary: state-transition
    secondary: [storytelling]
  trigger: [viewport]
  media: [dom-css]
  authoring: code

behavior:
  lifecycle: oneshot
  reversible: false
  replay: once

tags:
  - text
  - reveal
  - lines
  - entrance
  - typography
  - heading

trigger:
  primary: viewport
  touch_fallback: always-on
  config:
    amount: 0.4

runtime:
  language: typescript
  framework: react
  framework_version: ">=18"
dependencies:
  - { name: motion, version: "^11.0.0", purpose: "stagger + reveal" }
peer_dependencies:
  - { name: react, version: ">=18" }

implementations:
  - tier: 1
    name: "React + Motion (stagger)"
    dependencies: [ { name: motion, version: "^11.0.0" } ]
    browser_support: { baseline: widely-available, baseline_year: 2020 }
    performance: { gpu_accelerated: true, layout_thrash: false, cost: low }
    degrades_to: 2
  - tier: 2
    name: "Vanilla CSS keyframes"
    dependencies: []
    browser_support: { baseline: widely-available, baseline_year: 2017 }
    performance: { gpu_accelerated: true, layout_thrash: false, cost: low }
    degradation: "stagger は手動 animation-delay で表現"

browser_support:
  baseline: widely-available
  baseline_year: 2020
  notes: "代表値は Tier 1。行を span に分け、parent に overflow:hidden、子に translateY"

performance:
  gpu_accelerated: true
  layout_thrash: false
  cost: low
  notes: "translateY + opacity のみ。行数が多くても 1 行ごとに transform で軽い"

parameters:
  - { name: stagger_ms, type: number, default: 80, range: [20, 200], description: "行間のずらし時間" }
  - { name: distance_pct, type: number, default: 100, range: [40, 100], description: "translateY の％（100 で下から完全に隠れる）" }
  - { name: duration_ms, type: number, default: 700, range: [300, 1500], description: "各行の登場長さ" }

a11y:
  respects_reduced_motion: true
  fallback: "stagger と translate を無効化、opacity の fade のみ"
  focus_safe: true
  notes: "SR は各 line を読まず、見出し全文として読む（自然な改行が `<br />` or 文構造で表現されていればよい）"

license: MIT
authors: ["@daichi"]
sources: []
attribution_required: false

preview:
  url: https://animation-factory.app/preview/text-reveal-lines
  loop: true
  duration_ms: 2200

related:
  alternatives: [fade-up, entrance-stagger-fade]
  composes_with:
    - { id: blur-in, note: "ヒーロー画像 blur-in と組み合わせて映画的演出" }
  requires: []

sections:
  skip: [variants]

ai:
  intent_examples:
    - "見出しを行ごとに下から出したい"
    - "ヒーローのテキストを段階的に登場"
    - "タイポグラフィックな entrance"
  apply_targets: ["hero-heading", "chapter-title", "blog-h1"]
  do_not_apply_to: ["body-paragraph", "form-label", "menu-item"]
---

## Overview

見出しの各行を `<span>` に分け、親要素を `overflow: hidden`、子要素を `translateY(100%) → 0` で下から押し上げる。stagger で行ごとに 80ms ずらすと「組版が立ち上がる」印象になる。

使う場面: ヒーロー見出し、章タイトル、ブログ記事の H1。
避けたい場面: 本文段落（読みづらい）、フォームラベル、メニュー項目。

## Preview

公開プレビュー: https://animation-factory.app/preview/text-reveal-lines

## Implementation

### React + Motion

```tsx
"use client";
import { motion } from "motion/react";

export function TextRevealLines({ lines }: { lines: string[] }) {
  return (
    <motion.h1
      className="overflow-hidden"
      initial="hidden"
      animate="visible"
      variants={{
        hidden: {},
        visible: { transition: { staggerChildren: 0.08 } },
      }}
    >
      {lines.map((line, i) => (
        <span key={i} className="block overflow-hidden">
          <motion.span
            className="block"
            variants={{
              hidden: { y: "100%", opacity: 0 },
              visible: { y: 0, opacity: 1 },
            }}
            transition={{ duration: 0.7, ease: [0.2, 0.8, 0.2, 1] }}
          >
            {line}
          </motion.span>
        </span>
      ))}
    </motion.h1>
  );
}
```

## Usage

```tsx
<TextRevealLines lines={["まず動きの",  "辞書を作る。"]} />
```

## AI Apply Prompt

### Context
`{{target_selector}}` の見出しを行ごとに reveal する。

### Steps
1. `motion@^11` を `{{package_manager}}` で追加。
2. `TextRevealLines` を `{{target_file}}` に追加。
3. SEO 上 SR が見出しを正しく読めるよう、`<h1>` 内に line を span で組み込む（テキストノードはバラバラにしない）。

### Examples

Before: `<h1>まず動きの辞書を作る。</h1>`
After: `<TextRevealLines lines={["まず動きの", "辞書を作る。"]} />`

### Verify
- 各行が下から押し上げで登場
- stagger で行間のリズム
- Reduce Motion で translate なし、fade のみ
- SR は見出しを意図したテキストとして読む

## Accessibility

各行を span に分けても、SR は連続テキストとして読み上げる。`<h1>` の内側に span が複数あるのが基本構造。

## Performance Notes

行数が多くても各行は単独の transform/opacity。全体での合計コストは低い。

## Changelog

- 2026-05-27 (created): 初版。Phase 3 D1 第 5 弾、Tier A typography 拡充。
