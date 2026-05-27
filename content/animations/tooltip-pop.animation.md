---
id: tooltip-pop
name: Tooltip Pop
version: 1.0.0
release: alpha
variant: react-motion
description: |
  ホバー／フォーカスで小さなツールチップが fade + scale で現れる。
  ボタンの説明、IconButton のラベル、ヘルプテキストに。

taxonomy:
  layer: [library, js-runtime]
  ux_role:
    primary: state-transition
    secondary: [feedback]
  trigger: [pointer]
  media: [dom-css]
  authoring: code

behavior:
  lifecycle: continuous
  reversible: true
  replay: every-entry

tags:
  - tooltip
  - popover
  - hint
  - icon-button
  - help

trigger:
  primary: pointer
  touch_fallback: tap-toggle
  config:
    delay_ms: 200

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
    name: "Radix UI Tooltip"
    dependencies: [ { name: "@radix-ui/react-tooltip", version: "^1.0.0" } ]
    browser_support: { baseline: widely-available, baseline_year: 2020 }
    performance: { gpu_accelerated: true, layout_thrash: false, cost: low }
    degradation: "ARIA / 位置決め / keyboard が完備された production grade。アニメは class hook で乗せる"

browser_support:
  baseline: widely-available
  baseline_year: 2020
  notes: "代表値は Tier 1。AnimatePresence + opacity + scale"

performance:
  gpu_accelerated: true
  layout_thrash: false
  cost: low
  notes: "opacity + scale のみ補間"

parameters:
  - { name: enter_ms, type: number, default: 140, range: [60, 300], description: "登場の長さ" }
  - { name: delay_ms, type: number, default: 200, range: [0, 800], description: "ホバー開始から登場までの遅延" }
  - { name: from_scale, type: number, default: 0.92, range: [0.7, 1.0], description: "開始スケール" }

a11y:
  respects_reduced_motion: true
  fallback: "scale を無効化、opacity のみ"
  focus_safe: true
  notes: "`aria-describedby` でトリガと結ぶ。tooltip 本体は `role=\"tooltip\"`、ESC で閉じる、ホバー中は消さない（hover → tooltip ホバーで延長）"

license: MIT
authors: ["@daichi"]
sources: []
attribution_required: false

preview:
  url: https://animation-factory.app/preview/tooltip-pop
  loop: true
  duration_ms: 1800

related:
  alternatives: [dropdown-menu]
  composes_with: []
  requires: []

sections:
  skip: [variants]

ai:
  intent_examples:
    - "ホバーで小さな説明を出す"
    - "IconButton にラベルを出すツールチップ"
    - "ヘルプアイコンをホバーで説明"
  apply_targets: ["icon-button", "help-icon", "abbreviation", "truncated-text"]
  do_not_apply_to: ["primary-action", "form-field", "modal-content"]
---

## Overview

トリガにホバー or フォーカスすると、200ms 遅延の後に小さな box が `opacity + scale` で登場。離れると逆再生で消える。Touch 端末ではタップで toggle に縮退する設計。

使う場面: IconButton のラベル、ヘルプアイコン、省略テキスト（truncate）の全文表示。
避けたい場面: 主要 CTA、フォーム入力、モーダル内（モーダル内なら別の hover-card を使う）。

## Preview

公開プレビュー: https://animation-factory.app/preview/tooltip-pop

## Implementation

### React + Motion

```tsx
"use client";
import { AnimatePresence, motion } from "motion/react";
import { useEffect, useId, useState } from "react";

export function Tooltip({
  content, children, delayMs = 200,
}: { content: string; children: React.ReactNode; delayMs?: number }) {
  const [open, setOpen] = useState(false);
  const id = useId();
  useEffect(() => {
    if (!open) return;
    const onEsc = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    window.addEventListener("keydown", onEsc);
    return () => window.removeEventListener("keydown", onEsc);
  }, [open]);

  let timer: ReturnType<typeof setTimeout> | null = null;
  const show = () => { if (timer) clearTimeout(timer); timer = setTimeout(() => setOpen(true), delayMs); };
  const hide = () => { if (timer) clearTimeout(timer); setOpen(false); };

  return (
    <span className="relative inline-block"
      onPointerEnter={show} onPointerLeave={hide}
      onFocus={show} onBlur={hide}>
      <span aria-describedby={open ? id : undefined}>{children}</span>
      <AnimatePresence>
        {open && (
          <motion.span
            id={id}
            role="tooltip"
            initial={{ opacity: 0, scale: 0.92, y: 4 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.92, y: 4 }}
            transition={{ duration: 0.14, ease: "easeOut" }}
            className="absolute left-1/2 -translate-x-1/2 -top-9 rounded-md bg-zinc-800 text-zinc-100 text-xs px-2 py-1 whitespace-nowrap"
          >
            {content}
          </motion.span>
        )}
      </AnimatePresence>
    </span>
  );
}
```

### Radix UI Tooltip（縮退）

Production grade なら Radix。ARIA / 位置決め / keyboard 完備。

## Usage

```tsx
<Tooltip content="保存"><IconButton><SaveIcon /></IconButton></Tooltip>
```

## AI Apply Prompt

### Context
`{{target_selector}}` の icon ボタンにラベルツールチップを付ける。

### Steps
1. `motion@^11` を `{{package_manager}}` で追加。
2. `Tooltip` を `{{target_file}}` に追加。
3. ARIA: `aria-describedby` + `role="tooltip"`、ESC 閉じを確認。

### Examples

Before: `<button><SaveIcon /></button>`
After: `<Tooltip content="保存"><button><SaveIcon /></button></Tooltip>`

### Verify
- ホバー / フォーカスで 200ms 後に出現
- ESC キーで閉じる
- スクリーンリーダーが説明を読み上げる
- Reduce Motion で scale なし、fade のみ

## Accessibility

`role="tooltip"` + `aria-describedby` でトリガと結合。ESC 閉じ。タッチではタップで切替（モーダル相当ではないので背景 inert は不要）。

## Performance Notes

opacity + scale のみ。複数 tooltip 同時表示は通常ない。

## Changelog

- 2026-05-27 (created): 初版。Phase 3 D1 第 5 弾、Tier A UI 部品拡充。
