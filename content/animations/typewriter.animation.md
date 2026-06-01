---
id: typewriter
name: Typewriter
version: 1.0.0
release: v1.0
variant: vanilla-css
description: |
  文字が 1 文字ずつ「打たれる」ように現れるタイプライタ演出。
  ターミナル風 LP、ヒーローのキャッチコピー、AI チャットの応答風表示に。

taxonomy:
  layer: [css, js-runtime]
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
  - typewriter
  - typing
  - terminal
  - chars
  - entrance
  - storytelling

trigger:
  primary: viewport
  touch_fallback: always-on
  config:
    amount: 0.5

runtime:
  language: typescript
  framework: react
  framework_version: ">=18"
dependencies: []
peer_dependencies:
  - { name: react, version: ">=18" }

implementations:
  - tier: 1
    name: "React + setInterval"
    dependencies: []
    browser_support: { baseline: widely-available, baseline_year: 2017 }
    performance: { gpu_accelerated: false, layout_thrash: false, cost: low }
    degrades_to: 2
  - tier: 2
    name: "Vanilla CSS (steps())"
    dependencies: []
    browser_support: { baseline: widely-available, baseline_year: 2015 }
    performance: { gpu_accelerated: false, layout_thrash: false, cost: low }
    degradation: "steps() で width を 1 文字ずつ伸ばす古典手法。単一行限定"

browser_support:
  baseline: widely-available
  baseline_year: 2017
  notes: "代表値は Tier 1。React の useEffect で setInterval により 1 文字ずつ追加"

performance:
  gpu_accelerated: false
  layout_thrash: false
  cost: low
  notes: "短いテキストなら無視できるコスト。長文では useDeferredValue 等で抑える"

parameters:
  - { name: text, type: string, default: "Hello, world.", description: "表示するテキスト" }
  - { name: char_interval_ms, type: number, default: 60, range: [20, 200], description: "1 文字あたりの間隔" }
  - { name: show_caret, type: boolean, default: true, description: "末尾の点滅キャレット" }

a11y:
  respects_reduced_motion: true
  fallback: "テキスト全体を即時表示。途中状態は SR にとってノイズなので避ける"
  focus_safe: true
  notes: "SR には完成形だけ伝える。途中ノードは `aria-hidden`、別ノードで `aria-label` に完成テキストを置く"

license: MIT
authors: ["@daichi"]
sources: []
attribution_required: false

preview:
  url: https://animation-factory.app/preview/typewriter
  loop: true
  duration_ms: 3000

related:
  alternatives: [text-reveal-lines, fade-up]
  composes_with:
    - { id: pulse-attention, note: "キャレット点滅は pulse-attention と同質" }
  requires: []

sections:
  skip: [variants]

ai:
  intent_examples:
    - "タイプライタ風にテキストを表示"
    - "ターミナル LP のキャッチコピー"
    - "AI 風に応答が打たれる演出"
  apply_targets: ["hero-tagline", "terminal-prompt", "chat-message", "marketing-headline"]
  do_not_apply_to: ["body-text", "form-error", "navigation"]
---

## Overview

文字列を 1 文字ずつ state に追加し、末尾にキャレット（`|`）を点滅させる。長すぎる文章では「読ませる」より「邪魔になる」ので、キャッチコピーや短い案内に限定する。

使う場面: ヒーローのタグライン、ターミナル風 LP、AI チャット風の応答演出。
避けたい場面: 本文、フォームエラー（読みにくい）、ナビ。

## Preview

公開プレビュー: https://animation-factory.app/preview/typewriter

## Implementation

### React + setInterval

```tsx
"use client";
import { useEffect, useState } from "react";

export function Typewriter({
  text,
  charIntervalMs = 60,
  showCaret = true,
}: { text: string; charIntervalMs?: number; showCaret?: boolean }) {
  const [n, setN] = useState(0);

  useEffect(() => {
    setN(0);
    const id = setInterval(() => {
      setN((cur) => {
        if (cur >= text.length) {
          clearInterval(id);
          return cur;
        }
        return cur + 1;
      });
    }, charIntervalMs);
    return () => clearInterval(id);
  }, [text, charIntervalMs]);

  return (
    <span aria-label={text}>
      <span aria-hidden>{text.slice(0, n)}</span>
      {showCaret && <span aria-hidden className="caret">|</span>}
    </span>
  );
}
```

```css
.caret {
  display: inline-block;
  width: 1ch;
  animation: blink 900ms steps(1) infinite;
}
@keyframes blink { 50% { opacity: 0; } }
@media (prefers-reduced-motion: reduce) {
  .caret { animation: none; }
}
```

## Usage

```tsx
<Typewriter text="まず動きの辞書を作る。" />
```

## AI Apply Prompt

### Context
`{{target_selector}}` にタイプライタ演出を入れる。

### Steps
1. 上記 `Typewriter` を `{{target_file}}` に追加。
2. `aria-label` で完成テキストを SR に渡し、途中ノードは `aria-hidden`。
3. 長文には適用しない（読みにくい）。

### Examples

Before: `<p>Hello, world.</p>`
After: `<p><Typewriter text="Hello, world." /></p>`

### Verify
- 1 文字ずつ表示、末尾キャレットが点滅
- 完了後はキャレットだけが残る
- SR に完成テキストが渡る
- Reduce Motion で即時表示 + キャレット静止

## Accessibility

途中状態は `aria-hidden`、`aria-label` で完成テキストを露出する。

## Performance Notes

短文なら無視可。長文は `useDeferredValue` で render を流すか、Web Animations API で書き換える。

## Changelog

- 2026-05-27 (created): 初版。Phase 3 D1 第 5 弾、Tier A typography 拡充。
