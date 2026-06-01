---
id: confirm-dialog-shake-on-no
name: Confirm Dialog Shake on Dismiss
version: 1.0.0
release: v1.1
variant: react-motion
description: |
  破壊的操作の確認ダイアログで、背景クリックや ESC による「曖昧な dismiss」を拒否し、枠を短く shake して
  「キャンセルか実行かをボタンで明示的に選んで」と促すガード演出。誤操作での意図しない離脱を防ぐ。

taxonomy:
  layer: [css, js-runtime, library]
  ux_role:
    primary: feedback
    secondary: [attention]
  trigger: [click, state-change]
  media: [dom-css]
  authoring: code

behavior:
  lifecycle: oneshot
  reversible: false
  replay: every-entry

tags:
  - confirm
  - dialog
  - shake
  - destructive
  - guard
  - dismiss
  - alertdialog

trigger:
  primary: click
  touch_fallback: tap-toggle
  config: {}

runtime:
  language: typescript
  framework: react
  framework_version: ">=18"
dependencies:
  - { name: motion, version: "^11.0.0", purpose: "useAnimationControls で shake キーフレームを命令的に発火" }
peer_dependencies:
  - { name: react, version: ">=18" }

implementations:
  - tier: 1
    name: "React + Motion (useAnimationControls)"
    dependencies: [ { name: motion, version: "^11.0.0" } ]
    browser_support: { baseline: widely-available, baseline_year: 2020 }
    performance: { gpu_accelerated: true, layout_thrash: false, cost: low }
    degrades_to: 2
  - tier: 2
    name: "Vanilla CSS (shake クラス再付与)"
    dependencies: []
    browser_support: { baseline: widely-available, baseline_year: 2015 }
    degradation: "@keyframes shake をクラスで付与、animationend で外して再発火（shake と同方式）"
    performance: { gpu_accelerated: true, layout_thrash: false, cost: low }

browser_support:
  baseline: widely-available
  baseline_year: 2020
  notes: "代表値は Tier 1。shake は translateX のみで広く動作"

performance:
  gpu_accelerated: true
  layout_thrash: false
  cost: low
  notes: "shake は translateX の補間のみ。GPU 内で完結し layout に影響しない"

parameters:
  - { name: shake_amplitude_px, type: number, default: 8,   range: [4, 16],    description: "shake の振幅(px)" }
  - { name: shake_cycles,       type: number, default: 3,   range: [2, 6],     description: "往復回数" }
  - { name: shake_duration_ms,  type: number, default: 360, range: [200, 600], description: "shake 全体の長さ" }

a11y:
  respects_reduced_motion: true
  fallback: "shake を無効化し、枠線の赤フラッシュ + aria-live=\"assertive\" で『ボタンで選択してください』を通知"
  focus_safe: true
  notes: "role=\"alertdialog\" を使い、フォーカスはダイアログ内に留める。shake は視覚補助で、テキスト通知を必ず併設"

license: MIT
authors: ["@daichi"]
sources:
  - { title: "WAI-ARIA APG: Alert and Message Dialogs", url: "https://www.w3.org/WAI/ARIA/apg/patterns/alertdialog/" }
  - { title: "NN/g: Confirmation Dialogs", url: "https://www.nngroup.com/articles/confirmation-dialog/" }
attribution_required: false

preview:
  url: https://animation-factory.app/preview/confirm-dialog-shake-on-no
  loop: true
  duration_ms: 2600

related:
  alternatives: [modal-fade, shake, modal-scale-blur]
  composes_with:
    - { id: shake, note: "shake の振動を確認ダイアログの dismiss ガードに転用した派生" }
    - { id: dialog-focus-trap, note: "focus trap と組むと、キーボード利用者にも堅牢なガードになる" }
  requires: []

sections:
  skip: [variants]

ai:
  intent_examples:
    - "破壊的な確認ダイアログで誤って背景クリックで閉じるのを防ぎたい"
    - "削除確認で Cancel か Delete をボタンで明示的に選ばせたい"
    - "ダイアログ外クリックで閉じず、枠を揺らして選択を促す"
  apply_targets: ["confirm-dialog", "delete-confirmation", "destructive-action"]
  do_not_apply_to: ["informational-modal", "dismissible-toast", "tooltip"]
---

## Overview

`role="alertdialog"` の確認ダイアログで、背景クリック・ESC など「ボタンを押さずに閉じようとする操作」を**閉じずに拒否**し、ダイアログの枠を短く `shake` させる。「この操作は曖昧に流せない、キャンセルか実行かを選んで」というメッセージを身体的に伝えるガード。破壊的操作（削除・課金・不可逆処理）の確認に向く。

`shake` 単体（attention）と違うのは、**dismiss 試行というトリガーに反応する feedback** である点。揺れたあとはダイアログが残り、ユーザーは必ずボタンで意思表示する。

使う場面: 削除・退会・不可逆な確定処理の確認。
避けたい場面: 単なる情報モーダル（軽く閉じられる方が良い）、非モーダル通知、頻出する軽い確認（毎回ガードすると鬱陶しい）。

## Preview

公開プレビュー: https://animation-factory.app/preview/confirm-dialog-shake-on-no

## Implementation

### React + Motion (useAnimationControls)

```tsx
"use client";
import { motion, useAnimationControls } from "motion/react";
import { useCallback } from "react";

export function ConfirmDialogShakeOnNo({
  onCancel, onConfirm,
}: { onCancel: () => void; onConfirm: () => void }) {
  const controls = useAnimationControls();
  const guard = useCallback(() => {
    // 背景クリック/ESC = 曖昧な dismiss → 閉じずに shake
    controls.start({ x: [0, -8, 8, -6, 6, -4, 4, 0], transition: { duration: 0.36 } });
  }, [controls]);

  return (
    <div
      className="fixed inset-0 z-50 grid place-items-center bg-black/60"
      onClick={guard}
      onKeyDown={(e) => e.key === "Escape" && guard()}
    >
      <motion.div
        role="alertdialog" aria-modal="true" animate={controls}
        onClick={(e) => e.stopPropagation()}
      >
        <h3>プロジェクトを削除しますか？</h3>
        <p>この操作は取り消せません。</p>
        <button onClick={onCancel}>キャンセル</button>
        <button onClick={onConfirm}>削除する</button>
      </motion.div>
    </div>
  );
}
```

### Vanilla CSS（縮退・shake クラス再付与）

```ts
function guard(el: HTMLElement) {
  el.classList.remove("shake");
  void el.offsetWidth; // reflow で再発火可能に
  el.classList.add("shake"); // @keyframes shake { translateX を振動 }
}
```

## Usage

```tsx
{open && (
  <ConfirmDialogShakeOnNo
    onCancel={() => setOpen(false)}
    onConfirm={() => { doDelete(); setOpen(false); }}
  />
)}
```

## AI Apply Prompt

### Context
`{{target_selector}}` の破壊的確認ダイアログで、背景/ESC の dismiss をガードし shake で選択を促す。

### Steps
1. `motion@^11` を `{{package_manager}}` で追加。
2. `ConfirmDialogShakeOnNo` を `{{target_file}}` に追加。
3. 背景クリックと ESC を `guard()`（閉じずに shake）に接続。閉じるのは Cancel/Confirm ボタンのみ。
4. `aria-live="assertive"` のテキストで「ボタンで選択してください」を併設。

### Examples

Before: 背景クリックで即 `onClose()`（誤操作で消える）
After: 背景クリックは `guard()` で shake、閉じるのはボタンのみ

### Verify
- 背景クリック/ESC で閉じず、枠が短く 1 回 shake する
- Cancel / 削除ボタンでのみ閉じる
- Reduce Motion で shake せず、赤フラッシュ + テキスト通知で代替
- スクリーンリーダーに alertdialog として伝わる

## Accessibility

`role="alertdialog"` + `aria-modal="true"` + `aria-labelledby` / `aria-describedby`。shake は視覚のみなので、Reduce Motion 時は枠線の赤フラッシュと `aria-live` テキストでガードを伝える。フォーカスはダイアログ内に留める（`dialog-focus-trap` を併用）。

## Performance Notes

shake は `translateX` の補間のみで GPU 完結。`useAnimationControls` で命令的に発火し、`animationend` 相当の再発火問題（CSS 版）は Motion 側が管理する。`will-change` は不要。

## Changelog

- 2026-06-01 (created): 初版。v1.1 Batch 1（Navigation 基礎）第 3 弾。shake を「dismiss ガード feedback」に転用した破壊的確認ダイアログ。
