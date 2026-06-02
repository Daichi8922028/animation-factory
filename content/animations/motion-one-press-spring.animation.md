---
id: motion-one-press-spring
name: Motion One Spring Press
version: 1.0.0
release: v1.2
variant: motion-one
description: |
  Motion One の spring() でボタン押下に弾みのあるスケールフィードバックを与える micro-interaction。
  クリック / タップ時に scale が一瞬縮んでばね的に戻り、触れた感触を強める。CTA や主要アクションに。

taxonomy:
  layer: [js-runtime, library]
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
  - motion-one
  - spring
  - press
  - button
  - tactile
  - micro-interaction
  - feedback

trigger:
  primary: click
  touch_fallback: always-on
  config:
    stiffness: 420
    damping: 12

runtime:
  language: typescript
  framework: react
  framework_version: ">=18"
dependencies:
  - { name: "@motionone/dom", version: "^10.18.0", purpose: "spring() イージングと animate() による DOM アニメーション" }
peer_dependencies:
  - { name: react, version: ">=18" }

implementations:
  - tier: 1
    name: "Motion One spring()"
    dependencies: [ { name: "@motionone/dom", version: "^10.18.0" } ]
    browser_support: { baseline: widely-available, baseline_year: 2020 }
    performance: { gpu_accelerated: true, layout_thrash: false, cost: low }
    degrades_to: 2
  - tier: 2
    name: "CSS transition + transform"
    dependencies: []
    browser_support: { baseline: widely-available, baseline_year: 2015 }
    performance: { gpu_accelerated: true, layout_thrash: false, cost: low }
    degradation: "ばねのオーバーシュート（弾み）は出せず、:active で縮んで戻るだけの簡易フィードバックになる"

browser_support:
  baseline: widely-available
  baseline_year: 2020
  notes: "代表値は Tier 1（Motion One）。Web Animations API ベースで transform を補間。Tier 2 は CSS transition への縮退"

performance:
  gpu_accelerated: true
  layout_thrash: false
  cost: low
  notes: "transform: scale のみ補間し GPU 合成で完結。spring() は WAAPI へキーフレーム展開されメインスレッド負荷は小さい"

parameters:
  - { name: stiffness, type: number, default: 420, range: [120, 700], description: "ばねの硬さ。大きいほど速く反発する" }
  - { name: damping,   type: number, default: 12,  range: [5, 30],    description: "減衰。小さいほどオーバーシュート（弾み）が大きい" }
  - { name: scale_min, type: number, default: 0.88, range: [0.8, 0.96], description: "押下時の最小スケール" }

a11y:
  respects_reduced_motion: true
  fallback: "Reduce Motion 時は spring を再生せず、:active の色変化のみで押下を伝える"
  focus_safe: true
  notes: "scale はフォーカスやヒットターゲットを動かさない。focus-visible リングを別途付与し、キーボード操作でも押下が分かるようにする"

license: MIT
authors: ["@daichi"]
sources:
  - { title: "Motion One animate() ドキュメント", url: "https://motion.dev/dom/animate" }
  - { title: "Motion One spring() ジェネレータ", url: "https://motion.dev/docs/spring" }
attribution_required: false

preview:
  url: https://animation-factory.app/preview/motion-one-press-spring
  loop: true
  duration_ms: 1600

related:
  alternatives: [magnetic-button, hover-lift, scale-in]
  composes_with:
    - { id: hover-glow, note: "ホバーで光らせ、押下で弾ませると CTA の触感が増す" }
    - { id: input-focus-pop, note: "フォーム内のボタンに使い、入力系の pop と統一感を出す" }
  requires: []

sections:
  skip: [variants]

ai:
  intent_examples:
    - "ボタンを押したときに弾むフィードバックが欲しい"
    - "Motion One の spring でクリック時にぷるんと反応させたい"
    - "CTA ボタンに触った感触のあるマイクロインタラクションを足したい"
  apply_targets: ["cta-button", "primary-button", "icon-button"]
  do_not_apply_to: ["body-text", "data-table", "navigation-bar", "disabled-button"]
---

## Overview

ボタンのクリック / タップ時に `transform: scale` を一瞬 0.88 まで縮め、Motion One の `spring()` でばね的に 1.0 へ戻す。減衰の小さなばねによって戻り際に軽くオーバーシュートし、「押した」感触を増幅する **feedback / micro-interaction**。

使う場面: CTA、主要アクションボタン、アイコンボタン。
避けたい場面: 本文、データテーブル、ナビバー、無効化済みボタン（押せない要素を弾ませない）。

## Preview

公開プレビュー: https://animation-factory.app/preview/motion-one-press-spring

## Implementation

### Motion One spring()

```tsx
"use client";
import { useEffect, useRef } from "react";
import { animate, spring } from "@motionone/dom";

export function SpringPressButton() {
  const btnRef = useRef<HTMLButtonElement>(null);
  const controls = useRef<{ stop: () => void } | null>(null);

  const playPress = () => {
    const el = btnRef.current;
    if (!el) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    controls.current?.stop();
    controls.current = animate(
      el,
      { transform: ["scale(1)", "scale(0.88)", "scale(1)"] },
      { easing: spring({ stiffness: 420, damping: 12 }), duration: 0.6 },
    );
  };

  // unmount 時に走行中アニメーションを停止
  useEffect(() => () => controls.current?.stop(), []);

  return (
    <button ref={btnRef} type="button" onClick={playPress} style={{ willChange: "transform" }}>
      押してみる
    </button>
  );
}
```

### CSS transition + transform（縮退）

```css
/* ばねの弾みは出せない。:active で縮んで戻るだけの簡易フィードバック。 */
.spring-press {
  transition: transform 120ms ease-out;
}
.spring-press:active {
  transform: scale(0.88);
}
@media (prefers-reduced-motion: reduce) {
  .spring-press { transition: none; }
  .spring-press:active { transform: none; }
}
```

## Usage

```tsx
<SpringPressButton />
```

## AI Apply Prompt

### Context
`{{target_selector}}`（CTA / 主要ボタン）の押下時に Motion One の `spring()` で弾みフィードバックを足す。

### Steps
1. `@motionone/dom@^10.18` を `{{package_manager}}` で追加。
2. 上記コンポーネントを `{{target_file}}` に追加。サーバコンポーネントから呼ぶ場合は `"use client"` を確認。
3. `onClick`（タップでも発火する）で `animate(el, { transform: [...] }, { easing: spring(...) })` を呼ぶ。
4. 戻り値の `controls` を ref に保持し、再押下時は前回を `stop()`、unmount でも `stop()` する。
5. Reduce Motion 設定時は `animate` を呼ばず、:active の色変化など非モーションの代替で押下を伝える。

### Examples

Before: 通常の `<button>`（押下時の変化なし）
After: `<SpringPressButton />` で押下時に scale が弾む

### Verify
- クリック / タップで scale が一瞬縮み、ばね的に戻る（軽いオーバーシュート）
- 連打しても前回が停止され、毎回先頭から再生される
- Reduce Motion ON で弾まず、色など非モーションで押下が伝わる
- unmount 後にコンソールエラーや残留アニメーションがない（`stop()` が効いている）

## Accessibility

- `prefers-reduced-motion: reduce` を手動チェックし、ON では `animate` を呼ばない。
- `scale` はレイアウトを動かさずヒットターゲットを保つため、押下中にポインタが外れる事故が起きにくい。
- `focus-visible` リングを併設し、キーボード操作（Enter / Space）でも押下が視覚的に分かるようにする。無効化されたボタンには適用しない。

## Performance Notes

- `transform: scale` のみ補間するため GPU 合成で完結し、レイアウトもペイントも誘発しない。
- `spring()` は WAAPI のキーフレームへ展開され、メインスレッドの負荷は小さい。長押し連打を想定し、再押下時に前回コントロールを `stop()` してアニメーションの重複を防ぐ。
- `will-change: transform` は押下のある要素に限定して付与する（多用は逆効果）。

## Changelog

- 2026-06-02 (created): 初版。v1.2（Tier B）、Motion One variant 拡充。spring() による press フィードバック。
