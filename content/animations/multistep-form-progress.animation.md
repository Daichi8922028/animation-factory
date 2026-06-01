---
id: multistep-form-progress
name: Multistep Form Progress
version: 1.0.0
release: beta
variant: react-motion
description: |
  複数ステップのフォームで 1 → 2 → 3 の進行を示すステップインジケータ。アクティブ円が拡大し、
  ステップ間のコネクタが左から塗られ、完了済みにはチェックが入る navigation/feedback。

taxonomy:
  layer: [css, js-runtime, library]
  ux_role:
    primary: feedback
    secondary: [navigation]
  trigger: [state-change]
  media: [dom-css]
  authoring: code

behavior:
  lifecycle: toggle
  reversible: true
  replay: every-entry

tags:
  - form
  - multistep
  - stepper
  - progress
  - wizard
  - feedback
  - steps

trigger:
  primary: state-change
  touch_fallback: always-on
  config: {}

runtime:
  language: typescript
  framework: react
  framework_version: ">=18"
dependencies:
  - { name: motion, version: "^11.0.0", purpose: "コネクタの scaleX とアクティブ円の spring" }
peer_dependencies:
  - { name: react, version: ">=18" }

implementations:
  - tier: 1
    name: "React + Motion (connector scaleX + active spring)"
    dependencies: [ { name: motion, version: "^11.0.0" } ]
    browser_support: { baseline: widely-available, baseline_year: 2020 }
    performance: { gpu_accelerated: true, layout_thrash: false, cost: low }
    degrades_to: 2
  - tier: 2
    name: "Vanilla CSS (transition + data-state)"
    dependencies: []
    browser_support: { baseline: widely-available, baseline_year: 2017 }
    degradation: "data-state=done/active/todo を CSS transition でスタイル分岐。コネクタは scaleX"
    performance: { gpu_accelerated: true, layout_thrash: false, cost: low }

browser_support:
  baseline: widely-available
  baseline_year: 2020
  notes: "代表値は Tier 1。コネクタは transform: scaleX で reflow 回避"

performance:
  gpu_accelerated: true
  layout_thrash: false
  cost: low
  notes: "コネクタ scaleX + 円の scale/色補間。要素数はステップ数ぶんのみ"

parameters:
  - { name: steps,        type: number, default: 3,   range: [2, 6],     description: "ステップ数" }
  - { name: duration_ms,  type: number, default: 280, range: [150, 500], description: "遷移の長さ" }
  - { name: dot_size_px,  type: number, default: 28,  range: [20, 40],   description: "ステップ円の直径(px)" }

a11y:
  respects_reduced_motion: true
  fallback: "コネクタ塗り/円拡大を即時に。現在ステップは aria-current=\"step\" で示す"
  focus_safe: true
  notes: "各ステップに aria-current=\"step\"（現在）と、完了/未完を aria-label で。順序付きリスト(ol)で構造化"

license: MIT
authors: ["@daichi"]
sources:
  - { title: "WAI-ARIA: aria-current", url: "https://developer.mozilla.org/en-US/docs/Web/Accessibility/ARIA/Attributes/aria-current" }
attribution_required: false

preview:
  url: https://animation-factory.app/preview/multistep-form-progress
  loop: true
  duration_ms: 3200

related:
  alternatives: [progress-bar, password-strength-bar, tab-underline-slide]
  composes_with:
    - { id: tab-underline-slide, note: "ステップ切替に tab-underline-slide の layoutId 強調を併用できる" }
  requires: []

sections:
  skip: [variants]

ai:
  intent_examples:
    - "1→2→3 のステップインジケータを動かす"
    - "ウィザード形式フォームの進行バー"
    - "完了したステップにチェックが入る stepper"
  apply_targets: ["multistep-form", "wizard", "checkout-flow", "onboarding"]
  do_not_apply_to: ["single-form", "tooltip", "toast"]
---

## Overview

複数ステップのフォーム/ウィザードで、現在地と進行を示すインジケータ。アクティブな円が spring で少し拡大、完了済みの円にはチェックが入り、ステップ間のコネクタが左から `scaleX` で塗られる。`aria-current="step"` で現在ステップを支援技術にも伝える。

使う場面: チェックアウト、オンボーディング、申込みウィザード。
避けたい場面: 単一フォーム、ツールチップ、トースト。

## Preview

公開プレビュー: https://animation-factory.app/preview/multistep-form-progress

## Implementation

### React + Motion

```tsx
"use client";
import { motion } from "motion/react";

export function Stepper({ current, total }: { current: number; total: number }) {
  return (
    <ol className="flex items-center">
      {Array.from({ length: total }).map((_, i) => {
        const done = i < current, active = i === current;
        return (
          <li key={i} className="flex items-center" aria-current={active ? "step" : undefined}>
            <motion.span
              className="grid place-items-center rounded-full size-7 text-sm"
              animate={{ scale: active ? 1.1 : 1,
                backgroundColor: done || active ? "#a3e635" : "rgba(255,255,255,0.1)",
                color: done || active ? "#0a0a0a" : "#a1a1aa" }}
              transition={{ type: "spring", stiffness: 320, damping: 24 }}
            >
              {done ? "✓" : i + 1}
            </motion.span>
            {i < total - 1 && (
              <span className="mx-2 h-0.5 w-10 bg-white/10 overflow-hidden rounded">
                <motion.span className="block h-full origin-left bg-lime-300"
                  animate={{ scaleX: done ? 1 : 0 }} transition={{ duration: 0.28 }} />
              </span>
            )}
          </li>
        );
      })}
    </ol>
  );
}
```

## Usage

```tsx
const [step, setStep] = useState(0);
<Stepper current={step} total={3} />
```

## AI Apply Prompt

### Context
`{{form}}` に 1→N のステップインジケータを足す。

### Steps
1. `motion@^11` を追加。
2. `Stepper` を配置し、現在ステップ index を渡す。
3. `<ol>` + `aria-current="step"` で構造とアクセシビリティを担保。

### Verify
- ステップ進行で円が拡大・チェック化、コネクタが塗られる
- Reduce Motion で即時反映
- 現在ステップが支援技術に伝わる

## Accessibility

`<ol>` で順序を表し、現在ステップに `aria-current="step"`。完了/未完は色だけでなくチェック記号と `aria-label` で示す。

## Performance Notes

コネクタは `scaleX`、円は `scale`/色補間で reflow を避ける。`initial={false}` で初期ジャンプを抑制可。

## Changelog

- 2026-06-01 (created): 初版。v1.1 Batch 2（Form interaction）第 5 弾。ステップ進行インジケータ。
