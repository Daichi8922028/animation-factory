---
id: modal-scale-blur
name: Modal Scale Blur
version: 1.0.0
release: beta
variant: react-motion
description: |
  背景を backdrop-filter で一段ぼかしつつ、中身を spring で scale-in させるモーダル開閉。
  modal-fade が opacity 主体なのに対し、こちらは「奥の景色をぼかして前面に集中させる」奥行きのある登場感。

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
  - blur
  - backdrop
  - scale
  - overlay
  - focus-pull

trigger:
  primary: state-change
  touch_fallback: always-on
  config: {}

runtime:
  language: typescript
  framework: react
  framework_version: ">=18"
dependencies:
  - { name: motion, version: "^11.0.0", purpose: "AnimatePresence + spring で出入りを宣言的に" }
peer_dependencies:
  - { name: react, version: ">=18" }

implementations:
  - tier: 1
    name: "React + Motion (spring scale + backdrop blur)"
    dependencies: [ { name: motion, version: "^11.0.0" } ]
    browser_support: { baseline: newly-available, baseline_year: 2022 }
    performance: { gpu_accelerated: true, layout_thrash: false, cost: medium }
    degrades_to: 2
  - tier: 2
    name: "Vanilla CSS + <dialog> + @starting-style"
    dependencies: []
    browser_support: { baseline: newly-available, baseline_year: 2024 }
    degradation: "ネイティブ <dialog> に @starting-style で scale-in、::backdrop に backdrop-filter。閉じる遷移はブラウザ依存"
    performance: { gpu_accelerated: true, layout_thrash: false, cost: medium }

browser_support:
  baseline: newly-available
  baseline_year: 2022
  notes: "代表値は Tier 1。backdrop-filter は Safari で -webkit- 前置が必要。非対応環境では dim のみにフォールバック"

performance:
  gpu_accelerated: true
  layout_thrash: false
  cost: medium
  notes: "scale は transform で安価だが backdrop-filter: blur は合成コストが高め。大面積で常時かけ続けない（開閉時のみ）"

parameters:
  - { name: backdrop_blur_px, type: number, default: 6,   range: [2, 16],    description: "背景のぼかし量(px)" }
  - { name: from_scale,       type: number, default: 0.9,  range: [0.8, 1.0], description: "開始時のスケール" }
  - { name: duration_ms,      type: number, default: 240,  range: [120, 400], description: "fade/blur の長さ。中身は spring" }

a11y:
  respects_reduced_motion: true
  fallback: "scale と blur を無効化、dim の即時切替のみ。backdrop-filter も外す"
  focus_safe: true
  notes: "アニメは a11y を満たさない。focus トラップ・ESC 閉じ・aria-modal=\"true\"・背景の inert 化は別途実装（dialog-focus-trap を併用）"

license: MIT
authors: ["@daichi"]
sources:
  - { title: "MDN: backdrop-filter", url: "https://developer.mozilla.org/en-US/docs/Web/CSS/backdrop-filter" }
  - { title: "MDN: @starting-style", url: "https://developer.mozilla.org/en-US/docs/Web/CSS/@starting-style" }
attribution_required: false

preview:
  url: https://animation-factory.app/preview/modal-scale-blur
  loop: true
  duration_ms: 2200

related:
  alternatives: [modal-fade, scale-in, drawer-slide]
  composes_with:
    - { id: dialog-focus-trap, note: "登場演出はこれ、a11y(focus trap/ESC/inert)は dialog-focus-trap を重ねると完成形" }
  requires: []

sections:
  skip: [variants]

ai:
  intent_examples:
    - "モーダルが scale しながら背景がぼやけて開く"
    - "背景をブラーして前面のダイアログに集中させたい"
    - "fade だけじゃない奥行きのあるモーダル登場演出"
  apply_targets: ["modal", "dialog", "lightbox", "command-overlay"]
  do_not_apply_to: ["inline-tooltip", "dropdown-menu", "toast"]
---

## Overview

開閉トリガーに応じて、背景に `backdrop-filter: blur()` を効かせて後ろのコンテンツをぼかし、中央のダイアログを `spring` で `scale-in` させる。`modal-fade` が opacity 中心の素直な登場なのに対し、こちらは「被写界深度を浅くして前面に焦点を合わせる」ような奥行き表現。`AnimatePresence` の `exit` で blur と scale を逆再生する。

使う場面: 重要な確認ダイアログ、ライトボックス、コマンド/検索オーバーレイで「後ろを意識から外したい」とき。
避けたい場面: ツールチップやドロップダウン（強い遮断は過剰）、トースト（非モーダル）、低スペック端末で大面積に常時 blur をかけ続ける構成。

## Preview

公開プレビュー: https://animation-factory.app/preview/modal-scale-blur

## Implementation

### React + Motion (spring scale + backdrop blur)

```tsx
"use client";
import { AnimatePresence, motion } from "motion/react";

export function ModalScaleBlur({
  open, onClose, children,
}: { open: boolean; onClose: () => void; children: React.ReactNode }) {
  return (
    <AnimatePresence>
      {open && (
        <motion.div
          role="dialog"
          aria-modal="true"
          initial={{ opacity: 0, backdropFilter: "blur(0px)" }}
          animate={{ opacity: 1, backdropFilter: "blur(6px)" }}
          exit={{ opacity: 0, backdropFilter: "blur(0px)" }}
          transition={{ duration: 0.24 }}
          className="fixed inset-0 z-50 grid place-items-center bg-black/40"
          onClick={onClose}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.9, filter: "blur(8px)" }}
            animate={{ opacity: 1, scale: 1, filter: "blur(0px)" }}
            exit={{ opacity: 0, scale: 0.9, filter: "blur(8px)" }}
            transition={{ type: "spring", stiffness: 260, damping: 22 }}
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

### Vanilla CSS + `<dialog>` + `@starting-style`（縮退）

```css
dialog.scale-blur {
  opacity: 1;
  transform: scale(1);
  transition: opacity 240ms, transform 240ms;
}
@starting-style {
  dialog.scale-blur[open] { opacity: 0; transform: scale(0.9); }
}
dialog.scale-blur::backdrop {
  backdrop-filter: blur(6px);
  background: rgb(0 0 0 / 0.4);
}
```

## Usage

```tsx
<ModalScaleBlur open={isOpen} onClose={() => setOpen(false)}>
  <ConfirmDialog onConfirm={…} />
</ModalScaleBlur>
```

## AI Apply Prompt

### Context
`{{target_selector}}` を、背景ブラー + spring scale で開閉するモーダルにする。

### Steps
1. `motion@^11` を `{{package_manager}}` で追加。
2. `ModalScaleBlur` を `{{target_file}}` に追加。
3. open state を親で管理。focus トラップ・ESC 閉じ・背景 inert は `dialog-focus-trap` を併用（このコンポーネントは登場演出担当）。
4. Safari 対応は `-webkit-backdrop-filter` を CSS クラス側で併記（motion の animate オブジェクトには vendor 接頭辞を入れない）。

### Examples

Before: 条件付きで `<div>…</div>` を表示
After: `<ModalScaleBlur open={…}><Dialog /></ModalScaleBlur>`

### Verify
- open=true で背景がぼけつつ中身が spring で scale-in
- open=false で blur と scale が逆再生して消える
- 背景クリックで閉じる、内部クリックで閉じない
- Reduce Motion で scale/blur 無し、dim 即時切替

## Accessibility

`aria-modal="true"` / `role="dialog"` / ESC 閉じ / focus トラップ / 背景 `inert` 化は別途必須（`dialog-focus-trap` 参照）。Reduce Motion では `useReducedMotion()` を尊重し scale と blur を外す。視力の弱いユーザーには blur が見づらさを生むため、`prefers-reduced-transparency` も将来的に考慮。

## Performance Notes

`scale` は `transform` で安価。`backdrop-filter: blur()` は合成負荷が高めなので、**開閉時のみ**かけ、開きっぱなしの大面積に常時かけ続けない。`will-change` は Motion が必要時に付与するため手動指定は不要。

## Changelog

- 2026-06-01 (created): 初版。v1.1 Batch 1（Navigation 基礎）第 1 弾。modal-fade の opacity 主体に対し backdrop blur + spring scale で差別化。
