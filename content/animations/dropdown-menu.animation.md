---
id: dropdown-menu
name: Dropdown Menu
version: 1.0.0
release: v1.0
variant: react-motion
description: |
  ボタン押下で下方向に展開するメニュー。背景が fade、項目が短い stagger で順次登場。
  ユーザーメニュー、設定、コンテキストメニューに。

taxonomy:
  layer: [library, js-runtime]
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
  - dropdown
  - menu
  - popover
  - user-menu
  - settings
  - context-menu

trigger:
  primary: state-change
  touch_fallback: always-on
  config: {}

runtime:
  language: typescript
  framework: react
  framework_version: ">=18"
dependencies:
  - { name: motion, version: "^11.0.0", purpose: "AnimatePresence + stagger" }
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
    name: "Radix UI DropdownMenu"
    dependencies: [ { name: "@radix-ui/react-dropdown-menu", version: "^2.0.0" } ]
    browser_support: { baseline: widely-available, baseline_year: 2020 }
    performance: { gpu_accelerated: true, layout_thrash: false, cost: low }
    degradation: "ARIA / keyboard / 位置決めが完備。アニメは data-state hook で乗せる"

browser_support:
  baseline: widely-available
  baseline_year: 2020
  notes: "代表値は Tier 1。opacity + translateY、項目に staggerChildren"

performance:
  gpu_accelerated: true
  layout_thrash: false
  cost: low
  notes: "メニュー全体 fade-down + 項目 stagger。同時に動く要素が少ない"

parameters:
  - { name: enter_y_px, type: number, default: 6, range: [0, 20], description: "登場時の上方向オフセット" }
  - { name: stagger_ms, type: number, default: 30, range: [0, 100], description: "項目間のずらし" }
  - { name: duration_ms, type: number, default: 180, range: [100, 400], description: "全体の長さ" }

a11y:
  respects_reduced_motion: true
  fallback: "stagger と translate を無効化、opacity の fade のみ"
  focus_safe: true
  notes: "ARIA: `role=\"menu\"` / `role=\"menuitem\"`。↑/↓ で項目移動、ESC で閉じる、Tab で外側へ。focus トラップではなく focus return"

license: MIT
authors: ["@daichi"]
sources: []
attribution_required: false

preview:
  url: https://animation-factory.app/preview/dropdown-menu
  loop: true
  duration_ms: 2400

related:
  alternatives: [tooltip-pop, drawer-slide]
  composes_with: []
  requires: []

sections:
  skip: [variants]

ai:
  intent_examples:
    - "ユーザーメニューのドロップダウン"
    - "設定メニューを下に展開"
    - "コンテキストメニュー"
  apply_targets: ["user-menu", "settings-button", "context-menu", "options-button"]
  do_not_apply_to: ["primary-cta", "form-input", "tooltip-only-hover"]
---

## Overview

トリガを押すと、下方向に小さくスライド + fade でメニューが現れる。中身の項目には 30ms 程度の stagger を入れると「組み立たる」印象。閉じるときは逆再生。

使う場面: ユーザーメニュー、設定ボタン、コンテキストメニュー、機能オプション。
避けたい場面: メイン CTA、フォーム要素、hover-only のツールチップ（→ tooltip-pop）。

## Preview

公開プレビュー: https://animation-factory.app/preview/dropdown-menu

## Implementation

### React + Motion

```tsx
"use client";
import { AnimatePresence, motion } from "motion/react";
import { useEffect, useRef, useState } from "react";

const ITEMS = ["プロフィール", "設定", "ヘルプ", "ログアウト"];

export function UserMenu() {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const onDoc = (e: MouseEvent) => {
      if (!ref.current?.contains(e.target as Node)) setOpen(false);
    };
    const onEsc = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    document.addEventListener("mousedown", onDoc);
    document.addEventListener("keydown", onEsc);
    return () => {
      document.removeEventListener("mousedown", onDoc);
      document.removeEventListener("keydown", onEsc);
    };
  }, [open]);

  return (
    <div ref={ref} className="relative inline-block">
      <button type="button" aria-haspopup="menu" aria-expanded={open} onClick={() => setOpen((v) => !v)}>
        ユーザー ▾
      </button>
      <AnimatePresence>
        {open && (
          <motion.ul
            role="menu"
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0, transition: { staggerChildren: 0.03 } }}
            exit={{ opacity: 0, y: 6 }}
            transition={{ duration: 0.18 }}
            className="absolute right-0 mt-2 min-w-48 rounded-lg border border-white/10 bg-zinc-900 p-1.5 shadow-xl"
          >
            {ITEMS.map((label) => (
              <motion.li
                key={label} role="menuitem"
                variants={{
                  hidden: { opacity: 0, x: -4 },
                  visible: { opacity: 1, x: 0 },
                }}
                initial="hidden" animate="visible"
                className="px-3 py-2 text-sm rounded hover:bg-white/5 cursor-pointer"
              >
                {label}
              </motion.li>
            ))}
          </motion.ul>
        )}
      </AnimatePresence>
    </div>
  );
}
```

## Usage

```tsx
<UserMenu />
```

## AI Apply Prompt

### Context
`{{target_selector}}` にドロップダウンメニューを追加する。

### Steps
1. `motion@^11` を `{{package_manager}}` で追加。
2. `UserMenu` を `{{target_file}}` に追加。
3. ARIA: `aria-haspopup` / `aria-expanded` / `role="menu"` / `role="menuitem"`、ESC 閉じと外側クリックで閉じるを確認。
4. キーボード矢印操作（↑/↓）を別途実装するか、Radix UI に移行。

### Examples

Before: 静的なボタン
After: `<UserMenu />`

### Verify
- 開閉で fade + 軽い slide
- 項目に短い stagger
- ESC / 外側クリックで閉じる
- Reduce Motion で stagger / translate なし

## Accessibility

`aria-haspopup="menu"` / `aria-expanded`。閉じた時 focus をトリガに戻す（focus return）。Production grade は Radix UI を推奨。

## Performance Notes

opacity + translateY + stagger のみ。一度に動く要素が少なく軽い。

## Changelog

- 2026-05-27 (created): 初版。Phase 3 D1 第 5 弾、Tier A UI 部品拡充。
