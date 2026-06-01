---
id: sidebar-collapse-animated
name: Sidebar Collapse Animated
version: 1.0.0
release: beta
variant: react-motion
description: |
  サイドバーを幅アニメで折りたたみ、テキストラベルは fade-out してアイコンだけ残す。
  デスクトップ常駐ナビの省スペース化。展開/折りたたみを spring で滑らかに。

taxonomy:
  layer: [css, js-runtime, library]
  ux_role:
    primary: state-transition
    secondary: [navigation]
  trigger: [click]
  media: [dom-css]
  authoring: code

behavior:
  lifecycle: toggle
  reversible: true
  replay: every-entry

tags:
  - sidebar
  - navigation
  - collapse
  - expand
  - rail
  - icon
  - layout

trigger:
  primary: click
  touch_fallback: tap-toggle
  config: {}

runtime:
  language: typescript
  framework: react
  framework_version: ">=18"
dependencies:
  - { name: motion, version: "^11.0.0", purpose: "width の spring + ラベルの fade" }
peer_dependencies:
  - { name: react, version: ">=18" }

implementations:
  - tier: 1
    name: "React + Motion (animate width + label fade)"
    dependencies: [ { name: motion, version: "^11.0.0" } ]
    browser_support: { baseline: widely-available, baseline_year: 2020 }
    performance: { gpu_accelerated: false, layout_thrash: true, cost: medium }
    degrades_to: 2
  - tier: 2
    name: "Vanilla CSS (transition: width)"
    dependencies: []
    browser_support: { baseline: widely-available, baseline_year: 2017 }
    degradation: "collapsed クラスで width を切替、ラベルは opacity + max-width transition"
    performance: { gpu_accelerated: false, layout_thrash: true, cost: medium }

browser_support:
  baseline: widely-available
  baseline_year: 2020
  notes: "代表値は Tier 1。width アニメは reflow を伴うが、サイドバー単独なら影響は限定的。アイコンは固定、ラベルのみ fade"

performance:
  gpu_accelerated: false
  layout_thrash: true
  cost: medium
  notes: "width 補間は reflow するため、隣接コンテンツの再レイアウトに注意。content-visibility や固定アイコン幅で緩和"

parameters:
  - { name: width_open_px,      type: number, default: 220, range: [180, 280], description: "展開時の幅(px)" }
  - { name: width_collapsed_px, type: number, default: 56,  range: [48, 72],   description: "折りたたみ時の幅(px)" }
  - { name: duration_ms,        type: number, default: 260, range: [150, 420], description: "遷移の長さ" }

a11y:
  respects_reduced_motion: true
  fallback: "width / fade を即時切替。折りたたみ時もアイコンに aria-label でラベルを維持"
  focus_safe: true
  notes: "トグルボタンに aria-expanded。折りたたみ時はアイコンに title/aria-label を残し意味を失わせない。focus 順は維持"

license: MIT
authors: ["@daichi"]
sources:
  - { title: "MDN: aria-expanded", url: "https://developer.mozilla.org/en-US/docs/Web/Accessibility/ARIA/Attributes/aria-expanded" }
attribution_required: false

preview:
  url: https://animation-factory.app/preview/sidebar-collapse-animated
  loop: true
  duration_ms: 2800

related:
  alternatives: [drawer-left-overlay, drawer-slide, tab-underline-slide]
  composes_with:
    - { id: drawer-left-overlay, note: "デスクトップは collapse rail、モバイルは overlay drawer に切替える構成" }
  requires: []

sections:
  skip: [variants]

ai:
  intent_examples:
    - "サイドバーを折りたたむとアイコンだけ残る"
    - "ラベルが消えてレールになるナビ"
    - "展開/折りたたみできるサイドナビ"
  apply_targets: ["app-sidebar", "dashboard-nav", "rail-nav"]
  do_not_apply_to: ["mobile-overlay-menu", "tooltip", "toast"]
---

## Overview

サイドバーの `width` を spring でアニメして折りたたみ、各項目のテキストラベルは `opacity` + 幅で fade-out、アイコンだけを残す。ダッシュボード等の常駐ナビを省スペース化する。折りたたみ時はアイコンに `aria-label` を残して意味を保つ。

使う場面: ダッシュボードの常駐サイドナビ、IDE 風レイアウト。
避けたい場面: モバイルのオーバーレイメニュー（`drawer-left-overlay`）、ツールチップ。

## Preview

公開プレビュー: https://animation-factory.app/preview/sidebar-collapse-animated

## Implementation

### React + Motion

```tsx
"use client";
import { AnimatePresence, motion } from "motion/react";

export function Sidebar({ collapsed, items }:
  { collapsed: boolean; items: { icon: React.ReactNode; label: string }[] }) {
  return (
    <motion.aside
      animate={{ width: collapsed ? 56 : 220 }}
      transition={{ type: "spring", stiffness: 320, damping: 34 }}
      className="h-full overflow-hidden"
    >
      {items.map((it) => (
        <a key={it.label} className="flex items-center gap-3 px-3 py-2" aria-label={it.label}>
          <span className="shrink-0">{it.icon}</span>
          <AnimatePresence initial={false}>
            {!collapsed && (
              <motion.span
                initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                className="whitespace-nowrap">{it.label}</motion.span>
            )}
          </AnimatePresence>
        </a>
      ))}
    </motion.aside>
  );
}
```

## Usage

```tsx
const [collapsed, setCollapsed] = useState(false);
<button aria-expanded={!collapsed} onClick={() => setCollapsed((v) => !v)}>切替</button>
<Sidebar collapsed={collapsed} items={items} />
```

## AI Apply Prompt

### Context
`{{sidebar}}` を折りたたみ可能なレールナビにする。

### Steps
1. `motion@^11` を追加。
2. `width` を animate、ラベルを AnimatePresence で fade。
3. トグルに `aria-expanded`、アイコンに `aria-label` を残す。

### Verify
- 折りたたみで幅が縮みラベルが消え、アイコンだけ残る
- Reduce Motion で即時切替
- 折りたたみ時もアイコンの意味が支援技術に伝わる

## Accessibility

トグルに `aria-expanded`。折りたたみ時はアイコンに `aria-label`/`title` を残す。focus 順序は崩さない。Reduce Motion で width/fade を即時化。

## Performance Notes

`width` 補間は reflow を伴うため、サイドバー外の大きなコンテンツの再レイアウトに注意。アイコン列の幅を固定し、ラベルだけを fade すると軽い。

## Changelog

- 2026-06-01 (created): 初版。v1.1 Batch 3（Navigation 拡張）第 3 弾。折りたたみレールナビ。
