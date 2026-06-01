---
id: gsap-scroll-pin
name: Scroll Pin (GSAP)
version: 1.0.0
release: v1.0
variant: gsap-scrolltrigger
description: |
  GSAP ScrollTrigger でセクションをビューポートに pin し、スクロール進行に合わせて
  内側のコンテンツ（テキスト・図版・カウンタ等）が進む演出。スクロリーテリングの基本パターン。

taxonomy:
  layer: [library, js-runtime]
  ux_role:
    primary: storytelling
    secondary: [scroll-progress]
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
  - pin
  - scrollytelling
  - parallax
  - storytelling

trigger:
  primary: scroll-progress
  touch_fallback: always-on
  config:
    start: "top top"
    end: "+=800"
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
    name: "CSS position: sticky"
    dependencies: []
    browser_support: { baseline: widely-available, baseline_year: 2018 }
    performance: { gpu_accelerated: true, layout_thrash: false, cost: low }
    degradation: "スクロール進行に応じた内側の変化は出せない。固定位置に張り付くだけの簡易代替"

browser_support:
  baseline: widely-available
  baseline_year: 2020
  notes: "代表値は Tier 1（GSAP）。Tier 2 sticky は機能縮退、storytelling は失われる"

performance:
  gpu_accelerated: true
  layout_thrash: false
  cost: medium
  notes: "ScrollTrigger は requestAnimationFrame ベース。scrub: true でスムーズ追従するが、内側で多数の DOM 書き換えをすると重くなる"

parameters:
  - { name: end_offset_px, type: number, default: 800, range: [300, 3000], description: "pin が解除されるまでのスクロール距離" }
  - { name: scrub,         type: enum,   default: "true",
      values: ["true", "false", "smoothed-number"],
      description: "スクロール量に進行を直結。true で完全追従、数値でイージング" }

a11y:
  respects_reduced_motion: true
  fallback: "ScrollTrigger を生成せず、要素はそのまま順に流す（pin しない）"
  focus_safe: true
  notes: "pin 中は前後にスクロールしても fokus 順は変わらない。フォーカス可能要素を pin 領域内に置く場合、Tab 順とビジュアル順を一致させる"

license: MIT
authors: ["@daichi"]
sources:
  - { title: "ScrollTrigger 公式ドキュメント", url: "https://gsap.com/docs/v3/Plugins/ScrollTrigger/" }
attribution_required: false

preview:
  url: https://animation-factory.app/preview/gsap-scroll-pin
  loop: true
  duration_ms: 2400

related:
  alternatives: [scroll-reveal, css-scroll-driven]
  composes_with:
    - { id: fade-up, note: "pin 中に内側コンテンツを fade-up で順次出すと自然" }
  requires: []

sections:
  skip: [variants]

ai:
  intent_examples:
    - "セクションをスクロール中に固定して、横方向に内容を流したい"
    - "ScrollTrigger で pin する演出"
    - "スクロリーテリング風のセクション"
  apply_targets: ["hero-section", "feature-section", "case-study"]
  do_not_apply_to: ["short-page", "form", "data-table", "navigation-bar"]
---

## Overview

セクションをスクロール時にビューポートに **pin**（張り付け）し、外側のスクロール進行を内側のアニメーション（テキスト切替・図版の移動・カウンタ等）に変換する。ScrollTrigger の代表的なユースケース。pin の解除位置（`end`）と進行の同期方法（`scrub`）で挙動を決める。

使う場面: 機能紹介セクション / ケーススタディ / 大型ヒーローのナラティブ。
避けたい場面: 短いページ全体（ユーザーが進めなくなる感）、フォーム、ナビバー。

## Preview

公開プレビュー: https://animation-factory.app/preview/gsap-scroll-pin

## Implementation

### GSAP + ScrollTrigger

```tsx
"use client";
import { useRef, useEffect } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

export function ScrollPinSection() {
  const sectionRef = useRef<HTMLElement>(null);

  useEffect(() => {
    if (!sectionRef.current) return;
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduce) return;

    const ctx = gsap.context(() => {
      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: sectionRef.current,
          start: "top top",
          end: "+=800",
          pin: true,
          scrub: true,
        },
      });
      tl.from(".pin-line-1", { opacity: 0, y: 24 })
        .from(".pin-line-2", { opacity: 0, y: 24 }, "+=0.2")
        .from(".pin-line-3", { opacity: 0, y: 24 }, "+=0.2");
    }, sectionRef);

    return () => ctx.revert();
  }, []);

  return (
    <section ref={sectionRef} className="min-h-screen">
      <p className="pin-line-1">最初の主張</p>
      <p className="pin-line-2">次の根拠</p>
      <p className="pin-line-3">最後の結論</p>
    </section>
  );
}
```

### CSS position: sticky（縮退）

```css
/* pin の見た目だけ模す。スクロール量に応じた内側の進行は出せない。 */
.scroll-pin {
  position: sticky;
  top: 0;
  height: 100vh;
}
```

## Usage

```tsx
<ScrollPinSection />
```

## AI Apply Prompt

### Context
`{{target_selector}}` をスクロール時に pin し、内側 3 行を順に登場させる。

### Steps
1. `gsap@^3.13` を `{{package_manager}}` で追加。
2. 上記コンポーネントを `{{target_file}}` に追加。サーバコンポーネントから呼ぶ場合は `"use client"` を確認。
3. `start` / `end` の値で pin 範囲を決める。`+=800` はビューポート高さ + 800px。
4. `gsap.context()` と `ctx.revert()` を必ず併用（unmount で確実にクリーンアップ）。
5. Reduce Motion 設定時は ScrollTrigger を作らない分岐（上記）を維持する。

### Examples

Before: 通常のセクション
After: `<ScrollPinSection />` で pin + 内側ナラティブ

### Verify
- セクションがビューポートに張り付き、スクロールしても動かない
- スクロール量に応じて 3 行が順に登場
- pin 解除後、後続セクションがスムーズに流れる
- Reduce Motion ON で pin が発動せず、通常のスクロールになる
- unmount 時にエラーや 残留ハンドラがない（`ctx.revert()` が効いている）

## Accessibility

- ScrollTrigger は `prefers-reduced-motion` を自動尊重しないため、上記のように **手動チェック** が必要。
- pin 中はビューポートが固定されるため、フォーム要素や対話的要素を pin 領域内に置くと混乱を招きうる。閲覧型のコンテンツに限定する。

## Performance Notes

- ScrollTrigger は rAF ベースで、スクロールイベントを直接購読しないため軽い。
- 内側で大量の DOM 書き換えを `scrub: true` で行うとフレーム落ちしうる。`will-change` を補助に。
- `gsap.context()` + `ctx.revert()` で React の unmount 時に ScrollTrigger インスタンスが必ず破棄される構成にする。

## Examples in the Wild

- Apple の製品ページの機能紹介セクション（横スクロール / pin）
- GSAP 公式の ScrollTrigger デモギャラリー

（同一の実装かは未検証。視覚的に同系統の例として参照）

## Changelog

- 2026-05-26 (created): 初版。Phase 3 D1 第 2 弾、Tier B 拡充の口火。
