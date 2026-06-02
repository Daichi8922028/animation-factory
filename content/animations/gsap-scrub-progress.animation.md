---
id: gsap-scrub-progress
name: GSAP Scrub Progress
version: 1.0.0
release: v1.2
variant: gsap-scrolltrigger
description: |
  GSAP ScrollTrigger の scrub でスクロール量に進捗バー（と数値 %）を直結させる演出。
  ページや長文記事の読了進捗、セクション内の進行表示など、現在地を伝える feedback パターン。

taxonomy:
  layer: [css, js-runtime, library]
  ux_role:
    primary: feedback
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
  - scrub
  - progress-bar
  - scroll-progress
  - reading-progress
  - feedback

trigger:
  primary: scroll-progress
  touch_fallback: always-on
  config:
    start: "top top"
    end: "bottom bottom"
    scrub: true

runtime:
  language: typescript
  framework: react
  framework_version: ">=18"
dependencies:
  - { name: gsap, version: "^3.13.0", purpose: "ScrollTrigger による scrub 連動の進捗計算" }
peer_dependencies:
  - { name: react, version: ">=18" }

implementations:
  - tier: 1
    name: "GSAP + ScrollTrigger"
    dependencies: [ { name: gsap, version: "^3.13.0" } ]
    browser_support: { baseline: widely-available, baseline_year: 2020 }
    performance: { gpu_accelerated: true, layout_thrash: false, cost: low }
    degrades_to: 2
  - tier: 2
    name: "CSS scroll-driven animation (animation-timeline: scroll())"
    dependencies: []
    browser_support: { baseline: newly-available, baseline_year: 2024 }
    performance: { gpu_accelerated: true, layout_thrash: false, cost: low }
    degradation: "数値 % のテキスト更新は出せず、バーの伸長のみ。未対応ブラウザでは静的に省略"

browser_support:
  baseline: widely-available
  baseline_year: 2020
  notes: "代表値は Tier 1（GSAP）。Tier 2 の CSS scroll-driven は newly-available（2024〜）"

performance:
  gpu_accelerated: true
  layout_thrash: false
  cost: low
  notes: "scaleX / transform のみ補間。scrub の rAF 同期で軽い。数値表示は onUpdate での最小限の textContent 更新に留める"

parameters:
  - { name: scrub, type: enum, default: "true",
      values: ["true", "false", "smoothed-number"],
      description: "スクロール量への追従。true で完全直結、数値でスムージング遅延" }
  - { name: show_percent, type: boolean, default: true, description: "進捗バーに加えて数値 % を表示するか" }
  - { name: end, type: string, default: "bottom bottom", range: ["top top", "bottom bottom"], description: "進捗 100% に到達するスクロール終端" }

a11y:
  respects_reduced_motion: true
  fallback: "ScrollTrigger を生成せず、バーは進捗 0 のまま（または非表示）。現在地は本文の見出し構造で把握できる"
  focus_safe: true
  notes: "進捗バーは装飾。意味を持たせる場合は role=\"progressbar\" + aria-valuenow を併設し、視覚に依存しない"

license: MIT
authors: ["@daichi"]
sources:
  - { title: "ScrollTrigger 公式ドキュメント", url: "https://gsap.com/docs/v3/Plugins/ScrollTrigger/" }
attribution_required: false

preview:
  url: https://animation-factory.app/preview/gsap-scrub-progress
  loop: true
  duration_ms: 2400

related:
  alternatives: [progress-bar, css-scroll-driven, page-loading-bar, gsap-scroll-pin]
  composes_with:
    - { id: sticky-shrink-header, note: "縮小ヘッダーの下端に進捗バーを置くと読了状況が常時見える" }
  requires: []

sections:
  skip: [variants]

ai:
  intent_examples:
    - "スクロール量に応じて上部の進捗バーが伸びるようにしたい"
    - "記事の読了進捗を ScrollTrigger の scrub で表示する"
    - "スクロール進行を % の数値とバーで連動表示したい"
  apply_targets: ["article", "long-form-page", "documentation"]
  do_not_apply_to: ["short-page", "form", "modal", "navigation-bar"]
---

## Overview

GSAP ScrollTrigger の `scrub` を使い、ページ（またはセクション）のスクロール量を **進捗バーの伸長** と **数値 %** に直結させる。スクロールを前後すると進捗も双方向に追従し、ユーザーに「いまどこまで読んだか」という **feedback** を返す。

`scrub: true` で完全直結、数値（例 `0.4`）でスムージングの遅延を加えられる。バーは `scaleX` で伸ばし、数値は `onUpdate` での最小限のテキスト更新に留めるのが軽量。

使う場面: 長文記事 / ドキュメント / ランディングの読了進捗。
避けたい場面: 短いページ（進捗が一瞬で埋まる）、フォーム、モーダル内。

## Preview

公開プレビュー: https://animation-factory.app/preview/gsap-scrub-progress

## Implementation

### GSAP + ScrollTrigger

```tsx
"use client";
import { useRef, useEffect } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

export function ScrubProgress() {
  const barRef = useRef<HTMLDivElement>(null);
  const labelRef = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const ctx = gsap.context(() => {
      gsap.fromTo(
        barRef.current,
        { scaleX: 0 },
        {
          scaleX: 1,
          ease: "none",
          scrollTrigger: {
            trigger: document.documentElement,
            start: "top top",
            end: "bottom bottom",
            scrub: true,
            onUpdate: (self) => {
              if (labelRef.current) {
                labelRef.current.textContent =
                  Math.round(self.progress * 100) + "%";
              }
            },
          },
        },
      );
    });

    return () => ctx.revert();
  }, []);

  return (
    <div className="fixed top-0 left-0 right-0 z-50">
      <div
        ref={barRef}
        className="h-1 origin-left bg-lime-300"
        style={{ transform: "scaleX(0)" }}
      />
      <span ref={labelRef} className="text-xs">0%</span>
    </div>
  );
}
```

### CSS scroll-driven animation（縮退）

```css
/* GSAP なしでバーの伸長のみ。数値 % は出せない。未対応ブラウザでは進捗 0 のまま */
@supports (animation-timeline: scroll()) {
  .scrub-progress {
    transform-origin: left;
    animation: scrub-grow linear;
    animation-timeline: scroll(root block);
  }
  @keyframes scrub-grow {
    from { transform: scaleX(0); }
    to   { transform: scaleX(1); }
  }
}
@media (prefers-reduced-motion: reduce) {
  .scrub-progress { animation: none; transform: scaleX(0); }
}
```

## Usage

```tsx
<ScrubProgress />
```

## AI Apply Prompt

### Context
`{{target_page}}` の最上部に、スクロール量へ scrub 連動する進捗バー（+ 数値 %）を追加する。

### Steps
1. `gsap@^3.13` を `{{package_manager}}` で追加。
2. 上記 `ScrubProgress` コンポーネントを `{{target_file}}` に追加し、ページのルートで呼ぶ。サーバコンポーネントから呼ぶ場合は `"use client"` を確認。
3. `start` / `end`（既定 `top top` 〜 `bottom bottom`）で 0%〜100% の範囲を決める。セクション限定なら `trigger` を該当要素に変える。
4. `gsap.context()` と `ctx.revert()` を必ず併用し、unmount でクリーンアップする。
5. Reduce Motion 設定時は ScrollTrigger を作らない分岐（上記）を維持する。

### Examples

Before: スクロール位置の手がかりがない長文ページ
After: 最上部の lime バーがスクロールに直結して伸び、`42%` のように数値も更新

### Verify
- スクロールに合わせてバーが伸び、戻すと縮む（双方向追従）
- 数値 % がバーの進捗と一致して更新される
- ページ末尾で 100% に到達する
- Reduce Motion ON でバーが動かず、本文の読了は妨げられない
- unmount 時に残留ハンドラがない（`ctx.revert()` が効いている）

## Accessibility

- ScrollTrigger は `prefers-reduced-motion` を自動尊重しないため、上記のように **手動チェック** で生成自体を止める。
- 進捗バーは原則 **装飾**。意味を持たせる場合のみ `role="progressbar"` と `aria-valuenow` を付け、視覚だけに依存させない。
- フォーカス可能要素を進捗バー領域に置かない（純粋な表示要素に留める）。

## Performance Notes

- バーは `scaleX`（transform）で伸ばすため GPU 内で完結。`width` アニメーションは layout を誘発するので避ける。
- 数値 % は `onUpdate` での `textContent` 更新に限定し、毎フレームの React 再レンダーを避ける。
- `gsap.context()` + `ctx.revert()` で unmount 時に ScrollTrigger インスタンスを確実に破棄する。

## Changelog

- 2026-06-02 (created): 初版。v1.2（Tier B）、scroll-progress feedback の scrub 連動進捗バーを追加。
