---
id: gsap-split-text-stagger
name: GSAP SplitText Stagger
version: 1.0.0
release: v1.2
variant: gsap
description: |
  GSAP SplitText で見出しを文字単位に分割し、stagger で 1 文字ずつ登場させる
  見出し演出。ビューポート侵入で発火、もしくはデモ用にループ再生する。
  ヒーロー見出し・セクションタイトルのリッチな入場に。

taxonomy:
  layer: [js-runtime, library]
  ux_role:
    primary: micro-interaction
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
  - splittext
  - stagger
  - text-reveal
  - heading
  - typography
  - char-split

trigger:
  primary: viewport
  touch_fallback: always-on
  config:
    start: "top 85%"
    once: true

runtime:
  language: typescript
  framework: react
  framework_version: ">=18"
dependencies:
  - { name: gsap, version: "^3.13.0", purpose: "SplitText プラグインを含むコアタイムライン" }
peer_dependencies:
  - { name: react, version: ">=18" }

implementations:
  - tier: 1
    name: "GSAP + SplitText"
    dependencies: [ { name: gsap, version: "^3.13.0" } ]
    browser_support: { baseline: widely-available, baseline_year: 2020 }
    performance: { gpu_accelerated: true, layout_thrash: false, cost: medium }
    degrades_to: 2
  - tier: 2
    name: "手動 span 分割 + gsap.to"
    dependencies: [ { name: gsap, version: "^3.13.0" } ]
    browser_support: { baseline: widely-available, baseline_year: 2018 }
    performance: { gpu_accelerated: true, layout_thrash: false, cost: low }
    degradation: "SplitText を使わず JS で 1 文字ずつ <span> に包む簡易分割。絵文字・合字・RTL の扱いは粗くなる"

browser_support:
  baseline: widely-available
  baseline_year: 2020
  notes: "代表値は Tier 1（GSAP SplitText）。Tier 2 は手動分割で同系の見た目を再現"

performance:
  gpu_accelerated: true
  layout_thrash: false
  cost: medium
  notes: "分割は初回 1 回のみ DOM を再構築。以降は transform/opacity の補間のみで GPU 内に収まる"

parameters:
  - { name: stagger_s, type: number, default: 0.04, range: [0.01, 0.12], description: "文字間のずらし秒数" }
  - { name: y_offset_px, type: number, default: 28, range: [8, 64], description: "各文字の登場時の初期 Y オフセット" }
  - { name: duration_s, type: number, default: 0.6, range: [0.3, 1.2], description: "1 文字あたりの登場時間" }

a11y:
  respects_reduced_motion: true
  fallback: "分割・stagger を行わず、見出しをそのまま即時表示する"
  focus_safe: true
  notes: "SplitText は元テキストを複数 span に分けるため、aria-label に元の文字列を保持し、スクリーンリーダーには分割前の見出しを読ませる"

license: MIT
authors: ["@daichi"]
sources:
  - { title: "SplitText 公式ドキュメント", url: "https://gsap.com/docs/v3/Plugins/SplitText/" }
attribution_required: false

preview:
  url: https://animation-factory.app/preview/gsap-split-text-stagger
  loop: true
  duration_ms: 2600

related:
  alternatives: [text-reveal-lines, typewriter, fade-up, entrance-stagger-fade, scroll-reveal]
  composes_with:
    - { id: gsap-scroll-pin, note: "pin したセクション内で見出しを SplitText stagger で登場させると映える" }
  requires: []

sections:
  skip: [variants]

ai:
  intent_examples:
    - "見出しを 1 文字ずつパラパラ登場させたい"
    - "SplitText で文字単位の stagger アニメーション"
    - "ヒーローのタイトルをリッチに入場させる"
  apply_targets: ["hero-heading", "section-title", "display-text"]
  do_not_apply_to: ["body-text", "long-paragraph", "data-table", "navigation"]
---

## Overview

見出しを GSAP **SplitText** で 1 文字（または単語・行）単位の `<span>` に分割し、`stagger` で順番に `opacity` + `translateY` を補間して登場させる。文字が波のように立ち上がる、タイポグラフィ主役のリッチな入場演出。

ビューポートに入った 1 回だけ発火（`once: true`）するのが本番の基本。デモでは見映えのためループ再生する。

使う場面: ヒーロー見出し / セクションタイトル / ディスプレイ級の大きな文字。
避けたい場面: 本文・長い段落（読みづらい）、ナビ、データ表。

## Preview

公開プレビュー: https://animation-factory.app/preview/gsap-split-text-stagger

## Implementation

### GSAP + SplitText

```tsx
"use client";
import { useRef, useEffect } from "react";
import gsap from "gsap";
import { SplitText } from "gsap/SplitText";

gsap.registerPlugin(SplitText);

export function SplitTextHeading({ text }: { text: string }) {
  const ref = useRef<HTMLHeadingElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const ctx = gsap.context(() => {
      const split = new SplitText(el, { type: "chars", aria: "auto" });
      gsap.from(split.chars, {
        opacity: 0,
        yPercent: 60,
        duration: 0.6,
        ease: "back.out(1.7)",
        stagger: 0.04,
        scrollTrigger: { trigger: el, start: "top 85%", once: true },
      });
    }, ref);

    return () => ctx.revert(); // 分割した span も元に戻る
  }, []);

  return (
    <h2 ref={ref} className="text-4xl font-semibold">
      {text}
    </h2>
  );
}
```

### 手動 span 分割（縮退）

SplitText を使えない・読み込みたくない場合は、JS で 1 文字ずつ `<span>` に包んで同じ stagger をかける。絵文字や合字の扱いは粗くなる。

```tsx
const chars = [...text]; // span を生成して el に流し込む
gsap.from(el.querySelectorAll("span[data-char]"), {
  opacity: 0,
  yPercent: 60,
  duration: 0.6,
  ease: "back.out(1.7)",
  stagger: 0.04,
});
```

## Usage

```tsx
<SplitTextHeading text="文字が順番に立ち上がる" />
```

## AI Apply Prompt

### Context
`{{target_selector}}` の見出しテキストを SplitText で文字単位に分割し、ビューポート侵入時に stagger で 1 文字ずつ登場させる。

### Steps
1. `gsap@^3.13` を `{{package_manager}}` で追加（SplitText は同梱・無償）。
2. 上記コンポーネントを `{{target_file}}` に追加。サーバコンポーネントから呼ぶ場合は `"use client"` を確認。
3. `gsap.registerPlugin(SplitText)` をモジュールスコープで 1 回呼ぶ。
4. `new SplitText(el, { type: "chars", aria: "auto" })` で分割し、`split.chars` に `gsap.from(...)` を当てる。
5. `gsap.context()` と `ctx.revert()` を必ず併用し、unmount 時に分割 span を元に戻す。
6. Reduce Motion 設定時は分割せず、見出しをそのまま表示する分岐（上記）を維持する。

### Examples

Before: 静的な `<h2>` 見出し
After: `<SplitTextHeading text="..." />` で文字単位 stagger 入場

### Verify
- ビューポートに入ると見出しが 1 文字ずつ立ち上がる
- 発火は 1 回のみ（`once: true`）でしつこくない
- Reduce Motion ON で分割も stagger も起きず、見出しが即表示される
- スクリーンリーダーで分割前の元テキストが読み上げられる（`aria: "auto"`）
- unmount 時に分割 span が元に戻り、残留ハンドラがない（`ctx.revert()`）

## Accessibility

- SplitText は元テキストを複数の `<span>` に分けるため、`aria: "auto"` で `aria-label` に元文字列を保持し、スクリーンリーダーには **分割前の見出し** を読ませる。
- `prefers-reduced-motion` は GSAP が自動尊重しないため、上記のように手動チェックで分割自体をスキップする。
- 見出しの意味は動きに依存しない。アニメーション後も通常のテキストとして選択・コピー可能。

## Performance Notes

- 分割は初回マウント時に 1 回だけ DOM を再構築する。以降は `opacity` / `transform` の補間のみで GPU 内に収まる。
- 文字数が非常に多い見出し（長文）に当てると span 数が増え、初回コストが上がる。ディスプレイ級の短い見出しに限定する。
- `gsap.context()` + `ctx.revert()` で unmount 時に SplitText の分割と Tween が確実に破棄される構成にする。

## Changelog

- 2026-06-02 (created): 初版。v1.2（Tier B）、GSAP club プラグイン（SplitText）解禁に伴うタイポグラフィ拡充。
