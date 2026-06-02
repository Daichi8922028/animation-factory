---
id: wapi-flip-counter
name: WAAPI Flip Counter
version: 1.0.0
release: v1.2
variant: wapi
description: |
  数字が縦にフリップ（element.animate）して次の値へ切り替わるカウンタ。
  Web Animations API のみで実装し、ライブラリ非依存。KPI 更新、在庫数、
  ライブ集計、スコア表示など「値が変わったことを強調したい」場面に。

taxonomy:
  layer: [js-runtime]
  ux_role:
    primary: feedback
    secondary: [attention]
  trigger: [state-change]
  media: [dom-css]
  authoring: code

behavior:
  lifecycle: continuous
  reversible: false
  replay: every-entry

tags:
  - waapi
  - web-animations-api
  - flip
  - counter
  - number
  - odometer
  - state-change

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
    name: "Web Animations API (element.animate)"
    dependencies: []
    browser_support: { baseline: widely-available, baseline_year: 2020 }
    performance: { gpu_accelerated: true, layout_thrash: false, cost: low }
    degrades_to: 2
  - tier: 2
    name: "CSS transition（縮退）"
    dependencies: []
    browser_support: { baseline: widely-available, baseline_year: 2015 }
    performance: { gpu_accelerated: true, layout_thrash: false, cost: low }
    degradation: "transform/opacity を CSS transition で切り替えるだけ。旧→新の二枚重ねによる連続したフリップは出せず、単純なクロスフェード相当に簡略化される"

browser_support:
  baseline: widely-available
  baseline_year: 2020
  notes: "代表値は Tier 1（WAAPI）。element.animate は主要ブラウザで widely-available。composite/iterations 等の細部は環境差あり"

performance:
  gpu_accelerated: true
  layout_thrash: false
  cost: low
  notes: "transform(translateY) と opacity のみを補間。WAAPI はコンポジタスレッドで走るため低コスト。レイアウトを引き起こさない"

parameters:
  - { name: duration_ms, type: number, default: 420, range: [150, 1000], description: "1 桁ぶんのフリップ所要時間" }
  - { name: digit_height_px, type: number, default: 48, range: [24, 120], description: "1 桁の高さ。translateY の移動量に直結" }
  - { name: easing, type: enum, default: "cubic-bezier(.22,.61,.36,1)",
      values: ["ease-out", "cubic-bezier(.22,.61,.36,1)", "cubic-bezier(.34,1.56,.64,1)"],
      description: "フリップのイージング。バウンス系はめくれ感が増す" }

a11y:
  respects_reduced_motion: true
  fallback: "Reduce Motion 時はフリップせず、新しい値へ即時差し替え（animate を呼ばない）"
  focus_safe: true
  notes: "数字は視覚演出のみ。実値はテキストとして DOM に常駐させ、必要なら aria-live=\"polite\" で更新を読み上げる"

license: MIT
authors: ["@daichi"]
sources:
  - { title: "Web Animations API (MDN)", url: "https://developer.mozilla.org/en-US/docs/Web/API/Web_Animations_API" }
  - { title: "Element.animate() (MDN)", url: "https://developer.mozilla.org/en-US/docs/Web/API/Element/animate" }

preview:
  url: https://animation-factory.app/preview/wapi-flip-counter
  loop: true
  duration_ms: 2000

related:
  alternatives: [count-up, count-up-on-view, scale-in]
  composes_with:
    - { id: fade-up, note: "カウンタを含むカードを fade-up で登場させてから値を回し始めると自然" }
  requires: []

sections:
  skip: [variants]

ai:
  intent_examples:
    - "数字が縦にめくれて次の値に変わるカウンタを作りたい"
    - "ライブラリなしで WAAPI のフリップ数字を実装したい"
    - "KPI の値が更新されたときにパタッと切り替わる演出"
  apply_targets: ["kpi-number", "stat-card", "score-display", "stock-count"]
  do_not_apply_to: ["body-text", "long-form-number", "input", "navigation"]
---

## Overview

数字を縦に並べた二枚（旧値・新値）を `element.animate()` でスライドさせ、**パタッとめくれる**フリップ表現で次の値に切り替えるカウンタ。Web Animations API のみを使い、外部ライブラリに依存しない。値が変わったこと自体を強調する **feedback** 役割。

使う場面: ダッシュボードの KPI、在庫・残数、ライブ集計、スコア。
避けたい場面: 本文中の長い数字、入力欄、頻繁に細かく変わりすぎる値（チラつきの原因）。

## Preview

公開プレビュー: https://animation-factory.app/preview/wapi-flip-counter

## Implementation

### Web Animations API (element.animate)

```tsx
"use client";
import { useEffect, useRef } from "react";

/** 1 桁ぶんを縦にフリップさせる WAAPI ヘルパ。 */
function flipDigit(el: HTMLElement, next: string, durationMs = 420, heightPx = 48) {
  const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const incoming = el.querySelector<HTMLElement>(".flip-incoming");
  const current = el.querySelector<HTMLElement>(".flip-current");
  if (!incoming || !current) return;

  incoming.textContent = next;

  if (reduce) {
    current.textContent = next; // 即時差し替え
    return;
  }

  const opts: KeyframeAnimationOptions = {
    duration: durationMs,
    easing: "cubic-bezier(.22,.61,.36,1)",
    fill: "forwards",
  };
  // 旧値は上へ抜ける / 新値は下から入る
  const a1 = current.animate(
    [{ transform: "translateY(0)", opacity: 1 },
     { transform: `translateY(-${heightPx}px)`, opacity: 0 }],
    opts,
  );
  incoming.animate(
    [{ transform: `translateY(${heightPx}px)`, opacity: 0 },
     { transform: "translateY(0)", opacity: 1 }],
    opts,
  );
  a1.onfinish = () => {
    current.textContent = next; // 確定後に現在値を更新
    current.style.transform = "translateY(0)";
    current.style.opacity = "1";
  };
}

export function FlipCounter({ value }: { value: number }) {
  const ref = useRef<HTMLSpanElement>(null);
  const prev = useRef(value);

  useEffect(() => {
    const el = ref.current;
    if (!el || prev.current === value) return;
    flipDigit(el, String(value));
    prev.current = value;
  }, [value]);

  return (
    <span ref={ref} className="flip-digit" style={{ height: 48 }}>
      <span className="flip-current">{value}</span>
      <span className="flip-incoming" aria-hidden />
    </span>
  );
}
```

### CSS transition（縮退）

```css
/* WAAPI を使わず、新値へのクロスフェードだけで近似する簡易版。 */
.flip-digit .flip-current {
  transition: transform 420ms cubic-bezier(.22, .61, .36, 1), opacity 420ms;
}
@media (prefers-reduced-motion: reduce) {
  .flip-digit .flip-current { transition: none; }
}
```

## Usage

```tsx
const [n, setN] = useState(0);
// setInterval や WebSocket 等の状態更新で値を渡すだけ
<FlipCounter value={n} />
```

## AI Apply Prompt

### Context
`{{target_selector}}` の数字表示を、値が変わるたびに縦フリップするカウンタに置き換える。WAAPI のみ、ライブラリ追加なし。

### Steps
1. 上記 `flipDigit` ヘルパと `FlipCounter` を `{{target_file}}` に追加（`"use client"` を確認）。
2. 桁ごとに `flip-current` / `flip-incoming` の二枚を縦に重ね、`overflow: hidden` の枠（高さ = `digit_height_px`）で切り抜く。
3. 値の更新は state（`setInterval` / fetch / WebSocket）で行い、`useEffect` の依存に値を渡す。`useEffect` 内で `setState` は呼ばない（前回値の比較のみ）。
4. Reduce Motion 時は `animate` を呼ばず `textContent` を即時差し替える分岐を維持する。
5. 実値はテキストとして残し、必要なら `aria-live="polite"` を付ける。

### Examples

Before: `<span>{value}</span>` の素の数字
After: `<FlipCounter value={value} />` で縦フリップ

### Verify
- 値が変わるたびに旧値が上へ抜け、新値が下から入るフリップが 1 回起きる
- フリップ完了後に現在値が正しく確定している（途中でずれない）
- Reduce Motion ON でアニメーションせず、即時に正しい値になる
- unmount 後に走り続けるタイマー/アニメーションが残らない

## Accessibility

- 数字のフリップは視覚演出のみ。実値はテキストとして DOM に常駐させ、スクリーンリーダーには `aria-live="polite"` で更新を伝える（演出用の `flip-incoming` は `aria-hidden`）。
- `prefers-reduced-motion: reduce` で `animate()` を呼ばず即時差し替えに縮退。
- フォーカス可能要素ではないため Tab 順に影響しない（focus-safe）。

## Performance Notes

- `transform: translateY` と `opacity` のみを補間。レイアウト・ペイントを誘発せず、コンポジタスレッドで完結するため低コスト。
- WAAPI の `Animation` は finish 後に GC される。`onfinish` で現在値を確定し、明示的な `cancel()` は不要だが、高頻度更新では古い `Animation` を `cancel()` してから次を発火するとチラつきを防げる。
- `setInterval` 等のドライバは unmount 時に必ず `clearInterval` する。

## Changelog

- 2026-06-02 (created): 初版。v1.2（Tier B）、WAAPI フリップカウンタ。ライブラリ非依存の state-change feedback として追加。
