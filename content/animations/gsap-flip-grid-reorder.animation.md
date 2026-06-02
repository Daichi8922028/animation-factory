---
id: gsap-flip-grid-reorder
name: GSAP Flip Grid Reorder
version: 1.0.0
release: v1.2
variant: gsap
description: |
  GSAP Flip プラグインでグリッド項目の並び替えを滑らかにアニメーション化する。
  DOM 順序を変えた後に Flip.from() で旧位置→新位置の差分を補間し、レイアウト変更を
  視覚的に追跡可能にする。ギャラリー・カンバン・フィルタ結果の並べ替え演出に。

taxonomy:
  layer: [js-runtime, library, css]
  ux_role:
    primary: state-transition
    secondary: [feedback, spatial-continuity]
  trigger: [state-change]
  media: [dom-css]
  authoring: code

behavior:
  lifecycle: oneshot
  reversible: false
  replay: every-entry

tags:
  - gsap
  - flip
  - grid
  - reorder
  - shuffle
  - layout-animation
  - first-last-invert-play

trigger:
  primary: state-change
  touch_fallback: always-on
  config:
    duration: 0.6
    ease: "power2.inOut"
    stagger: 0.03

runtime:
  language: typescript
  framework: react
  framework_version: ">=18"
dependencies:
  - { name: gsap, version: "^3.13.0", purpose: "Flip プラグインを含むコアタイムライン" }
peer_dependencies:
  - { name: react, version: ">=18" }

implementations:
  - tier: 1
    name: "GSAP + Flip"
    dependencies: [ { name: gsap, version: "^3.13.0" } ]
    browser_support: { baseline: widely-available, baseline_year: 2020 }
    performance: { gpu_accelerated: true, layout_thrash: false, cost: medium }
    degrades_to: 2
  - tier: 2
    name: "Vanilla FLIP (getBoundingClientRect + WAAPI)"
    dependencies: []
    browser_support: { baseline: widely-available, baseline_year: 2018 }
    performance: { gpu_accelerated: true, layout_thrash: true, cost: medium }
    degradation: "自前で旧矩形を計測して transform を補間。stagger やネスト要素のクリップ補正など Flip の細かな配慮は省略され、複数要素で layout 計測が増える"

browser_support:
  baseline: widely-available
  baseline_year: 2020
  notes: "代表値は Tier 1（GSAP Flip）。transform 補間のみで描画され、CSS Grid が使える全モダンブラウザで動作"

performance:
  gpu_accelerated: true
  layout_thrash: false
  cost: medium
  notes: "Flip は記録時に一括で getBoundingClientRect し、再生は transform のみ。項目数が増えると記録コストが線形に増えるが layout thrash は起こさない"

parameters:
  - { name: duration_s, type: number, default: 0.6, range: [0.2, 1.5], description: "1 回の並べ替えアニメーションの長さ（秒）" }
  - { name: stagger_s, type: number, default: 0.03, range: [0, 0.12], description: "項目ごとの開始遅延。波打つように動かす" }
  - { name: ease, type: enum, default: "power2.inOut",
      values: ["power2.inOut", "power3.out", "back.out(1.4)", "elastic.out(1,0.5)"],
      description: "GSAP イージング。インタラクティブなら out 系、自動 shuffle なら inOut が落ち着く" }

a11y:
  respects_reduced_motion: true
  fallback: "Flip アニメーションを生成せず、DOM 順序だけ即座に入れ替える（瞬間移動）"
  focus_safe: true
  notes: "並べ替えは視覚演出であり情報そのものは DOM 順で保持される。自動 shuffle は装飾用途に留め、操作対象には reorder の結果を aria-live や見出しで補う"

license: MIT
authors: ["@daichi"]
sources:
  - { title: "GSAP Flip Plugin 公式ドキュメント", url: "https://gsap.com/docs/v3/Plugins/Flip/" }
  - { title: "FLIP テクニック (Paul Lewis)", url: "https://aerotwist.com/blog/flip-your-animations/" }
attribution_required: false

preview:
  url: https://animation-factory.app/preview/gsap-flip-grid-reorder
  loop: true
  duration_ms: 2400

related:
  alternatives: [drag-reorder, view-transition-list-reorder, gsap-scroll-pin, scale-in]
  composes_with:
    - { id: fade-up, note: "フィルタで項目数が変わる場合、出入りする項目を fade-up と組み合わせる" }
    - { id: scale-in, note: "新規追加項目を Flip の onEnter で scale-in させると自然" }
  requires: []

sections:
  skip: [variants]

ai:
  intent_examples:
    - "グリッドの並び替えを滑らかにアニメーションさせたい"
    - "GSAP Flip でカードをシャッフルする演出"
    - "フィルタ結果が並べ替わるときに項目が移動して見えるようにしたい"
  apply_targets: ["card-grid", "gallery", "kanban-column", "filter-results"]
  do_not_apply_to: ["data-table", "long-list", "navigation", "body-text"]
---

## Overview

CSS Grid の項目の **DOM 順序を変えた後**、GSAP の Flip プラグインで旧位置から新位置への差分を transform で補間する。Flip は記録（`Flip.getState`）→ DOM 変更 → 再生（`Flip.from`）の 3 ステップで、いわゆる FLIP（First / Last / Invert / Play）テクニックを安全に実装したもの。レイアウトの変化を **空間的連続性** を保って見せられる。

このプレビューでは一定間隔で自動 shuffle するが、実用ではフィルタ・ソート・ドラッグ確定などの `state-change` を起点に呼び出す。

使う場面: 画像ギャラリーの並べ替え / カンバンのカード移動 / フィルタ後の結果の再配置。
避けたい場面: 大量行のデータテーブル（記録コストが重い）、ナビゲーション、本文。

## Preview

公開プレビュー: https://animation-factory.app/preview/gsap-flip-grid-reorder

## Implementation

### GSAP + Flip

```tsx
"use client";
import { useRef } from "react";
import gsap from "gsap";
import { Flip } from "gsap/Flip";

gsap.registerPlugin(Flip);

export function FlipGrid({ items }: { items: string[] }) {
  const gridRef = useRef<HTMLUListElement>(null);
  const order = useRef(items);

  function shuffle() {
    const grid = gridRef.current;
    if (!grid) return;

    // 1. 現在のレイアウトを記録（First + Last の基準）
    const state = Flip.getState(grid.children);

    // 2. DOM 順序を変更（ここではランダム並べ替え）
    const children = Array.from(grid.children);
    children
      .map((el) => ({ el, k: Math.random() }))
      .sort((a, b) => a.k - b.k)
      .forEach(({ el }) => grid.appendChild(el));

    // 3. 記録した state から新位置へ補間（Invert + Play）
    Flip.from(state, {
      duration: 0.6,
      ease: "power2.inOut",
      stagger: 0.03,
      absolute: true, // 移動中にレイアウトが崩れないよう一時的に absolute 化
    });
  }

  return (
    <ul ref={gridRef} className="grid grid-cols-3 gap-3">
      {order.current.map((label) => (
        <li key={label} className="rounded-lg bg-zinc-800 p-6 text-center">
          {label}
        </li>
      ))}
    </ul>
  );
}
```

Reduce Motion 時は `Flip.from` を呼ばず DOM 並べ替えだけ行う（瞬間で入れ替わる）。

### Vanilla FLIP（縮退）

GSAP を使わず、素の FLIP テクニックで近い挙動を出す簡易代替。stagger やクリップ補正はなく、計測コストも増える。

```ts
function flipReorder(grid: HTMLElement, reorder: () => void) {
  const items = Array.from(grid.children) as HTMLElement[];
  const first = new Map(items.map((el) => [el, el.getBoundingClientRect()]));

  reorder(); // DOM 順序を変更

  for (const el of items) {
    const last = el.getBoundingClientRect();
    const f = first.get(el)!;
    const dx = f.left - last.left;
    const dy = f.top - last.top;
    if (dx === 0 && dy === 0) continue;
    el.animate(
      [
        { transform: `translate(${dx}px, ${dy}px)` },
        { transform: "translate(0, 0)" },
      ],
      { duration: 600, easing: "ease-in-out" },
    );
  }
}
```

## Usage

```tsx
<FlipGrid items={["A", "B", "C", "D", "E", "F"]} />
```

並べ替えのトリガはボタンやフィルタ変更などの `state-change` に紐づける。

## AI Apply Prompt

### Context
`{{target_selector}}` の CSS Grid 項目を、並べ替え時に GSAP Flip で移動アニメーションさせる。

### Steps
1. `gsap@^3.13` を `{{package_manager}}` で追加（Flip は同梱、別パッケージ不要）。
2. `import { Flip } from "gsap/Flip"; gsap.registerPlugin(Flip);` を追加。
3. 並べ替えの直前に `Flip.getState(grid.children)`、DOM 順序を変更後に `Flip.from(state, { duration, ease, stagger, absolute: true })` を呼ぶ。
4. Reduce Motion 設定時は `Flip.from` を呼ばず、DOM の並べ替えのみ行う分岐を入れる。
5. React なら並べ替えはイベントハンドラ内（または rAF / interval コールバック内）で実行し、`useEffect` 本体で同期的に状態更新しない。

### Examples

Before: フィルタで `<li>` の順序が一瞬で切り替わる
After: `Flip.getState` → 並べ替え → `Flip.from` で項目が新位置へ滑らかに移動

### Verify
- 並べ替え時、各項目が旧位置から新位置へ移動して見える（瞬間移動しない）
- `absolute: true` で移動中にグリッドが崩れない
- Reduce Motion ON で即座に入れ替わり、アニメーションが出ない
- unmount / 連続トリガ時に残留トゥイーンやエラーがない

## Accessibility

- Flip は視覚的な **空間的連続性** の演出であり、情報は DOM 順で保持される。
- `prefers-reduced-motion: reduce` で `Flip.from` をスキップし瞬間移動に縮退する。自動 shuffle は装飾に留め、ユーザー操作の結果は見出しや `aria-live` でテキストでも伝える。
- フォーカス中の要素が移動してもフォーカスは保持される（DOM ノードを使い回すため）。`key` を安定させてノード再生成を避ける。

## Performance Notes

- `Flip.getState` は対象要素を一括で `getBoundingClientRect` するため、項目数に比例して記録コストが増える。数十項目までが快適。
- 再生は `transform` のみで GPU 合成に乗り、layout thrash を起こさない。
- 連続トリガ時は進行中のトゥイーンを `Flip.from` が引き継ぐ。手動で多重起動する場合は前のトゥイーンを `gsap.killTweensOf` で止める。
- React では `gsap.context()` でスコープし、unmount 時に `ctx.revert()` でクリーンアップする。

## Changelog

- 2026-06-02 (created): 初版。v1.2（Tier B）、GSAP Flip による grid reorder の追加。
