---
id: gsap-morph-svg-icon
name: GSAP MorphSVG Icon
version: 1.0.0
release: v1.2
variant: gsap
description: |
  GSAP MorphSVGPlugin で複数の inline SVG アイコンの path 形状を相互にモーフィングし続ける
  micro-interaction。再生 / 一時停止 / お気に入り / メニューなど、状態を持つアイコンの
  滑らかな形状遷移や、装飾的なループ演出に使う。

taxonomy:
  layer: [js-runtime, library, css]
  ux_role:
    primary: micro-interaction
    secondary: [delight, feedback]
  trigger: [autoplay]
  media: [svg]
  authoring: code

behavior:
  lifecycle: continuous
  reversible: true
  replay: every-entry

tags:
  - gsap
  - morphsvg
  - svg
  - icon
  - morph
  - path
  - micro-interaction

trigger:
  primary: autoplay
  touch_fallback: always-on
  config:
    repeat: -1
    repeat_delay: 0.6

runtime:
  language: typescript
  framework: react
  framework_version: ">=18"
dependencies:
  - { name: gsap, version: "^3.13.0", purpose: "MorphSVGPlugin を含むコアタイムライン（club プラグインは現在無償）" }
peer_dependencies:
  - { name: react, version: ">=18" }

implementations:
  - tier: 1
    name: "GSAP + MorphSVGPlugin"
    dependencies: [ { name: gsap, version: "^3.13.0" } ]
    browser_support: { baseline: widely-available, baseline_year: 2020 }
    performance: { gpu_accelerated: false, layout_thrash: false, cost: medium }
    degrades_to: 2
  - tier: 2
    name: "CSS opacity クロスフェード（縮退）"
    dependencies: []
    browser_support: { baseline: widely-available, baseline_year: 2017 }
    performance: { gpu_accelerated: true, layout_thrash: false, cost: low }
    degradation: "path の中間形状は補間できない。複数アイコンを重ね、opacity でクロスフェードするだけの簡易代替"

browser_support:
  baseline: widely-available
  baseline_year: 2020
  notes: "代表値は Tier 1（GSAP）。SVG path の d 属性補間は MorphSVGPlugin が担い、ブラウザ依存はない"

performance:
  gpu_accelerated: false
  layout_thrash: false
  cost: medium
  notes: "d 属性を毎フレーム書き換えるため CPU 上のパス計算が主。GPU 合成には乗らないが、要素数が少なければ軽い"

parameters:
  - { name: duration_ms, type: number, default: 600, range: [200, 1500], description: "1 回のモーフ遷移にかける時間" }
  - { name: repeat_delay_ms, type: number, default: 600, range: [0, 2000], description: "各アイコンで静止する間隔" }
  - { name: ease, type: enum, default: "power2.inOut",
      values: ["power2.inOut", "power1.inOut", "none", "elastic.out"],
      description: "形状補間のイージング" }

a11y:
  respects_reduced_motion: true
  fallback: "ループを生成せず、代表アイコン 1 つを静止表示する"
  focus_safe: true
  notes: "装飾目的の場合は aria-hidden=\"true\"。意味を持つアイコンなら role/aria-label で状態をテキストでも伝える"

license: MIT
authors: ["@daichi"]
sources:
  - { title: "MorphSVGPlugin 公式ドキュメント", url: "https://gsap.com/docs/v3/Plugins/MorphSVGPlugin/" }
attribution_required: false

preview:
  url: https://animation-factory.app/preview/gsap-morph-svg-icon
  loop: true
  duration_ms: 2400

related:
  alternatives: [svg-line-draw, scale-in, fade-up]
  composes_with:
    - { id: hover-glow, note: "モーフ中のアイコンに hover-glow を重ねると注目度が上がる" }
  requires: []

sections:
  skip: [variants]

ai:
  intent_examples:
    - "再生ボタンと一時停止ボタンのアイコンを滑らかに形状変化させたい"
    - "MorphSVG で複数アイコンをループでモーフィングする装飾"
    - "ハートやチェックなど SVG アイコンの形を相互に変形させたい"
  apply_targets: ["icon-button", "play-pause-toggle", "decorative-icon"]
  do_not_apply_to: ["body-text", "data-table", "navigation-label", "form-field"]
---

## Overview

GSAP の **MorphSVGPlugin** は SVG `path` の `d` 属性を補間し、ある形状から別の形状へ滑らかに変形させる。本アニメーションは 2〜3 個の inline SVG アイコン（例: 再生 → 一時停止 → ハート）の path を順番に相互モーフし、`repeat: -1` で連続ループさせる micro-interaction。

使う場面: アイコンボタンの状態遷移（再生/停止、メニュー/閉じる）、ヒーローやローディングの装飾的アクセント。
避けたい場面: 本文、データテーブル、意味を形状でしか伝えないナビゲーションラベル。

## Preview

公開プレビュー: https://animation-factory.app/preview/gsap-morph-svg-icon

## Implementation

### GSAP + MorphSVGPlugin

```tsx
"use client";
import { useEffect, useRef } from "react";
import gsap from "gsap";
import { MorphSVGPlugin } from "gsap/MorphSVGPlugin";

gsap.registerPlugin(MorphSVGPlugin);

// 3 つのアイコン path（同じ viewBox / 同じ単一 path 構成にすると破綻しにくい）
const PLAY = "M8 5v14l11-7z";
const PAUSE = "M6 5h4v14H6zM14 5h4v14h-4z";
const HEART = "M12 21s-7-4.3-9.3-8.4C1 9 3 5.5 6.5 5.5c2 0 3.5 1.3 5.5 3.3 2-2 3.5-3.3 5.5-3.3C25 5.5 23 9 21.3 12.6 19 16.7 12 21 12 21z";

export function MorphIcon() {
  const pathRef = useRef<SVGPathElement>(null);

  useEffect(() => {
    if (!pathRef.current) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const ctx = gsap.context(() => {
      const tl = gsap.timeline({ repeat: -1, repeatDelay: 0.6 });
      tl.to(pathRef.current, { duration: 0.6, morphSVG: PAUSE, ease: "power2.inOut" })
        .to(pathRef.current, { duration: 0.6, morphSVG: HEART, ease: "power2.inOut" }, "+=0.6")
        .to(pathRef.current, { duration: 0.6, morphSVG: PLAY, ease: "power2.inOut" }, "+=0.6");
    });

    return () => ctx.revert();
  }, []);

  return (
    <svg viewBox="0 0 24 24" width="48" height="48" aria-hidden="true">
      <path ref={pathRef} d={PLAY} fill="#a3e635" />
    </svg>
  );
}
```

### CSS opacity クロスフェード（縮退）

```css
/* path の中間形状は出せない。複数アイコンを重ね、opacity で順に切り替えるだけの簡易代替。 */
.morph-fallback svg { position: absolute; inset: 0; animation: morphfade 3.6s infinite; }
.morph-fallback svg:nth-child(2) { animation-delay: 1.2s; }
.morph-fallback svg:nth-child(3) { animation-delay: 2.4s; }
@keyframes morphfade {
  0%, 27%, 100% { opacity: 0; }
  5%, 22% { opacity: 1; }
}
@media (prefers-reduced-motion: reduce) {
  .morph-fallback svg { animation: none; }
  .morph-fallback svg:not(:first-child) { opacity: 0; }
}
```

## Usage

```tsx
<MorphIcon />
```

## AI Apply Prompt

### Context
`{{target_selector}}` の単一 SVG `path` を、複数のアイコン形状の間でループ・モーフさせる。

### Steps
1. `gsap@^3.13`（MorphSVGPlugin を含む）を `{{package_manager}}` で追加。
2. 上記コンポーネントを `{{target_file}}` に追加。サーバコンポーネントから呼ぶ場合は `"use client"` を確認。
3. モーフ対象の各アイコンを **同一 viewBox の単一 path** として用意する（path 数が一致しない形状は MorphSVGPlugin の `shapeIndex` 調整が必要）。
4. `gsap.context()` と `ctx.revert()` を必ず併用し、unmount で timeline を破棄する。
5. Reduce Motion 設定時は timeline を作らず代表アイコンを静止表示する分岐（上記）を維持する。

### Examples

Before: `d` 固定の静的アイコン
After: `<MorphIcon />` で複数形状を連続モーフ

### Verify
- アイコンの path が滑らかに別形状へ変形し、ループする
- Reduce Motion ON でモーフが起きず、代表アイコンが静止表示される
- unmount 時にエラーや残留 timeline がない（`ctx.revert()` が効いている）

## Accessibility

- 装飾用途では `aria-hidden="true"` を付け、スクリーンリーダーから隠す。
- 状態（再生/停止など）を意味する場合は形状だけに頼らず、`aria-label` やテキストで現在状態を伝える。
- MorphSVGPlugin は `prefers-reduced-motion` を自動尊重しないため、上記のように **手動チェック** で timeline 生成を抑止する。

## Performance Notes

- `d` 属性を毎フレーム再計算するため、コストは CPU 側のパス補間が主。GPU 合成には乗らない。
- モーフ対象は同時に少数（1〜3 path）に留めると軽い。複雑な path や多数同時モーフはフレーム落ちの原因。
- `gsap.context()` + `ctx.revert()` で React unmount 時に timeline が確実に破棄される構成にする。

## Changelog

- 2026-06-02 (created): 初版。v1.2（Tier B）GSAP club プラグイン拡充、MorphSVGPlugin による SVG アイコンモーフ。
