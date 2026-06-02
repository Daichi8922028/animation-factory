---
id: gsap-scroll-horizontal
name: GSAP Horizontal Scroll Section
version: 1.0.0
release: v1.2
variant: gsap-scrolltrigger
description: |
  GSAP ScrollTrigger の pin + scrub で、縦スクロールを横移動に変換する横スクロールセクション。
  4〜5 枚の panel 列を 1 本のタイムラインで横に流し、スクロリーテリングや製品ツアーに使う。

taxonomy:
  layer: [css, js-runtime, library]
  ux_role:
    primary: storytelling
    secondary: [scroll-progress, navigation]
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
  - horizontal-scroll
  - pin
  - scrub
  - scrollytelling
  - panels
  - storytelling

trigger:
  primary: scroll-progress
  touch_fallback: always-on
  config:
    start: "top top"
    end: "+=panels"
    pin: true
    scrub: true

runtime:
  language: typescript
  framework: react
  framework_version: ">=18"
dependencies:
  - { name: gsap, version: "^3.13.0", purpose: "ScrollTrigger を含むコアタイムライン。pin + scrub で横移動を駆動" }
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
    name: "CSS overflow-x scroll-snap"
    dependencies: []
    browser_support: { baseline: widely-available, baseline_year: 2019 }
    performance: { gpu_accelerated: true, layout_thrash: false, cost: low }
    degradation: "縦→横の変換はできない。ユーザーが横方向に直接スクロールする overflow-x コンテナへ縮退。pin による storytelling 同期は失われる"

browser_support:
  baseline: widely-available
  baseline_year: 2020
  notes: "代表値は Tier 1（GSAP）。Tier 2 は overflow-x + scroll-snap の機能縮退。縦→横変換は得られない"

performance:
  gpu_accelerated: true
  layout_thrash: false
  cost: medium
  notes: "横移動は transform: translateX（GPU 合成）。ScrollTrigger は rAF ベースでスクロールイベントを直接購読しない。panel 数を増やしすぎると end 距離が伸び操作感が重くなる"

parameters:
  - { name: panel_count, type: number, default: 4, range: [3, 6], description: "横に並べる panel の枚数。end のスクロール距離に比例" }
  - { name: scrub, type: enum, default: "1", values: ["true", "1", "false"], description: "スクロール量と横移動の同期。数値でイージング付き追従" }
  - { name: gap_px, type: number, default: 24, range: [0, 64], description: "panel 間の余白" }

a11y:
  respects_reduced_motion: true
  fallback: "ScrollTrigger を生成せず、panel 列を通常の縦積みで順に流す（pin も横移動もしない）"
  focus_safe: true
  notes: "横移動中は視覚順と Tab 順を一致させる。pin 領域に対話的要素を置く場合、横移動でフォーカスが画面外に出ないよう scrollIntoView を併用する"

license: MIT
authors: ["@daichi"]
sources:
  - { title: "ScrollTrigger 公式ドキュメント", url: "https://gsap.com/docs/v3/Plugins/ScrollTrigger/" }
  - { title: "GSAP Horizontal Scroll デモ", url: "https://gsap.com/demos/" }
attribution_required: false

preview:
  url: https://animation-factory.app/preview/gsap-scroll-horizontal
  loop: true
  duration_ms: 3200

related:
  alternatives: [gsap-scroll-pin, css-scroll-driven, scroll-reveal, marquee, carousel-slider]
  composes_with:
    - { id: fade-up, note: "各 panel 内のテキストを横移動と合わせて fade-up で出すと奥行きが出る" }
    - { id: count-up, note: "panel が中央に来たタイミングで count-up を発火させると数値訴求になる" }
  requires: []

sections:
  skip: [variants]

ai:
  intent_examples:
    - "縦スクロールで横にカードが流れるセクションを作りたい"
    - "ScrollTrigger の pin で横スクロールにする演出"
    - "製品の特徴を横並び panel でスクロリーテリングしたい"
  apply_targets: ["feature-section", "product-tour", "case-study", "gallery-section"]
  do_not_apply_to: ["short-page", "form", "data-table", "navigation-bar"]
---

## Overview

縦スクロールの進行を ScrollTrigger の **pin + scrub** で受け取り、内側の panel 列を `translateX` で横に流す。セクションをビューポートに張り付けた状態で、外側のスクロール量を横移動に変換するため、ユーザーは普段どおり縦にスクロールするだけで横スクロール体験になる。

横移動量は `(列の総幅 - ビューポート幅)` を `end` 距離に割り当て、`scrub` でスクロールと同期させる。panel 枚数を増やすほど `end` が伸び、1 枚あたりの滞在が長くなる。

使う場面: 製品ツアー / 機能紹介 / ケーススタディの章立て / ギャラリー。
避けたい場面: 短いページ、フォーム、データテーブル、ナビバー。

## Preview

公開プレビュー: https://animation-factory.app/preview/gsap-scroll-horizontal

縦にスクロールすると 4 枚の panel が横に流れる。Reduce Motion ON では pin せず縦積みで表示。

## Implementation

### GSAP + ScrollTrigger（Tier 1）

```tsx
"use client";
import { useRef, useEffect } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

export function HorizontalScrollSection() {
  const rootRef = useRef<HTMLDivElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!rootRef.current || !trackRef.current) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    gsap.registerPlugin(ScrollTrigger);

    const ctx = gsap.context(() => {
      const track = trackRef.current!;
      const distance = track.scrollWidth - track.offsetWidth;

      gsap.to(track, {
        x: () => -distance,
        ease: "none",
        scrollTrigger: {
          trigger: rootRef.current,
          start: "top top",
          end: () => "+=" + distance,
          pin: true,
          scrub: 1,
          invalidateOnRefresh: true,
        },
      });
    }, rootRef);

    return () => ctx.revert();
  }, []);

  return (
    <section ref={rootRef} className="h-screen overflow-hidden">
      <div ref={trackRef} className="flex h-full gap-6 will-change-transform">
        <article className="w-screen shrink-0">Panel 1</article>
        <article className="w-screen shrink-0">Panel 2</article>
        <article className="w-screen shrink-0">Panel 3</article>
        <article className="w-screen shrink-0">Panel 4</article>
      </div>
    </section>
  );
}
```

### CSS overflow-x scroll-snap（Tier 2・縮退）

```css
/* 縦→横の変換はできない。ユーザーが横に直接スクロールする簡易代替。 */
.h-track {
  display: flex;
  gap: 1.5rem;
  overflow-x: auto;
  scroll-snap-type: x mandatory;
}
.h-track > * {
  flex: 0 0 100%;
  scroll-snap-align: start;
}
@media (prefers-reduced-motion: reduce) {
  .h-track { scroll-behavior: auto; }
}
```

## Usage

```tsx
<HorizontalScrollSection />
```

## AI Apply Prompt

### Context
`{{target_selector}}` を、縦スクロールで横に panel が流れる横スクロールセクションに変換する。

### Steps
1. `gsap@^3.13` を `{{package_manager}}` で追加。
2. 上記コンポーネントを `{{target_file}}` に追加。サーバコンポーネントから呼ぶ場合は `"use client"` を確認。
3. panel を 3〜6 枚に調整。各 panel は `w-screen shrink-0`、track は `flex`。
4. 横移動量は `track.scrollWidth - track.offsetWidth` を `end` に割り当て、`x: () => -distance` を関数で渡す（`invalidateOnRefresh: true` でリサイズ追従）。
5. `gsap.context()` と `ctx.revert()` を必ず併用し、unmount で確実にクリーンアップ。
6. Reduce Motion 設定時は ScrollTrigger を作らない分岐（上記）を維持する。

### Examples

Before: 縦に積んだ feature カード群
After: `<HorizontalScrollSection />` で縦スクロール → 横移動

### Verify
- 縦にスクロールするとセクションが pin され、panel 列が横に流れる
- スクロール量と横移動が同期し、戻すと逆再生される
- pin 解除後、後続セクションがスムーズに流れる
- ウィンドウ幅を変えても横移動量が再計算される（`invalidateOnRefresh`）
- Reduce Motion ON で pin / 横移動が発動せず、通常の縦スクロールになる
- unmount 時にエラーや残留ハンドラがない（`ctx.revert()` が効いている）

## Accessibility

- ScrollTrigger は `prefers-reduced-motion` を自動尊重しないため、上記のように **手動チェック** が必要。
- 横移動中は視覚順と Tab 順を一致させる。panel 内の対話的要素にフォーカスが移ったとき横位置が画面外なら、`scrollIntoView` 等で可視位置へ寄せる。
- pin 領域はフォーム等の長い対話には向かない。閲覧型コンテンツに限定する。

## Performance Notes

- 横移動は `transform: translateX`（GPU 合成）で行い、`left` 等のレイアウトプロパティは触らない。
- ScrollTrigger は rAF ベースで、スクロールイベントを直接購読しないため軽い。
- panel 数を増やすと `end` 距離が伸び、横スクロール体験が長くなる。3〜6 枚を目安に。
- `will-change: transform` を track に付け、`gsap.context()` + `ctx.revert()` で unmount 時に必ず破棄する。

## Changelog

- 2026-06-02 (created): 初版。v1.2（Tier B）、GSAP ScrollTrigger 横スクロールセクション。gsap-scroll-pin の横移動応用。
