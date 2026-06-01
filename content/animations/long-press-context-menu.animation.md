---
id: long-press-context-menu
name: Long Press Context Menu
version: 1.0.0
release: beta
variant: react-motion
description: |
  要素を 300ms ほど長押しすると、押下中に進捗リングが満ちてからコンテキストメニューが pop する。
  タッチ環境で右クリック相当のアクションを引き出す long-press トリガーの state-transition。

taxonomy:
  layer: [css, js-runtime, library]
  ux_role:
    primary: state-transition
    secondary: [navigation]
  trigger: [long-press]
  media: [dom-css]
  authoring: code

behavior:
  lifecycle: toggle
  reversible: true
  replay: every-entry

tags:
  - long-press
  - context-menu
  - touch
  - hold
  - menu
  - gesture
  - navigation

trigger:
  primary: long-press
  touch_fallback: tap-toggle
  config: { hold_ms: 300 }

runtime:
  language: typescript
  framework: react
  framework_version: ">=18"
dependencies:
  - { name: motion, version: "^11.0.0", purpose: "進捗リングとメニューの pop アニメ" }
peer_dependencies:
  - { name: react, version: ">=18" }

implementations:
  - tier: 1
    name: "React + Motion (hold timer + pop)"
    dependencies: [ { name: motion, version: "^11.0.0" } ]
    browser_support: { baseline: widely-available, baseline_year: 2020 }
    performance: { gpu_accelerated: true, layout_thrash: false, cost: low }
    degrades_to: 2
  - tier: 2
    name: "Pointer Events + contextmenu（自前）"
    dependencies: []
    browser_support: { baseline: widely-available, baseline_year: 2019 }
    degradation: "pointerdown でタイマー開始、move/up でキャンセル。デスクトップは contextmenu イベントに委譲"
    performance: { gpu_accelerated: true, layout_thrash: false, cost: low }

browser_support:
  baseline: widely-available
  baseline_year: 2020
  notes: "代表値は Tier 1。pointerdown でタイマー、一定の移動でキャンセル。デスクトップは右クリックにフォールバック"

performance:
  gpu_accelerated: true
  layout_thrash: false
  cost: low
  notes: "進捗リングは transform/opacity、メニューは scale/opacity。タイマーは 1 本"

parameters:
  - { name: hold_ms,      type: number, default: 300, range: [200, 600], description: "発火に必要な長押し時間" }
  - { name: from_scale,   type: number, default: 0.9, range: [0.8, 1.0], description: "メニュー登場の開始スケール" }
  - { name: cancel_move_px, type: number, default: 8, range: [4, 16],   description: "これ以上動いたらキャンセル(px)" }

a11y:
  respects_reduced_motion: true
  fallback: "進捗リング/pop を抑え即時表示。デスクトップは contextmenu キー/右クリック、ボタンの代替も用意"
  focus_safe: true
  notes: "long-press には必ず別の到達手段（ボタンや右クリック）を用意。メニューは role=\"menu\"/menuitem、ESC で閉じる。発火時に軽い触覚（navigator.vibrate）も検討"

license: MIT
authors: ["@daichi"]
sources:
  - { title: "MDN: Pointer events", url: "https://developer.mozilla.org/en-US/docs/Web/API/Pointer_events" }
  - { title: "WAI-ARIA APG: Menu", url: "https://www.w3.org/WAI/ARIA/apg/patterns/menu/" }
attribution_required: false

preview:
  url: https://animation-factory.app/preview/long-press-context-menu
  loop: true
  duration_ms: 3200

related:
  alternatives: [dropdown-menu, popover-anchor-positioning, modal-fade]
  composes_with:
    - { id: popover-anchor-positioning, note: "メニューの配置に anchor positioning を併用できる" }
  requires: []

sections:
  skip: [variants]

ai:
  intent_examples:
    - "長押しでコンテキストメニューを出す"
    - "300ms ホールドでアクションメニューを開く"
    - "タッチで右クリック相当のメニューを引き出す"
  apply_targets: ["list-item", "card", "touch-target", "thumbnail"]
  do_not_apply_to: ["primary-button", "link-text", "form-input"]
---

## Overview

要素を押し続けると、押下中に進捗リングが満ちていき、`hold_ms` を超えるとコンテキストメニューが `scale` で pop する。指を動かしすぎる/早く離すとキャンセル。タッチ環境で右クリック相当のアクションを引き出す。発火時に `navigator.vibrate` で軽い触覚を添えると分かりやすい。

使う場面: リスト項目/カード/サムネのアクション、タッチ前提の UI。
避けたい場面: 主要ボタン（タップで十分）、本文リンク、フォーム入力。

## Preview

公開プレビュー: https://animation-factory.app/preview/long-press-context-menu

## Implementation

### React + Motion (hold timer + pop)

```tsx
"use client";
import { AnimatePresence, motion } from "motion/react";
import { useRef, useState } from "react";

export function LongPress({ children, menu }: { children: React.ReactNode; menu: React.ReactNode }) {
  const [open, setOpen] = useState(false);
  const timer = useRef<number>();
  const start = () => { timer.current = window.setTimeout(() => { navigator.vibrate?.(10); setOpen(true); }, 300); };
  const cancel = () => window.clearTimeout(timer.current);
  return (
    <div onPointerDown={start} onPointerUp={cancel} onPointerLeave={cancel}
      onContextMenu={(e) => { e.preventDefault(); setOpen(true); }}>
      {children}
      <AnimatePresence>
        {open && (
          <motion.div role="menu" initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }} transition={{ duration: 0.16 }}>
            {menu}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
```

## Usage

```tsx
<LongPress menu={<Menu />}><Card /></LongPress>
```

## AI Apply Prompt

### Context
`{{target}}` を長押しでコンテキストメニュー表示にする。

### Steps
1. `motion@^11` を追加。
2. `pointerdown` でタイマー、移動/早離しでキャンセル。`hold_ms` 経過で open。
3. デスクトップは `contextmenu` に委譲、ボタン代替も用意。`role="menu"` + ESC 閉じ。

### Verify
- 長押し（~300ms）でメニューが pop、早離し/移動でキャンセル
- 右クリックでも開く
- Reduce Motion で pop 抑制、キーボード/ボタン代替がある

## Accessibility

long-press には必ず別経路（右クリック・ボタン）を用意。メニューは `role="menu"`/`menuitem`、ESC で閉じ、矢印キー移動。発火に軽い触覚（`navigator.vibrate`）を添えると伝わりやすい。

## Performance Notes

進捗リングは transform/opacity、メニューは scale/opacity。タイマーは 1 本だけ持ち、アンマウントで必ず clear。

## Changelog

- 2026-06-01 (created): 初版。v1.1 Batch 4（トリガー多様化: long-press）第 4 弾。
