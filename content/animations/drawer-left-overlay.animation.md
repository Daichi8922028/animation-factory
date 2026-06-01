---
id: drawer-left-overlay
name: Drawer Left Overlay
version: 1.0.0
release: beta
variant: react-motion
description: |
  画面左から滑り込むナビゲーションドロワー（overlay モード）。背景を dim で覆い、本体の上に重ねて表示する。
  既存 drawer-slide の左版・オーバーレイ型。背景クリックと ESC で閉じる。

taxonomy:
  layer: [css, js-runtime, library]
  ux_role:
    primary: state-transition
    secondary: [navigation]
  trigger: [state-change]
  media: [dom-css]
  authoring: code

behavior:
  lifecycle: toggle
  reversible: true
  replay: every-entry

tags:
  - drawer
  - navigation
  - overlay
  - slide
  - sidebar
  - menu
  - off-canvas

trigger:
  primary: state-change
  touch_fallback: always-on
  config: {}

runtime:
  language: typescript
  framework: react
  framework_version: ">=18"
dependencies:
  - { name: motion, version: "^11.0.0", purpose: "AnimatePresence で本体と背景の出入り" }
peer_dependencies:
  - { name: react, version: ">=18" }

implementations:
  - tier: 1
    name: "React + Motion (slide x + backdrop)"
    dependencies: [ { name: motion, version: "^11.0.0" } ]
    browser_support: { baseline: widely-available, baseline_year: 2020 }
    performance: { gpu_accelerated: true, layout_thrash: false, cost: low }
    degrades_to: 2
  - tier: 2
    name: "Vanilla CSS (transform: translateX + transition)"
    dependencies: []
    browser_support: { baseline: widely-available, baseline_year: 2017 }
    degradation: "open class で translateX(0)、閉で translateX(-100%)。背景は opacity transition"
    performance: { gpu_accelerated: true, layout_thrash: false, cost: low }

browser_support:
  baseline: widely-available
  baseline_year: 2020
  notes: "代表値は Tier 1。translateX で本体、opacity で背景 dim"

performance:
  gpu_accelerated: true
  layout_thrash: false
  cost: low
  notes: "translateX + opacity のみ。push モードと違い本体レイアウトを動かさない"

parameters:
  - { name: width_px,        type: number, default: 256, range: [200, 360], description: "ドロワー幅(px)" }
  - { name: duration_ms,     type: number, default: 260, range: [150, 420], description: "出入りの長さ" }
  - { name: backdrop_opacity, type: number, default: 0.6, range: [0.3, 0.9], description: "背景 dim の濃さ" }

a11y:
  respects_reduced_motion: true
  fallback: "スライドを無効化し open/close 即時。背景 dim は維持"
  focus_safe: true
  notes: "overlay は modal 相当 → focus トラップ・ESC 閉じ・背景 inert を実装（dialog-focus-trap を併用）。トリガーに aria-expanded"

license: MIT
authors: ["@daichi"]
sources:
  - { title: "WAI-ARIA APG: Dialog (Modal)", url: "https://www.w3.org/WAI/ARIA/apg/patterns/dialog-modal/" }
attribution_required: false

preview:
  url: https://animation-factory.app/preview/drawer-left-overlay
  loop: true
  duration_ms: 2600

related:
  alternatives: [drawer-slide, modal-fade, sidebar-collapse-animated]
  composes_with:
    - { id: dialog-focus-trap, note: "overlay ドロワーは modal 相当。focus trap を重ねる" }
  requires: [drawer-slide]

sections:
  skip: [variants]

ai:
  intent_examples:
    - "左からスライドインするナビドロワー"
    - "ハンバーガーメニューで開くオフキャンバスメニュー"
    - "背景を暗くして左から出るサイドメニュー"
  apply_targets: ["nav-drawer", "off-canvas-menu", "mobile-nav", "filter-panel"]
  do_not_apply_to: ["tooltip", "inline-dropdown", "toast"]
---

## Overview

ハンバーガー等のトリガーで、左端からナビゲーションドロワーが `translateX` で滑り込み、背景を dim で覆う overlay 型。既存 `drawer-slide` の左版・オーバーレイモード。本体レイアウトを押し出さない（push モードではない）ので、モバイルのナビに向く。背景クリック / ESC で閉じる。

使う場面: モバイルナビ、オフキャンバスメニュー、フィルタパネル。
避けたい場面: 常時表示したいサイドバー（`sidebar-collapse-animated`）、ツールチップ。

## Preview

公開プレビュー: https://animation-factory.app/preview/drawer-left-overlay

## Implementation

### React + Motion

```tsx
"use client";
import { AnimatePresence, motion } from "motion/react";

export function DrawerLeftOverlay({ open, onClose, children }:
  { open: boolean; onClose: () => void; children: React.ReactNode }) {
  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div key="bd"
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-40 bg-black/60" onClick={onClose} />
          <motion.aside key="dw" role="dialog" aria-modal="true"
            initial={{ x: -280 }} animate={{ x: 0 }} exit={{ x: -280 }}
            transition={{ type: "spring", stiffness: 320, damping: 34 }}
            className="fixed inset-y-0 left-0 z-50 w-64">
            {children}
          </motion.aside>
        </>
      )}
    </AnimatePresence>
  );
}
```

### Vanilla CSS（縮退）

`.drawer { transform: translateX(-100%); transition: transform 260ms; }` / `.drawer.open { transform: translateX(0); }`。

## Usage

```tsx
<DrawerLeftOverlay open={open} onClose={() => setOpen(false)}><Nav /></DrawerLeftOverlay>
```

## AI Apply Prompt

### Context
`{{nav}}` を左からのオーバーレイドロワーにする。

### Steps
1. `motion@^11` を追加。
2. `DrawerLeftOverlay` を配置、open state を管理、トリガーに `aria-expanded`。
3. focus トラップ・ESC 閉じ・背景 inert を付ける（`dialog-focus-trap`）。

### Verify
- トリガーで左から滑り込み、背景が dim
- 背景クリック / ESC で閉じる
- Reduce Motion でスライド無し、dim 即時

## Accessibility

overlay は modal 相当なので `role="dialog"` + `aria-modal` + focus トラップ + 背景 inert。トリガーに `aria-expanded` / `aria-controls`。Reduce Motion でスライドを切る。

## Performance Notes

`translateX` + `opacity` のみ。本体を押し出さないので本体側の reflow が起きない。

## Changelog

- 2026-06-01 (created): 初版。v1.1 Batch 3（Navigation 拡張）第 2 弾。drawer-slide の左・overlay 版。
