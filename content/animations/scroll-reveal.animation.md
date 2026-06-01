---
# ── 識別 ─────────────────────────────
id: scroll-reveal
name: Scroll Reveal
version: 1.0.0
release: v1.0
variant: css-scroll-driven
description: |
  要素がビューポートを通過する進捗に連動して、下からフェードインしながら
  現れる。スクロール量が時間軸になる scroll-linked アニメーション。

# ── タクソノミー（schema v0.2）─────────
taxonomy:
  layer: [css, js-runtime]
  ux_role:
    primary: state-transition
    secondary: [storytelling]
  trigger: [scroll-progress]
  media: [dom-css]
  authoring: code

# ── タグ（自然言語） ─────────────────
tags:
  - scroll
  - reveal
  - fade-in
  - on-scroll
  - scroll-driven
  - section-entrance

# ── トリガー詳細（schema v0.2）─────────
trigger:
  primary: scroll-progress
  touch_fallback: always-on       # スクロール自体はタッチでも起きるので常時適用
  config:
    range_start: "cover 0%"       # アニメ開始位置（view() のレンジ）
    range_end: "cover 35%"        # アニメ完了位置（view() のレンジ）

# ── 環境要件 ─────────────────────────
runtime:
  language: css
  framework: none
  framework_version: null
  bundler: null
dependencies: []
peer_dependencies: []

# ── 実装 Tier（schema v0.2）─────────────
implementations:
  - tier: 1
    name: "CSS Scroll-Driven Animations"
    browser_support: { baseline: limited, baseline_year: null }
    performance:     { gpu_accelerated: true, layout_thrash: false, cost: low }
    degrades_to: 2
  - tier: 2
    name: "JS フォールバック（IntersectionObserver）"
    browser_support: { baseline: widely-available, baseline_year: 2019 }
    performance:     { gpu_accelerated: true, layout_thrash: false, cost: medium }
    degradation: "scroll-linked（連続連動）→ viewport one-shot（1 回 reveal）に縮退"

# ── 代表値（= Tier 1。Tier 差は implementations[] 参照）─
browser_support:
  baseline: limited
  baseline_year: null
  notes: >
    代表値は Tier 1（CSS Scroll-Driven, `animation-timeline: view()`、Chrome 115+ / Safari 26+、
    Firefox 未対応）。未対応ブラウザは Tier 2（JS）に縮退する。詳細は implementations[] を参照。

# ── 振る舞いパラメータ（schema v0.2: トリガー設定は trigger.config へ移動）─
parameters:
  - { name: distance_px, type: number, default: 32,  range: [0, 120],  description: "下からの初期オフセット" }
  - { name: easing,      type: enum,   default: "ease-out",
      values: ["linear","ease-in","ease-out","ease-in-out"] }

# ── 振る舞いの性質（schema v0.2）─────────
behavior:
  lifecycle: scroll-linked        # oneshot | continuous | toggle | scroll-linked
  reversible: true                # 上にスクロールし戻すと逆再生される
  replay: every-entry             # once | every-entry

# ── アクセシビリティ ──────────────
a11y:
  respects_reduced_motion: true
  fallback: "transform を無効化し、要素は最初から不透明で表示（スクロール連動を解除）"
  focus_safe: true
  notes: "スクロール中に未表示の要素へフォーカスが移ると面食らうため、reveal 完了前でも内容は DOM 上に存在させる（display:none にしない）"

# ── パフォーマンス ────────────────
performance:
  gpu_accelerated: true
  layout_thrash: false
  cost: "low"
  notes: >
    CSS Scroll-Driven 版はコンポジタスレッドで走りメインスレッドを塞がない（cost: low）。
    JS フォールバック版は IntersectionObserver なので可（cost: low〜medium）。
    scroll イベント直聞きの実装は jank の原因になるため不可。

# ── ライセンス・出典 ──────────────
license: MIT
authors: ["@daichi"]
sources: []
attribution_required: false

# ── プレビュー ───────────────────
preview:
  url: https://animation-factory.app/preview/scroll-reveal
  thumbnail: ./assets/scroll-reveal.webp
  loop: true
  duration_ms: 2000

# ── 関連 ─────────────────────────
related:
  alternatives: [scroll-parallax, scroll-pinned-section]
  composes_with:
    - { id: entrance-stagger-fade, note: "両者 transform/opacity を使用。同一要素に重ねず、親=scroll-reveal / 子=stagger のように階層を分ける" }
  requires: []

# ── セクション省略宣言（schema v0.2）─
sections:
  skip: [variants]

ai:
  intent_examples:
    - "スクロールするとセクションがふわっと出てくるようにしたい"
    - "スクロール連動で要素を reveal したい"
    - "下から fade in、スクロールに応じて"
  apply_targets: ["section", "card", "image", "heading-block"]
  do_not_apply_to: ["above-the-fold", "sticky-header", "modal"]
---

## Overview

要素がビューポートに入ってくる進捗（0%〜35% 通過）に連動して、下から `distance_px` 上昇しながらフェードインする。**スクロール位置が時間軸**になる "scroll-linked" アニメーション。スクロールを戻せば逆再生される。

[[Web-Animation-Taxonomy]] の境界線でいう **scroll-progress 型**（スクロール量に連続連動）であって、viewport 型（領域に入った瞬間 1 回だけ再生）ではない。両者は別アニメーションとして扱う。

使う場面:

- 縦長 LP のセクション見出し・カード群の登場
- 記事中の図版の出現
- スクロールで読み進める導線づくり

避けたい場面:

- ファーストビュー内の要素（スクロール前から見えているので連動しない → `entrance-stagger-fade` を使う）
- スティッキーヘッダー（スクロールで動く前提と矛盾）
- モーダル内（モーダルはスクロールコンテキストが別）

## Preview

- 公開プレビュー: https://animation-factory.app/preview/scroll-reveal
- 静止サムネ: `./assets/scroll-reveal.webp`

## Implementation

> この .md は実装を 2 段の **プログレッシブエンハンスメント** で持つ。
> Tier 1（CSS Scroll-Driven）が動く環境ではそれが使われ、未対応環境は Tier 2（JS）に自動で落ちる。

### Tier 1 — CSS Scroll-Driven Animations（主実装 / `baseline: limited`）

```css
/* Chrome 115+ / Safari 26+。animation-timeline が時間ではなくスクロール進捗を駆動する。 */
@keyframes scroll-reveal {
  from { opacity: 0; transform: translateY(32px); }
  to   { opacity: 1; transform: translateY(0); }
}

@supports (animation-timeline: view()) {
  .scroll-reveal {
    animation: scroll-reveal linear both;
    animation-timeline: view();
    animation-range: cover 0% cover 35%;  /* range_start / range_end */
  }
}

@media (prefers-reduced-motion: reduce) {
  .scroll-reveal { animation: none; opacity: 1; transform: none; }
}
```

### Tier 2 — JS フォールバック（IntersectionObserver / `baseline: widely-available`）

```js
// animation-timeline 非対応ブラウザ向け。1 回だけ reveal する縮退仕様。
// （scroll-linked の連続連動は CSS でしか軽量に実現できないため、JS 版は viewport 型に縮退する）
if (!CSS.supports("animation-timeline: view()")) {
  const io = new IntersectionObserver((entries) => {
    for (const e of entries) {
      if (e.isIntersecting) {
        e.target.classList.add("is-revealed");
        io.unobserve(e.target);     // replay: once 相当に縮退
      }
    }
  }, { threshold: 0.15 });

  document.querySelectorAll(".scroll-reveal").forEach((el) => io.observe(el));
}
```

```css
/* Tier 2 用の初期状態とクラス。Tier 1 が効く環境では @supports 側が優先される。 */
@supports not (animation-timeline: view()) {
  .scroll-reveal { opacity: 0; transform: translateY(32px);
                   transition: opacity 500ms ease-out, transform 500ms ease-out; }
  .scroll-reveal.is-revealed { opacity: 1; transform: translateY(0); }
}
```

## Usage

```html
<section class="scroll-reveal">
  <h2>機能紹介</h2>
  <p>…</p>
</section>
```

Tier 1 が効く環境ではスクロール進捗に連続連動。非対応環境では Tier 2 が「ビューポート進入時に 1 回 reveal」へ自動で縮退する。**追加の出し分けコードは不要**（`@supports` と特徴検出が担う）。

## AI Apply Prompt

### Context
`{{target_selector}}` をスクロール連動で reveal させる。CSS Scroll-Driven を主実装にしつつ、未対応ブラウザへ JS フォールバックを必ず併設する。

### Steps
1. `{{target_file}}` の対象要素に `scroll-reveal` クラスを付与する。
2. §Implementation の Tier 1 CSS・Tier 2 CSS・Tier 2 JS を **3 つとも**追加する。1 つでも欠けると未対応ブラウザで要素が出ないまま消える危険がある。
3. 対象がファーストビュー内（スクロール前から見える位置）でないことを確認する。見えている要素に付けると Tier 2 で「最初から非表示 → 即 reveal」になり不自然。その場合は `entrance-stagger-fade` を提案する。
4. `range_start` / `range_end` を変えたい指示があれば Tier 1 の `animation-range` を書き換える。
5. JS は 1 ファイルに 1 回だけ設置する（複数要素は `querySelectorAll` でまとめて監視）。

### Examples

Before:

```html
<section>…</section>
```

After:

```html
<section class="scroll-reveal">…</section>
```

### Verify
- Tier 1 対応ブラウザ: スクロールに連続連動して要素が現れ、戻すと逆再生される。
- Tier 1 非対応ブラウザ（Firefox 等）: 要素がビューポートに入ると 1 回 reveal され、**消えたまま残らない**。
- JS を無効化しても、Tier 1 対応ブラウザなら CSS だけで動く。
- OS の Reduce Motion ON で、要素は最初から表示されスクロール連動が解除される。
- ファーストビュー内の要素に誤適用していない。

## Accessibility

- **Reduce Motion**: `transform` を切り、要素を最初から不透明にする。スクロール連動自体を解除（揺れない）。
- **フォーカス**: reveal 前の要素も DOM 上に存在させ、`display:none` にしない。Tab でスクロール外の要素にフォーカスが飛んでも内容が読める。
- **JS 無効環境**: Tier 1 対応ブラウザは CSS のみで成立。非対応かつ JS 無効だと Tier 2 CSS で要素が初期非表示のまま残る → 重要コンテンツには `<noscript>` で初期表示にする CSS を併記することを推奨。

## Performance Notes

- **Tier 1（CSS Scroll-Driven）**: コンポジタスレッドで走り、メインスレッドを塞がない。`cost: low`。
- **Tier 2（IntersectionObserver）**: イベントは非同期・間引き済み。`cost: low〜medium`。
- `scroll` イベントを直接購読してスタイルを書き換える実装は **不可**（毎フレーム同期処理で jank の主因）。本サンプルは一切使わない。
- 同一実装でも Tier によってコスト特性が変わる点に注意（validation-notes R3-3）。

## Examples in the Wild

- Apple のプロダクトページのセクション登場
- Stripe のスクロールに連動する図版
- Linear のフィーチャーセクション

（同一の実装かは未検証。視覚的に同系統の例として参照）

## Changelog

- 2026-05-23 (created): 初版。スキーマ v0.1 検証用の第 3 サンプル（scroll-progress トリガー / プログレッシブエンハンスメント 2 Tier）。
- 2026-05-23 (update): スキーマ v0.2 に追従。`trigger` オブジェクト・`implementations[]` を追加、`range_start/end` を parameters から trigger.config へ移動、behavior の「先取り」注記を削除。
- 2026-05-23 (update): スキーマ v1.0（凍結）に追従。`release: beta` を追加（CSS Scroll-Driven は React 実装 Tier B）、version を 1.0.0 に。
