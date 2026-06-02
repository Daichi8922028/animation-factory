---
id: gsap-batch-reveal
name: GSAP Batch Reveal
version: 1.0.0
release: v1.2
variant: gsap-scrolltrigger
description: |
  GSAP ScrollTrigger.batch でビューポートに入ったカード群をまとめて検知し、
  stagger 付きで一斉に reveal する演出。多数の要素に ScrollTrigger を 1 つずつ
  作らず、batch で束ねて間引くため、リストやグリッドの登場に向く。

taxonomy:
  layer: [css, js-runtime, library]
  ux_role:
    primary: state-transition
    secondary: [storytelling]
  trigger: [viewport]
  media: [dom-css]
  authoring: code

behavior:
  lifecycle: oneshot
  reversible: false
  replay: every-entry

tags:
  - gsap
  - scrolltrigger
  - batch
  - stagger
  - reveal
  - scroll-reveal
  - grid

trigger:
  primary: viewport
  touch_fallback: always-on
  config:
    start: "top 85%"
    batchMax: 12
    interval: 0.1

runtime:
  language: typescript
  framework: react
  framework_version: ">=18"
dependencies:
  - { name: gsap, version: "^3.13.0", purpose: "ScrollTrigger.batch を含むコアタイムライン" }
peer_dependencies:
  - { name: react, version: ">=18" }

implementations:
  - tier: 1
    name: "GSAP ScrollTrigger.batch"
    dependencies: [ { name: gsap, version: "^3.13.0" } ]
    browser_support: { baseline: widely-available, baseline_year: 2020 }
    performance: { gpu_accelerated: true, layout_thrash: false, cost: medium }
    degrades_to: 2
  - tier: 2
    name: "IntersectionObserver + CSS transition"
    dependencies: []
    browser_support: { baseline: widely-available, baseline_year: 2019 }
    performance: { gpu_accelerated: true, layout_thrash: false, cost: low }
    degradation: "batch の間引きと滑らかな stagger は失われ、各要素が個別に閾値到達時 fade-up するだけの簡易代替"

browser_support:
  baseline: widely-available
  baseline_year: 2020
  notes: "代表値は Tier 1（GSAP）。Tier 2 IntersectionObserver は機能縮退、batch のまとめ検知は失われる"

performance:
  gpu_accelerated: true
  layout_thrash: false
  cost: medium
  notes: "ScrollTrigger.batch は同フレームに入った要素を 1 コールバックに束ねるため、要素数が多くてもトリガ生成コストを抑えられる。reveal は opacity と translateY のみ補間"

parameters:
  - { name: stagger_s, type: number, default: 0.1, range: [0.02, 0.4], description: "batch 内の各カードをずらす間隔（秒）" }
  - { name: batch_max, type: number, default: 12, range: [3, 50], description: "1 回の onEnter でまとめて処理する最大要素数" }
  - { name: y_offset_px, type: number, default: 28, range: [8, 80], description: "reveal 前の初期 translateY（下からせり上がる量）" }

a11y:
  respects_reduced_motion: true
  fallback: "ScrollTrigger を生成せず、カードは初期から可視（opacity 1 / translate なし）でそのまま表示"
  focus_safe: true
  notes: "reveal 中も DOM 順は変わらないため Tab 順は安定。視覚的登場だけに意味を持たせず、内容自体はスクロール前から読める前提にする"

license: MIT
authors: ["@daichi"]
sources:
  - { title: "ScrollTrigger.batch() 公式ドキュメント", url: "https://gsap.com/docs/v3/Plugins/ScrollTrigger/static.batch()/" }
attribution_required: false

preview:
  url: https://animation-factory.app/preview/gsap-batch-reveal
  loop: true
  duration_ms: 2600

related:
  alternatives: [scroll-reveal, entrance-stagger-fade, css-scroll-driven]
  composes_with:
    - { id: fade-up, note: "各カードの reveal を fade-up と同じ opacity + y の組で揃えると一貫する" }
    - { id: gsap-scroll-pin, note: "pin したセクションの中で batch reveal を併用するとリッチなスクロリーテリングになる" }
  requires: []

sections:
  skip: [variants]

ai:
  intent_examples:
    - "スクロールでカードが見えたら順番にふわっと出したい"
    - "グリッドの大量のアイテムを ScrollTrigger でまとめて stagger reveal したい"
    - "リストが画面に入ったら一斉に登場させる演出"
  apply_targets: ["card-grid", "feature-list", "gallery", "pricing-cards"]
  do_not_apply_to: ["above-the-fold-hero", "form", "data-table", "navigation-bar"]
---

## Overview

`ScrollTrigger.batch()` は、複数の要素を **個別のトリガにせず** 1 つの batch として監視し、同じフレームでビューポートに入った要素をまとめて `onEnter` コールバックに渡す。これにより大量のカードに対しても登場処理を間引きでき、`gsap.from(elements, { stagger })` で一斉に stagger reveal できる。

挙動は oneshot（`once: true`）で、各カードは初回進入時に下からせり上がりながら不透明になる。多数要素の登場で個別 ScrollTrigger を作るとインスタンスが増えすぎる問題を、batch が解決する。

使う場面: 機能カードのグリッド / ギャラリー / 料金プランのカード列 / 長い特徴リスト。
避けたい場面: ファーストビュー（スクロール前に見える領域）、フォーム、データテーブル、ナビバー。

## Preview

公開プレビュー: https://animation-factory.app/preview/gsap-batch-reveal

## Implementation

### GSAP ScrollTrigger.batch（Tier 1）

```tsx
"use client";
import { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

export function BatchRevealGrid() {
  const rootRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!rootRef.current) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    gsap.registerPlugin(ScrollTrigger);

    const ctx = gsap.context(() => {
      gsap.set(".reveal-card", { opacity: 0, y: 28 });

      ScrollTrigger.batch(".reveal-card", {
        start: "top 85%",
        once: true,
        batchMax: 12,
        onEnter: (batch) =>
          gsap.to(batch, {
            opacity: 1,
            y: 0,
            duration: 0.6,
            ease: "power2.out",
            stagger: 0.1,
            overwrite: true,
          }),
      });
    }, rootRef);

    return () => ctx.revert();
  }, []);

  return (
    <div ref={rootRef} className="grid grid-cols-2 gap-4">
      {items.map((it) => (
        <article key={it.id} className="reveal-card">
          {it.title}
        </article>
      ))}
    </div>
  );
}
```

### IntersectionObserver + CSS transition（Tier 2 / 縮退）

```tsx
"use client";
import { useEffect, useRef } from "react";

// batch の束ね検知は無し。各カードが個別に閾値到達で fade-up するだけ。
export function ObserverRevealGrid() {
  const rootRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!rootRef.current) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const cards = rootRef.current.querySelectorAll<HTMLElement>(".reveal-card");
    const io = new IntersectionObserver(
      (entries, obs) => {
        for (const e of entries) {
          if (e.isIntersecting) {
            e.target.classList.add("is-visible");
            obs.unobserve(e.target); // once 相当
          }
        }
      },
      { rootMargin: "0px 0px -15% 0px" },
    );
    cards.forEach((c) => io.observe(c));
    return () => io.disconnect();
  }, []);

  return <div ref={rootRef}>{/* .reveal-card に opacity/translate の CSS transition */}</div>;
}
```

## Usage

```tsx
<BatchRevealGrid />
```

## AI Apply Prompt

### Context
`{{target_selector}}`（カードのグリッド/リスト）がスクロールでビューポートに入ったとき、`ScrollTrigger.batch` でまとめて検知し stagger reveal する。

### Steps
1. `gsap@^3.13` を `{{package_manager}}` で追加。
2. 上記 Tier 1 コンポーネントを `{{target_file}}` に追加。各アイテムへ `reveal-card` クラスを付与。
3. `useEffect` 冒頭で Reduce Motion を判定し、ON のときは ScrollTrigger を作らず初期可視のままにする分岐を維持。
4. `gsap.set` で初期状態（`opacity: 0, y: 28`）を与え、`onEnter` で `gsap.to(batch, { stagger })`。`once: true` で再発火を防ぐ。
5. `gsap.context()` + `ctx.revert()` を必ず併用し、unmount で batch トリガを確実に破棄。

### Examples

Before: カードグリッドがスクロール前から全部表示
After: ビューポート進入時に行ごとにふわっと stagger reveal

### Verify
- 画面に入ったカード群がまとめて下からせり上がって登場
- 多数のカードでも ScrollTrigger インスタンスが大量生成されない（batch にまとまる）
- 一度出たカードは再スクロールしても再発火しない（`once: true`）
- Reduce Motion ON で reveal せず最初から表示される
- unmount 時にエラーや残留トリガがない（`ctx.revert()` が効いている）

## Accessibility

- ScrollTrigger は `prefers-reduced-motion` を自動尊重しないため、上記のように **手動チェック** が必須。OFF 時は最初から可視にする。
- reveal は装飾。コンテンツ自体は登場アニメに依存せず読める前提にし、視覚的な「出現」に情報を載せない。
- DOM 順は変えないため Tab 順・スクリーンリーダー読み上げ順は安定。

## Performance Notes

- `ScrollTrigger.batch` は同フレームで進入した要素を 1 コールバックに束ねるため、要素数が増えてもトリガ生成・コールバック呼び出しコストを抑えられる。
- reveal は `opacity` と `transform: translateY` のみで GPU 合成内に収まり、レイアウトを揺らさない。
- `once: true` で完了後にトリガを破棄でき、`gsap.context()` + `ctx.revert()` で React unmount 時に確実にクリーンアップされる構成にする。

## Changelog

- 2026-06-02 (created): 初版。v1.2（Tier B）、ScrollTrigger.batch による grid/list の stagger reveal を追加。
