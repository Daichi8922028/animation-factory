---
id: toggle-switch
name: Toggle Switch
version: 1.0.0
release: v1.0
variant: react-motion
description: |
  iOS 風のトグルスイッチ。つまみが左↔右に滑り、トラックの色が補間する。
  設定の ON / OFF、ダークモード切替、機能フラグに。

taxonomy:
  layer: [css, js-runtime, library]
  ux_role:
    primary: state-transition
    secondary: [feedback]
  trigger: [state-change]
  media: [dom-css]
  authoring: code

behavior:
  lifecycle: toggle
  reversible: true
  replay: every-entry

tags:
  - toggle
  - switch
  - on-off
  - settings
  - form
  - control

trigger:
  primary: state-change
  touch_fallback: always-on
  config: {}

runtime:
  language: typescript
  framework: react
  framework_version: ">=18"
dependencies:
  - { name: motion, version: "^11.0.0", purpose: "spring 補間" }
peer_dependencies:
  - { name: react, version: ">=18" }

implementations:
  - tier: 1
    name: "React + Motion (spring)"
    dependencies: [ { name: motion, version: "^11.0.0" } ]
    browser_support: { baseline: widely-available, baseline_year: 2020 }
    performance: { gpu_accelerated: true, layout_thrash: false, cost: low }
    degrades_to: 2
  - tier: 2
    name: "Vanilla CSS"
    dependencies: []
    browser_support: { baseline: widely-available, baseline_year: 2015 }
    performance: { gpu_accelerated: true, layout_thrash: false, cost: low }
    degradation: "spring ではなく cubic-bezier で近似"

browser_support:
  baseline: widely-available
  baseline_year: 2020
  notes: "代表値は Tier 1。layout: \"position\" の transform、color の transition"

performance:
  gpu_accelerated: true
  layout_thrash: false
  cost: low
  notes: "transform: translateX + background color のみ補間"

parameters:
  - { name: track_width_px, type: number, default: 44, range: [32, 80], description: "トラック幅" }
  - { name: stiffness, type: number, default: 500, range: [200, 1000], description: "spring 硬さ" }

a11y:
  respects_reduced_motion: true
  fallback: "transition を無効化、即時切替"
  focus_safe: true
  notes: "`role=\"switch\"` + `aria-checked` を必ず付ける。色だけで状態を示さない（テキストや icon を併設）"

license: MIT
authors: ["@daichi"]
sources: []
attribution_required: false

preview:
  url: https://animation-factory.app/preview/toggle-switch
  loop: true
  duration_ms: 1800

related:
  alternatives: [accordion-collapse]
  composes_with: []
  requires: []

sections:
  skip: [variants]

ai:
  intent_examples:
    - "iOS 風のトグルスイッチ"
    - "設定の ON / OFF UI"
    - "ダークモード切替ボタン"
  apply_targets: ["settings-row", "form-toggle", "theme-switcher", "feature-flag"]
  do_not_apply_to: ["multi-select", "navigation", "primary-cta"]
---

## Overview

トグルは ON / OFF の二値状態 UI。トラック背景の color と、つまみの translateX を spring で補間。クリックで `aria-checked` を反転する。色だけでなくテキストやアイコンでも状態を伝える。

使う場面: 設定行、ダークモード切替、機能フラグ。
避けたい場面: 複数選択（チェックボックスを使う）、メインの CTA。

## Preview

公開プレビュー: https://animation-factory.app/preview/toggle-switch

## Implementation

### React + Motion

```tsx
"use client";
import { motion } from "motion/react";
import { useState } from "react";

export function ToggleSwitch({
  defaultOn = false,
  onChange,
}: { defaultOn?: boolean; onChange?: (on: boolean) => void }) {
  const [on, setOn] = useState(defaultOn);
  const toggle = () => {
    const next = !on;
    setOn(next);
    onChange?.(next);
  };
  return (
    <button
      type="button"
      role="switch"
      aria-checked={on}
      onClick={toggle}
      className="relative inline-flex items-center w-11 h-6 rounded-full transition-colors"
      style={{ background: on ? "rgb(132,204,22)" : "rgb(63,63,70)" }}
    >
      <motion.span
        layout
        transition={{ type: "spring", stiffness: 500, damping: 30 }}
        className="absolute h-5 w-5 rounded-full bg-white shadow-md"
        style={{ left: on ? "calc(100% - 22px)" : "2px" }}
      />
    </button>
  );
}
```

## Usage

```tsx
<ToggleSwitch onChange={(on) => setDark(on)} />
```

## AI Apply Prompt

### Context
`{{target_selector}}` に ON/OFF のトグルスイッチを追加する。

### Steps
1. `motion@^11` を `{{package_manager}}` で追加。
2. `ToggleSwitch` を `{{target_file}}` に追加。
3. `role="switch"` + `aria-checked` を確認。色だけでなくラベルでも状態を示す。

### Examples

Before: 通常の checkbox
After: `<ToggleSwitch />`（form 状態管理は別途）

### Verify
- クリックでつまみが滑らかに左右へ移動
- spring 物理感が出る
- スクリーンリーダーが「ON / OFF」を読み上げる
- Reduce Motion で transition なし、即時切替

## Accessibility

`role="switch"` + `aria-checked={on}`。状態をテキスト (`On` / `Off`) や icon でも示し、色覚多様性ユーザーに配慮。

## Performance Notes

translateX + background-color のみ。layout 補間で位置を制御。

## Changelog

- 2026-05-27 (created): 初版。Phase 3 D1 第 5 弾、Tier A form UI 拡充。
