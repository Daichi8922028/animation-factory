---
id: count-up-on-view
name: Count Up On View
version: 1.0.0
release: beta
variant: react-motion
description: |
  数値カウンタが、ビューポートに入った瞬間に 0 から目標値までアニメーションで上昇する。
  IntersectionObserver で「見えたら一度だけ」発火する、統計・KPI 表示向けの feedback。

taxonomy:
  layer: [css, js-runtime, library]
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
  - counter
  - number
  - viewport
  - stats
  - kpi
  - feedback

trigger:
  primary: viewport
  touch_fallback: always-on
  config: { once: true }

runtime:
  language: typescript
  framework: react
  framework_version: ">=18"
dependencies:
  - { name: motion, version: "^11.0.0", purpose: "useInView + animate で数値補間" }
peer_dependencies:
  - { name: react, version: ">=18" }

implementations:
  - tier: 1
    name: "React + Motion (useInView + animate)"
    dependencies: [ { name: motion, version: "^11.0.0" } ]
    browser_support: { baseline: widely-available, baseline_year: 2020 }
    performance: { gpu_accelerated: false, layout_thrash: false, cost: low }
    degrades_to: 2
  - tier: 2
    name: "Vanilla JS (IntersectionObserver + rAF)"
    dependencies: []
    browser_support: { baseline: widely-available, baseline_year: 2019 }
    degradation: "IntersectionObserver で進入検出、requestAnimationFrame で textContent を補間"
    performance: { gpu_accelerated: false, layout_thrash: false, cost: low }

browser_support:
  baseline: widely-available
  baseline_year: 2020
  notes: "代表値は Tier 1。useInView({ once: true }) で一度だけ。数値は textContent の書き換えで layout 影響は数字幅のみ"

performance:
  gpu_accelerated: false
  layout_thrash: false
  cost: low
  notes: "テキスト更新は paint のみ。tabular-nums で桁の横揺れを防ぐと滑らか"

parameters:
  - { name: target,       type: number, default: 1280, range: [0, 1000000], description: "到達する目標値" }
  - { name: duration_ms,  type: number, default: 1400, range: [400, 3000],  description: "カウントの長さ" }
  - { name: decimals,     type: number, default: 0,    range: [0, 2],       description: "小数桁数" }

a11y:
  respects_reduced_motion: true
  fallback: "カウントを省略し最終値を即時表示。最終値は常に DOM に存在させる"
  focus_safe: true
  notes: "意味のある数値は aria で最終値を読ませる（途中の中間値は読み上げない）。tabular-nums で視覚の安定も確保"

license: MIT
authors: ["@daichi"]
sources:
  - { title: "Motion: useInView", url: "https://motion.dev/docs/react-use-in-view" }
  - { title: "MDN: IntersectionObserver", url: "https://developer.mozilla.org/en-US/docs/Web/API/Intersection_Observer_API" }
attribution_required: false

preview:
  url: https://animation-factory.app/preview/count-up-on-view
  loop: true
  duration_ms: 3000

related:
  alternatives: [count-up, progress-bar, password-strength-bar]
  composes_with:
    - { id: entrance-stagger-fade, note: "複数 KPI を stagger で出しつつ各数値を count-up させる" }
  requires: []

sections:
  skip: [variants]

ai:
  intent_examples:
    - "スクロールして見えたら数字が 0 からカウントアップする"
    - "KPI/統計をビューポート進入で数えるアニメ"
    - "実績の数値を視界に入ったときに上昇させたい"
  apply_targets: ["stats-section", "kpi-card", "landing-metrics"]
  do_not_apply_to: ["price-table", "form-field", "navigation"]
---

## Overview

数値が画面に入った瞬間、0 から目標値まで `animate` で上昇する。`useInView({ once: true })` で「一度だけ」発火し、再スクロールで何度も走らない。KPI・実績・統計セクションで効果的。`tabular-nums` で桁の横揺れを抑える。

使う場面: ランディングの実績数値、ダッシュボードの KPI カード。
避けたい場面: 価格表（誤読を招く）、フォーム、ナビ。

## Preview

公開プレビュー: https://animation-factory.app/preview/count-up-on-view

## Implementation

### React + Motion (useInView + animate)

```tsx
"use client";
import { animate, useInView } from "motion/react";
import { useEffect, useRef, useState } from "react";

export function CountUp({ to, duration = 1.4 }: { to: number; duration?: number }) {
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true, amount: 0.6 });
  const [val, setVal] = useState(0);
  useEffect(() => {
    if (!inView) return;
    const controls = animate(0, to, {
      duration, ease: "easeOut", onUpdate: (v) => setVal(Math.round(v)),
    });
    return () => controls.stop();
  }, [inView, to, duration]);
  return <span ref={ref} className="tabular-nums">{val.toLocaleString()}</span>;
}
```

### Vanilla JS（縮退）

`IntersectionObserver` で進入検出 → `requestAnimationFrame` で `textContent` を補間。

## Usage

```tsx
<p className="text-4xl font-bold"><CountUp to={1280} />+</p>
```

## AI Apply Prompt

### Context
`{{stat}}` の数値をビューポート進入時にカウントアップさせる。

### Steps
1. `motion@^11` を追加。
2. `useInView({ once: true })` で発火、`animate(0, to)` の onUpdate で値更新。
3. `tabular-nums` を当て、Reduce Motion で最終値を即時表示。

### Verify
- 見えたら 0→目標値へ上昇、once で再発火しない
- Reduce Motion で即最終値
- 桁が増えても横揺れしない

## Accessibility

最終値は常に DOM に存在させ、支援技術には最終値が伝わるようにする（中間値は読み上げ不要）。Reduce Motion で即時表示。

## Performance Notes

テキスト更新は paint のみで GPU 不要。`tabular-nums` で桁送りの reflow 体感を消す。`once` で無駄な再実行を防ぐ。

## Changelog

- 2026-06-01 (created): 初版。v1.1 Batch 4（トリガー多様化: viewport）第 2 弾。count-up の viewport 発火版。
