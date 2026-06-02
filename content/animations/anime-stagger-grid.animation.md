---
id: anime-stagger-grid
name: Anime.js Stagger Grid
version: 1.0.0
release: v1.2
variant: anime-js
description: |
  anime.js v4 の stagger（grid 指定）でグリッドのセルが中心から波状に拡散しながら
  順次登場する演出。ループ再生で常時アニメーション。ダッシュボードのタイル群、
  ギャラリー、機能カードのエントランスに。
taxonomy:
  layer: [js-runtime, library]
  ux_role:
    primary: state-transition
    secondary: [entrance]
  trigger: [viewport]
  media: [dom-css]
  authoring: code
behavior:
  lifecycle: continuous
  reversible: true
  replay: every-entry
tags:
  - animejs
  - stagger
  - grid
  - wave
  - entrance
  - timeline
trigger:
  primary: viewport
  touch_fallback: always-on
  config:
    grid: [6, 4]
    from: center
    delay_step_ms: 60
runtime:
  language: typescript
  framework: react
  framework_version: ">=18"
dependencies:
  - { name: animejs, version: "^4.0.0", purpose: "animate + stagger（grid）でセル群を波状に駆動" }
peer_dependencies:
  - { name: react, version: ">=18" }
implementations:
  - tier: 1
    name: "anime.js v4 stagger (grid)"
    dependencies: [ { name: animejs, version: "^4.0.0" } ]
    browser_support: { baseline: widely-available, baseline_year: 2020 }
    performance: { gpu_accelerated: true, layout_thrash: false, cost: low }
    degrades_to: 2
  - tier: 2
    name: "CSS transition-delay 段階指定（縮退）"
    dependencies: []
    browser_support: { baseline: widely-available, baseline_year: 2017 }
    performance: { gpu_accelerated: true, layout_thrash: false, cost: low }
    degradation: "中心からの距離ベースの 2 次元波は出せない。行ごとの一次元 transition-delay で近似する簡易代替"
browser_support:
  baseline: widely-available
  baseline_year: 2020
  notes: "代表値は Tier 1（anime.js v4）。transform / opacity のみ補間し GPU 内で完結。Tier 2 は機能縮退で波の方向性が失われる"
performance:
  gpu_accelerated: true
  layout_thrash: false
  cost: low
  notes: "translateY / scale / opacity のみ補間。レイアウトを発生させず、stagger は計算済みの delay 配列を適用するだけで安価"
parameters:
  - { name: grid, type: tuple, default: [6, 4], range: [[2, 2], [12, 12]], description: "stagger のグリッド寸法 [columns, rows]" }
  - { name: from, type: enum, default: "center", values: ["first", "last", "center", "index"], description: "波の起点。中心 / 端 / 任意 index" }
  - { name: delay_step_ms, type: number, default: 60, range: [20, 200], description: "隣接セル間の遅延量（stagger の刻み）" }
a11y:
  respects_reduced_motion: true
  fallback: "波状の登場を無効化し、全セルを即時 opacity:1 / transform:none で表示（情報は欠落しない）"
  focus_safe: true
  notes: "装飾的な登場演出。フォーカス順や DOM 順は変えない。Reduce Motion ではループを生成せず静止表示にする"
license: MIT
authors: ["@daichi"]
sources:
  - { title: "anime.js v4 Stagger ドキュメント", url: "https://animejs.com/documentation/stagger" }
  - { title: "anime.js v4 Grid staggering", url: "https://animejs.com/documentation/stagger/grid-values" }
attribution_required: false
preview:
  url: https://animation-factory.app/preview/anime-stagger-grid
  loop: true
  duration_ms: 2600
related:
  alternatives: [entrance-stagger-fade, scale-in, fade-up]
  composes_with:
    - { id: fade-up, note: "個々のセル内テキストを fade-up で重ねると密度が上がる" }
    - { id: gsap-scroll-pin, note: "pin したセクション内でグリッドを波状登場させると導入が映える" }
  requires: []
sections:
  skip: [variants]
ai:
  intent_examples:
    - "グリッドのカードが中心から波のように順に出てくる演出にしたい"
    - "anime.js の stagger でタイルを波状に登場させる"
    - "ダッシュボードのタイル群をループで波打たせたい"
  apply_targets: ["card-grid", "gallery", "dashboard-tiles", "feature-grid"]
  do_not_apply_to: ["body-text", "form", "data-table", "navigation-bar"]
---

## Overview

anime.js v4 の `stagger()` に `grid` と `from` を渡すと、各ターゲットの **グリッド上の位置から起点までの距離** に応じた遅延が自動計算される。これを `animate()` の `delay` に渡すことで、セルが中心から外側へ（または端から）**波状に拡散** しながら登場する 2 次元 stagger を実現する。

ループ再生（`loop: true`, `alternate: true`）で常時アニメーションし、カタログのサムネイルとしても映える。

使う場面: ダッシュボードのタイル群 / ギャラリー / 機能カードのエントランス。
避けたい場面: 本文・フォーム・データテーブルなど情報密度が高く動きが邪魔になる箇所。

## Preview

公開プレビュー: https://animation-factory.app/preview/anime-stagger-grid

## Implementation

### anime.js v4 stagger (grid)

```tsx
"use client";
import { useEffect, useRef } from "react";
import { animate, stagger } from "animejs";

export function StaggerGrid() {
  const rootRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const cells = root.querySelectorAll<HTMLElement>(".cell");
    const anim = animate(cells, {
      scale: [0.2, 1],
      opacity: [0, 1],
      translateY: [16, 0],
      ease: "outElastic(1, .6)",
      duration: 900,
      delay: stagger(60, { grid: [6, 4], from: "center" }),
      loop: true,
      alternate: true,
    });

    return () => {
      anim.pause();
      anim.revert(); // インラインスタイルを除去して原状回復
    };
  }, []);

  return (
    <div ref={rootRef} className="grid grid-cols-6 gap-3">
      {Array.from({ length: 24 }, (_, i) => (
        <div key={i} className="cell h-10 rounded-md bg-lime-300" />
      ))}
    </div>
  );
}
```

### CSS transition-delay 段階指定（縮退）

```css
/* 2 次元の中心起点の波は出せない。行ごとの一次元 delay で近似する簡易代替。 */
.cell {
  opacity: 0;
  transform: translateY(16px) scale(0.2);
  transition: opacity 600ms ease, transform 600ms ease;
}
.cell.is-in {
  opacity: 1;
  transform: none;
}
.cell:nth-child(6n + 1) { transition-delay: 0ms; }
.cell:nth-child(6n + 2) { transition-delay: 60ms; }
.cell:nth-child(6n + 3) { transition-delay: 120ms; }
/* ...列ごとに段階を付与。中心からの距離ではなく左→右の一次元波になる */
```

## Usage

```tsx
<StaggerGrid />
```

## AI Apply Prompt

### Context
`{{target_selector}}` のグリッド子要素を anime.js の stagger（grid + from:center）で波状に登場させ、ループ再生する。

### Steps
1. `animejs@^4.0.0` を `{{package_manager}}` で追加。
2. 上記コンポーネントを `{{target_file}}` に追加。サーバコンポーネントから呼ぶ場合は `"use client"` を確認。
3. `stagger(delay_step, { grid: [cols, rows], from })` の `grid` を実際の列数・行数に合わせる。
4. `useEffect` 内で `animate()` の戻り値を保持し、cleanup で `anim.pause()` + `anim.revert()` を必ず呼ぶ。
5. `prefers-reduced-motion: reduce` のときは `animate()` を呼ばず静止表示にする分岐（上記）を維持する。

### Examples

Before: 静的なカードグリッド
After: `<StaggerGrid />` で中心から波状に登場するグリッド

### Verify
- セルが中心から外側へ順に拡散しながら登場し、ループで往復する
- `grid` の値を変えると波の形（起点・伝播方向）が変わる
- Reduce Motion ON で波が発生せず、全セルが即時表示される
- unmount 時にエラーや残留アニメーションがない（`pause()` + `revert()` が効いている）

## Accessibility

- anime.js は `prefers-reduced-motion` を自動尊重しないため、上記のように **手動チェック** が必須。Reduce Motion では `animate()` を生成せず、全セルを静止表示にする。
- 純粋に装飾的な登場演出であり、フォーカス順・DOM 順・読み上げ順には影響しない（`focus_safe`）。
- セル内に意味のある情報を載せる場合、アニメーションの有無に関わらず情報が取得できることを保証する。

## Performance Notes

- 補間対象は `transform`（translateY / scale）と `opacity` のみで、レイアウト・ペイントを発生させず GPU 合成で完結する。
- `stagger()` は描画前に delay 配列を一度計算するだけで、フレームごとのコストは持たない。セル数が数百を超える場合のみ DOM 数に注意。
- `loop: true` の常時再生はタブ非表示時にブラウザが rAF を間引くため負荷は限定的。長時間放置するページでは IntersectionObserver で `pause()` する補助を検討。

## Changelog

- 2026-06-02 (created): 初版。v1.2（Tier B）、anime.js v4 stagger 系の grid 波状エントランスを追加。
