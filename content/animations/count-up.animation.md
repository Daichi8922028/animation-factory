---
id: count-up
name: Count Up
version: 1.0.0
release: alpha
variant: react-motion
description: |
  数字を 0 → 目標値に滑らかにカウントアップする。
  ダッシュボード KPI、価格、統計、達成数の演出に。

taxonomy:
  layer: [library, js-runtime]
  ux_role:
    primary: feedback
    secondary: [attention]
  trigger: [viewport]
  media: [dom-css]
  authoring: code

behavior:
  lifecycle: oneshot
  reversible: false
  replay: once

tags:
  - count-up
  - number
  - tween
  - kpi
  - stat
  - data

trigger:
  primary: viewport
  touch_fallback: always-on
  config:
    amount: 0.5

runtime:
  language: typescript
  framework: react
  framework_version: ">=18"
dependencies:
  - { name: motion, version: "^11.0.0", purpose: "useMotionValue + animate + useTransform" }
peer_dependencies:
  - { name: react, version: ">=18" }

implementations:
  - tier: 1
    name: "React + Motion (useMotionValue)"
    dependencies: [ { name: motion, version: "^11.0.0" } ]
    browser_support: { baseline: widely-available, baseline_year: 2020 }
    performance: { gpu_accelerated: false, layout_thrash: false, cost: low }
    degrades_to: 2
  - tier: 2
    name: "Vanilla JS (rAF)"
    dependencies: []
    browser_support: { baseline: widely-available, baseline_year: 2017 }
    performance: { gpu_accelerated: false, layout_thrash: false, cost: low }
    degradation: "requestAnimationFrame で値を補間して setState、Motion なしで動く"

browser_support:
  baseline: widely-available
  baseline_year: 2020
  notes: "代表値は Tier 1。SR は最終値だけ読み上げる工夫が必要"

performance:
  gpu_accelerated: false
  layout_thrash: false
  cost: low
  notes: "テキストノードの書き換え。フォントが proportional だと幅が変動するので tabular-nums を指定"

parameters:
  - { name: from, type: number, default: 0, description: "開始値" }
  - { name: to, type: number, default: 100, description: "目標値" }
  - { name: duration_ms, type: number, default: 1200, range: [400, 4000], description: "全体長" }
  - { name: format, type: enum, default: "integer",
      values: ["integer","decimal","currency","percent"], description: "表示フォーマット" }

a11y:
  respects_reduced_motion: true
  fallback: "tween なしで最終値を即時表示"
  focus_safe: true
  notes: "SR は途中の数字を読み上げると混乱する。途中値は `aria-hidden=\"true\"`、最終値だけ別の `aria-live=\"polite\"` ノードで通知"

license: MIT
authors: ["@daichi"]
sources: []
attribution_required: false

preview:
  url: https://animation-factory.app/preview/count-up
  loop: true
  duration_ms: 2400

related:
  alternatives: [progress-bar]
  composes_with:
    - { id: scroll-reveal, note: "ビューポート進入で kick するパターン" }
  requires: []

sections:
  skip: [variants]

ai:
  intent_examples:
    - "ダッシュボードの数字をカウントアップ"
    - "達成件数を 0 から目標値にアニメ"
    - "価格表示の数字を tween"
  apply_targets: ["kpi-card", "stat-number", "price-display", "counter"]
  do_not_apply_to: ["input-value", "form-field", "real-time-fluctuating-value"]
---

## Overview

`useMotionValue` で動かす数値を `useTransform` で文字列に変換し、`<motion.span>` の `children` に流す。または `motion.value.on("change")` で setState する。tabular-nums で幅変動を抑える。

使う場面: KPI、達成件数、価格、統計、ヒーローの「N 件導入」表示。
避けたい場面: 入力値、リアルタイムに変動する値（カウントアップとリアルタイム更新は両立しない）。

## Preview

公開プレビュー: https://animation-factory.app/preview/count-up

## Implementation

### React + Motion

```tsx
"use client";
import { animate, useInView, useMotionValue, useTransform } from "motion/react";
import { useEffect, useRef } from "react";

export function CountUp({
  to,
  durationMs = 1200,
  format = (n: number) => Math.round(n).toLocaleString(),
}: { to: number; durationMs?: number; format?: (n: number) => string }) {
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true, amount: 0.5 });
  const value = useMotionValue(0);
  const display = useTransform(value, format);

  useEffect(() => {
    if (!inView) return;
    const ctrl = animate(value, to, { duration: durationMs / 1000, ease: "easeOut" });
    return () => ctrl.stop();
  }, [inView, to, durationMs, value]);

  return (
    <span ref={ref} style={{ fontVariantNumeric: "tabular-nums" }} aria-label={format(to)}>
      <span aria-hidden>{display}</span>
    </span>
  );
}
```

### Vanilla JS（縮退）

```ts
function countUp(el: HTMLElement, to: number, ms = 1200) {
  const start = performance.now();
  function tick(now: number) {
    const t = Math.min((now - start) / ms, 1);
    const eased = 1 - Math.pow(1 - t, 3);
    el.textContent = Math.round(to * eased).toLocaleString();
    if (t < 1) requestAnimationFrame(tick);
  }
  requestAnimationFrame(tick);
}
```

## Usage

```tsx
<CountUp to={12345} />
```

## AI Apply Prompt

### Context
`{{target_selector}}` の数字を 0 から目標値にカウントアップする。

### Steps
1. `motion@^11` を `{{package_manager}}` で追加。
2. 上記 `CountUp` を `{{target_file}}` に追加。
3. `font-variant-numeric: tabular-nums` を必ず指定（幅変動防止）。
4. SR 用に `aria-label` で最終値を露出。

### Examples

Before: `<span>12,345</span>`
After: `<CountUp to={12345} />`

### Verify
- ビューポート進入で 0 → 目標値へ滑らかに増加
- フォントの桁幅が変動しない（tabular-nums）
- Reduce Motion で即時表示
- SR が最終値だけを読む

## Accessibility

途中値は SR にノイズなので `aria-hidden`。最終値は `aria-label` で正しく取得できるように。

## Performance Notes

テキストノードの書き換えは Paint コストあり。`tabular-nums` で Layout を一定化。

## Changelog

- 2026-05-27 (created): 初版。Phase 3 D1 第 5 弾、Tier A 数値 tween 拡充。
