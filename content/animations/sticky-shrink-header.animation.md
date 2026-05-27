---
id: sticky-shrink-header
name: Sticky Shrink Header
version: 1.0.0
release: alpha
variant: vanilla-css
description: |
  スクロール開始でヘッダが縮む。背景を不透明化・高さを縮め・タイポを小さくして情報密度を上げる。
  Apple / Stripe / Linear のグローバルヘッダ定番。

taxonomy:
  layer: [css, js-runtime]
  ux_role:
    primary: state-transition
    secondary: [navigation]
  trigger: [scroll-progress]
  media: [dom-css]
  authoring: code

behavior:
  lifecycle: scroll-linked
  reversible: true
  replay: every-entry

tags:
  - sticky
  - header
  - shrink
  - scroll
  - condensed
  - navbar

trigger:
  primary: scroll-progress
  touch_fallback: always-on
  config:
    threshold_px: 16

runtime:
  language: typescript
  framework: react
  framework_version: ">=18"
dependencies: []
peer_dependencies:
  - { name: react, version: ">=18" }

implementations:
  - tier: 1
    name: "Vanilla CSS + scroll listener"
    dependencies: []
    browser_support: { baseline: widely-available, baseline_year: 2017 }
    performance: { gpu_accelerated: true, layout_thrash: false, cost: low }

browser_support:
  baseline: widely-available
  baseline_year: 2017
  notes: "scroll listener で is-scrolled class を付ける単純な実装。CSS Scroll-Driven で書き換えも可"

performance:
  gpu_accelerated: true
  layout_thrash: false
  cost: low
  notes: "transition で height / padding / backdrop-filter を補間。height ではなく padding + scale で寄せると安全"

parameters:
  - { name: shrink_threshold_px, type: number, default: 16, range: [0, 200], description: "スクロール量しきい値" }
  - { name: duration_ms, type: number, default: 220, range: [120, 500], description: "縮みの長さ" }

a11y:
  respects_reduced_motion: true
  fallback: "transition を 0.01s。最終状態だけ即時切替"
  focus_safe: true
  notes: "ヘッダの focus 順序が変わらないこと（DOM 構造は維持、視覚のみ縮む）"

license: MIT
authors: ["@daichi"]
sources: []
attribution_required: false

preview:
  url: https://animation-factory.app/preview/sticky-shrink-header
  loop: true
  duration_ms: 2400

related:
  alternatives: []
  composes_with: []
  requires: []

sections:
  skip: [variants]

ai:
  intent_examples:
    - "スクロールでヘッダが縮む"
    - "Apple 風の condensed nav"
    - "スクロール時にヘッダ背景を半透明にしたい"
  apply_targets: ["global-header", "site-nav", "top-bar"]
  do_not_apply_to: ["footer", "section-heading", "modal-toolbar"]
---

## Overview

`window.scrollY > threshold` で `data-scrolled` 属性を付け、CSS で `padding` / `backdrop-filter` / 子要素のサイズを補間する。height を直接動かすと Layout 全体が動くため、padding を縮める方が滑らか。

使う場面: グローバルナビ、サイトヘッダ、トップバー。
避けたい場面: フッター、セクション見出し（スクロールに反応すべきでない）。

## Preview

公開プレビュー: https://animation-factory.app/preview/sticky-shrink-header

## Implementation

### React + scroll listener

```tsx
"use client";
import { useEffect, useState } from "react";

export function ShrinkHeader({ children, thresholdPx = 16 }: { children: React.ReactNode; thresholdPx?: number }) {
  const [scrolled, setScrolled] = useState(false);
  useEffect(() => {
    const on = () => setScrolled(window.scrollY > thresholdPx);
    on();
    window.addEventListener("scroll", on, { passive: true });
    return () => window.removeEventListener("scroll", on);
  }, [thresholdPx]);
  return (
    <header data-scrolled={scrolled} className="shrink-header sticky top-0 z-30">
      {children}
    </header>
  );
}
```

```css
.shrink-header {
  padding: 1rem 1.5rem;
  background: transparent;
  backdrop-filter: none;
  transition: padding 220ms ease, background 220ms ease, backdrop-filter 220ms ease;
}
.shrink-header[data-scrolled="true"] {
  padding: 0.6rem 1.5rem;
  background: rgba(10, 10, 11, 0.7);
  backdrop-filter: blur(12px);
  border-bottom: 1px solid rgba(255, 255, 255, 0.08);
}
@media (prefers-reduced-motion: reduce) {
  .shrink-header { transition-duration: 0.01ms; }
}
```

## Usage

```tsx
<ShrinkHeader>
  <Nav />
</ShrinkHeader>
```

## AI Apply Prompt

### Context
`{{target_selector}}` のグローバルヘッダをスクロール時に縮める。

### Steps
1. `ShrinkHeader` を `{{target_file}}` の最上位に配置。
2. CSS を追記。透過 → 半透明 + blur の遷移。
3. `passive: true` のスクロールリスナを使い、jank を避ける。

### Examples

Before: `<header>…</header>`
After: `<ShrinkHeader>…</ShrinkHeader>`

### Verify
- 初期は透過、スクロール開始で半透明 + blur
- 戻すと元状態に
- focus 順序が変わらない
- Reduce Motion で transition なし

## Accessibility

DOM 構造は不変、視覚のみ。focus リング・タブ順は影響受けない。

## Performance Notes

`padding` の transition は Layout を引き起こすが、ヘッダのみのため影響は小さい。代替として `height` の transition は避ける（より広い再 layout が走る）。

## Changelog

- 2026-05-27 (created): 初版。Phase 3 D1 第 5 弾、scroll 系拡充。
