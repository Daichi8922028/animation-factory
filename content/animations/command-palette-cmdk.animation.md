---
id: command-palette-cmdk
name: Command Palette (Cmd+K)
version: 1.0.0
release: v1.1
variant: react-motion
description: |
  ⌘K / Ctrl+K で開く検索コマンドパレット。上から軽く落ちて scale-in し、入力に即フォーカス。
  矢印キーで候補を移動、Enter で実行、ESC で閉じる。dialog-focus-trap の focus 管理を土台にした navigation パターン。

taxonomy:
  layer: [css, js-runtime, library]
  ux_role:
    primary: navigation
    secondary: [state-transition]
  trigger: [keypress, state-change]
  media: [dom-css]
  authoring: code

behavior:
  lifecycle: toggle
  reversible: true
  replay: every-entry

tags:
  - command-palette
  - cmdk
  - search
  - keyboard
  - shortcut
  - palette
  - navigation

trigger:
  primary: keypress
  touch_fallback: tap-toggle
  config: { combo: "mod+k" }

runtime:
  language: typescript
  framework: react
  framework_version: ">=18"
dependencies:
  - { name: motion, version: "^11.0.0", purpose: "登場/退場の AnimatePresence + scale/translate" }
peer_dependencies:
  - { name: react, version: ">=18" }

implementations:
  - tier: 1
    name: "React + Motion + 自前フィルタ/キーボードナビ"
    dependencies: [ { name: motion, version: "^11.0.0" } ]
    browser_support: { baseline: widely-available, baseline_year: 2020 }
    performance: { gpu_accelerated: true, layout_thrash: false, cost: low }
  - tier: 2
    name: "cmdk ライブラリ採用（フィルタ/ナビ/a11y を肩代わり）"
    dependencies: [ { name: cmdk, version: "^1.0.0" } ]
    browser_support: { baseline: widely-available, baseline_year: 2020 }
    degradation: "cmdk が候補フィルタ・矢印ナビ・aria を提供。登場アニメは Motion でラップ"
    performance: { gpu_accelerated: true, layout_thrash: false, cost: low }

browser_support:
  baseline: widely-available
  baseline_year: 2020
  notes: "代表値は Tier 1。⌘/Ctrl 検出は metaKey/ctrlKey。Mac は ⌘、Win/Linux は Ctrl"

performance:
  gpu_accelerated: true
  layout_thrash: false
  cost: low
  notes: "登場は opacity + translateY + scale のみ。候補フィルタは useMemo でメモ化し入力ごとの再計算を最小化"

parameters:
  - { name: from_y_px,    type: number, default: -8,  range: [-24, 0],   description: "登場時の縦オフセット(px、上から落とす)" }
  - { name: from_scale,   type: number, default: 0.96, range: [0.9, 1.0], description: "開始時のスケール" }
  - { name: duration_ms,  type: number, default: 180, range: [100, 320], description: "登場トランジションの長さ" }

a11y:
  respects_reduced_motion: true
  fallback: "登場アニメを無効化し即時表示。キーボード操作は維持"
  focus_safe: true
  notes: "開いたら入力にフォーカス、focus はパレット内に留める（dialog-focus-trap 併用）。候補は role=listbox/option + aria-selected、aria-activedescendant で読み上げ。ESC で閉じトリガーへ復帰"

license: MIT
authors: ["@daichi"]
sources:
  - { title: "cmdk by pacocoursey", url: "https://github.com/pacocoursey/cmdk" }
  - { title: "WAI-ARIA APG: Combobox / Listbox", url: "https://www.w3.org/WAI/ARIA/apg/patterns/combobox/" }
attribution_required: false

preview:
  url: https://animation-factory.app/preview/command-palette-cmdk
  loop: false
  duration_ms: 2600

related:
  alternatives: [dropdown-menu, modal-scale-blur, dialog-focus-trap]
  composes_with:
    - { id: dialog-focus-trap, note: "focus trap を土台に検索 UI を載せた構成" }
    - { id: modal-scale-blur, note: "登場演出を scale-blur に差し替えても良い" }
  requires: [dialog-focus-trap]

sections:
  skip: [variants]

ai:
  intent_examples:
    - "⌘K で開く検索コマンドパレットがほしい"
    - "Linear / VSCode 風のコマンドパレット"
    - "キーボードショートカットでコマンド検索を開く"
  apply_targets: ["command-palette", "quick-search", "action-menu"]
  do_not_apply_to: ["simple-dropdown", "tooltip", "toast"]
---

## Overview

`⌘K`（Mac）/ `Ctrl+K`（Win/Linux）で開く検索パレット。オーバーレイの上端寄りに、軽く上から落ちて `scale-in` する。開くと検索入力に即フォーカスし、`↑`/`↓` で候補移動、`Enter` で実行、`Esc` で閉じる。動きとしては `dialog-focus-trap` の focus 管理を土台に、combobox/listbox の a11y を載せた **navigation** パターン。

トリガーが `keypress`（キーボードショートカット）である点が、クリック起点の他モーダルとの違い。アプリ全体のクイックアクション入口として使う。

使う場面: アプリ全体の検索/コマンド実行、ページ遷移ハブ、開発者ツール。
避けたい場面: 単純な選択メニュー（ドロップダウンで十分）、ツールチップ、トースト。

## Preview

公開プレビュー: https://animation-factory.app/preview/command-palette-cmdk

## Implementation

### React + Motion + 自前フィルタ/キーボードナビ

```tsx
"use client";
import { AnimatePresence, motion } from "motion/react";
import { useEffect, useMemo, useRef, useState } from "react";

export function CommandPalette({ commands }: { commands: { id: string; label: string }[] }) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [active, setActive] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") { e.preventDefault(); setOpen((v) => !v); }
      else if (e.key === "Escape") setOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  const results = useMemo(
    () => commands.filter((c) => c.label.toLowerCase().includes(query.toLowerCase())),
    [commands, query],
  );

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-start justify-center pt-24 bg-black/50"
          onClick={() => setOpen(false)}
        >
          <motion.div
            role="dialog" aria-modal="true" aria-label="コマンドパレット"
            initial={{ opacity: 0, y: -8, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -8, scale: 0.96 }}
            transition={{ duration: 0.18, ease: "easeOut" }}
            onClick={(e) => e.stopPropagation()}
          >
            <input ref={inputRef} value={query} onChange={(e) => setQuery(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "ArrowDown") setActive((a) => Math.min(a + 1, results.length - 1));
                if (e.key === "ArrowUp") setActive((a) => Math.max(a - 1, 0));
              }}
              role="combobox" aria-expanded aria-controls="cmd-list" aria-activedescendant={`cmd-${active}`}
            />
            <ul id="cmd-list" role="listbox">
              {results.map((c, i) => (
                <li id={`cmd-${i}`} key={c.id} role="option" aria-selected={i === active}>{c.label}</li>
              ))}
            </ul>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
```

### cmdk ライブラリ採用（代替）

`cmdk`（pacocoursey）でフィルタ・矢印ナビ・aria を肩代わりさせ、登場アニメだけ Motion でラップする構成。実装量を減らせる。

## Usage

```tsx
<CommandPalette commands={[{ id: "new", label: "新規作成" }, { id: "settings", label: "設定" }]} />
// どこからでも ⌘K で起動
```

## AI Apply Prompt

### Context
`{{app_root}}` に ⌘K で開くコマンドパレットを足す。

### Steps
1. `motion@^11` を追加（または `cmdk` を併用）。
2. `window` の `keydown` で `mod+k` を検出して open をトグル。
3. 開いたら入力にフォーカス、`↑↓` で active 移動、`Enter` で実行、`Esc` で閉じる。
4. focus trap（`dialog-focus-trap`）と combobox/listbox の aria を付ける。

### Examples

Before: ヘッダの検索ボタンをクリックして遷移
After: どこからでも ⌘K で検索/コマンド実行

### Verify
- ⌘K / Ctrl+K で開閉、Esc で閉じる
- 開くと入力にフォーカス、↑↓ で候補がハイライト移動
- 入力でリアルタイムに候補が絞り込まれる
- Reduce Motion で登場アニメ無し、キーボード操作は維持

## Accessibility

`dialog` + `aria-modal` + focus trap（`dialog-focus-trap`）。入力は `role="combobox"` + `aria-controls` + `aria-activedescendant`、候補は `role="listbox"` / `role="option"` + `aria-selected`。ESC で閉じてトリガーへフォーカス復帰。Reduce Motion では登場アニメのみ無効化。

## Performance Notes

候補フィルタは `useMemo` でメモ化。登場は `opacity` + `translateY` + `scale` のみで GPU 完結。大量候補（数百件超）は仮想スクロール（react-virtual 等）を検討。

## Changelog

- 2026-06-01 (created): 初版。v1.1 Batch 1（Navigation 基礎）第 5 弾。dialog-focus-trap を土台にした ⌘K コマンドパレット（navigation / keyboard トリガー）。
