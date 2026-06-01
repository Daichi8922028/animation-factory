---
# ── 識別 ─────────────────────────────
id: hover-lift
name: Hover Lift
version: 1.0.0
release: v1.0
variant: vanilla-css
description: |
  カードやボタンにポインタを乗せると、わずかに浮き上がり影が深くなる
  定番のマイクロインタラクション。クリック可能であることを示す。

# ── タクソノミー（schema v0.2）─────────
taxonomy:
  layer: [css]
  ux_role:
    primary: micro-interaction
    secondary: [feedback]
  trigger: [pointer]
  media: [dom-css]
  authoring: code

# ── 振る舞いの性質（schema v0.2）─────────
behavior:
  lifecycle: continuous
  reversible: true
  replay: every-entry

# ── タグ（自然言語） ─────────────────
tags:
  - hover
  - lift
  - elevation
  - shadow
  - card
  - affordance
  - clickable

# ── トリガー詳細（schema v0.2）─────────
trigger:
  primary: pointer
  touch_fallback: disabled      # @media (hover: hover) でガード。タッチでは発火させない
  config: {}

# ── 環境要件 ─────────────────────────
runtime:
  language: css
  framework: none
  framework_version: null
  bundler: null
dependencies: []        # 代表値 Tier 1 は純 CSS。Tier 2(React) は motion を要する（implementations 参照）
peer_dependencies: []

# ── 実装 Tier（schema v0.2）─────────────
implementations:
  - tier: 1
    name: "Vanilla CSS"
    browser_support: { baseline: widely-available, baseline_year: 2015 }
    performance:     { gpu_accelerated: true, layout_thrash: false, cost: low }
    degrades_to: 2
  - tier: 2
    name: "React + Motion"
    browser_support: { baseline: widely-available, baseline_year: 2020 }
    performance:     { gpu_accelerated: true, layout_thrash: false, cost: low }
    degradation: "結果は同等。タッチ判定や条件分岐など JS 制御が要るときの代替実装（motion@^11 が必要）"

# ── 代表値（= Tier 1。Tier 差は implementations[] 参照）─
browser_support:
  baseline: widely-available
  baseline_year: 2015
  notes: "代表値は Tier 1（Vanilla CSS）。hover はポインタ無しデバイスで発火しないため `@media (hover: hover)` でガード"

# ── 振る舞いパラメータ ─────────────
parameters:
  - { name: lift_px,     type: number, default: 4,   range: [1, 16],     description: "上方向の移動量" }
  - { name: duration_ms, type: number, default: 180, range: [80, 400],   description: "ホバー進入／離脱の長さ" }
  - { name: scale,       type: number, default: 1.0, range: [1.0, 1.05], description: "任意の拡大率。1.0 で無効" }
  - { name: easing,      type: enum,   default: "ease-out",
      values: ["linear","ease-in","ease-out","ease-in-out"] }

# ── アクセシビリティ ──────────────
a11y:
  respects_reduced_motion: true
  fallback: "transform は無効化し、影の変化のみ残す（移動なしでも状態は伝わる）"
  focus_safe: true
  notes: "キーボード操作のため :focus-visible にも同じ視覚を適用する"

# ── パフォーマンス ────────────────
performance:
  gpu_accelerated: true
  layout_thrash: false
  cost: "low"
  notes: "box-shadow の直接アニメは再描画が重い。擬似要素に影を載せ opacity を補間する手法で GPU 内に収める"

# ── ライセンス・出典 ──────────────
license: MIT
authors: ["@daichi"]
sources: []
attribution_required: false

# ── プレビュー ───────────────────
preview:
  url: https://animation-factory.app/preview/hover-lift
  thumbnail: ./assets/hover-lift.webp
  loop: true
  duration_ms: 800

# ── 関連 ─────────────────────────
related:
  alternatives: [hover-glow, hover-tilt, hover-scale]
  composes_with:
    - { id: entrance-stagger-fade, note: "登場後に hover-lift。発火タイミングが分かれるので衝突しない" }
    - { id: press-shrink,          note: "hover で浮く→press で沈む。逆方向で自然に共存" }
  requires: []

# ── セクション省略宣言（schema v0.2）─
sections:
  skip: [variants]

ai:
  intent_examples:
    - "カードにホバーで浮く動きをつけたい"
    - "ボタンを hover でちょっと持ち上げる"
    - "クリックできそうに見せたい"
  apply_targets: ["card", "button", "link-tile", "clickable-container"]
  do_not_apply_to: ["body-text", "disabled-element", "list-row-dense"]
---

## Overview

ポインタが要素に乗っている間、要素が `lift_px` だけ上昇し影が深くなる。離れると元に戻る。**継続・可逆**のインタラクション（マウント時 1 回だけの登場アニメとは性質が違う）。

役割は **アフォーダンス** — 「これはクリックできる」と視覚で伝える。

使う場面:

- カードグリッドの各カード
- CTA ボタン、価格プランのタイル
- リンクになっている画像サムネ

避けたい場面:

- 本文テキストやラベル（クリック不能なものを持ち上げると誤誘導）
- 無効状態の要素（`disabled` は動かさない）
- 行間の詰まった密なリスト（隣接要素と重なって見える）

## Preview

- 公開プレビュー: https://animation-factory.app/preview/hover-lift
- 静止サムネ: `./assets/hover-lift.webp`

## Implementation

### Vanilla CSS

```css
/* 影は擬似要素に持たせ、opacity を補間して GPU 内で完結させる。
   box-shadow を直接 transition すると再描画が重いため。 */
.hover-lift {
  position: relative;
  transition: transform 180ms ease-out;
  will-change: transform;
}

.hover-lift::after {
  content: "";
  position: absolute;
  inset: 0;
  border-radius: inherit;
  box-shadow: 0 12px 28px rgba(0, 0, 0, 0.18);
  opacity: 0;
  transition: opacity 180ms ease-out;
  pointer-events: none;
}

/* ポインタを持つデバイスでのみ hover を発火させる */
@media (hover: hover) {
  .hover-lift:hover {
    transform: translateY(-4px);
  }
  .hover-lift:hover::after {
    opacity: 1;
  }
}

/* キーボード操作でも同じ視覚を出す */
.hover-lift:focus-visible {
  transform: translateY(-4px);
}
.hover-lift:focus-visible::after {
  opacity: 1;
}

@media (prefers-reduced-motion: reduce) {
  .hover-lift,
  .hover-lift::after { transition-duration: 0.01ms; }
  .hover-lift:hover,
  .hover-lift:focus-visible { transform: none; }   /* 移動はやめ、影だけ残す */
}
```

### React + Motion

```tsx
// HoverLift.tsx — JS で制御したい場合（タッチ判定や条件分岐を足したいとき）
import { motion, useReducedMotion } from "motion/react";
import type { ReactNode } from "react";

type Props = {
  children: ReactNode;
  liftPx?: number;     // default 4
  durationMs?: number; // default 180
  scale?: number;      // default 1.0
};

export function HoverLift({ children, liftPx = 4, durationMs = 180, scale = 1.0 }: Props) {
  const reduce = useReducedMotion();
  return (
    <motion.div
      whileHover={reduce ? undefined : { y: -liftPx, scale }}
      whileFocus={reduce ? undefined : { y: -liftPx, scale }}
      transition={{ duration: durationMs / 1000, ease: "easeOut" }}
      style={{ display: "inline-block" }}
    >
      {children}
    </motion.div>
  );
}
```

> 純 CSS で足りる動きなので、**第一選択は Vanilla CSS 版**。JS 版はタッチ端末での無効化やアプリ状態に応じた条件分岐が必要なときだけ使う。

## Usage

CSS 版（推奨）:

```html
<article class="hover-lift card">
  <h3>Plan A</h3>
  <p>月額 ¥980</p>
</article>
```

React 版:

```tsx
<HoverLift liftPx={6}>
  <Card title="Plan A" />
</HoverLift>
```

## AI Apply Prompt

### Context
`{{target_selector}}` にホバーで浮き上がるアフォーダンスを付ける。純 CSS で完結するため、原則として依存追加は不要。

### Steps
1. `{{target_file}}` の対象要素に `hover-lift` クラスを追加する。
2. 上記 Vanilla CSS をスタイルシートに追記する。要素に `border-radius` がある場合、`::after` は `inherit` で追従する。
3. 対象要素が `position: static` なら、`hover-lift` クラスが `position: relative` を与えるので既存レイアウトに影響しないか確認する。
4. 対象がリンク／ボタンでない（クリック不能）の場合は **適用しない**。ユーザーに確認する。
5. JS 制御が必要な指示（例: タッチ端末で無効化したい）が明示された場合のみ React + Motion 版に切り替え、`motion@^11` を `{{package_manager}}` で追加する。

### Examples

Before:

```html
<article class="card">…</article>
```

After:

```html
<article class="card hover-lift">…</article>
```

### Verify
- ポインタを乗せると要素が上昇し影が出る。離すと戻る。
- `@media (hover: hover)` のおかげで、タッチ端末でタップしても「浮いたまま張り付く」状態にならない。
- キーボード Tab でフォーカスしても同じ視覚が出る（`:focus-visible`）。
- OS の Reduce Motion ON で、移動が消え影だけが変化する。
- `box-shadow` を直接 transition していない（擬似要素 opacity 方式になっている）。

## Accessibility

- **タッチ端末**: `hover` はポインタ端末でしか発火しない。`@media (hover: hover)` でガードしないと、タップ後に hover 状態が固着する端末がある。
- **キーボード**: `:focus-visible` に同じ視覚を割り当て、マウス利用者とキーボード利用者で体験を揃える。
- **Reduce Motion**: 移動（`transform`）を無効化し、影の変化だけ残す。状態は伝わるが揺れない。
- フォーカスリング（`outline`）は上書きしない。

## Performance Notes

- `transform` と擬似要素の `opacity` のみを補間 → GPU コンポジット内で完結、Layout/Paint を引き起こさない。
- `box-shadow` を直接 `transition` するアンチパターンを避けるため、影は `::after` に載せて `opacity` で出し入れする。
- `will-change: transform` は対象が多数（数百）の場合メモリを食う。グリッドが巨大なら外すか、`:hover` 直前に付与する戦略にする。

## Examples in the Wild

- Stripe のトップページの機能カード（ホバーでわずかに浮上）
- Vercel のテンプレートギャラリーのサムネ
- Linear の料金プランカード

（同一の実装かは未検証。視覚的に同系統の例として参照）

## Changelog

- 2026-05-23 (created): 初版。スキーマ v0.1 検証用の第 2 サンプル（micro-interaction / pointer トリガー）。
- 2026-05-23 (update): スキーマ v0.2 に追従。`behavior` / `trigger` オブジェクト / `implementations[]` を追加、`composes_with` を {id,note} 形式へ。
- 2026-05-23 (update): スキーマ v1.0（凍結）に追従。`release: alpha` を追加、version を 1.0.0 に。
