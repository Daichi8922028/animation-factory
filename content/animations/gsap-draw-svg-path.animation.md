---
id: gsap-draw-svg-path
name: GSAP DrawSVG Path
version: 1.0.0
release: v1.2
variant: gsap
description: |
  GSAP DrawSVGPlugin で SVG の line / ロゴ風 path を 0%→100% に描画する演出。
  描画の進行を stroke の可視区間で表現し、ロゴ登場・署名・装飾線・イラストの線画化に。

taxonomy:
  layer: [js-runtime, library, css]
  ux_role:
    primary: storytelling
    secondary: [decorative]
  trigger: [viewport]
  media: [svg]
  authoring: code

behavior:
  lifecycle: oneshot
  reversible: false
  replay: every-entry

tags:
  - gsap
  - drawsvg
  - svg
  - stroke
  - path
  - logo
  - line-draw

trigger:
  primary: viewport
  touch_fallback: always-on
  config:
    amount: 0.4

runtime:
  language: typescript
  framework: react
  framework_version: ">=18"
dependencies:
  - { name: gsap, version: "^3.13.0", purpose: "コアタイムライン + DrawSVGPlugin（旧 club、現在は無償）" }
peer_dependencies:
  - { name: react, version: ">=18" }

implementations:
  - tier: 1
    name: "GSAP + DrawSVGPlugin"
    dependencies: [ { name: gsap, version: "^3.13.0" } ]
    browser_support: { baseline: widely-available, baseline_year: 2020 }
    performance: { gpu_accelerated: false, layout_thrash: false, cost: low }
    degrades_to: 2
  - tier: 2
    name: "Vanilla CSS stroke-dashoffset"
    dependencies: []
    browser_support: { baseline: widely-available, baseline_year: 2017 }
    performance: { gpu_accelerated: false, layout_thrash: false, cost: low }
    degradation: "getTotalLength() / pathLength で dasharray を求め CSS で描く。複数パスの精密な timing 制御は DrawSVG ほど容易ではない"

browser_support:
  baseline: widely-available
  baseline_year: 2020
  notes: "代表値は Tier 1（GSAP DrawSVGPlugin）。stroke アニメ自体は 2017 以降広く利用可能"

performance:
  gpu_accelerated: false
  layout_thrash: false
  cost: low
  notes: "stroke-dashoffset の補間のみ。レイアウトを起こさず、再描画コストは path の複雑さ次第で軽量"

parameters:
  - { name: duration_ms, type: number, default: 1600, range: [600, 4000], description: "1 パスを描き切る時間" }
  - { name: stagger_ms,  type: number, default: 180,  range: [0, 600], description: "複数パスの開始ずらし" }
  - { name: ease,        type: enum,   default: "power2.inOut",
      values: ["none", "power1.inOut", "power2.inOut", "power3.out"],
      description: "描画進行のイージング" }

a11y:
  respects_reduced_motion: true
  fallback: "描画アニメを行わず、完成形の path を即座に表示（stroke を最初から全描画）"
  focus_safe: true
  notes: "装飾的な線画には role / aria を付けず（aria-hidden）、意味を持つロゴには <title> を付与してスクリーンリーダーに名称を伝える"

license: MIT
authors: ["@daichi"]
sources:
  - { title: "DrawSVGPlugin 公式ドキュメント", url: "https://gsap.com/docs/v3/Plugins/DrawSVGPlugin/" }
attribution_required: false

preview:
  url: https://animation-factory.app/preview/gsap-draw-svg-path
  loop: true
  duration_ms: 2400

related:
  alternatives: [svg-line-draw, gsap-morph-svg-icon, gsap-scroll-pin]
  composes_with:
    - { id: fade-up, note: "描画完了後にロゴ下のテキストを fade-up で続けると締まる" }
  requires: []

sections:
  skip: [variants]

ai:
  intent_examples:
    - "ロゴが線で描かれていくように登場させたい"
    - "DrawSVG で SVG パスを 0 から 100% まで描く"
    - "署名やイラストの線画が手書きされる演出"
  apply_targets: ["logo", "svg-illustration", "decorative-line", "signature"]
  do_not_apply_to: ["body-text", "data-table", "form", "navigation-bar"]
---

## Overview

GSAP の **DrawSVGPlugin** は SVG の `stroke` を「可視区間」として扱い、`0%` → `100%` の指定だけで path が描かれていく演出を作る。`stroke-dasharray` / `stroke-dashoffset` を手計算する必要がなく、複数パスの timing 制御や逆再生もタイムラインで一元化できるのが利点。

使う場面: ブランドロゴの登場 / 署名・手書き風イラスト / グラフの罫線や装飾ライン。
避けたい場面: 本文・テーブル・フォームなど「描画演出が読みづらさになる」要素。

## Preview

公開プレビュー: https://animation-factory.app/preview/gsap-draw-svg-path

## Implementation

### GSAP + DrawSVGPlugin

```tsx
"use client";
import { useEffect, useRef } from "react";
import gsap from "gsap";
import { DrawSVGPlugin } from "gsap/DrawSVGPlugin";

gsap.registerPlugin(DrawSVGPlugin);

export function DrawSvgPathLogo() {
  const rootRef = useRef<SVGSVGElement>(null);

  useEffect(() => {
    if (!rootRef.current) return;
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    const ctx = gsap.context(() => {
      if (reduce) {
        // 縮退: 完成形を即表示
        gsap.set(".draw-path", { drawSVG: "100%" });
        return;
      }
      gsap.set(".draw-path", { drawSVG: "0%" });
      gsap.to(".draw-path", {
        drawSVG: "100%",
        duration: 1.6,
        ease: "power2.inOut",
        stagger: 0.18,
      });
    }, rootRef);

    return () => ctx.revert();
  }, []);

  return (
    <svg ref={rootRef} viewBox="0 0 200 100" aria-hidden="true">
      <path className="draw-path" d="M10 80 L60 20 L110 80 L160 20"
        fill="none" stroke="#a3e635" strokeWidth={4} />
    </svg>
  );
}
```

### Vanilla CSS stroke-dashoffset（縮退）

```css
/* getTotalLength() で長さ L を取得し --len に注入してから使う */
.draw-path {
  stroke-dasharray: var(--len);
  stroke-dashoffset: var(--len);
  animation: draw 1.6s ease-in-out forwards;
}
@keyframes draw {
  to { stroke-dashoffset: 0; }
}
@media (prefers-reduced-motion: reduce) {
  .draw-path { animation: none; stroke-dashoffset: 0; }
}
```

## Usage

```tsx
<DrawSvgPathLogo />
```

## AI Apply Prompt

### Context
`{{target_selector}}` の SVG path を DrawSVGPlugin で 0%→100% に描画して登場させる。

### Steps
1. `gsap@^3.13` を `{{package_manager}}` で追加（DrawSVGPlugin は現在無償で同梱）。
2. `gsap.registerPlugin(DrawSVGPlugin)` を呼び、対象 path に `fill: none` と `stroke` を設定。
3. `gsap.context()` 内で `gsap.set(path, { drawSVG: "0%" })` → `gsap.to(path, { drawSVG: "100%", ... })`。
4. 複数 path は `stagger` で順に。`gsap.context()` + `ctx.revert()` で unmount 時にクリーンアップ。
5. Reduce Motion 時は `gsap.set(path, { drawSVG: "100%" })` で完成形を即表示する分岐を入れる。

### Examples

Before: 静止した SVG ロゴ
After: `<DrawSvgPathLogo />` で path が描かれて登場

### Verify
- ビューポート進入時に path が 0% から 100% まで描かれる
- 複数 path が stagger で順に描かれる
- Reduce Motion ON で描画アニメが起きず、完成形が即表示される
- unmount 時にエラーや残留 tween がない（`ctx.revert()` が効いている）

## Accessibility

- 装飾線は `aria-hidden="true"` を付け、スクリーンリーダーから隠す。
- 意味を持つロゴは `<svg role="img">` + `<title>` で名称を伝える。描画演出の有無に依存させない。
- `prefers-reduced-motion` を手動チェックし、Reduce Motion 時は完成形を即表示する。

## Performance Notes

- DrawSVGPlugin は `stroke-dashoffset` 相当の補間のみで、レイアウトを起こさない。
- コストは path の複雑さ（点数・フィルタ）に比例。重いフィルタやシャドウは描画中フレーム落ちの原因になりうる。
- `gsap.context()` + `ctx.revert()` で React の unmount 時に tween が確実に破棄される構成にする。

## Changelog

- 2026-06-02 (created): 初版。v1.2（Tier B）、GSAP クラブプラグイン（DrawSVGPlugin）拡充の一環。
