---
id: tab-switch
name: Tab Switch
version: 1.0.0
release: v1.0
variant: react-motion
description: |
  タブ切替時にインジケータが選択タブの位置へ滑らかに移動し、中身が fade で入れ替わる。
  Motion の `layoutId` で計測なしに FLIP を委ねるのが核。

taxonomy:
  layer: [js-runtime, library]
  ux_role:
    primary: state-transition
    secondary: [navigation, feedback]
  trigger: [state-change]
  media: [dom-css]
  authoring: code

behavior:
  lifecycle: toggle
  reversible: true
  replay: every-entry

tags:
  - tab
  - indicator
  - layout
  - flip
  - layoutId
  - segmented-control

trigger:
  primary: state-change
  touch_fallback: always-on
  config: {}

runtime:
  language: typescript
  framework: react
  framework_version: ">=18"
dependencies:
  - { name: motion, version: "^11.0.0", purpose: "layoutId による FLIP 補間" }
peer_dependencies:
  - { name: react, version: ">=18" }

implementations:
  - tier: 1
    name: "React + Motion (layoutId)"
    dependencies: [ { name: motion, version: "^11.0.0" } ]
    browser_support: { baseline: widely-available, baseline_year: 2020 }
    performance: { gpu_accelerated: true, layout_thrash: false, cost: low }
    degrades_to: 2
  - tier: 2
    name: "Vanilla CSS + JS measure"
    dependencies: []
    browser_support: { baseline: widely-available, baseline_year: 2017 }
    performance: { gpu_accelerated: true, layout_thrash: false, cost: low }
    degradation: "切替時にインジケータの位置を JS で計測して transition。Motion ほど安定しない"

browser_support:
  baseline: widely-available
  baseline_year: 2020
  notes: "代表値は Tier 1。FLIP の差分計算は Motion が内部で処理"

performance:
  gpu_accelerated: true
  layout_thrash: false
  cost: low
  notes: "layoutId は transform/scale で擬似的に移動するため Layout を引き起こさない"

parameters:
  - { name: indicator_height_px, type: number, default: 2,   range: [1, 6],   description: "下線インジケータの太さ" }
  - { name: duration_ms,         type: number, default: 240, range: [120, 500], description: "インジケータ移動の長さ" }
  - { name: content_fade_ms,     type: number, default: 160, range: [60, 320], description: "中身の fade 長さ" }

a11y:
  respects_reduced_motion: true
  fallback: "layoutId 補間を無効化、瞬時に切替"
  focus_safe: true
  notes: "Tab ロール（`role=\"tablist\"` / `role=\"tab\"` / `role=\"tabpanel\"`）と aria-selected を必ず付ける"

license: MIT
authors: ["@daichi"]
sources: []
attribution_required: false

preview:
  url: https://animation-factory.app/preview/tab-switch
  loop: true
  duration_ms: 2400

related:
  alternatives: [accordion-collapse]
  composes_with:
    - { id: fade-in, note: "中身の入れ替えは fade-in と同じパターン" }
  requires: []

sections:
  skip: [variants]

ai:
  intent_examples:
    - "タブ切替でインジケータが滑らかに移動"
    - "segmented control 風の tab UI"
    - "切替アニメ付きのタブ"
  apply_targets: ["tab-bar", "segmented-control", "filter-tabs"]
  do_not_apply_to: ["radio-group", "checkbox-list"]
---

## Overview

タブの並びに対して、選択中のタブだけが共通の `layoutId` を持つインジケータをレンダリングする。選択が変わると Motion が前回位置→新規位置を自動で補間する。中身は AnimatePresence の `mode="wait"` で fade を入れ替える。

使う場面: タブ UI、segmented control、フィルタタブ。
避けたい場面: ラジオグループ（一度に表示される選択肢）、チェックリスト（複数選択）。

## Preview

公開プレビュー: https://animation-factory.app/preview/tab-switch

## Implementation

### React + Motion (layoutId)

```tsx
"use client";
import { AnimatePresence, motion } from "motion/react";
import { useState } from "react";

const tabs = [
  { id: "a", label: "概要" },
  { id: "b", label: "詳細" },
  { id: "c", label: "履歴" },
] as const;

export function TabSwitch() {
  const [active, setActive] = useState<typeof tabs[number]["id"]>("a");
  return (
    <div role="tablist" className="border-b border-white/10 flex gap-2">
      {tabs.map((t) => (
        <button
          key={t.id}
          role="tab"
          aria-selected={active === t.id}
          onClick={() => setActive(t.id)}
          className="relative px-3 py-2 text-sm"
        >
          {t.label}
          {active === t.id && (
            <motion.span
              layoutId="tab-indicator"
              className="absolute inset-x-0 bottom-0 h-0.5 bg-current"
              transition={{ duration: 0.24, ease: "easeOut" }}
            />
          )}
        </button>
      ))}
      <AnimatePresence mode="wait">
        <motion.div
          key={active}
          role="tabpanel"
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
          transition={{ duration: 0.16 }}
        >
          {/* active に応じた中身 */}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
```

## Usage

```tsx
<TabSwitch />
```

## AI Apply Prompt

### Context
`{{target_selector}}` のタブ切替でインジケータが滑らかに移動する。

### Steps
1. `motion@^11` を `{{package_manager}}` で追加。
2. 上記パターン（`layoutId="tab-indicator"`）を導入。
3. ARIA ロール（tablist / tab / tabpanel）と `aria-selected` を付与。

### Examples

Before: クラス切替だけのタブ UI
After: `motion.span` インジケータ + AnimatePresence でコンテンツ fade

### Verify
- タブ切替でインジケータが新しいタブに滑らかに移動
- 中身が fade in / out で切り替わる
- キーボードフォーカスが ARIA 通りに動く（別途実装）
- Reduce Motion で移動が瞬時に

## Accessibility

`role="tablist"` / `role="tab"` / `role="tabpanel"` を必ず付ける。`aria-selected` は active と同期、`aria-controls` でタブと panel を結ぶ。

## Performance Notes

`layoutId` の FLIP は transform で実装されるため、`left/top` の transition より滑らか。中身の fade は `mode="wait"` で重なりを防ぐ。

## Changelog

- 2026-05-27 (created): 初版。Phase 3 D1 第 3 弾、state-layout 拡充。
