---
id: drawer-slide
name: Drawer Slide
version: 1.0.0
release: alpha
variant: react-motion
description: |
  画面の端（右／左／下）からスライドして登場するパネル。
  ナビゲーション drawer、サイド設定、モバイル向けのフィルタパネルに。

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
  - panel
  - slide
  - sidebar
  - off-canvas
  - menu

trigger:
  primary: state-change
  touch_fallback: always-on
  config: {}

runtime:
  language: typescript
  framework: react
  framework_version: ">=18"
dependencies:
  - { name: motion, version: "^11.0.0", purpose: "AnimatePresence で出入り" }
peer_dependencies:
  - { name: react, version: ">=18" }

implementations:
  - tier: 1
    name: "React + Motion (AnimatePresence)"
    dependencies: [ { name: motion, version: "^11.0.0" } ]
    browser_support: { baseline: widely-available, baseline_year: 2020 }
    performance: { gpu_accelerated: true, layout_thrash: false, cost: low }
    degrades_to: 2
  - tier: 2
    name: "Vanilla CSS (transform + transition)"
    dependencies: []
    browser_support: { baseline: widely-available, baseline_year: 2017 }
    performance: { gpu_accelerated: true, layout_thrash: false, cost: low }
    degradation: "結果は同等。React の unmount 同期は外部 state 管理が必要"

browser_support:
  baseline: widely-available
  baseline_year: 2020
  notes: "代表値は Tier 1。translateX/Y で出入り、背景 dim は modal と同じ作り"

performance:
  gpu_accelerated: true
  layout_thrash: false
  cost: low
  notes: "translateX/Y のみ補間。Layout を引き起こさない"

parameters:
  - { name: side,          type: enum, default: "right",
      values: ["right","left","bottom"], description: "出てくる方向" }
  - { name: width_px,      type: number, default: 360, range: [240, 560], description: "パネル幅（縦 drawer は height）" }
  - { name: duration_ms,   type: number, default: 260, range: [160, 500], description: "出入りの長さ" }

a11y:
  respects_reduced_motion: true
  fallback: "transform を無効化、open/close は即時"
  focus_safe: true
  notes: "ESC 閉じ・focus トラップ・背景 `inert` は別途実装。drawer 自体は `role=\"dialog\"` + `aria-modal=\"true\"` 推奨"

license: MIT
authors: ["@daichi"]
sources: []
attribution_required: false

preview:
  url: https://animation-factory.app/preview/drawer-slide
  loop: true
  duration_ms: 2400

related:
  alternatives: [modal-fade, slide-in-right]
  composes_with:
    - { id: modal-fade, note: "背景 dim の作りは modal-fade と共通。同じパターンで実装" }
  requires: []

sections:
  skip: [variants]

ai:
  intent_examples:
    - "右からスライドで開くサイド drawer"
    - "モバイルメニューが横から出てくる"
    - "off-canvas の navigation drawer"
  apply_targets: ["nav-drawer", "side-panel", "filter-panel", "mobile-menu"]
  do_not_apply_to: ["toast", "tooltip", "inline-popover"]
---

## Overview

画面の端から `translateX`（右／左）または `translateY`（下）でパネルがスライドインする。背景に半透明の dim を重ね、パネルは画面端に固定。AnimatePresence の `exit` で逆方向に退場する。

使う場面: ナビ drawer、設定パネル、モバイルのフィルタ UI、商品詳細のクイックビュー。
避けたい場面: トースト、ツールチップ、フローティングメニュー。

## Preview

公開プレビュー: https://animation-factory.app/preview/drawer-slide

## Implementation

### React + Motion (AnimatePresence)

```tsx
"use client";
import { AnimatePresence, motion } from "motion/react";

export function DrawerSlide({
  open, onClose, side = "right", children,
}: { open: boolean; onClose: () => void; side?: "right"|"left"|"bottom"; children: React.ReactNode }) {
  const off = side === "right" ? { x: "100%" } : side === "left" ? { x: "-100%" } : { y: "100%" };
  const pos = side === "right" ? "right-0 top-0 h-full w-[360px]"
            : side === "left"  ? "left-0  top-0 h-full w-[360px]"
            :                    "left-0  bottom-0 w-full h-[60vh]";
  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            transition={{ duration: 0.22 }}
            className="fixed inset-0 z-40 bg-black/60"
            onClick={onClose}
          />
          <motion.aside
            role="dialog" aria-modal="true"
            initial={off} animate={{ x: 0, y: 0 }} exit={off}
            transition={{ duration: 0.26, ease: "easeOut" }}
            className={`fixed z-50 bg-zinc-900 border border-white/10 ${pos}`}
          >
            {children}
          </motion.aside>
        </>
      )}
    </AnimatePresence>
  );
}
```

### Vanilla CSS（縮退）

```css
.drawer {
  position: fixed; right: 0; top: 0; height: 100%; width: 360px;
  transform: translateX(100%);
  transition: transform 260ms ease-out;
}
.drawer[data-open="true"] { transform: translateX(0); }
@media (prefers-reduced-motion: reduce) { .drawer { transition: none; } }
```

## Usage

```tsx
<DrawerSlide open={navOpen} onClose={() => setNavOpen(false)}>
  <NavMenu />
</DrawerSlide>
```

## AI Apply Prompt

### Context
`{{target_selector}}` の状態に応じて、画面端から drawer をスライドインさせる。

### Steps
1. `motion@^11` を `{{package_manager}}` で追加。
2. `DrawerSlide` を `{{target_file}}` に追加し、`side` で方向を指定。
3. ESC 閉じ・focus トラップ・背景 `inert` を別途実装。

### Examples

Before: 表示/非表示の条件分岐 only
After: `<DrawerSlide open={…} side="right">…</DrawerSlide>`

### Verify
- 開閉トリガーで指定方向からスライド
- 背景クリックで閉じる
- ESC 閉じは別途実装（このコンポーネントは onClose を呼ぶだけ）
- Reduce Motion でアニメ無し、即時切替

## Accessibility

`role="dialog"` + `aria-modal="true"`、`inert` で背景を無効化（モーダル相当の遮断）。ESC 閉じ・focus トラップは Headless UI / Radix の Dialog プリミティブで強化推奨。

## Performance Notes

`translateX/Y` のみ補間。`will-change: transform` は Motion が自動付与。

## Changelog

- 2026-05-27 (created): 初版。Phase 3 D1 第 3 弾、state-layout 拡充。
