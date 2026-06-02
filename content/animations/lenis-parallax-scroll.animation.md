---
id: lenis-parallax-scroll
name: Lenis Parallax Scroll
version: 1.0.0
release: v1.2
variant: lenis
description: |
  Lenis のスムーススクロールが返す scroll 値を購読し、複数の背景レイヤーを
  異なる速度で parallax 変位させて奥行きを作る storytelling 演出。
  ヒーロー、ランディング、ケーススタディの背景に。

taxonomy:
  layer: [js-runtime, library]
  ux_role:
    primary: storytelling
    secondary: [scroll-progress, decorative]
  trigger: [scroll-progress]
  media: [dom-css]
  authoring: code

behavior:
  lifecycle: scroll-linked
  reversible: true
  replay: every-entry

tags:
  - lenis
  - parallax
  - smooth-scroll
  - scrollytelling
  - storytelling
  - depth

trigger:
  primary: scroll-progress
  touch_fallback: always-on
  config:
    lerp: 0.1
    smoothWheel: true

runtime:
  language: typescript
  framework: react
  framework_version: ">=18"
dependencies:
  - { name: lenis, version: "^1.3.0", purpose: "スムーススクロールと scroll イベントの提供" }
peer_dependencies:
  - { name: react, version: ">=18" }

implementations:
  - tier: 1
    name: "Lenis（smooth scroll + parallax）"
    dependencies: [ { name: lenis, version: "^1.3.0" } ]
    browser_support: { baseline: widely-available, baseline_year: 2021 }
    performance: { gpu_accelerated: true, layout_thrash: false, cost: medium }
    degrades_to: 2
  - tier: 2
    name: "ネイティブ scroll + transform（縮退）"
    dependencies: []
    browser_support: { baseline: widely-available, baseline_year: 2016 }
    performance: { gpu_accelerated: true, layout_thrash: false, cost: low }
    degradation: "スムージング（慣性）は失われ、ネイティブスクロールで scroll イベントから直接 transform を更新する簡易版"

browser_support:
  baseline: widely-available
  baseline_year: 2021
  notes: "代表値は Tier 1（Lenis）。Tier 2 はネイティブスクロールで慣性なし"

performance:
  gpu_accelerated: true
  layout_thrash: false
  cost: medium
  notes: "translate3d のみで合成。scroll コールバックは rAF 駆動。レイヤー数を増やしすぎると合成コストが上がる"

parameters:
  - { name: lerp, type: number, default: 0.1, range: [0.02, 1], description: "スクロールの補間強度。小さいほど滑らかで遅延、1 で即時" }
  - { name: layer_speed, type: number, default: -0.5, range: [-1, 1], description: "レイヤーの変位係数。負で逆方向、絶対値が大きいほど速く動く" }
  - { name: smoothWheel, type: boolean, default: true, values: [true, false], description: "ホイールスクロールをスムージングするか" }

a11y:
  respects_reduced_motion: true
  fallback: "スムージング（lerp:1）と parallax 変位を無効化し、通常のネイティブスクロールに縮退"
  focus_safe: true
  notes: "parallax は装飾レイヤーのみに適用し、本文は通常フローのまま。スクロールジャックを避け、ネイティブのスクロール量を尊重する"

license: MIT
authors: ["@daichi"]
sources:
  - { title: "Lenis 公式リポジトリ", url: "https://github.com/darkroomengineering/lenis" }
attribution_required: false

preview:
  url: https://animation-factory.app/preview/lenis-parallax-scroll
  loop: true
  duration_ms: 3200

related:
  alternatives: [gsap-parallax-layers, gsap-scroll-pin, css-scroll-driven, scroll-reveal]
  composes_with:
    - { id: fade-up, note: "前景コンテンツを fade-up で出すと parallax 背景と相性が良い" }
    - { id: count-up-on-view, note: "parallax セクション内のカウンタを併せて演出" }
  requires: []

sections:
  skip: [variants]

ai:
  intent_examples:
    - "スクロールに合わせて背景レイヤーを視差で動かしたい"
    - "Lenis のスムーススクロールで parallax を作る"
    - "ヒーローの背景を奥行きのある parallax にしたい"
  apply_targets: ["hero-section", "landing-background", "case-study"]
  do_not_apply_to: ["form", "data-table", "navigation-bar", "body-text"]
---

## Overview

Lenis でスクロールをスムージングしつつ、`lenis.on("scroll")` が返す `scroll` 値（ピクセル）を購読して、複数の背景レイヤーを **異なる速度で** `translate3d` 変位させる。遠いレイヤーほどゆっくり動かすことで **奥行き（parallax）** を表現する storytelling パターン。

ポイントは、parallax を **装飾レイヤーだけ** に適用し、本文は通常フローのまま動かさないこと。スクロール量はネイティブを尊重し、ジャックしない。

使う場面: ヒーロー / ランディングの背景 / ケーススタディの章背景。
避けたい場面: フォーム、データテーブル、ナビバー、本文そのものの変位。

## Preview

公開プレビュー: https://animation-factory.app/preview/lenis-parallax-scroll

## Implementation

### Lenis（smooth scroll + parallax）

```tsx
"use client";
import { useEffect, useRef } from "react";
import Lenis from "lenis";

export function ParallaxHero() {
  const wrapperRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const bgRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const wrapper = wrapperRef.current;
    const content = contentRef.current;
    if (!wrapper || !content) return;

    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    // ネストした scroll container に Lenis を生成（document ではなく wrapper）
    const lenis = new Lenis({
      wrapper,
      content,
      lerp: reduce ? 1 : 0.1,
      smoothWheel: !reduce,
    });

    const onScroll = (l: Lenis) => {
      const bg = bgRef.current;
      if (bg) {
        const offset = reduce ? 0 : l.scroll * -0.5; // 背景は半速で逆方向
        bg.style.transform = `translate3d(0, ${offset}px, 0)`;
      }
    };
    lenis.on("scroll", onScroll);

    let rafId = 0;
    const raf = (time: number) => {
      lenis.raf(time);
      rafId = requestAnimationFrame(raf);
    };
    rafId = requestAnimationFrame(raf);

    return () => {
      cancelAnimationFrame(rafId);
      lenis.destroy();
    };
  }, []);

  return (
    <div ref={wrapperRef} className="relative h-screen overflow-hidden">
      <div
        ref={bgRef}
        className="pointer-events-none absolute inset-0 h-[140%] bg-gradient-to-b from-lime-300/15 to-transparent will-change-transform"
      />
      <div ref={contentRef} className="relative z-10">
        {/* 通常フローの本文 */}
      </div>
    </div>
  );
}
```

### ネイティブ scroll + transform（縮退）

```tsx
// Lenis なし。慣性は失われるが、scroll イベントから直接 transform を更新。
const onScroll = () => {
  const bg = bgRef.current;
  if (bg) bg.style.transform = `translate3d(0, ${wrapper.scrollTop * -0.5}px, 0)`;
};
wrapper.addEventListener("scroll", onScroll, { passive: true });
// cleanup: wrapper.removeEventListener("scroll", onScroll);
```

## Usage

```tsx
<ParallaxHero />
```

## AI Apply Prompt

### Context
`{{target_selector}}` の背景レイヤーを、Lenis のスムーススクロール値で parallax 変位させる。

### Steps
1. `lenis@^1.3` を `{{package_manager}}` で追加。
2. 上記コンポーネントを `{{target_file}}` に追加。サーバコンポーネントから呼ぶ場合は `"use client"` を確認。
3. Lenis は **ネストした wrapper/content** に生成する（`document` 全体ではなく、対象セクションのスクロールコンテナ）。
4. `lenis.on("scroll")` 内で `scroll` 値にレイヤーごとの係数（例 -0.25 / -0.5 / -0.85）を掛け、`translate3d` で変位。React state は更新しない（DOM ref に直接書く）。
5. unmount で `cancelAnimationFrame` + `lenis.destroy()` を必ず実行。
6. Reduce Motion 時は `lerp:1` / `smoothWheel:false` にし、parallax 変位（offset）を 0 にする分岐を維持。

### Verify
- スクロールに追従して背景レイヤーが異なる速度で動き、奥行きが出る
- 本文は変位せず、ネイティブのスクロール量どおりに進む
- Reduce Motion ON でスムージングと parallax が止まり、通常スクロールになる
- unmount 時に rAF と Lenis インスタンスが破棄され、残留ハンドラがない

## Accessibility

- Lenis は `prefers-reduced-motion` を自動尊重しないため、上記のように **手動チェック** が必要。Reduce 時は `lerp:1`・`smoothWheel:false` でネイティブ相当にし、parallax 変位を 0 にする。
- parallax は装飾レイヤーのみ。本文・フォーカス可能要素は通常フローに保ち、スクロールジャックを避ける。

## Performance Notes

- 変位は `translate3d` のみで GPU 合成。`will-change: transform` をレイヤーに付与してレイヤー化を促す。
- `scroll` コールバックは Lenis の rAF ループから呼ばれるため、スクロールイベントを直接購読するより安定する。
- レイヤー数や半透明グラデーションを増やしすぎると合成コストが上がる。3〜4 レイヤー程度に留めるのが目安。

## Changelog

- 2026-06-02 (created): 初版。v1.2（Tier B）、Lenis スムーススクロール parallax の追加。
