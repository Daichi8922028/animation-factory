---
# ── 識別 ─────────────────────────────
id: entrance-stagger-fade
name: Stagger Fade Entrance
version: 1.0.0
release: v1.0
variant: react-motion
description: |
  リスト項目を順に少しずつ遅らせて、下からふわっとフェードインさせる
  汎用の登場アニメーション。カードグリッドや箇条書きの初期表示に使う。

# ── タクソノミー（schema v0.2）─────────
taxonomy:
  layer: [css, js-runtime, library]
  ux_role:
    primary: state-transition
    secondary: [micro-interaction]
  trigger: [viewport]
  media: [dom-css]
  authoring: code

# ── 振る舞いの性質（schema v0.2）─────────
behavior:
  lifecycle: oneshot
  reversible: false
  replay: once

# ── タグ（自然言語） ─────────────────
tags:
  - fade-in
  - stagger
  - entrance
  - list
  - subtle
  - on-mount

# ── トリガー詳細（schema v0.2）─────────
trigger:
  primary: viewport
  touch_fallback: always-on
  config:
    amount: 0.15            # Motion whileInView の可視率しきい値

# ── 環境要件 ─────────────────────────
runtime:
  language: typescript
  framework: react
  framework_version: ">=18 <20"
  bundler: vite
dependencies:
  - { name: motion, version: "^11.0.0", purpose: "アニメ駆動" }
peer_dependencies:
  - { name: react,     version: ">=18" }
  - { name: react-dom, version: ">=18" }

# ── 実装 Tier（schema v0.2）─────────────
implementations:
  - tier: 1
    name: "React + Motion"
    browser_support: { baseline: widely-available, baseline_year: 2020 }
    performance:     { gpu_accelerated: true, layout_thrash: false, cost: low }
    degrades_to: 2
  - tier: 2
    name: "Vanilla CSS"
    browser_support: { baseline: widely-available, baseline_year: 2017 }
    performance:     { gpu_accelerated: true, layout_thrash: false, cost: low }
    degradation: "stagger 個数が :nth-child の静的上限を持つ（N 不定なら Tier 1）"

# ── 代表値（= Tier 1。Tier 差は implementations[] 参照）─
browser_support:
  baseline: widely-available
  baseline_year: 2020
  notes: "代表値は Tier 1（React + Motion）。Safari 16 以下も基本機能は動作。Tier 差は implementations[] 参照"

# ── 振る舞いパラメータ ─────────────
parameters:
  - { name: duration_ms, type: number, default: 400, range: [100, 1500], description: "1 アイテムあたりの長さ" }
  - { name: stagger_ms,  type: number, default: 60,  range: [0, 300],    description: "次アイテムまでの遅延" }
  - { name: distance_px, type: number, default: 16,  range: [0, 64],     description: "下からの初期オフセット" }
  - { name: easing,      type: enum,   default: "ease-out",
      values: ["linear","ease-in","ease-out","ease-in-out","spring"] }

# ── アクセシビリティ ──────────────
a11y:
  respects_reduced_motion: true
  fallback: "duration を 0.01s、distance_px を 0 に上書きし、即時表示する"
  focus_safe: true
  notes: "Motion は useReducedMotion() を尊重。pointer トリガーではないため focus ミラーは不要"

# ── パフォーマンス ────────────────
performance:
  gpu_accelerated: true
  layout_thrash: false
  cost: low
  notes: "transform / opacity のみ。Layout を引き起こさない。代表値は Tier 1"

# ── ライセンス・出典 ──────────────
license: MIT
authors: ["@daichi"]
sources: []
attribution_required: false

# ── プレビュー ───────────────────
preview:
  url: https://animation-factory.app/preview/entrance-stagger-fade
  thumbnail: ./assets/entrance-stagger-fade.webp
  loop: true
  duration_ms: 1200

# ── 関連 ─────────────────────────
related:
  alternatives: [entrance-slide-up, entrance-blur-in]
  composes_with:
    - { id: hover-lift,    note: "親=entrance の登場後、子に hover-lift。タイミングが分かれるので衝突しない" }
    - { id: scroll-reveal, note: "両者 transform/opacity を使用。同一要素に重ねず階層を分ける" }
  requires: []

ai:
  intent_examples:
    - "リストの登場を順番にふわっと出したい"
    - "stagger fade を card grid に適用"
    - "箇条書きをアニメ付きで現したい"
  apply_targets: ["list", "grid", "card-collection"]
  do_not_apply_to: ["text-input", "modal-backdrop", "skeleton-loader"]
---

## Overview

リスト・グリッドの初期描画時に、各アイテムを `stagger_ms` ずつずらして、下から `distance_px` 上昇しながらフェードインさせる。**マウント時 1 回のみ** 発火し、再マウントするまで再生されない。

使う場面:

- ダッシュボードのカード一覧
- 検索結果リストの初期表示
- ヒーロー直下の箇条書き（読みの導線を作る）

避けたい場面:

- スクロールで何度も視界に入るリスト（毎回流れると鬱陶しい → `scroll-reveal` を使う）
- 入力フォーム（タブ操作のフォーカス遷移と競合する）
- スケルトンローダー（読み込み中の表現には別系統がある）

## Preview

- 公開プレビュー: https://animation-factory.app/preview/entrance-stagger-fade
- 静止サムネ: `./assets/entrance-stagger-fade.webp`

## Implementation

### React + Motion

```tsx
// StaggerFadeList.tsx
import { motion } from "motion/react";
import type { ReactNode } from "react";

type Props = {
  children: ReactNode[];
  durationMs?: number;   // default 400
  staggerMs?: number;    // default 60
  distancePx?: number;   // default 16
  easing?: "linear" | "ease-in" | "ease-out" | "ease-in-out" | "spring";
};

export function StaggerFadeList({
  children,
  durationMs = 400,
  staggerMs = 60,
  distancePx = 16,
  easing = "ease-out",
}: Props) {
  return (
    <motion.ul
      initial="hidden"
      animate="visible"
      variants={{
        hidden: {},
        visible: { transition: { staggerChildren: staggerMs / 1000 } },
      }}
    >
      {children.map((child, i) => (
        <motion.li
          key={i}
          variants={{
            hidden:  { opacity: 0, y: distancePx },
            visible: { opacity: 1, y: 0 },
          }}
          transition={{
            duration: durationMs / 1000,
            ease: easing === "spring" ? undefined : easing,
            type: easing === "spring" ? "spring" : "tween",
          }}
        >
          {child}
        </motion.li>
      ))}
    </motion.ul>
  );
}
```

### Vanilla CSS

```css
/* prefers-reduced-motion を尊重した素の CSS 版。
   stagger は :nth-child で N 段まで列挙する素朴な実装。 */
@keyframes stagger-fade-in {
  from { opacity: 0; transform: translateY(16px); }
  to   { opacity: 1; transform: translateY(0); }
}

.stagger-fade > * {
  opacity: 0;
  animation: stagger-fade-in 400ms ease-out forwards;
}
.stagger-fade > *:nth-child(1) { animation-delay: 0ms; }
.stagger-fade > *:nth-child(2) { animation-delay: 60ms; }
.stagger-fade > *:nth-child(3) { animation-delay: 120ms; }
.stagger-fade > *:nth-child(4) { animation-delay: 180ms; }
.stagger-fade > *:nth-child(5) { animation-delay: 240ms; }
/* …必要な個数まで */

@media (prefers-reduced-motion: reduce) {
  .stagger-fade > * {
    animation-duration: 0.01ms;
    transform: none;
  }
}
```

### Vue 3 / Svelte / 他

N/A（v0.1 では未提供。`variant: vue-transition` / `variant: svelte-transition` で別ファイルとして追加予定）

## Usage

```tsx
import { StaggerFadeList } from "./StaggerFadeList";

<StaggerFadeList staggerMs={80} distancePx={24}>
  <Card title="Plan A" />
  <Card title="Plan B" />
  <Card title="Plan C" />
</StaggerFadeList>
```

最小例（CSS 版）:

```html
<ul class="stagger-fade">
  <li>Plan A</li>
  <li>Plan B</li>
  <li>Plan C</li>
</ul>
```

## AI Apply Prompt

### Context
ユーザーのリスト/グリッドコンポーネントに `entrance-stagger-fade`（React + Motion 版）を適用する。前提: React >=18, motion ^11 が既に or これから入る。

### Steps
1. `package.json` の `dependencies` に `motion@^11` が無ければ追加し、`{{package_manager}}` で install する。
2. `{{target_file}}` から、既存の `<ul>` / `<div role="list">` / 子を `.map()` で並べているコンテナを 1 件特定する。複数あればユーザーに確認する。
3. そのコンテナを上記 `StaggerFadeList` で置き換える。子要素は `key` を保つ。
4. ユーザーが `parameters` の値を変えたい場合のみ props を渡す。明示指定が無ければデフォルトのまま。
5. 既存の `prefers-reduced-motion` の CSS が衝突しないか確認する。Motion は `useReducedMotion()` を内部で尊重するため通常は不要。

### Examples

Before:

```tsx
<ul>
  {plans.map(p => <li key={p.id}>{p.name}</li>)}
</ul>
```

After:

```tsx
<StaggerFadeList>
  {plans.map(p => <li key={p.id}>{p.name}</li>)}
</StaggerFadeList>
```

### Verify
- 初回マウント時に各アイテムが順に下から現れる。
- リロード以外で（親 state 更新だけで）アニメが再生されない。
- DevTools の Performance で paint/composite のみで Layout を含まない。
- OS の Reduce Motion を ON にすると、瞬時表示になる。
- アイテムにフォーカス可能要素がある場合、Tab 順序が崩れない。

## Accessibility

- `prefers-reduced-motion: reduce` 時は **必ず即時表示** にフォールバックする。Motion は `useReducedMotion()` をデフォルトで尊重するが、CSS 版は上記の `@media` クエリで明示する。
- `aria-busy` などのライブリージョン用属性とは独立。スクリーンリーダーは順序通りに読む。
- フォーカスリングを上書きしない（`outline` を触らない）。

## Performance Notes

- 使うプロパティは `opacity` と `transform: translateY` のみ → GPU コンポジット内で完結し、Layout を引き起こさない。
- N アイテム時は最後のアイテムが現れ終わるまでに `duration_ms + (N-1) * stagger_ms` ms かかる。**N > 30 では合計時間が 2.2s を超える** ため、デフォルト値のまま大規模リストに使うのは避け、仮想スクロールと併用するか stagger を減らす。
- CSS 版の `:nth-child` 列挙は静的な上限を持つ。Vanilla で N 不定なら React/Motion 版を選ぶ。

## Variants

- `variant: vue-transition`（未作成）
- `variant: svelte-transition`（未作成）
- `variant: vanilla-css`（本ファイル §Implementation 内に同梱、別 id にはしない）

## Examples in the Wild

- Linear のサインイン後ダッシュボード初期表示（カードが順次フェード）
- Notion のサイドバー展開時の項目登場
- Apple のプロダクトページの spec 一覧

（同一の動きであることは未検証。視覚的に同系統の例として参照）

## Changelog

- 2026-05-09 (created): 初版。スキーマ v0 検証用の第 1 サンプル。
- 2026-05-09 (update): スキーマ v0.1 に追従。`taxonomy.ux_role` を primary/secondary 構造へ、`browser_support` に `baseline_year` を追加。
- 2026-05-23 (update): スキーマ v0.2 に追従。`behavior` / `trigger` オブジェクト / `implementations[]` を追加、`composes_with` を {id,note} 形式へ、`a11y.notes` / `performance.notes` を追記。
- 2026-05-23 (update): スキーマ v1.0（凍結）に追従。`release: alpha` を追加、version を 1.0.0 に。
