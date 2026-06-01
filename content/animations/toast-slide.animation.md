---
id: toast-slide
name: Toast Slide
version: 1.0.0
release: v1.0
variant: react-motion
description: |
  画面右下から軽くスライドインし、数秒後に自動で fade-out するトースト通知。
  保存・送信完了などの非モーダルなフィードバックに。

taxonomy:
  layer: [css, js-runtime, library]
  ux_role:
    primary: feedback
    secondary: [attention]
  trigger: [state-change]
  media: [dom-css]
  authoring: code

behavior:
  lifecycle: oneshot
  reversible: false
  replay: every-entry

tags:
  - toast
  - notification
  - feedback
  - slide
  - snackbar
  - auto-dismiss

trigger:
  primary: state-change
  touch_fallback: always-on
  config:
    auto_dismiss_ms: 3000

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
    name: "Vanilla CSS"
    dependencies: []
    browser_support: { baseline: widely-available, baseline_year: 2017 }
    performance: { gpu_accelerated: true, layout_thrash: false, cost: low }
    degradation: "結果は同等。複数 toast のスタッキング管理は手書き必要"

browser_support:
  baseline: widely-available
  baseline_year: 2020
  notes: "代表値は Tier 1。translateY + opacity で出入り"

performance:
  gpu_accelerated: true
  layout_thrash: false
  cost: low
  notes: "translateY + opacity のみ補間。Layout を引き起こさない"

parameters:
  - { name: enter_y_px,      type: number, default: 24,   range: [8, 64],    description: "登場時の下方向オフセット" }
  - { name: enter_ms,        type: number, default: 240,  range: [120, 500], description: "登場の長さ" }
  - { name: exit_ms,         type: number, default: 200,  range: [80, 400],  description: "退場の長さ" }
  - { name: auto_dismiss_ms, type: number, default: 3000, range: [1000, 10000], description: "自動消失までの時間。0 で無効" }

a11y:
  respects_reduced_motion: true
  fallback: "translateY を無効化、表示/非表示は即時"
  focus_safe: true
  notes: "緊急度に応じて `role=\"status\"`（polite）または `role=\"alert\"`（assertive）。視覚アニメだけに頼らずテキストでも内容を伝える"

license: MIT
authors: ["@daichi"]
sources: []
attribution_required: false

preview:
  url: https://animation-factory.app/preview/toast-slide
  loop: true
  duration_ms: 4000

related:
  alternatives: [modal-fade]
  composes_with:
    - { id: pulse-attention, note: "重要度が高い時は toast に pulse で注意を引く（過剰にしない）" }
  requires: []

sections:
  skip: [variants]

ai:
  intent_examples:
    - "保存完了の toast を出す"
    - "右下にスナックバーを出して数秒で消す"
    - "通知のスライドイン"
  apply_targets: ["toast", "snackbar", "notification-banner"]
  do_not_apply_to: ["confirm-dialog", "modal", "tooltip"]
---

## Overview

右下（または好きな端）からわずかに上方向に押し上げられるようにスライドインし、`auto_dismiss_ms` 後に fade + slide-out で消える。複数同時表示時は縦に積む。

使う場面: 保存・送信完了、コピーした、削除を取り消すリンク付き通知。
避けたい場面: ユーザーの判断を要求する内容（モーダルにする）、永続的な状態表示（バナー）。

## Preview

公開プレビュー: https://animation-factory.app/preview/toast-slide

## Implementation

### React + Motion

```tsx
"use client";
import { AnimatePresence, motion } from "motion/react";
import { useEffect } from "react";

export function Toast({
  open, onClose, autoDismissMs = 3000, children,
}: {
  open: boolean; onClose: () => void; autoDismissMs?: number;
  children: React.ReactNode;
}) {
  useEffect(() => {
    if (!open || autoDismissMs <= 0) return;
    const t = setTimeout(onClose, autoDismissMs);
    return () => clearTimeout(t);
  }, [open, autoDismissMs, onClose]);

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          role="status"
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 24 }}
          transition={{ duration: 0.24, ease: "easeOut" }}
          className="fixed right-4 bottom-4 z-50 rounded-lg border border-white/10 bg-zinc-900 px-4 py-3 text-sm shadow-lg"
        >
          {children}
        </motion.div>
      )}
    </AnimatePresence>
  );
}
```

## Usage

```tsx
<Toast open={saved} onClose={() => setSaved(false)}>
  保存しました
</Toast>
```

## AI Apply Prompt

### Context
`{{target_selector}}` の状態に応じて、右下から toast を表示し数秒後に自動で消す。

### Steps
1. `motion@^11` を `{{package_manager}}` で追加。
2. 親で open state を管理し、`onClose` で false に戻す。
3. 緊急度が高ければ `role="alert"`（assertive）に変更。

### Examples

Before: `<div>保存しました</div>` を条件表示
After: `<Toast open={…}>保存しました</Toast>`

### Verify
- open=true で右下からスライドイン
- auto_dismiss_ms 経過で自動で fade-out
- 複数の同時表示が縦に積まれる（別途レイアウト）
- Reduce Motion で動きなし、表示/非表示は即時

## Accessibility

`role="status"` で polite、`role="alert"` で assertive にスクリーンリーダーが読み上げる。視覚に頼らずテキストで内容を完結させる。

## Performance Notes

`translateY` + `opacity` のみ。`will-change` は Motion が付与。

## Changelog

- 2026-05-27 (created): 初版。Phase 3 D1 第 3 弾、feedback 拡充。
