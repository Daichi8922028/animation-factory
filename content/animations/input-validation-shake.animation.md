---
id: input-validation-shake
name: Input Validation Shake
version: 1.0.0
release: v1.1
variant: vanilla-css
description: |
  フォーム入力のバリデーションエラー時に、その入力欄を短く左右に shake し、border を赤に、
  aria-live でメッセージを通知する。汎用 shake をフォーム入力向けに特化した feedback。

taxonomy:
  layer: [css]
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
  - input
  - form
  - validation
  - error
  - shake
  - feedback
  - invalid

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
    name: "Vanilla CSS (shake クラス再付与)"
    dependencies: []
    browser_support: { baseline: widely-available, baseline_year: 2015 }
    performance: { gpu_accelerated: true, layout_thrash: false, cost: low }
    degrades_to: 2
  - tier: 2
    name: "Motion (useAnimationControls)"
    dependencies: [ { name: motion, version: "^11.0.0" } ]
    browser_support: { baseline: widely-available, baseline_year: 2020 }
    degradation: "React 環境では useAnimationControls で命令的に発火し、再発火の reflow ハックが不要"
    performance: { gpu_accelerated: true, layout_thrash: false, cost: low }

browser_support:
  baseline: widely-available
  baseline_year: 2015
  notes: "代表値は Tier 1。translateX の @keyframes。border 赤は color で代替も可"

performance:
  gpu_accelerated: true
  layout_thrash: false
  cost: low
  notes: "translateX のみ補間。border-color は paint だが軽量"

parameters:
  - { name: amplitude_px, type: number, default: 6,   range: [3, 14],    description: "振幅(px)" }
  - { name: cycles,       type: number, default: 4,   range: [2, 6],     description: "往復回数" }
  - { name: duration_ms,  type: number, default: 380, range: [200, 700], description: "全体の長さ" }

a11y:
  respects_reduced_motion: true
  fallback: "shake を無効化し border の赤 + aria-live メッセージで状態を伝える"
  focus_safe: true
  notes: "aria-invalid=\"true\" と aria-describedby でエラーメッセージを紐付け、aria-live=\"assertive\" で読み上げる。視覚の揺れだけに頼らない"

license: MIT
authors: ["@daichi"]
sources:
  - { title: "MDN: ARIA aria-invalid", url: "https://developer.mozilla.org/en-US/docs/Web/Accessibility/ARIA/Attributes/aria-invalid" }
attribution_required: false

preview:
  url: https://animation-factory.app/preview/input-validation-shake
  loop: true
  duration_ms: 2200

related:
  alternatives: [shake, input-focus-pop, input-success-checkmark]
  composes_with:
    - { id: input-success-checkmark, note: "エラー時は shake、成功時は checkmark で対の feedback にする" }
  requires: []

sections:
  skip: [variants]

ai:
  intent_examples:
    - "バリデーション失敗時に入力欄が左右に揺れる"
    - "必須入力が空のときエラーで shake"
    - "フォームの入力エラーを揺れで伝えたい"
  apply_targets: ["form-field", "text-input", "login-form"]
  do_not_apply_to: ["body-text", "card", "navigation"]
---

## Overview

入力欄の値が無効と判定されたとき、その欄を短く `translateX` で揺らし、border を赤にして、`aria-live` でエラーメッセージを通知する。汎用の `shake` を「フォーム入力欄のエラー feedback」に特化させた形。1 ショットで終わらせ、しつこくループしない。

使う場面: ログイン失敗、必須/形式エラー、確認コード不一致。
避けたい場面: 本文、カード、ナビ。長時間ループ。

## Preview

公開プレビュー: https://animation-factory.app/preview/input-validation-shake

## Implementation

### Vanilla CSS

```css
@keyframes field-shake {
  0%, 100% { transform: translateX(0); }
  20%, 60% { transform: translateX(-6px); }
  40%, 80% { transform: translateX(6px); }
}
.field.invalid input {
  border-color: #f87171;
  animation: field-shake 380ms cubic-bezier(.36,.07,.19,.97) both;
}
@media (prefers-reduced-motion: reduce) {
  .field.invalid input { animation: none; }
}
```

```ts
function markInvalid(field: HTMLElement) {
  field.classList.remove("invalid");
  void field.offsetWidth; // reflow で再発火
  field.classList.add("invalid");
}
```

## Usage

```html
<div class="field">
  <input id="code" aria-invalid="true" aria-describedby="code-err" />
  <p id="code-err" role="alert">コードが一致しません</p>
</div>
```

## AI Apply Prompt

### Context
`{{field_selector}}` を無効入力時に shake + 赤 border + メッセージで返す。

### Steps
1. 上記 CSS を追記。
2. バリデーション失敗時に `invalid` クラスを再付与（`animationend` で外す）。
3. `aria-invalid` と `role="alert"` のメッセージを必ず併設。

### Verify
- 無効時に短い揺れ 1 回 + 赤 border
- Reduce Motion で揺れず、赤 border とメッセージで伝わる
- スクリーンリーダーでエラー内容が読み上げられる

## Accessibility

`aria-invalid="true"` + `aria-describedby` でエラーメッセージを紐付け、`role="alert"` / `aria-live="assertive"` でテキスト通知。色（赤）だけに頼らずアイコンや文言も添える。

## Performance Notes

`translateX` のみ補間。`will-change` は付与しない（短時間で終わるため）。

## Changelog

- 2026-06-01 (created): 初版。v1.1 Batch 2（Form interaction）第 2 弾。shake を form-input 向けに特化。
