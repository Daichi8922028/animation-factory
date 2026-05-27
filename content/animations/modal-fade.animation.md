---
id: modal-fade
name: Modal Fade
version: 1.0.0
release: alpha
variant: react-motion
description: |
  モーダルの背景が fade-in、中身が scale-in でポンと現れる定番の開閉演出。
  Motion の AnimatePresence で出入りを宣言的に。

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
  - modal
  - dialog
  - overlay
  - fade
  - scale
  - open
  - close

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
    name: "Vanilla CSS + dialog"
    dependencies: []
    browser_support: { baseline: newly-available, baseline_year: 2024 }
    degradation: "ネイティブ <dialog> + @starting-style。閉じる遷移はブラウザ依存"
    performance: { gpu_accelerated: true, layout_thrash: false, cost: low }

browser_support:
  baseline: widely-available
  baseline_year: 2020
  notes: "代表値は Tier 1。React state で open/close を制御し AnimatePresence でアニメ"

performance:
  gpu_accelerated: true
  layout_thrash: false
  cost: low
  notes: "背景は opacity、中身は opacity + scale。Layout に影響しない"

parameters:
  - { name: backdrop_opacity, type: number, default: 0.6, range: [0.3, 0.9], description: "背景 dim の濃さ" }
  - { name: from_scale,       type: number, default: 0.94, range: [0.8, 1.0], description: "開始時のスケール" }
  - { name: duration_ms,      type: number, default: 220,  range: [120, 400], description: "出入りの長さ" }

a11y:
  respects_reduced_motion: true
  fallback: "fade と scale を無効化、open/close は即時切替"
  focus_safe: true
  notes: "アニメだけでは a11y は満たせない。focus トラップ、ESC で閉じる、`aria-modal=\"true\"`、背景の `inert` 化を別途実装する"

license: MIT
authors: ["@daichi"]
sources: []
attribution_required: false

preview:
  url: https://animation-factory.app/preview/modal-fade
  loop: true
  duration_ms: 2200

related:
  alternatives: [scale-in, drawer-slide]
  composes_with:
    - { id: scale-in, note: "modal-fade の中身演出は scale-in と同質。単独要素にだけ使うなら scale-in" }
  requires: []

sections:
  skip: [variants]

ai:
  intent_examples:
    - "モーダルが fade + scale で開く"
    - "ダイアログの開閉アニメ"
    - "オーバーレイで何かを表示する"
  apply_targets: ["modal", "dialog", "confirm-overlay", "lightbox"]
  do_not_apply_to: ["inline-tooltip", "dropdown-menu", "toast"]
---

## Overview

開閉トリガー（ボタンクリック等）に応じて、半透明の背景 dim と中央のダイアログを同時に出し入れする。背景は `opacity`、中身は `opacity + scale` を補間。`AnimatePresence` の `exit` で逆再生される。

使う場面: 確認ダイアログ、ライトボックス、フォーム入力モーダル。
避けたい場面: ツールチップ、ドロップダウン（モーダルほど強い遮断は不要）、トースト（非モーダル通知）。

## Preview

公開プレビュー: https://animation-factory.app/preview/modal-fade

## Implementation

### React + Motion (AnimatePresence)

```tsx
"use client";
import { AnimatePresence, motion } from "motion/react";

export function ModalFade({
  open, onClose, children,
}: { open: boolean; onClose: () => void; children: React.ReactNode }) {
  return (
    <AnimatePresence>
      {open && (
        <motion.div
          role="dialog"
          aria-modal="true"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.22 }}
          className="fixed inset-0 z-50 grid place-items-center bg-black/60"
          onClick={onClose}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.94 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.94 }}
            transition={{ duration: 0.22, ease: "easeOut" }}
            onClick={(e) => e.stopPropagation()}
          >
            {children}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
```

### Vanilla CSS + `<dialog>`（縮退）

```css
dialog[open] {
  animation: scale-in 220ms ease-out;
}
@keyframes scale-in {
  from { opacity: 0; transform: scale(0.94); }
  to   { opacity: 1; transform: scale(1); }
}
```

## Usage

```tsx
<ModalFade open={isOpen} onClose={() => setOpen(false)}>
  <ConfirmDialog onConfirm={…} />
</ModalFade>
```

## AI Apply Prompt

### Context
`{{target_selector}}` を fade + scale で開閉するモーダルにする。

### Steps
1. `motion@^11` を `{{package_manager}}` で追加。
2. `ModalFade` を `{{target_file}}` に追加。
3. open state を親で管理。ESC キー閉じと focus トラップを別途実装（このコンポーネントはアニメだけを担当）。

### Examples

Before: `<div>…</div>` を条件で表示
After: `<ModalFade open={…}><Dialog /></ModalFade>`

### Verify
- open=true で背景 fade + 中身 scale-in
- open=false で逆再生して消える（AnimatePresence の exit）
- 背景クリックで閉じる、内部クリックで閉じない
- Reduce Motion でアニメ無し、open/close 即時

## Accessibility

`aria-modal="true"` / `role="dialog"` / ESC 閉じ / focus トラップ / 背景の `inert` 化は別途必須。Reduce Motion で fade と scale を無効化（Motion は `useReducedMotion()` を尊重）。

## Performance Notes

背景と中身を別 motion 要素に分けることで、`opacity` と `transform` を独立制御できる。`will-change` は不要（Motion が必要時に付与）。

## Changelog

- 2026-05-27 (created): 初版。Phase 3 D1 第 3 弾、state-layout 拡充。
