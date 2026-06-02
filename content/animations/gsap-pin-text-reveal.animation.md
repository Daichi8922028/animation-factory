---
id: gsap-pin-text-reveal
name: GSAP Pinned Text Reveal
version: 1.0.0
release: v1.2
variant: gsap-scrolltrigger
description: |
  GSAP ScrollTrigger でセクションを pin し、スクロール量（scrub）に応じて複数行の文章を
  順次 reveal するスクロリーテリング演出。ヒーロー／マニフェスト／ストーリー導入のナラティブに。

taxonomy:
  layer: [css, js-runtime, library]
  ux_role:
    primary: storytelling
    secondary: [scroll-progress, entrance]
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
  - text-reveal
  - scrollytelling
  - storytelling
  - scrub

trigger:
  primary: scroll-progress
  touch_fallback: always-on
  config:
    start: "top top"
    end: "+=1200"
    pin: true
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
    name: "CSS scroll-driven (animation-timeline: view)"
    dependencies: []
    browser_support: { baseline: newly-available, baseline_year: 2024 }
    performance: { gpu_accelerated: true, layout_thrash: false, cost: low }
    degradation: "pin はせず、各行が view() タイムラインで個別に reveal。スクロール固定（pin）の体験は失われ、未対応ブラウザでは即表示に縮退"

browser_support:
  baseline: widely-available
  baseline_year: 2020
  notes: "代表値は Tier 1（GSAP）。Tier 2 の scroll-driven は newly-available（2024）、未対応ブラウザでは静的表示"

performance:
  gpu_accelerated: true
  layout_thrash: false
  cost: medium
  notes: "ScrollTrigger は requestAnimationFrame ベース。reveal は opacity / transform のみで合成レイヤ内に収める"

parameters:
  - { name: end_offset_px, type: number, default: 1200, range: [600, 4000], description: "pin が解除されるまでのスクロール距離。行数 × 余白で調整" }
  - { name: stagger,       type: number, default: 0.2,  range: [0.05, 0.6], description: "各行の登場間隔（タイムライン上のオフセット秒）" }
  - { name: scrub,         type: enum,   default: "true",
      values: ["true", "false", "smoothed-number"],
      description: "スクロール量に進行を直結。true で完全追従、数値でイージング付き追従" }

a11y:
  respects_reduced_motion: true
  fallback: "ScrollTrigger を生成せず pin もしない。全行を最初から不透明で表示し、通常スクロールで読める"
  focus_safe: true
  notes: "reveal される文章はテキストとして常に DOM に存在し、opacity だけを操作する。Reduce Motion 時も内容は欠落しない"

license: MIT
authors: ["@daichi"]
sources:
  - { title: "ScrollTrigger 公式ドキュメント", url: "https://gsap.com/docs/v3/Plugins/ScrollTrigger/" }
  - { title: "CSS scroll-driven animations", url: "https://developer.mozilla.org/en-US/docs/Web/CSS/animation-timeline" }
attribution_required: false

preview:
  url: https://animation-factory.app/preview/gsap-pin-text-reveal
  loop: true
  duration_ms: 3000

related:
  alternatives: [gsap-scroll-pin, text-reveal-lines, scroll-reveal, css-scroll-driven]
  composes_with:
    - { id: fade-up, note: "pin 解除後の後続セクションに fade-up を続けると流れが途切れない" }
    - { id: count-up, note: "pin 中の数値強調を count-up で同期させると効果的" }
  requires: []

sections:
  skip: [variants]

ai:
  intent_examples:
    - "スクロールでセクションを固定して、文章を1行ずつ見せていきたい"
    - "ScrollTrigger で pin しながらテキストを順番に reveal する"
    - "マニフェストやストーリー導入をスクロリーテリング風に出したい"
  apply_targets: ["hero-section", "manifesto", "story-intro", "feature-narrative"]
  do_not_apply_to: ["short-page", "form", "data-table", "navigation-bar"]
---

## Overview

セクションをスクロール時にビューポートへ **pin**（張り付け）し、外側のスクロール進行を内側の **複数行テキストの順次 reveal** に変換する。ユーザーがスクロールするほど 1 行ずつ文章が立ち上がり、読み進めるリズムをスクロール操作そのものに同期させる storytelling パターン。

`scrub: true` でスクロール量と reveal 進行を完全に直結させ、戻れば文章も巻き戻る（reversible）。pin の解除位置（`end`）と各行の `stagger` で読みのテンポを決める。

使う場面: ヒーロー直後のマニフェスト / プロダクトのストーリー導入 / ケーススタディの語り。
避けたい場面: 短いページ全体（先に進めない感）、フォーム、ナビバー、データ表。

## Preview

公開プレビュー: https://animation-factory.app/preview/gsap-pin-text-reveal

## Implementation

### GSAP + ScrollTrigger

```tsx
"use client";
import { useRef, useEffect } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

export function PinTextReveal() {
  const sectionRef = useRef<HTMLElement>(null);

  useEffect(() => {
    if (!sectionRef.current) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    gsap.registerPlugin(ScrollTrigger);

    const ctx = gsap.context(() => {
      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: sectionRef.current,
          start: "top top",
          end: "+=1200",
          pin: true,
          scrub: true,
        },
      });
      tl.from(".reveal-line-1", { opacity: 0, y: 28, filter: "blur(6px)" })
        .from(".reveal-line-2", { opacity: 0, y: 28, filter: "blur(6px)" }, "+=0.2")
        .from(".reveal-line-3", { opacity: 0, y: 28, filter: "blur(6px)" }, "+=0.2")
        .from(".reveal-line-4", { opacity: 0, y: 28, filter: "blur(6px)" }, "+=0.2");
    }, sectionRef);

    return () => ctx.revert();
  }, []);

  return (
    <section ref={sectionRef} className="min-h-screen">
      <p className="reveal-line-1">最初の一文がスクロールで立ち上がる。</p>
      <p className="reveal-line-2">次の一文が続いて現れる。</p>
      <p className="reveal-line-3">三文目で主張が積み上がる。</p>
      <p className="reveal-line-4">最後の一文で締める。</p>
    </section>
  );
}
```

### CSS scroll-driven（縮退）

```css
/* pin はできない。各行を view() タイムラインで個別に reveal する簡易代替。
   未対応ブラウザでは @supports 外で即表示（内容は欠落しない）。 */
@supports (animation-timeline: view()) {
  .reveal-line {
    opacity: 0;
    animation: reveal-up linear both;
    animation-timeline: view();
    animation-range: entry 10% cover 35%;
  }
  @keyframes reveal-up {
    from { opacity: 0; transform: translateY(28px); }
    to   { opacity: 1; transform: translateY(0); }
  }
}
@media (prefers-reduced-motion: reduce) {
  .reveal-line { opacity: 1; animation: none; }
}
```

## Usage

```tsx
<PinTextReveal />
```

## AI Apply Prompt

### Context
`{{target_selector}}` をスクロール時に pin し、内側の複数行を scrub に応じて順次 reveal する。

### Steps
1. `gsap@^3.13` を `{{package_manager}}` で追加。
2. 上記コンポーネントを `{{target_file}}` に追加。サーバコンポーネントから呼ぶ場合は `"use client"` を確認。
3. 行数に応じて `end`（`+=1200` はビューポート高 + 1200px）と各行の `stagger`（`"+=0.2"`）を調整。
4. `gsap.registerPlugin(ScrollTrigger)` は副作用なので useEffect 内で呼び、`gsap.context()` + `ctx.revert()` を併用して unmount で確実にクリーンアップ。
5. Reduce Motion 設定時は ScrollTrigger を作らない分岐（上記）を維持し、全行が初期表示で読める状態にする。

### Examples

Before: 通常の段落が並ぶセクション
After: `<PinTextReveal />` で pin + スクロール同期の行ごと reveal

### Verify
- セクションがビューポートに張り付き、スクロール量に応じて行が 1 つずつ現れる
- 上方向にスクロールすると reveal が巻き戻る（reversible）
- pin 解除後、後続セクションがスムーズに流れる
- Reduce Motion ON で pin が発動せず、全行が最初から表示される
- unmount 時にエラーや残留ハンドラがない（`ctx.revert()` が効いている）

## Accessibility

- ScrollTrigger は `prefers-reduced-motion` を自動尊重しないため、上記のように **手動チェック** が必要。
- reveal 対象のテキストは常に DOM 上に存在し、`opacity` のみを操作する。表示有無は CSS の見た目に限られ、スクリーンリーダーには全文が読める。
- pin 中はビューポートが固定されるため、フォーム要素や対話的要素を pin 領域内に置かない。閲覧型の文章に限定する。

## Performance Notes

- ScrollTrigger は rAF ベースで、スクロールイベントを直接購読しないため軽い。
- reveal は `opacity` / `transform` / `filter: blur` の合成可能プロパティのみで、レイアウトを揺らさない（layout_thrash: false）。
- `gsap.context()` + `ctx.revert()` で React の unmount 時に ScrollTrigger インスタンスが必ず破棄される構成にする。

## Changelog

- 2026-06-02 (created): 初版。v1.2（Tier B）、GSAP ScrollTrigger による pin + 行ごとテキスト reveal の storytelling 拡充。
