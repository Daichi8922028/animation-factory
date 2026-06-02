---
id: wapi-ripple-click
name: WAAPI Ripple Click
version: 1.0.0
release: v1.2
variant: wapi
description: |
  クリック位置を起点に Material 風の ripple（円が広がりフェードアウト）を
  Web Animations API（element.animate）で描く micro-interaction。ライブラリ不要。
  ボタンやカードのタップフィードバックに。一定間隔で自動 ripple も発生させ、賑やかに見せられる。

taxonomy:
  layer: [js-runtime]
  ux_role:
    primary: feedback
    secondary: [micro-interaction]
  trigger: [click]
  media: [dom-css]
  authoring: code

behavior:
  lifecycle: oneshot
  reversible: false
  replay: every-entry

tags:
  - waapi
  - web-animations-api
  - ripple
  - material
  - click-feedback
  - micro-interaction

trigger:
  primary: click
  touch_fallback: always-on
  config:
    duration_ms: 600
    color: "rgba(163, 230, 53, 0.35)"

runtime:
  language: typescript
  framework: react
  framework_version: ">=18"
dependencies: []
peer_dependencies:
  - { name: react, version: ">=18" }

implementations:
  - tier: 1
    name: "Web Animations API (element.animate)"
    dependencies: []
    browser_support: { baseline: widely-available, baseline_year: 2020 }
    performance: { gpu_accelerated: true, layout_thrash: false, cost: low }
    degrades_to: 2
  - tier: 2
    name: "CSS @keyframes ripple（縮退）"
    dependencies: []
    browser_support: { baseline: widely-available, baseline_year: 2017 }
    performance: { gpu_accelerated: true, layout_thrash: false, cost: low }
    degradation: "クリック座標を JS で渡さず中央固定の ripple になる。座標追従の精度は失われる"

browser_support:
  baseline: widely-available
  baseline_year: 2020
  notes: "代表値は Tier 1。Element.animate() は全モダンブラウザで安定。transform/opacity のみ補間"

performance:
  gpu_accelerated: true
  layout_thrash: false
  cost: low
  notes: "transform: scale と opacity のみ補間。ripple ノードは animation finish で remove し DOM を溜めない"

parameters:
  - { name: duration_ms, type: number, default: 600, range: [300, 1200], description: "ripple が広がりきって消えるまでの時間" }
  - { name: color, type: string, default: "rgba(163, 230, 53, 0.35)", description: "ripple の塗り色（半透明推奨）" }
  - { name: scale_to, type: number, default: 2, range: [1.5, 4], description: "起点直径に対する最終拡大率" }

a11y:
  respects_reduced_motion: true
  fallback: "ripple を描画せず、押下時に背景色をひと瞬間変えるだけのフィードバックに縮退"
  focus_safe: true
  notes: "ripple は純粋な装飾。aria は付けず、実体（ボタン等）のラベル・押下状態で意味を伝える"

license: MIT
authors: ["@daichi"]
sources:
  - { title: "Element: animate() method - MDN", url: "https://developer.mozilla.org/en-US/docs/Web/API/Element/animate" }
attribution_required: false

preview:
  url: https://animation-factory.app/preview/wapi-ripple-click
  loop: true
  duration_ms: 1800

related:
  alternatives: [motion-one-press-spring, input-focus-pop, highlight-flash]
  composes_with:
    - { id: hover-glow, note: "hover で発光、click で ripple と段階的なフィードバックに" }
    - { id: scale-in, note: "ripple を出すボタン自体の登場に scale-in を併用" }
  requires: []

sections:
  skip: [variants]

ai:
  intent_examples:
    - "ボタンをクリックした位置から波紋が広がるようにしたい"
    - "Material Design みたいな ripple をライブラリなしで付けたい"
    - "タップ位置から円が広がるフィードバックがほしい"
  apply_targets: ["button", "card", "list-item", "fab"]
  do_not_apply_to: ["body-text", "data-table", "navigation-bar", "form-field"]
---

## Overview

クリック / タップした **座標を起点** に半透明の円を生成し、`element.animate()` で `scale` 拡大 + `opacity` フェードを同時に走らせる Material 風の ripple。Web Animations API のみで実装し、ライブラリ依存はゼロ。

ripple ノードはアニメーション完了時に DOM から取り除くため、連打しても DOM が溜まらない。座標は `getBoundingClientRect()` + ポインタ座標から算出する。

使う場面: ボタン / カード / リスト項目 / FAB の押下フィードバック。
避けたい場面: 本文、データテーブルのセル、フォーム入力欄（誤タップ時に煩い）。

## Preview

公開プレビュー: https://animation-factory.app/preview/wapi-ripple-click

## Implementation

### Web Animations API (element.animate)

```tsx
"use client";
import { useRef } from "react";

export function RippleButton({ children }: { children: React.ReactNode }) {
  const hostRef = useRef<HTMLButtonElement>(null);

  const spawnRipple = (x: number, y: number) => {
    const host = hostRef.current;
    if (!host) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const rect = host.getBoundingClientRect();
    // 起点から最遠コーナーまでを直径に
    const size = Math.max(rect.width, rect.height) * 2;
    const ripple = document.createElement("span");
    ripple.style.cssText = `
      position:absolute; left:${x - rect.left - size / 2}px; top:${y - rect.top - size / 2}px;
      width:${size}px; height:${size}px; border-radius:9999px;
      background:rgba(163,230,53,0.35); pointer-events:none;
    `;
    host.appendChild(ripple);

    const anim = ripple.animate(
      [
        { transform: "scale(0)", opacity: 0.6 },
        { transform: "scale(1)", opacity: 0 },
      ],
      { duration: 600, easing: "cubic-bezier(0.4, 0, 0.2, 1)" },
    );
    anim.onfinish = () => ripple.remove();
  };

  return (
    <button
      ref={hostRef}
      type="button"
      onPointerDown={(e) => spawnRipple(e.clientX, e.clientY)}
      style={{ position: "relative", overflow: "hidden" }}
    >
      {children}
    </button>
  );
}
```

### CSS @keyframes ripple（縮退）

```css
/* JS で座標を渡さず中央固定の ripple に縮退。Reduce Motion では非表示。 */
@keyframes ripple-center {
  from { transform: translate(-50%, -50%) scale(0); opacity: 0.6; }
  to   { transform: translate(-50%, -50%) scale(2); opacity: 0; }
}
.ripple-host { position: relative; overflow: hidden; }
.ripple-host:active::after {
  content: ""; position: absolute; left: 50%; top: 50%;
  width: 100%; aspect-ratio: 1; border-radius: 9999px;
  background: rgba(163, 230, 53, 0.35);
  animation: ripple-center 600ms cubic-bezier(0.4, 0, 0.2, 1);
}
@media (prefers-reduced-motion: reduce) {
  .ripple-host:active::after { animation: none; content: none; }
}
```

## Usage

```tsx
<RippleButton>送信</RippleButton>
```

## AI Apply Prompt

### Context
`{{target_selector}}`（ボタン等）に、クリック座標を起点とする WAAPI ripple を付与する。ライブラリは追加しない。

### Steps
1. ホスト要素に `position: relative; overflow: hidden;` を付与する。
2. `onPointerDown` で `getBoundingClientRect()` とポインタ座標から ripple の位置・サイズを計算し、`<span>` を生成して `appendChild`。
3. `ripple.animate([...], { duration: 600 })` で `scale` + `opacity` を補間し、`onfinish` で `ripple.remove()`。
4. `prefers-reduced-motion: reduce` のときは ripple を生成しない分岐を入れる。
5. ripple は装飾なので aria を付けず、ホスト要素のラベル / 状態で意味を伝える。

### Examples

Before: 通常の `<button>送信</button>`
After: `<RippleButton>送信</RippleButton>` で押下位置から波紋

### Verify
- クリック / タップした **その位置** から円が広がる
- 連打しても DOM に `<span>` が残らない（`onfinish` で remove）
- Reduce Motion ON で ripple が出ず、機能は損なわれない
- ホスト要素の `overflow: hidden` で円がはみ出さない

## Accessibility

ripple は純粋な視覚装飾。スクリーンリーダー向けの情報は持たせず、ホスト要素（ボタン等）の **ラベルと押下状態** で意味を伝える。`prefers-reduced-motion: reduce` 時は ripple 生成自体をスキップし、フォーカスリングや色変化など非モーションのフィードバックに委ねる。`focus-visible` のリングは ripple と独立して機能する。

## Performance Notes

- 補間は `transform: scale` と `opacity` のみで GPU 合成に乗る。レイアウトを起こさない。
- ripple ノードは `anim.onfinish` で DOM から除去するため、連打しても要素が蓄積しない。
- `element.animate()` は内部で WAAPI のコンポジタスレッド最適化を受けられるため、`setInterval` で JS から座標を書き換えるより軽い。
- `will-change` は ripple が短命なため付けない（生成コストの方が上回る）。

## Changelog

- 2026-06-02 (created): 初版。v1.2（Tier B）、Web Animations API による click ripple。motion-one-press-spring と並ぶライブラリ別 micro-interaction 系列。
