---
id: motion-one-scroll-reveal
name: Motion One Scroll Reveal
version: 1.0.0
release: v1.2
variant: motion-one
description: |
  Motion One の scroll() でスクロール進行に連動させ、要素を fade + scale で reveal する演出。
  ネストしたスクロールコンテナを target にして、対象の進行 0→1 を opacity / scale に直結する scroll-linked state-transition。

taxonomy:
  layer: [js-runtime, library]
  ux_role:
    primary: state-transition
    secondary: [storytelling]
  trigger: [scroll-progress]
  media: [dom-css]
  authoring: code

behavior:
  lifecycle: scroll-linked
  reversible: true
  replay: every-entry

tags:
  - motion-one
  - scroll
  - scroll-linked
  - reveal
  - fade
  - scale
  - state-transition

trigger:
  primary: scroll-progress
  touch_fallback: always-on
  config:
    offset: ["start end", "center center"]
    axis: "y"

runtime:
  language: typescript
  framework: react
  framework_version: ">=18"
dependencies:
  - { name: "@motionone/dom", version: "^10.18.0", purpose: "scroll() による進行監視と animate() / spring() の補間" }
peer_dependencies:
  - { name: react, version: ">=18" }

implementations:
  - tier: 1
    name: "Motion One scroll()"
    dependencies: [ { name: "@motionone/dom", version: "^10.18.0" } ]
    browser_support: { baseline: widely-available, baseline_year: 2020 }
    performance: { gpu_accelerated: true, layout_thrash: false, cost: low }
    degrades_to: 2
  - tier: 2
    name: "CSS scroll-driven animations (animation-timeline: view())"
    dependencies: []
    browser_support: { baseline: limited, baseline_year: 2024 }
    performance: { gpu_accelerated: true, layout_thrash: false, cost: low }
    degradation: "JS なしで view() タイムラインに直結できるが、未対応ブラウザでは進行連動が効かず即時表示になる。細かな offset 制御や container 指定は Tier 1 ほど柔軟ではない"

browser_support:
  baseline: widely-available
  baseline_year: 2020
  notes: "代表値は Tier 1（Motion One）。scroll() は requestAnimationFrame ベースで進行を測定し、Web Animations API で transform / opacity を補間。Tier 2 の CSS scroll-driven は baseline limited（2024〜）"

performance:
  gpu_accelerated: true
  layout_thrash: false
  cost: low
  notes: "opacity と transform: scale のみ補間し GPU 合成で完結。scroll() は scroll イベントを直接購読せず rAF で測定するため、メインスレッド負荷は小さい"

parameters:
  - { name: scale_from, type: number, default: 0.92, range: [0.8, 0.98], description: "reveal 開始時のスケール（進行 0 の値）" }
  - { name: offset, type: array, default: ["start end", "center center"], values: [["start end", "end start"], ["start end", "center center"], ["start center", "center center"]], description: "進行 0/1 を測る対象とコンテナのエッジ交点" }
  - { name: smooth, type: number, default: 0, range: [0, 60], description: "進行のスムージング量（ms 相当）。大きいほど追従が滑らかになる" }

a11y:
  respects_reduced_motion: true
  fallback: "scroll() を生成せず、要素を opacity:1 / scale:1 の最終状態で即時表示する（進行連動なし）"
  focus_safe: true
  notes: "reveal は視覚効果のみで、要素はDOM上に常に存在しフォーカス順を変えない。コンテンツの理解に reveal の完了は不要にする"

license: MIT
authors: ["@daichi"]
sources:
  - { title: "Motion One scroll() ドキュメント", url: "https://motion.dev/dom/scroll" }
  - { title: "Motion One animate() ドキュメント", url: "https://motion.dev/dom/animate" }
attribution_required: false

preview:
  url: https://animation-factory.app/preview/motion-one-scroll-reveal
  loop: true
  duration_ms: 2400

related:
  alternatives: [gsap-scroll-pin, css-scroll-driven, scroll-reveal, fade-up, scale-in]
  composes_with:
    - { id: count-up-on-view, note: "reveal と同じ進行で数値をカウントアップさせると統一感が出る" }
    - { id: fade-up, note: "reveal 後の内側要素を fade-up で順次出すと自然" }
  requires: []

sections:
  skip: [variants]

ai:
  intent_examples:
    - "スクロールに連動して要素をふわっと fade とスケールで出したい"
    - "Motion One の scroll() でスクロール進行に reveal を紐付けたい"
    - "ネストしたスクロール領域の進行で中身を徐々に現したい"
  apply_targets: ["section", "card", "hero-block", "figure"]
  do_not_apply_to: ["body-text", "data-table", "navigation-bar", "form"]
---

## Overview

Motion One の `scroll()` で、対象要素（またはネストしたスクロールコンテナ）のスクロール進行 0→1 を取得し、その値を `opacity`（0→1）と `transform: scale`（0.92→1）に直結する **scroll-linked な state-transition**。スクロールを巻き戻せば reveal も逆再生されるため reversible。

使う場面: セクション / カード / ヒーローブロック / 図版を、視界に入る進行に合わせて現す。
避けたい場面: 本文（読みづらい）、データテーブル、ナビバー、フォーム。

## Preview

公開プレビュー: https://animation-factory.app/preview/motion-one-scroll-reveal

## Implementation

### Motion One scroll()

```tsx
"use client";
import { useEffect, useRef } from "react";
import { scroll } from "@motionone/dom";

export function ScrollRevealSection() {
  const containerRef = useRef<HTMLDivElement>(null);
  const targetRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const container = containerRef.current;
    const target = targetRef.current;
    if (!container || !target) return;

    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      // 縮退: 進行連動せず最終状態で即時表示
      target.style.opacity = "1";
      target.style.transform = "scale(1)";
      return;
    }

    // scroll() は cleanup 関数（VoidFunction）を返す
    const cancel = scroll(
      ({ y }) => {
        const p = y.progress; // 0 → 1
        target.style.opacity = String(p);
        target.style.transform = `scale(${0.92 + p * 0.08})`;
      },
      { container, target, offset: ["start end", "center center"] },
    );

    return () => cancel();
  }, []);

  return (
    <div ref={containerRef} style={{ height: "100vh", overflowY: "auto" }}>
      <div style={{ height: "120vh" }} />
      <div ref={targetRef} style={{ opacity: 0, transform: "scale(0.92)", willChange: "transform, opacity" }}>
        スクロールで現れるコンテンツ
      </div>
      <div style={{ height: "120vh" }} />
    </div>
  );
}
```

### CSS scroll-driven animations（縮退）

```css
/* JS なしで view() タイムラインに直結。baseline limited（2024〜）。
   未対応ブラウザでは進行連動が効かず即時表示になる。 */
@supports (animation-timeline: view()) {
  .scroll-reveal {
    animation: reveal linear both;
    animation-timeline: view();
    animation-range: entry 0% cover 50%;
  }
  @keyframes reveal {
    from { opacity: 0; transform: scale(0.92); }
    to   { opacity: 1; transform: scale(1); }
  }
}
@media (prefers-reduced-motion: reduce) {
  .scroll-reveal { animation: none; opacity: 1; transform: none; }
}
```

## Usage

```tsx
<ScrollRevealSection />
```

## AI Apply Prompt

### Context
`{{target_selector}}` を、ネストしたスクロールコンテナの進行に連動して fade + scale で reveal する。

### Steps
1. `@motionone/dom@^10.18` を `{{package_manager}}` で追加。
2. 上記コンポーネントを `{{target_file}}` に追加。サーバコンポーネントから呼ぶ場合は `"use client"` を確認。
3. スクロールコンテナを `container`、現したい要素を `target` として `scroll(onScroll, { container, target, offset })` を呼ぶ。
4. `onScroll` 内で `y.progress`（0→1）を `opacity` と `transform: scale` に割り当てる。`offset` で進行の起点・終点を調整する。
5. `scroll()` の戻り値（cleanup 関数）を保持し、unmount の cleanup で必ず呼ぶ。
6. Reduce Motion 設定時は `scroll()` を生成せず、最終状態（opacity:1 / scale:1）で即時表示する分岐を維持する。

### Examples

Before: スクロールに反応しない静的なセクション
After: `<ScrollRevealSection />` で進行に応じて fade + scale reveal

### Verify
- スクロール進行に合わせて opacity と scale が連続的に変化する
- スクロールを巻き戻すと reveal も逆再生される（reversible）
- Reduce Motion ON で進行連動せず、最終状態で即時表示される
- unmount 後にコンソールエラーや残留ハンドラがない（cleanup 関数が効いている）

## Accessibility

- `prefers-reduced-motion: reduce` を手動チェックし、ON では `scroll()` を生成せず最終状態で即時表示する。
- reveal は視覚効果のみで、要素は常に DOM 上に存在しフォーカス順や読み上げ順を変えない。コンテンツの理解に reveal の完了を前提にしない。
- 進行の途中で `opacity` が低い状態でもテキストの可読性を損なわないよう、開始値を極端に低くしすぎない。

## Performance Notes

- `opacity` と `transform: scale` のみ補間するため GPU 合成で完結し、レイアウトもペイントも誘発しない。
- `scroll()` は scroll イベントを直接購読せず requestAnimationFrame で進行を測定するため、メインスレッド負荷は小さい。
- `will-change: transform, opacity` は reveal 対象に限定して付与する（多用は逆効果）。`smooth` を上げると追従が滑らかになるが、わずかに遅延する。

## Changelog

- 2026-06-02 (created): 初版。v1.2（Tier B）、Motion One variant 拡充。scroll() による scroll-linked fade/scale reveal。
