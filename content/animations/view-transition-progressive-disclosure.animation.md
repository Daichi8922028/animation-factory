---
id: view-transition-progressive-disclosure
name: View Transition Progressive Disclosure
version: 1.0.0
release: v1.1
variant: vanilla-css
description: |
  段階的に開示するフォーム/ウィザードで、ステップ切替時に内容が左右へスライドして入れ替わる。
  View Transitions API で進む=左へ、戻る=右へ、コンテンツを滑らせる state-transition。

taxonomy:
  layer: [css, js-runtime]
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
  - view-transitions
  - progressive-disclosure
  - form
  - wizard
  - slide
  - steps
  - reveal

trigger:
  primary: state-change
  touch_fallback: always-on
  config: {}

runtime:
  language: typescript
  framework: react
  framework_version: ">=18"
dependencies: []
peer_dependencies:
  - { name: react, version: ">=18" }

implementations:
  - tier: 1
    name: "View Transitions API (slide old/new)"
    dependencies: []
    browser_support: { baseline: newly-available, baseline_year: 2024 }
    performance: { gpu_accelerated: true, layout_thrash: false, cost: low }
    degrades_to: 2
  - tier: 2
    name: "Motion AnimatePresence (x slide)"
    dependencies: [ { name: motion, version: "^11.0.0" } ]
    browser_support: { baseline: widely-available, baseline_year: 2020 }
    degradation: "未対応では AnimatePresence + custom direction で x スライド"
    performance: { gpu_accelerated: true, layout_thrash: false, cost: low }

browser_support:
  baseline: newly-available
  baseline_year: 2024
  notes: "Chrome 111+ / Safari 18+。:root に方向クラスを付けて old/new のスライド向きを出し分ける"

performance:
  gpu_accelerated: true
  layout_thrash: false
  cost: low
  notes: "old/new スナップショットの translateX 補間。コンテンツ高さが変わる場合は container を固定高に"

parameters:
  - { name: duration_ms,  type: number, default: 320, range: [180, 600], description: "スライドの長さ" }
  - { name: slide_pct,    type: number, default: 30,  range: [10, 100],  description: "退場側の移動量(%)" }
  - { name: easing,       type: string, default: "ease", description: "easing" }

a11y:
  respects_reduced_motion: true
  fallback: "スライドを発火させず即時にステップ切替"
  focus_safe: true
  notes: "ステップ切替後、新ステップの最初の入力へフォーカス。進捗は aria（multistep-form-progress 等）でも示す。戻る操作を必ず提供"

license: MIT
authors: ["@daichi"]
sources:
  - { title: "View Transitions API — MDN", url: "https://developer.mozilla.org/en-US/docs/Web/API/View_Transition_API" }
attribution_required: false

preview:
  url: https://animation-factory.app/preview/view-transition-progressive-disclosure
  loop: true
  duration_ms: 3000

related:
  alternatives: [multistep-form-progress, view-transition-directional-slide, tab-underline-slide]
  composes_with:
    - { id: multistep-form-progress, note: "ステップインジケータ（multistep-form-progress）とセットで使う" }
  requires: []

sections:
  skip: [variants]

ai:
  intent_examples:
    - "ウィザードの次へ/戻るで内容が左右にスライド"
    - "段階開示フォームのステップ遷移アニメ"
    - "進む=左、戻る=右に滑るフォーム"
  apply_targets: ["wizard", "multistep-form", "onboarding", "checkout"]
  do_not_apply_to: ["single-form", "tooltip", "toast"]
---

## Overview

ウィザードや段階開示フォームで「次へ/戻る」を押すと、`:root` に方向クラス（forward/back）を一時的に付け、`startViewTransition()` でステップ内容を差し替える。CSS の `::view-transition-old/new` を方向クラスで出し分け、進む時は左へ、戻る時は右へスライドさせる。

使う場面: 申込みウィザード、オンボーディング、チェックアウトの段階入力。
避けたい場面: 単一フォーム、ツールチップ。

## Preview

公開プレビュー: https://animation-factory.app/preview/view-transition-progressive-disclosure

## Implementation

### View Transitions API (slide old/new)

```tsx
function go(dir: "forward" | "back", next: number) {
  document.documentElement.dataset.vt = dir;
  const doc = document as Document & { startViewTransition?: (cb: () => void) => unknown };
  const run = () => setStep(next);
  doc.startViewTransition ? doc.startViewTransition(run) : run();
}
```

```css
.panel { view-transition-name: vtpd-panel; }
:root[data-vt="forward"]::view-transition-old(vtpd-panel) { animation: vtpd-out-left 320ms ease both; }
:root[data-vt="forward"]::view-transition-new(vtpd-panel) { animation: vtpd-in-right 320ms ease both; }
:root[data-vt="back"]::view-transition-old(vtpd-panel)    { animation: vtpd-out-right 320ms ease both; }
:root[data-vt="back"]::view-transition-new(vtpd-panel)    { animation: vtpd-in-left 320ms ease both; }
@keyframes vtpd-out-left  { to { transform: translateX(-30%); opacity: 0; } }
@keyframes vtpd-in-right  { from { transform: translateX(30%); opacity: 0; } }
@keyframes vtpd-out-right { to { transform: translateX(30%); opacity: 0; } }
@keyframes vtpd-in-left   { from { transform: translateX(-30%); opacity: 0; } }
```

### Motion AnimatePresence（縮退）

未対応では `AnimatePresence` + `custom` direction で x スライド。

## Usage

```tsx
<button onClick={() => go("forward", step + 1)}>次へ</button>
<button onClick={() => go("back", step - 1)}>戻る</button>
```

## AI Apply Prompt

### Context
`{{wizard}}` のステップ遷移を方向付きスライドにする。

### Steps
1. パネルに `view-transition-name`、`:root[data-vt]` で方向別のキーフレームを定義。
2. 「次へ/戻る」で方向をセットし `startViewTransition` でラップ。
3. 遷移後に新ステップ先頭へフォーカス、Reduce Motion で即時化。

### Verify
- 次へで左、戻るで右へスライド
- 未対応/Reduce Motion で即時切替
- 遷移後にフォーカスが移る

## Accessibility

切替後は新ステップの最初の入力へフォーカス。進捗は `multistep-form-progress` 等の aria でも示し、戻る操作を必ず提供。Reduce Motion で発火させない。

## Performance Notes

`translateX` + `opacity` のスナップショット補間。高さが変わるステップは container を固定高 or min-height にして飛びを防ぐ。

## Changelog

- 2026-06-01 (created): 初版。v1.1 Batch 5（View Transitions API 進化）第 3 弾。方向付き段階開示スライド。
