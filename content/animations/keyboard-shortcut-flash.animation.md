---
id: keyboard-shortcut-flash
name: Keyboard Shortcut Flash
version: 1.0.0
release: beta
variant: vanilla-css
description: |
  キーボードショートカットが押された瞬間、対応する kbd 表示が一瞬光って（flash）押下を視覚化する。
  ショートカット教育やヘルプオーバーレイで、どのキーが効いたかを伝える attention 演出。

taxonomy:
  layer: [css]
  ux_role:
    primary: attention
    secondary: [feedback]
  trigger: [keypress]
  media: [dom-css]
  authoring: code

behavior:
  lifecycle: oneshot
  reversible: false
  replay: every-entry

tags:
  - keyboard
  - shortcut
  - kbd
  - flash
  - attention
  - hotkey
  - feedback

trigger:
  primary: keypress
  touch_fallback: disabled
  config: { keys: ["mod+k", "mod+s", "/"] }

runtime:
  language: css
  framework: none
  framework_version: null
  bundler: null
dependencies: []
peer_dependencies: []

implementations:
  - tier: 1
    name: "Vanilla CSS (flash class) + keydown"
    dependencies: []
    browser_support: { baseline: widely-available, baseline_year: 2016 }
    performance: { gpu_accelerated: true, layout_thrash: false, cost: low }
    degrades_to: 2
  - tier: 2
    name: "Web Animations API (element.animate)"
    dependencies: []
    browser_support: { baseline: widely-available, baseline_year: 2020 }
    degradation: "keydown で element.animate([...]) を呼び、クラス再付与の reflow ハックを避ける"
    performance: { gpu_accelerated: true, layout_thrash: false, cost: low }

browser_support:
  baseline: widely-available
  baseline_year: 2016
  notes: "代表値は Tier 1。keydown でキー合致を判定し flash クラスを付与、animationend で外す"

performance:
  gpu_accelerated: true
  layout_thrash: false
  cost: low
  notes: "background/box-shadow/scale の短い補間。要素は kbd チップのみ"

parameters:
  - { name: flash_duration_ms, type: number, default: 360, range: [180, 600], description: "光るアニメの長さ" }
  - { name: scale_peak,        type: number, default: 1.12, range: [1.0, 1.3], description: "ピーク時のスケール" }
  - { name: glow_px,           type: number, default: 12,  range: [4, 24],    description: "グローの広がり(px)" }

a11y:
  respects_reduced_motion: true
  fallback: "scale/glow を抑え、背景色の一瞬の変化のみ。キー操作自体は妨げない"
  focus_safe: true
  notes: "ショートカットは必ずボタン等の代替操作も提供。flash は補助。修飾キー表示は OS に応じて ⌘/Ctrl を出し分ける"

license: MIT
authors: ["@daichi"]
sources:
  - { title: "MDN: <kbd>", url: "https://developer.mozilla.org/en-US/docs/Web/HTML/Element/kbd" }
  - { title: "MDN: KeyboardEvent", url: "https://developer.mozilla.org/en-US/docs/Web/API/KeyboardEvent" }
attribution_required: false

preview:
  url: https://animation-factory.app/preview/keyboard-shortcut-flash
  loop: true
  duration_ms: 2600

related:
  alternatives: [highlight-flash, pulse-attention, command-palette-cmdk]
  composes_with:
    - { id: command-palette-cmdk, note: "command-palette-cmdk の ⌘K と組み合わせ、起動キーを光らせて教える" }
  requires: []

sections:
  skip: [variants]

ai:
  intent_examples:
    - "ショートカットキーを押すと kbd 表示が光る"
    - "押されたキーをフラッシュで可視化したい"
    - "ヘルプ画面でショートカットの押下を見せる"
  apply_targets: ["shortcut-help", "keyboard-hint", "command-overlay"]
  do_not_apply_to: ["body-text", "form-input", "navigation"]
---

## Overview

ショートカット（⌘K, /, など）が押された瞬間、対応する `<kbd>` 表示が一瞬 `scale` + glow で光る。どのキーが効いたかを視覚的に伝え、ショートカット学習を助ける。`keydown` でキー合致を判定し、flash クラスを付けて `animationend` で外す。

使う場面: ショートカットヘルプ、オンボーディングのキー案内、コマンドオーバーレイ。
避けたい場面: 本文、フォーム入力中（誤反応）、ナビ。

## Preview

公開プレビュー: https://animation-factory.app/preview/keyboard-shortcut-flash

## Implementation

### Vanilla CSS (flash class) + keydown

```css
.kbd {
  display: inline-grid; place-items: center;
  padding: 4px 8px; border-radius: 6px;
  border: 1px solid var(--border); background: var(--surface);
  transition: none;
}
@keyframes kbd-flash {
  0% { transform: scale(1); box-shadow: 0 0 0 0 transparent; background: var(--surface); }
  35% { transform: scale(1.12); box-shadow: 0 0 12px 2px color-mix(in srgb, var(--accent) 60%, transparent); background: color-mix(in srgb, var(--accent) 20%, var(--surface)); }
  100% { transform: scale(1); box-shadow: 0 0 0 0 transparent; background: var(--surface); }
}
.kbd.flash { animation: kbd-flash 360ms ease-out; }
@media (prefers-reduced-motion: reduce) {
  .kbd.flash { animation: none; }
}
```

```ts
window.addEventListener("keydown", (e) => {
  if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") flash("kbd-k");
});
function flash(id: string) {
  const el = document.getElementById(id);
  el?.classList.remove("flash"); void el?.offsetWidth; el?.classList.add("flash");
}
```

## Usage

```html
<kbd id="kbd-k" class="kbd">⌘K</kbd>
```

## AI Apply Prompt

### Context
`{{shortcut_hint}}` の kbd 表示を、対応キー押下時に光らせる。

### Steps
1. 上記 CSS を追記。
2. `keydown` でキー合致を判定し flash クラスを再付与。
3. ⌘/Ctrl の表示を OS で出し分け、ボタン代替も用意。

### Verify
- 対応キー押下で kbd が一瞬光る
- Reduce Motion で scale/glow を抑制
- フォーム入力中に誤反応しない

## Accessibility

ショートカットには必ずボタン等の代替操作を提供。flash は補助的な視覚キュー。修飾キー表記は OS に合わせる。フォーム入力中は発火しないようガード。

## Performance Notes

`transform`/`box-shadow`/`background` の短い補間のみ。対象は kbd チップ単体で軽量。

## Changelog

- 2026-06-01 (created): 初版。v1.1 Batch 4（トリガー多様化: keypress）第 1 弾。
