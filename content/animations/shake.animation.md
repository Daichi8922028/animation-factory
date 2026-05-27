---
id: shake
name: Shake
version: 1.0.0
release: alpha
variant: vanilla-css
description: |
  入力エラーや無効操作を伝えるため、要素を短く左右に揺らす attention アニメーション。
  フォームバリデーション、ロック解除失敗、削除確認のキャンセル時に。

taxonomy:
  layer: [css]
  ux_role:
    primary: attention
    secondary: [feedback]
  trigger: [state-change]
  media: [dom-css]
  authoring: code

behavior:
  lifecycle: oneshot
  reversible: false
  replay: every-entry

tags:
  - shake
  - wiggle
  - error
  - invalid
  - form
  - validation

trigger:
  primary: state-change
  touch_fallback: always-on
  config: {}

runtime:
  language: css
  framework: none
  framework_version: null
  bundler: null
dependencies: []
peer_dependencies: []

implementations:
  - tier: 1
    name: "Vanilla CSS"
    dependencies: []
    browser_support: { baseline: widely-available, baseline_year: 2015 }
    performance: { gpu_accelerated: true, layout_thrash: false, cost: low }

browser_support:
  baseline: widely-available
  baseline_year: 2015
  notes: "代表値は Tier 1。@keyframes の translateX 振動"

performance:
  gpu_accelerated: true
  layout_thrash: false
  cost: low
  notes: "translateX のみ補間。GPU 内で完結"

parameters:
  - { name: amplitude_px, type: number, default: 6, range: [2, 16], description: "振幅" }
  - { name: cycles, type: number, default: 4, range: [2, 8], description: "往復回数" }
  - { name: duration_ms, type: number, default: 400, range: [200, 1000], description: "全体の長さ" }

a11y:
  respects_reduced_motion: true
  fallback: "shake を無効化、色（赤など）で代替フィードバック"
  focus_safe: true
  notes: "視覚的揺れだけに頼らず、aria-live=\"assertive\" でメッセージも読み上げる"

license: MIT
authors: ["@daichi"]
sources: []
attribution_required: false

preview:
  url: https://animation-factory.app/preview/shake
  loop: true
  duration_ms: 1600

related:
  alternatives: [pulse-attention]
  composes_with: []
  requires: []

sections:
  skip: [variants]

ai:
  intent_examples:
    - "ログイン失敗時に入力欄が左右に揺れる"
    - "フォームエラーで揺らす"
    - "間違った操作をユーザーに伝えたい"
  apply_targets: ["form-field", "input", "confirm-button"]
  do_not_apply_to: ["body-text", "card", "navigation"]
---

## Overview

要素が `translateX` で短時間左右に振動する。エラー状態の **強い視覚的な合図**。長すぎたり繰り返したりせず、1 ショットで終わらせる。

使う場面: 認証失敗、必須入力の空、削除キャンセル後の戻り。
避けたい場面: 長時間ループ（不快）、本文、ナビ。

## Preview

公開プレビュー: https://animation-factory.app/preview/shake

## Implementation

### Vanilla CSS

```css
@keyframes shake {
  0%, 100% { transform: translateX(0); }
  10%, 30%, 50%, 70%, 90% { transform: translateX(-6px); }
  20%, 40%, 60%, 80% { transform: translateX(6px); }
}
.shake {
  animation: shake 400ms cubic-bezier(.36, .07, .19, .97) both;
}
@media (prefers-reduced-motion: reduce) {
  .shake { animation: none; }
}
```

JS でクラス付与し、`animationend` で外して再発火を可能にする:

```ts
function triggerShake(el: HTMLElement) {
  el.classList.remove("shake");
  void el.offsetWidth; // reflow
  el.classList.add("shake");
}
```

## Usage

```tsx
<input ref={ref} className={invalid ? "shake" : ""} />
```

## AI Apply Prompt

### Context
`{{target_selector}}` を無効入力時に shake で揺らす。

### Steps
1. 上記 CSS を `{{target_file}}` に追記。
2. 無効状態の判定時に `shake` クラスを付与し、`animationend` で外す。
3. `aria-live="assertive"` 付きのエラーメッセージを必ず併設。

### Examples

Before: 無効入力で `is-invalid` クラスのみ
After: `is-invalid` + `shake` を再付与で揺らす

### Verify
- 無効時に短い揺れが 1 回発生、しつこくない
- Reduce Motion で揺れず、メッセージのみで状態が伝わる
- スクリーンリーダーでエラー内容が読み上げられる

## Accessibility

`shake` は視覚のみ。`aria-live` + `aria-invalid` で **テキストでも** エラーを伝える。Reduce Motion で完全無効化。

## Performance Notes

`translateX` のみ補間。`will-change: transform` は付与しない（短時間で終わるため）。

## Changelog

- 2026-05-27 (created): 初版。Phase 3 D1 第 4 弾、attention 拡充。
