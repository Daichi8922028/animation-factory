---
id: anime-svg-line-draw
name: Anime.js SVG Line Draw
version: 1.0.0
release: v1.2
variant: anime-js
description: |
  anime.js v4 の svg.createDrawable で SVG の stroke を線画（0→1）として描画し、
  消去してループ再生するスクロリーテリング系の演出。ロゴ・アイコン・図版の登場に。
  viewport in で発火し、複数 path を stagger で順に描く。

taxonomy:
  layer: [js-runtime, library]
  ux_role:
    primary: storytelling
    secondary: [reveal]
  trigger: [viewport]
  media: [svg]
  authoring: code

behavior:
  lifecycle: continuous
  reversible: true
  replay: every-entry

tags:
  - animejs
  - svg
  - line-draw
  - stroke
  - createDrawable
  - storytelling
  - loop

trigger:
  primary: viewport
  touch_fallback: always-on
  config:
    threshold: 0.4
    once: false

runtime:
  language: typescript
  framework: react
  framework_version: ">=19"
dependencies:
  - { name: animejs, version: "^4.0.0", purpose: "svg.createDrawable + animate による stroke 描画" }
peer_dependencies:
  - { name: react, version: ">=18" }

implementations:
  - tier: 1
    name: "anime.js v4 svg.createDrawable"
    dependencies: [ { name: animejs, version: "^4.0.0" } ]
    browser_support: { baseline: widely-available, baseline_year: 2020 }
    performance: { gpu_accelerated: false, layout_thrash: false, cost: low }
    degrades_to: 2
  - tier: 2
    name: "Vanilla CSS stroke-dashoffset"
    dependencies: []
    browser_support: { baseline: widely-available, baseline_year: 2016 }
    performance: { gpu_accelerated: false, layout_thrash: false, cost: low }
    degradation: "stagger / 細かな描画進行制御は不可。単一 path を一定速度で描くだけの簡易代替"

browser_support:
  baseline: widely-available
  baseline_year: 2020
  notes: "代表値は Tier 1（anime.js v4）。stroke-dasharray/offset を JS で補間。SVG geometry に依存"

performance:
  gpu_accelerated: false
  layout_thrash: false
  cost: low
  notes: "stroke-dashoffset の補間のみ。レイアウトを揺らさず、path 数が多くなければ軽量"

parameters:
  - { name: duration_ms, type: number, default: 2600, range: [800, 6000], description: "1 本あたりの描画時間" }
  - { name: stagger_ms,  type: number, default: 220,  range: [0, 600], description: "path 間の描き始めの遅延" }
  - { name: loop,        type: boolean, default: true, description: "描画→消去を繰り返すか" }

a11y:
  respects_reduced_motion: true
  fallback: "描画アニメを行わず draw 0→1 の完成形を即表示（線画は最初から見える）"
  focus_safe: true
  notes: "装飾的な線画には role=\"img\" + aria-label を付与し、意味を伝える。動きに依存しない"

license: MIT
authors: ["@daichi"]
sources:
  - { title: "anime.js v4 SVG createDrawable ドキュメント", url: "https://animejs.com/documentation/svg/draw-svg-lines" }

preview:
  url: https://animation-factory.app/preview/anime-svg-line-draw
  loop: true
  duration_ms: 3200

related:
  alternatives: [svg-line-draw, gsap-draw-svg-path, scroll-reveal]
  composes_with:
    - { id: fade-up, note: "線画の完成に合わせて見出しを fade-up で出すと自然" }
  requires: []

sections:
  skip: [variants]

ai:
  intent_examples:
    - "ロゴを線画で描き起こすアニメーションにしたい"
    - "anime.js で SVG のストロークを 0 から 1 へ描く"
    - "アイコンが手書き風に描かれてループする演出"
  apply_targets: ["logo", "svg-illustration", "hero-icon"]
  do_not_apply_to: ["body-text", "data-table", "form", "navigation-bar"]
---

## Overview

anime.js v4 の `svg.createDrawable()` は SVG の `<path>` / `<line>` 等を **drawable** 化し、`draw` プロパティ（`"start end"` の 0–1 範囲）で stroke の描画区間を制御できるようにする。`animate(targets, { draw: ["0 0", "0 1", "1 1"] })` のように与えると、線が **描かれ → 消える** 一連の線画ループになる。複数 path を `stagger()` で順に描けば、ロゴやアイコンの登場演出になる。

使う場面: ロゴの描き起こし / アイコンのイントロ / 図版の段階的な提示（スクロリーテリング）。
避けたい場面: 本文、データテーブル、フォーム、ナビバー（線画の動きが文脈に合わない）。

## Preview

公開プレビュー: https://animation-factory.app/preview/anime-svg-line-draw

## Implementation

### anime.js v4 svg.createDrawable

```tsx
"use client";
import { useEffect, useRef } from "react";
import { animate, stagger, svg } from "animejs";
import type { JSAnimation } from "animejs";

export function LogoLineDraw() {
  const rootRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;

    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const paths = svg.createDrawable(root.querySelectorAll(".draw-line"));

    if (reduce) {
      animate(paths, { draw: "0 1", duration: 0 }); // 完成形を即表示
      return;
    }

    const anim: JSAnimation = animate(paths, {
      draw: ["0 0", "0 1", "1 1"], // 描く → 消す
      duration: 2600,
      delay: stagger(220),
      loop: true,
      loopDelay: 600,
      ease: "inOutQuad",
    });

    return () => anim.revert(); // unmount で必ずクリーンアップ
  }, []);

  return (
    <div ref={rootRef}>
      <svg viewBox="0 0 280 160" role="img" aria-label="線画ロゴ">
        <path className="draw-line" d="M24 124 L78 36 L134 124 L190 36 L246 124"
          fill="none" stroke="#a3e635" strokeWidth={5}
          strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    </div>
  );
}
```

### Vanilla CSS stroke-dashoffset（縮退）

```css
/* anime.js を使わずに単一 path を一定速度で描くだけの簡易代替。
   stagger や細かな進行制御はできない。 */
.draw-line {
  stroke-dasharray: 1000;
  stroke-dashoffset: 1000;
  animation: line-draw 2.6s ease-in-out infinite;
}
@keyframes line-draw {
  0%   { stroke-dashoffset: 1000; }
  60%  { stroke-dashoffset: 0; }
  100% { stroke-dashoffset: -1000; }
}
@media (prefers-reduced-motion: reduce) {
  .draw-line { animation: none; stroke-dashoffset: 0; }
}
```

## Usage

```tsx
<LogoLineDraw />
```

## AI Apply Prompt

### Context
`{{target_selector}}` 内の SVG `<path>`（クラス `draw-line`）を anime.js v4 の `svg.createDrawable` で線画ループにする。

### Steps
1. `animejs@^4.0.0` を `{{package_manager}}` で追加。
2. 上記コンポーネントを `{{target_file}}` に追加。サーバコンポーネントから呼ぶ場合は `"use client"` を確認。
3. `import { animate, stagger, svg } from "animejs";`（named import。default import ではない）。
4. `svg.createDrawable(selector)` の戻り値を `animate(..., { draw: ["0 0","0 1","1 1"] })` の target に渡す。
5. `useEffect` 内で `animate` の戻り値を保持し、cleanup で `.revert()` を呼ぶ。
6. Reduce Motion 設定時は `draw: "0 1"` の完成形を即表示する分岐（上記）を維持。

### Verify
- ロード後、線が 0 から 1 へ描かれ、複数 path が stagger で順に登場する
- `loop: true` で描画→消去が繰り返される
- Reduce Motion ON で線が即完成形になり、描画アニメが走らない
- unmount 時にエラーや残留タイマーがない（`.revert()` が効いている）
- SVG に `role="img"` + `aria-label` が付き、意味が伝わる

## Accessibility

- anime.js は `prefers-reduced-motion` を自動尊重しないため、上記のように **手動チェック** が必要。
- 線画は装飾になりがち。意味のある図版なら `role="img"` + `aria-label`（または `<title>`）を付け、動きに依存せず内容が伝わるようにする。
- フォーカス可能要素は含めない（純粋な描画演出）。`focus_safe`。

## Performance Notes

- `svg.createDrawable` は `stroke-dasharray` / `stroke-dashoffset` を JS で補間する。レイアウトを揺らさず、GPU 合成ではないが path 数が少なければ軽量（cost: low）。
- path 数や全長が大きいと描画コストが上がる。複雑な図版は path を分割しすぎない。
- `useEffect` で `animate` インスタンスを保持し、unmount 時に `.revert()`（または `.pause()` + target 解放）で確実に破棄する。

## Changelog

- 2026-06-02 (created): 初版。v1.2（Tier B）、anime.js variant の svg.createDrawable 線画ループ。
