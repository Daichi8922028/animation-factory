---
id: dialog-focus-trap
name: Dialog Focus Trap
version: 1.0.0
release: beta
variant: react-motion
description: |
  modal の登場演出に「アクセシブルな focus 管理」を足した a11y 強化ダイアログ。
  開いたら内部の最初の要素にフォーカス、Tab/Shift+Tab はダイアログ内を循環、ESC で閉じて元のトリガーへフォーカスを戻す。

taxonomy:
  layer: [css, js-runtime, library]
  ux_role:
    primary: state-transition
    secondary: [feedback]
  trigger: [state-change, keyboard]
  media: [dom-css]
  authoring: code

behavior:
  lifecycle: toggle
  reversible: true
  replay: every-entry

tags:
  - dialog
  - modal
  - focus-trap
  - accessibility
  - a11y
  - keyboard
  - tab

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
    name: "React + Motion + 手動 focus trap"
    dependencies: [ { name: motion, version: "^11.0.0" } ]
    browser_support: { baseline: widely-available, baseline_year: 2020 }
    performance: { gpu_accelerated: true, layout_thrash: false, cost: low }
    degrades_to: 2
  - tier: 2
    name: "ネイティブ <dialog>.showModal()（focus trap が標準装備）"
    dependencies: []
    browser_support: { baseline: newly-available, baseline_year: 2022 }
    degradation: "<dialog>.showModal() は focus trap・background inert・ESC 閉じを標準提供。登場アニメは @starting-style に縮退"
    performance: { gpu_accelerated: true, layout_thrash: false, cost: low }

browser_support:
  baseline: widely-available
  baseline_year: 2020
  notes: "代表値は Tier 1。focus 管理は JS。ネイティブ <dialog> が使えるなら Tier 2 で trap を OS/ブラウザに任せられる"

performance:
  gpu_accelerated: true
  layout_thrash: false
  cost: low
  notes: "アニメは opacity + translate のみ。focus 管理は keydown ハンドラで軽量"

parameters:
  - { name: from_y_px,       type: number, default: 8,   range: [0, 24],    description: "登場時の縦オフセット(px)" }
  - { name: duration_ms,     type: number, default: 200, range: [120, 360], description: "出入りの長さ" }
  - { name: backdrop_opacity, type: number, default: 0.6, range: [0.3, 0.9], description: "背景 dim の濃さ" }

a11y:
  respects_reduced_motion: true
  fallback: "登場アニメを無効化し open/close 即時。focus 管理は維持（a11y は常に有効）"
  focus_safe: true
  notes: "この動きの主眼は a11y。開く→最初の要素へフォーカス、Tab 循環、ESC 閉じ、閉じる→トリガーへ復帰、aria-modal=\"true\"、背景の inert 化を実装する"

license: MIT
authors: ["@daichi"]
sources:
  - { title: "WAI-ARIA APG: Dialog (Modal) Pattern", url: "https://www.w3.org/WAI/ARIA/apg/patterns/dialog-modal/" }
  - { title: "MDN: <dialog> showModal()", url: "https://developer.mozilla.org/en-US/docs/Web/API/HTMLDialogElement/showModal" }
attribution_required: false

preview:
  url: https://animation-factory.app/preview/dialog-focus-trap
  loop: false
  duration_ms: 2400

related:
  alternatives: [modal-fade, modal-scale-blur, drawer-slide]
  composes_with:
    - { id: modal-scale-blur, note: "modal-scale-blur の登場演出に、この focus trap を重ねると a11y 完成形" }
  requires: []

sections:
  skip: [variants]

ai:
  intent_examples:
    - "Tab がダイアログの外に出ないモーダルにしたい"
    - "アクセシブルな（focus trap 付き）ダイアログ"
    - "開いたら最初の入力にフォーカス、閉じたら元のボタンに戻す"
  apply_targets: ["modal", "dialog", "settings-panel", "confirm-overlay"]
  do_not_apply_to: ["inline-tooltip", "toast", "non-modal-popover"]
---

## Overview

モーダルの登場演出（opacity + 軽い translate）に、WAI-ARIA APG 準拠の **focus 管理**を組み合わせたダイアログ。アニメだけでは満たせない a11y の中核を実装に含めるのがこの動きの狙い:

1. 開いたら内部の最初の focusable にフォーカスを移す
2. `Tab` / `Shift+Tab` はダイアログ内の要素を**循環**（外に出ない）
3. `Esc` で閉じる
4. 閉じたら**開く前にフォーカスがあったトリガー要素へ復帰**
5. `role="dialog"` + `aria-modal="true"` + 背景の `inert` 化

使う場面: 設定パネル、確認、フォーム入力モーダルなど、キーボード/スクリーンリーダー利用者が確実に操作できる必要があるもの。
避けたい場面: 非モーダルなツールチップ・ポップオーバー（trap は過剰）、トースト。

## Preview

公開プレビュー: https://animation-factory.app/preview/dialog-focus-trap

## Implementation

### React + Motion + 手動 focus trap

```tsx
"use client";
import { AnimatePresence, motion } from "motion/react";
import { useCallback, useEffect, useRef } from "react";

const FOCUSABLE =
  'a[href], button:not([disabled]), input:not([disabled]), select, textarea, [tabindex]:not([tabindex="-1"])';

export function DialogFocusTrap({
  open, onClose, children,
}: { open: boolean; onClose: () => void; children: React.ReactNode }) {
  const ref = useRef<HTMLDivElement>(null);
  const prev = useRef<HTMLElement | null>(null);

  useEffect(() => {
    if (!open) return;
    prev.current = document.activeElement as HTMLElement;
    const f = ref.current?.querySelectorAll<HTMLElement>(FOCUSABLE);
    f?.[0]?.focus();
    return () => prev.current?.focus(); // 閉じたらトリガーへ復帰
  }, [open]);

  const onKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (e.key === "Escape") return onClose();
    if (e.key !== "Tab") return;
    const f = Array.from(ref.current?.querySelectorAll<HTMLElement>(FOCUSABLE) ?? []);
    if (!f.length) return;
    const [first, last] = [f[0], f[f.length - 1]];
    if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
    else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
  }, [onClose]);

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          className="fixed inset-0 z-50 grid place-items-center bg-black/60"
          onClick={onClose}
        >
          <motion.div
            ref={ref} role="dialog" aria-modal="true" onKeyDown={onKeyDown}
            initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 8 }}
            transition={{ duration: 0.2, ease: "easeOut" }}
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

### ネイティブ `<dialog>.showModal()`（縮退・focus trap 標準装備）

```tsx
const ref = useRef<HTMLDialogElement>(null);
// 開く: ref.current?.showModal();  閉じる: ref.current?.close();
// showModal() は focus trap・background inert・ESC 閉じをブラウザが提供する。
```

## Usage

```tsx
<DialogFocusTrap open={open} onClose={() => setOpen(false)}>
  <SettingsForm />
</DialogFocusTrap>
```

## AI Apply Prompt

### Context
`{{target_selector}}` を、focus trap 付きのアクセシブルなモーダルにする。

### Steps
1. `motion@^11` を `{{package_manager}}` で追加。
2. `DialogFocusTrap` を `{{target_file}}` に追加し、open state を親で管理。
3. ネイティブ `<dialog>` が使える場合は `showModal()` 版に置き換えて trap をブラウザに任せる選択肢を提示。
4. 背景の `inert` 化（`aria-hidden` ではなく `inert` 属性）を忘れない。

### Examples

Before: `{open && <div role="dialog">…</div>}`（focus が背景に漏れる）
After: `<DialogFocusTrap open={open} onClose={…}>…</DialogFocusTrap>`

### Verify
- 開くと最初の入力にフォーカス
- Tab を最後の要素で押すと先頭へ循環、Shift+Tab で逆循環
- ESC で閉じ、フォーカスが開く前のトリガーへ戻る
- Reduce Motion でアニメ無し、focus 管理は維持

## Accessibility

これ自体が a11y パターン。`role="dialog"` + `aria-modal="true"` + `aria-labelledby`（タイトルと紐付け）+ 背景 `inert` を必ず付ける。Reduce Motion では登場アニメのみ無効化し、focus 管理は常に有効にする。

## Performance Notes

アニメは `opacity` + `translateY` のみで安価。focus 管理は `keydown` ハンドラと `querySelectorAll` で軽量。focusable の取得は開く時とキー操作時のみ走らせ、毎フレーム計算しない。

## Changelog

- 2026-06-01 (created): 初版。v1.1 Batch 1（Navigation 基礎）第 2 弾。WAI-ARIA APG Dialog パターン準拠の focus trap を実装に含めた a11y 強化版。
