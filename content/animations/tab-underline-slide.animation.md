---
id: tab-underline-slide
name: Tab Underline Slide
version: 1.0.0
release: v1.1
variant: react-motion
description: |
  タブ切替時に、アクティブを示すアンダーラインが選択タブへ滑って移動する。Motion の layoutId による
  shared-layout で、位置・幅を自動補間。既存 tab-switch のアンダーライン強化版。

taxonomy:
  layer: [css, js-runtime, library]
  ux_role:
    primary: navigation
    secondary: [state-transition]
  trigger: [click]
  media: [dom-css]
  authoring: code

behavior:
  lifecycle: toggle
  reversible: true
  replay: every-entry

tags:
  - tabs
  - navigation
  - underline
  - layoutid
  - indicator
  - slide
  - shared-layout

trigger:
  primary: click
  touch_fallback: tap-toggle
  config: {}

runtime:
  language: typescript
  framework: react
  framework_version: ">=18"
dependencies:
  - { name: motion, version: "^11.0.0", purpose: "layoutId による shared-layout アニメ" }
peer_dependencies:
  - { name: react, version: ">=18" }

implementations:
  - tier: 1
    name: "React + Motion (layoutId underline)"
    dependencies: [ { name: motion, version: "^11.0.0" } ]
    browser_support: { baseline: widely-available, baseline_year: 2020 }
    performance: { gpu_accelerated: true, layout_thrash: false, cost: low }
    degrades_to: 2
  - tier: 2
    name: "Vanilla JS (translateX + scaleX で indicator 移動)"
    dependencies: []
    browser_support: { baseline: widely-available, baseline_year: 2017 }
    degradation: "アクティブタブの offsetLeft/width を測って単一の下線要素を transform で移動"
    performance: { gpu_accelerated: true, layout_thrash: false, cost: low }

browser_support:
  baseline: widely-available
  baseline_year: 2020
  notes: "代表値は Tier 1。layoutId は Motion が FLIP で transform 補間。reflow なし"

performance:
  gpu_accelerated: true
  layout_thrash: false
  cost: low
  notes: "layoutId は内部で transform を使う FLIP。下線要素ひとつを移動するだけ"

parameters:
  - { name: underline_height_px, type: number, default: 2,   range: [1, 4],     description: "下線の太さ(px)" }
  - { name: stiffness,           type: number, default: 380, range: [200, 600], description: "移動 spring の硬さ" }
  - { name: damping,             type: number, default: 30,  range: [18, 44],   description: "移動 spring の減衰" }

a11y:
  respects_reduced_motion: true
  fallback: "下線移動を即時に。色/太字でもアクティブを示す"
  focus_safe: true
  notes: "role=\"tablist\" / role=\"tab\" + aria-selected。矢印キーでタブ移動できると望ましい。下線だけに頼らず aria でも状態を伝える"

license: MIT
authors: ["@daichi"]
sources:
  - { title: "Motion: layout animations (layoutId)", url: "https://motion.dev/docs/react-layout-animations" }
  - { title: "WAI-ARIA APG: Tabs", url: "https://www.w3.org/WAI/ARIA/apg/patterns/tabs/" }
attribution_required: false

preview:
  url: https://animation-factory.app/preview/tab-underline-slide
  loop: true
  duration_ms: 2800

related:
  alternatives: [tab-switch, hover-underline, multistep-form-progress]
  composes_with:
    - { id: tab-switch, note: "tab-switch のコンテンツ切替に、この下線スライドを足す" }
  requires: [tab-switch]

sections:
  skip: [variants]

ai:
  intent_examples:
    - "タブを切り替えると下線が滑って移動する"
    - "アクティブタブのインジケータがスライドするタブUI"
    - "layoutId で下線が動くタブ"
  apply_targets: ["tabs", "segmented-control", "nav-bar"]
  do_not_apply_to: ["accordion", "dropdown", "toast"]
---

## Overview

タブを切り替えると、アクティブを示すアンダーラインが選択タブの位置・幅へ滑って移動する。Motion の `layoutId` を使い、要素間で「同じ下線」として扱わせることで、位置と幅を FLIP で自動補間する。`tab-switch` のコンテンツ切替に下線スライドを足した強化版。

使う場面: タブナビ、セグメンテッドコントロール、サブナビ。
避けたい場面: アコーディオン、ドロップダウン。

## Preview

公開プレビュー: https://animation-factory.app/preview/tab-underline-slide

## Implementation

### React + Motion (layoutId underline)

```tsx
"use client";
import { motion } from "motion/react";

export function Tabs({ tabs }: { tabs: string[] }) {
  const [active, setActive] = useState(0);
  return (
    <div role="tablist" className="flex gap-1">
      {tabs.map((t, i) => (
        <button key={t} role="tab" aria-selected={i === active}
          onClick={() => setActive(i)} className="relative px-3 py-2">
          {t}
          {i === active && (
            <motion.span layoutId="tab-underline"
              className="absolute inset-x-0 -bottom-px h-0.5 bg-lime-300"
              transition={{ type: "spring", stiffness: 380, damping: 30 }} />
          )}
        </button>
      ))}
    </div>
  );
}
```

### Vanilla JS（縮退）

アクティブタブの `offsetLeft` / `offsetWidth` を測り、単一の下線要素を `transform: translateX() scaleX()` で移動。

## Usage

```tsx
<Tabs tabs={["概要", "価格", "ドキュメント", "FAQ"]} />
```

## AI Apply Prompt

### Context
`{{tabs}}` のアクティブ下線をスライドさせる。

### Steps
1. `motion@^11` を追加。
2. アクティブタブにだけ `motion.span layoutId="tab-underline"` を描画。
3. `role="tablist"`/`role="tab"`/`aria-selected` を付け、矢印キー移動も実装。

### Verify
- タブ切替で下線が次の位置・幅へ滑る
- Reduce Motion で即時移動
- アクティブが aria でも伝わる

## Accessibility

`role="tablist"`/`tab`/`aria-selected`、矢印キーでのタブ移動。下線（視覚）だけでなく `aria-selected` で状態を伝える。Reduce Motion で移動を即時化。

## Performance Notes

`layoutId` は Motion が FLIP（transform）で補間するため reflow なし。下線要素ひとつを動かすだけで軽い。

## Changelog

- 2026-06-01 (created): 初版。v1.1 Batch 3（Navigation 拡張）第 4 弾。layoutId のアンダーラインスライド。
