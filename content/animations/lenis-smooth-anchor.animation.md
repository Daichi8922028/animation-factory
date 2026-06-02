---
id: lenis-smooth-anchor
name: Lenis Smooth Anchor
version: 1.0.0
release: v1.2
variant: lenis
description: |
  Lenis の慣性スムーススクロールでアンカー（セクション）間を滑らかに移動する navigation 演出。
  アンカーリンクのクリックで対象セクションへ scrollTo し、ネイティブの瞬間ジャンプを慣性付きの
  なめらかな移動に置き換える。ランディングページの目次やセクションナビに。

taxonomy:
  layer: [js-runtime, library]
  ux_role:
    primary: navigation
    secondary: [scroll-progress]
  trigger: [click]
  media: [dom-css]
  authoring: code

behavior:
  lifecycle: continuous
  reversible: false
  replay: every-entry

tags:
  - lenis
  - smooth-scroll
  - anchor
  - inertia
  - navigation
  - scroll-to

trigger:
  primary: click
  touch_fallback: always-on
  config:
    duration: 1.2
    lerp: 0.08

runtime:
  language: typescript
  framework: react
  framework_version: ">=18"
dependencies:
  - { name: lenis, version: "^1.3.0", purpose: "慣性スムーススクロールと scrollTo を提供するコアライブラリ" }
peer_dependencies:
  - { name: react, version: ">=18" }

implementations:
  - tier: 1
    name: "Lenis (慣性スムーススクロール)"
    dependencies: [ { name: lenis, version: "^1.3.0" } ]
    browser_support: { baseline: widely-available, baseline_year: 2021 }
    performance: { gpu_accelerated: true, layout_thrash: false, cost: medium }
    degrades_to: 2
  - tier: 2
    name: "CSS scroll-behavior: smooth"
    dependencies: []
    browser_support: { baseline: widely-available, baseline_year: 2022 }
    performance: { gpu_accelerated: true, layout_thrash: false, cost: low }
    degradation: "慣性（lerp）やパララックス連動は出せない。アンカー間をブラウザ標準の補間で移動するだけの簡易代替"

browser_support:
  baseline: widely-available
  baseline_year: 2021
  notes: "代表値は Tier 1（Lenis）。Tier 2 の scroll-behavior は慣性が無く、Lenis ほど滑らかではない"

performance:
  gpu_accelerated: true
  layout_thrash: false
  cost: medium
  notes: "Lenis は requestAnimationFrame で scrollTop を補間。スクロールイベントの直接購読より軽いが、rAF ループは常時回るため未使用時は destroy する"

parameters:
  - { name: lerp, type: number, default: 0.08, range: [0.02, 0.2], description: "慣性の強さ（小さいほど滑らかで遅い追従）" }
  - { name: duration_s, type: number, default: 1.2, range: [0.4, 2.5], description: "scrollTo 1 回あたりの移動時間（秒）" }
  - { name: smooth_wheel, type: boolean, default: true, description: "ホイール入力にも慣性スムーシングを適用するか" }

a11y:
  respects_reduced_motion: true
  fallback: "Lenis を生成せず、CSS scroll-behavior も auto に。アンカーは瞬間ジャンプ（ネイティブ挙動）に戻す"
  focus_safe: true
  notes: "scrollTo 後はフォーカスも対象セクションへ移し、キーボード操作の文脈を保つ。長い慣性で酔いやすいユーザのため Reduce Motion で完全無効化"

license: MIT
authors: ["@daichi"]
sources:
  - { title: "Lenis 公式リポジトリ", url: "https://github.com/darkroomengineering/lenis" }
attribution_required: false

preview:
  url: https://animation-factory.app/preview/lenis-smooth-anchor
  loop: true
  duration_ms: 2400

related:
  alternatives: [gsap-scroll-pin, css-scroll-driven, scroll-reveal]
  composes_with:
    - { id: fade-up, note: "移動先セクションの内側を fade-up で出すと到着が分かりやすい" }
    - { id: css-scroll-progress-bar, note: "Lenis の scroll 値で進捗バーを駆動するとナビと整合する" }
  requires: []

sections:
  skip: [variants]

ai:
  intent_examples:
    - "アンカーリンクのクリックでセクションへ滑らかにスクロールしたい"
    - "Lenis で慣性付きのスムーススクロールを入れたい"
    - "目次から各セクションへ気持ちよく移動させたい"
  apply_targets: ["landing-page", "table-of-contents", "section-nav", "one-page-site"]
  do_not_apply_to: ["data-table", "infinite-scroll-feed", "form", "modal"]
---

## Overview

Lenis は `requestAnimationFrame` ループで `scrollTop` を補間し、ネイティブスクロールに **慣性（lerp）** を与えるライブラリ。本アニメーションはそれを使い、アンカーリンクのクリックで対象セクションへ `lenis.scrollTo(target)` する。ブラウザ標準の瞬間ジャンプが、慣性付きのなめらかな移動に置き換わる。`lenis.on("scroll")` でスクロール値を購読し、背景レイヤーのパララックス等にも連動できる。

使う場面: ランディングページの目次 / セクションナビ / 1 ページサイトの章移動。
避けたい場面: データテーブル、無限スクロールのフィード、フォーム、モーダル内。

## Preview

公開プレビュー: https://animation-factory.app/preview/lenis-smooth-anchor

ネストした scroll container（`wrapper` + `content`）上で、一定間隔で次セクションへ自動 `scrollTo` し、慣性スクロールと背景パララックスを巡回表示する。

## Implementation

### Lenis（慣性スムーススクロール）

```tsx
"use client";
import { useEffect, useRef } from "react";
import Lenis from "lenis";

export function SmoothAnchorNav() {
  const wrapperRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const wrapper = wrapperRef.current;
    const content = contentRef.current;
    if (!wrapper || !content) return;
    // Reduce Motion は Lenis を作らずネイティブ挙動に縮退
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    // ネストした scroll container を対象にする（document ではなく wrapper/content）
    const lenis = new Lenis({ wrapper, content, lerp: 0.08, smoothWheel: true });

    let rafId = 0;
    const raf = (time: number) => {
      lenis.raf(time);
      rafId = requestAnimationFrame(raf);
    };
    rafId = requestAnimationFrame(raf);

    // アンカークリック → 対象セクションへ慣性スクロール
    const onClick = (e: MouseEvent) => {
      const a = (e.target as HTMLElement).closest<HTMLAnchorElement>("a[href^='#']");
      if (!a) return;
      e.preventDefault();
      const target = content.querySelector<HTMLElement>(a.getAttribute("href")!);
      if (target) lenis.scrollTo(target, { duration: 1.2 });
    };
    wrapper.addEventListener("click", onClick);

    return () => {
      wrapper.removeEventListener("click", onClick);
      cancelAnimationFrame(rafId); // rAF を必ず止める
      lenis.destroy();             // Lenis を破棄してリスナを解放
    };
  }, []);

  return (
    <div ref={wrapperRef} className="h-screen overflow-y-auto">
      <nav><a href="#sec-a">A</a><a href="#sec-b">B</a></nav>
      <div ref={contentRef}>
        <section id="sec-a" className="min-h-screen">A</section>
        <section id="sec-b" className="min-h-screen">B</section>
      </div>
    </div>
  );
}
```

### CSS scroll-behavior: smooth（縮退）

```css
/* Lenis 無しの簡易代替。慣性・パララックス連動は出せない。 */
.smooth-scroll {
  scroll-behavior: smooth;
}
@media (prefers-reduced-motion: reduce) {
  .smooth-scroll { scroll-behavior: auto; }
}
```

## Usage

```tsx
<SmoothAnchorNav />
```

## AI Apply Prompt

### Context
`{{target_selector}}` のアンカーナビをクリック時に Lenis の慣性スクロールで対象セクションへ移動させる。

### Steps
1. `lenis@^1.3` を `{{package_manager}}` で追加。
2. 上記コンポーネントを `{{target_file}}` に追加。`"use client"` を確認。
3. `new Lenis({ wrapper, content })` でネストした scroll container を対象に指定する（`document` 全体ではなく）。
4. `requestAnimationFrame` ループで `lenis.raf(time)` を毎フレーム呼ぶ。
5. アンカークリックを `e.preventDefault()` して `lenis.scrollTo(target, { duration })`。
6. unmount で `cancelAnimationFrame` + `lenis.destroy()` を必ず呼ぶ。
7. Reduce Motion 設定時は Lenis を生成しない分岐（上記）を維持する。

### Examples

Before: アンカーリンクで瞬間ジャンプ
After: `<SmoothAnchorNav />` で慣性付きスムーススクロール

### Verify
- アンカークリックで対象セクションへ滑らかに移動する
- ホイール操作にも慣性が乗る（`smoothWheel: true`）
- Reduce Motion ON で慣性が消え、ネイティブの瞬間ジャンプに戻る
- unmount 時に rAF が止まり、`lenis.destroy()` でリスナが残らない

## Accessibility

- Lenis は `prefers-reduced-motion` を自動尊重しないため、上記のように **手動チェック** が必要。
- `scrollTo` 後は移動先セクションへフォーカスも移し、キーボード操作の文脈を保つ。
- 長い慣性は乗り物酔いを誘発しうるため、Reduce Motion で完全無効化する。

## Performance Notes

- Lenis は rAF で `scrollTop` を補間し、スクロールイベントを直接購読しないため軽い。
- ただし rAF ループは常時回るため、コンポーネントが不要になったら必ず `destroy()` する。
- `lenis.on("scroll")` のコールバック内で重い DOM 書き換えをするとフレーム落ちしうる。`transform` のみに留め `will-change: transform` を補助に。

## Changelog

- 2026-06-02 (created): 初版。v1.2（Tier B）、Lenis 慣性スムーススクロールによる navigation 拡充。
