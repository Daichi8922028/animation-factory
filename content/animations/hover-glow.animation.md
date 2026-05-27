---
id: hover-glow
name: Hover Glow
version: 1.0.0
release: alpha
variant: vanilla-css
description: |
  ポインタが乗ると要素の周囲に柔らかい光（color-bleed）が滲み出るマイクロインタラクション。
  CTA、プライマリボタン、ハイライトカードに。

taxonomy:
  layer: [css]
  ux_role:
    primary: micro-interaction
    secondary: [feedback, attention]
  trigger: [pointer]
  media: [dom-css]
  authoring: code

behavior:
  lifecycle: continuous
  reversible: true
  replay: every-entry

tags:
  - hover
  - glow
  - bloom
  - cta
  - button
  - emphasis
  - affordance

trigger:
  primary: pointer
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
    name: "Vanilla CSS"
    dependencies: []
    browser_support: { baseline: widely-available, baseline_year: 2017 }
    performance: { gpu_accelerated: true, layout_thrash: false, cost: low }
    degrades_to: 2
  - tier: 2
    name: "React + Motion"
    dependencies: [ { name: motion, version: "^11.0.0" } ]
    browser_support: { baseline: widely-available, baseline_year: 2020 }
    performance: { gpu_accelerated: true, layout_thrash: false, cost: low }
    degradation: "結果は同等。JS で条件分岐したいときの代替"

browser_support:
  baseline: widely-available
  baseline_year: 2017
  notes: "代表値は Tier 1（純 CSS）。box-shadow + filter を擬似要素に持たせる"

performance:
  gpu_accelerated: true
  layout_thrash: false
  cost: low
  notes: "影は擬似要素の opacity で出し入れし、GPU 内で完結させる"

parameters:
  - { name: glow_color,    type: string, default: "rgba(190, 242, 100, 0.45)", description: "アクセントトークンに合わせた色" }
  - { name: glow_radius_px,type: number, default: 24,   range: [8, 64],   description: "ぼかし半径" }
  - { name: duration_ms,   type: number, default: 220,  range: [80, 500], description: "進入／離脱の長さ" }

a11y:
  respects_reduced_motion: true
  fallback: "transition を 0.01ms に短縮。状態は出るがアニメは即時"
  focus_safe: true
  notes: ":focus-visible にも同じ glow を割り当て、キーボード利用者と体験を揃える"

license: MIT
authors: ["@daichi"]
sources: []
attribution_required: false

preview:
  url: https://animation-factory.app/preview/hover-glow
  loop: true
  duration_ms: 1200

related:
  alternatives: [hover-lift, hover-tilt]
  composes_with:
    - { id: hover-lift, note: "lift と glow を同時に当てると強い CTA 表現になる（重ねすぎ注意）" }
  requires: []

sections:
  skip: [variants]

ai:
  intent_examples:
    - "CTA ボタンをホバーで光らせたい"
    - "ハイライトカードに柔らかい発光感"
    - "プライマリ要素をホバーで強調"
  apply_targets: ["primary-button", "cta", "highlight-card", "key-link"]
  do_not_apply_to: ["body-text", "secondary-link", "disabled-element"]
---

## Overview

ポインタが要素に乗っている間、外周にうっすらと光（color-bleed）が滲み出す。`hover-lift` が「持ち上がる」アフォーダンスなのに対し、`hover-glow` は「強調・特別感」を出す方向の表現。CTA やプライマリボタンに使うと自然。

使う場面: 主役ボタン、CTA、料金プランの推奨カード、特集記事カード。
避けたい場面: 二次的なリンク（過剰演出になる）、無効状態の要素、本文テキスト。

## Preview

公開プレビュー: https://animation-factory.app/preview/hover-glow

## Implementation

### Vanilla CSS

```css
/* 影は擬似要素に持たせ、opacity を補間して GPU 内で完結させる。
   サイトのアクセントトークン（lime 系）に合わせて色を統一すると馴染む。 */
.hover-glow {
  position: relative;
  isolation: isolate;
  transition: transform 220ms ease-out;
}

.hover-glow::after {
  content: "";
  position: absolute;
  inset: -4px;
  border-radius: inherit;
  box-shadow: 0 0 24px 4px rgba(190, 242, 100, 0.45);
  opacity: 0;
  transition: opacity 220ms ease-out;
  pointer-events: none;
  z-index: -1;
}

@media (hover: hover) {
  .hover-glow:hover::after {
    opacity: 1;
  }
}

.hover-glow:focus-visible::after {
  opacity: 1;
}

@media (prefers-reduced-motion: reduce) {
  .hover-glow,
  .hover-glow::after { transition-duration: 0.01ms; }
}
```

### React + Motion

```tsx
import { motion, useReducedMotion } from "motion/react";
import type { ReactNode } from "react";

export function HoverGlow({ children }: { children: ReactNode }) {
  const reduce = useReducedMotion();
  return (
    <motion.div
      whileHover={reduce ? undefined : { filter: "drop-shadow(0 0 16px rgba(190, 242, 100, 0.65))" }}
      whileFocus={reduce ? undefined : { filter: "drop-shadow(0 0 16px rgba(190, 242, 100, 0.65))" }}
      transition={{ duration: 0.22, ease: "easeOut" }}
      style={{ display: "inline-block" }}
    >
      {children}
    </motion.div>
  );
}
```

## Usage

CSS 版（推奨）:

```html
<button class="hover-glow cta">続ける</button>
```

React 版:

```tsx
<HoverGlow>
  <CTAButton>続ける</CTAButton>
</HoverGlow>
```

## AI Apply Prompt

### Context
`{{target_selector}}` をホバーで光らせる（強調・CTA 用途）。純 CSS で完結するため依存追加は不要。

### Steps
1. `{{target_file}}` の対象要素に `hover-glow` クラスを追加する。
2. 上記 CSS をスタイルシートに追記する。`border-radius` は `inherit` で追従する。
3. アクセント色がサイト固有なら `box-shadow` の rgba をプロジェクトのトークン色に置換する。
4. 対象がクリック不能（本文テキスト等）の場合は適用しない。

### Examples

Before:

```html
<button class="cta">続ける</button>
```

After:

```html
<button class="cta hover-glow">続ける</button>
```

### Verify
- ホバーで外周にうっすら光が出る／離れると消える
- Tab フォーカスで `:focus-visible` 経由でも同じ光が出る
- タッチ端末でタップ後に光が固着しない（`@media (hover: hover)` 経由）
- Reduce Motion ON で transition が消える（光自体は機能のため残す）

## Accessibility

- `:focus-visible` を `:hover` と同じスタイルにし、キーボード利用者と視覚を揃える。
- タッチ端末は `@media (hover: hover)` で無効化（タップ後の固着を防ぐ）。
- `hover-lift` と同様、フォーカスリングは上書きしない。

## Performance Notes

`box-shadow` の補間ではなく擬似要素の `opacity` で出し入れすることで、再描画を避け GPU 内で完結させる。

## Changelog

- 2026-05-26 (created): 初版。Phase 3 D1 第 1 弾、hover-press 拡充。
