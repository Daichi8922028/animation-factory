---
id: highlight-flash
name: Highlight Flash
version: 1.0.0
release: v1.0
variant: vanilla-css
description: |
  要素が一瞬色の付いた背景でフラッシュして消える attention アニメ。
  検索結果のヒット位置、新着行、コピー成功などの「いまここ」シグナルに。

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
  - highlight
  - flash
  - sparkle
  - new
  - changed
  - here

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
  notes: "代表値は Tier 1。background-color の補間または擬似要素 opacity"

performance:
  gpu_accelerated: true
  layout_thrash: false
  cost: low
  notes: "擬似要素の opacity を使えば Composite で完結。background-color 直接は Paint コスト有り"

parameters:
  - { name: color, type: string, default: "rgba(190, 242, 100, 0.35)", description: "フラッシュ色（アクセント由来推奨）" }
  - { name: duration_ms, type: number, default: 1200, range: [400, 3000], description: "全体の長さ" }
  - { name: hold_pct, type: number, default: 30, range: [10, 60], description: "ピーク色を保つ割合（%）" }

a11y:
  respects_reduced_motion: true
  fallback: "フラッシュなし、静的な背景色で代替（ハイライト状態は短く維持）"
  focus_safe: true
  notes: "ハイライト位置を別途 aria-current / aria-live で伝える"

license: MIT
authors: ["@daichi"]
sources: []
attribution_required: false

preview:
  url: https://animation-factory.app/preview/highlight-flash
  loop: true
  duration_ms: 2400

related:
  alternatives: [pulse-attention, bounce-in]
  composes_with:
    - { id: scroll-reveal, note: "スクロールでヒット位置に飛ばし、flash で示すパターンが定番" }
  requires: []

sections:
  skip: [variants]

ai:
  intent_examples:
    - "検索結果に飛んだ瞬間にその行を光らせる"
    - "コピーした feedback の一瞬のハイライト"
    - "新着行をフラッシュで強調"
  apply_targets: ["search-hit", "table-row", "list-item", "code-block-just-copied"]
  do_not_apply_to: ["background", "always-visible-element"]
---

## Overview

擬似要素に色を持たせ、`opacity: 0 → ~1 → 0` でフラッシュさせる。背景色を直接 transition すると Paint コストが出るため、`::after` の opacity が王道。短く 1 ショットで終わらせるのがコツ。

使う場面: 検索ヒット、新着行、コピー直後のチラ見せ、内部リンクで飛んだ先の強調。
避けたい場面: 背景、常に見える要素、ループ。

## Preview

公開プレビュー: https://animation-factory.app/preview/highlight-flash

## Implementation

### Vanilla CSS

```css
.flash-target {
  position: relative;
  isolation: isolate;
}
.flash-target::after {
  content: "";
  position: absolute;
  inset: 0;
  border-radius: inherit;
  background: rgba(190, 242, 100, 0.35);
  opacity: 0;
  pointer-events: none;
  z-index: -1;
}
.flash-target.is-flash::after {
  animation: highlight-flash 1200ms ease-out forwards;
}
@keyframes highlight-flash {
  0%   { opacity: 0; }
  20%  { opacity: 1; }
  50%  { opacity: 1; }
  100% { opacity: 0; }
}
@media (prefers-reduced-motion: reduce) {
  .flash-target.is-flash::after { animation: none; opacity: 0.6; }
}
```

```ts
function flash(el: HTMLElement) {
  el.classList.remove("is-flash");
  void el.offsetWidth; // reflow
  el.classList.add("is-flash");
  el.addEventListener("animationend", () => el.classList.remove("is-flash"), { once: true });
}
```

## Usage

```tsx
<div ref={ref} className={`flash-target ${flashKey > 0 ? "is-flash" : ""}`}>…</div>
```

## AI Apply Prompt

### Context
`{{target_selector}}` を一瞬だけハイライトしてその位置に注意を引く。

### Steps
1. 上記 CSS を追記。
2. 対象要素に `flash-target` を付与。
3. 発火タイミングで `is-flash` クラスを付け、`animationend` で外す。

### Examples

検索ヒットに飛んだ直後:

```ts
const hit = document.querySelector(`[data-id="${id}"]`);
if (hit) flash(hit as HTMLElement);
```

### Verify
- 1 回だけフラッシュして自然に消える
- 連続発火しない（クラス再付与パターン）
- Reduce Motion で控えめな静的ハイライトに縮退

## Accessibility

視覚アニメだけに頼らず、`aria-current` や `aria-live` で「いま位置はここ」を音声でも伝える。

## Performance Notes

擬似要素 `::after` の opacity 補間で Composite に閉じる。`background` 直接 transition は Paint が走るため避ける。

## Changelog

- 2026-05-27 (created): 初版。Phase 3 D1 第 4 弾、attention 拡充。
