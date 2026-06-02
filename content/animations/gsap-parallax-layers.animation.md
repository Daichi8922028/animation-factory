---
id: gsap-parallax-layers
name: GSAP Parallax Layers
version: 1.0.0
release: v1.2
variant: gsap-scrolltrigger
description: |
  GSAP ScrollTrigger で背景・中景・前景の複数レイヤーを異なる速度でスクロール parallax させる
  storytelling 演出。奥行きと没入感を生み、ヒーローやセクション見出しの導入に効果的。

taxonomy:
  layer: [css, js-runtime, library]
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
  - gsap
  - scrolltrigger
  - parallax
  - layers
  - depth
  - storytelling
  - scrollytelling

trigger:
  primary: scroll-progress
  touch_fallback: always-on
  config:
    start: "top bottom"
    end: "bottom top"
    scrub: true

runtime:
  language: typescript
  framework: react
  framework_version: ">=18"
dependencies:
  - { name: gsap, version: "^3.13.0", purpose: "ScrollTrigger を含むコアタイムライン" }
peer_dependencies:
  - { name: react, version: ">=18" }

implementations:
  - tier: 1
    name: "GSAP + ScrollTrigger"
    dependencies: [ { name: gsap, version: "^3.13.0" } ]
    browser_support: { baseline: widely-available, baseline_year: 2020 }
    performance: { gpu_accelerated: true, layout_thrash: false, cost: medium }
    degrades_to: 2
  - tier: 2
    name: "CSS scroll-driven animation (animation-timeline: scroll())"
    dependencies: []
    browser_support: { baseline: newly-available, baseline_year: 2024 }
    performance: { gpu_accelerated: true, layout_thrash: false, cost: low }
    degradation: "JS なしで各レイヤーを translateY する簡易 parallax。スクロール進行の細かな同期や reverse は限定的"

browser_support:
  baseline: widely-available
  baseline_year: 2020
  notes: "代表値は Tier 1（GSAP）。Tier 2 の CSS scroll-driven は 2024 newly-available で未対応ブラウザは静止表示に縮退"

performance:
  gpu_accelerated: true
  layout_thrash: false
  cost: medium
  notes: "各レイヤーは transform: translateY のみ補間。scrub: true で rAF 追従。レイヤー数を増やしすぎるとペイント負荷が上がる"

parameters:
  - { name: layer_count, type: number, default: 3, range: [2, 5], description: "視差を付けるレイヤー数（背景/中景/前景 など）" }
  - { name: depth_factor, type: number, default: 0.5, range: [0.1, 1], description: "奥のレイヤーほど遅く動かす係数。0 で固定、1 で等速" }
  - { name: scrub, type: enum, default: "true", values: ["true", "false", "smoothed-number"], description: "スクロール量に進行を直結。true で完全追従、数値でイージング" }

a11y:
  respects_reduced_motion: true
  fallback: "ScrollTrigger を生成せず、全レイヤーを静止配置のまま重ねて表示する"
  focus_safe: true
  notes: "視差は装飾であり情報を持たない。Reduce Motion 時は完全無効化。レイヤー内のテキストは parallax せず可読性を保つ"

license: MIT
authors: ["@daichi"]
sources:
  - { title: "ScrollTrigger 公式ドキュメント", url: "https://gsap.com/docs/v3/Plugins/ScrollTrigger/" }
  - { title: "CSS scroll-driven animations", url: "https://developer.mozilla.org/en-US/docs/Web/CSS/animation-timeline/scroll" }
attribution_required: false

preview:
  url: https://animation-factory.app/preview/gsap-parallax-layers
  loop: true
  duration_ms: 2800

related:
  alternatives: [gsap-scroll-pin, css-scroll-driven, scroll-reveal]
  composes_with:
    - { id: fade-up, note: "前景レイヤーの見出しを fade-up で登場させると視差と相乗する" }
    - { id: text-reveal-lines, note: "parallax 背景の上にテキストを行単位で出すと storytelling が強まる" }
  requires: []

sections:
  skip: [variants]

ai:
  intent_examples:
    - "スクロールで背景と前景が違う速度で動く視差効果を付けたい"
    - "ヒーローセクションに奥行きのある parallax を入れる"
    - "ScrollTrigger で複数レイヤーをパララックスさせたい"
  apply_targets: ["hero-section", "landing-header", "story-section"]
  do_not_apply_to: ["form", "data-table", "navigation-bar", "body-text"]
---

## Overview

背景・中景・前景といった複数のレイヤーを、スクロール進行に対して **異なる速度** で `translateY` させることで奥行き（parallax）を生む。奥のレイヤーほど遅く（`depth_factor` を小さく）、手前ほど速く動かすと、視線が画面に引き込まれる storytelling 効果になる。GSAP ScrollTrigger の `scrub` でスクロール量に進行を直結する。

使う場面: ランディングのヒーロー / ストーリー型セクションの導入 / 写真やイラストの重ね合わせ。
避けたい場面: フォームやデータ表（操作の邪魔）、本文、ナビバー、動きに敏感なユーザー向けの主要導線。

## Preview

公開プレビュー: https://animation-factory.app/preview/gsap-parallax-layers

## Implementation

### GSAP + ScrollTrigger

```tsx
"use client";
import { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

export function ParallaxLayers() {
  const rootRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!rootRef.current) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    gsap.registerPlugin(ScrollTrigger);

    const ctx = gsap.context(() => {
      // data-speed が小さいほど遅く動く（奥のレイヤー）
      gsap.utils.toArray<HTMLElement>(".parallax-layer").forEach((layer) => {
        const speed = Number(layer.dataset.speed ?? "0.5");
        gsap.to(layer, {
          yPercent: -100 * speed,
          ease: "none",
          scrollTrigger: {
            trigger: rootRef.current,
            start: "top bottom",
            end: "bottom top",
            scrub: true,
          },
        });
      });
    }, rootRef);

    return () => ctx.revert();
  }, []);

  return (
    <div ref={rootRef} className="relative overflow-hidden">
      <div className="parallax-layer" data-speed="0.2">背景</div>
      <div className="parallax-layer" data-speed="0.5">中景</div>
      <div className="parallax-layer" data-speed="0.9">前景</div>
    </div>
  );
}
```

### CSS scroll-driven animation（縮退）

```css
/* JS なしで各レイヤーを translateY する簡易 parallax。
   対応ブラウザのみ。未対応では静止表示にフォールバック。 */
@supports (animation-timeline: scroll()) {
  .parallax-layer {
    animation: parallax-rise linear both;
    animation-timeline: scroll();
  }
  .parallax-layer[data-speed="0.2"] { --shift: -20px; }
  .parallax-layer[data-speed="0.5"] { --shift: -60px; }
  .parallax-layer[data-speed="0.9"] { --shift: -120px; }
}
@keyframes parallax-rise {
  to { transform: translateY(var(--shift, -60px)); }
}
@media (prefers-reduced-motion: reduce) {
  .parallax-layer { animation: none; }
}
```

## Usage

```tsx
<ParallaxLayers />
```

## AI Apply Prompt

### Context
`{{target_selector}}` の中に背景/中景/前景の 3 レイヤーを置き、スクロールで異なる速度の parallax を付ける。

### Steps
1. `gsap@^3.13` を `{{package_manager}}` で追加。
2. 上記コンポーネントを `{{target_file}}` に追加。サーバコンポーネントから呼ぶ場合は `"use client"` を確認。
3. 各レイヤーに `class="parallax-layer"` と `data-speed`（奥ほど小さい値）を付与。
4. `start: "top bottom"` / `end: "bottom top"` でコンテナがビューポートを通過する間ずっと追従させる。
5. `gsap.context()` と `ctx.revert()` を必ず併用（unmount で確実にクリーンアップ）。
6. Reduce Motion 設定時は ScrollTrigger を作らない分岐（上記）を維持する。

### Examples

Before: 静止した重ね画像のヒーロー
After: `<ParallaxLayers />` で各レイヤーが異なる速度でスクロール追従

### Verify
- スクロールに応じて背景がゆっくり、前景が速く動く
- レイヤー間に視差（奥行き）が感じられる
- Reduce Motion ON で全レイヤーが静止し、内容は欠けない
- unmount 時にエラーや残留ハンドラがない（`ctx.revert()` が効いている）

## Accessibility

- ScrollTrigger は `prefers-reduced-motion` を自動尊重しないため、上記のように **手動チェック** が必要。
- parallax は装飾であり情報を伝えない。テキストなどの意味のある内容は視差させず、可読性を保つ。
- Reduce Motion 時は全レイヤーを静止配置にし、レイアウトが崩れないことを確認する。

## Performance Notes

- 各レイヤーは `transform: translateY`（`yPercent`）のみ補間し、GPU で完結する。
- ScrollTrigger は rAF ベースでスクロールイベントを直接購読しないため軽い。
- レイヤー数（`layer_count`）や大きな画像を増やすとペイント負荷が上がる。`will-change: transform` を補助に。
- `gsap.context()` + `ctx.revert()` で React の unmount 時に ScrollTrigger インスタンスが必ず破棄される構成にする。

## Changelog

- 2026-06-02 (created): 初版。v1.2（Tier B）、GSAP ScrollTrigger による複数レイヤー parallax の追加。
