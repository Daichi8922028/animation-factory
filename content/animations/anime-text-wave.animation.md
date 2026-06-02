---
id: anime-text-wave
name: Anime.js Text Wave
version: 1.0.0
release: v1.2
variant: anime-js
description: |
  テキストを 1 文字ずつ span に分割し、sine 波に沿って上下させる波打ちアニメーション。
  anime.js v4 の stagger ディレイで隣接文字に位相差を与え、連続ループで波が流れ続ける装飾演出。
  ヒーローの見出し、ローディング中のキャッチコピー、空状態のメッセージなどに。

taxonomy:
  layer: [js-runtime, library]
  ux_role:
    primary: decorative
    secondary: [branding]
  trigger: [autoplay]
  media: [dom-css]
  authoring: code

behavior:
  lifecycle: continuous
  reversible: false
  replay: every-entry

tags:
  - anime-js
  - text-wave
  - stagger
  - sine
  - typography
  - decorative
  - loop

trigger:
  primary: autoplay
  touch_fallback: always-on
  config:
    loop: true
    alternate: true

runtime:
  language: typescript
  framework: react
  framework_version: ">=18"
dependencies:
  - { name: animejs, version: "^4.0.0", purpose: "named API（animate / stagger）で文字 span を波状に補間" }
peer_dependencies:
  - { name: react, version: ">=18" }

implementations:
  - tier: 1
    name: "anime.js v4（animate + stagger）"
    dependencies: [ { name: animejs, version: "^4.0.0" } ]
    browser_support: { baseline: widely-available, baseline_year: 2020 }
    performance: { gpu_accelerated: true, layout_thrash: false, cost: low }
    degrades_to: 2
  - tier: 2
    name: "Vanilla CSS @keyframes + animation-delay（縮退）"
    dependencies: []
    browser_support: { baseline: widely-available, baseline_year: 2015 }
    performance: { gpu_accelerated: true, layout_thrash: false, cost: low }
    degradation: "stagger の位相差を nth-child ごとの animation-delay で近似。文字数が増えると手書き CSS が冗長になり、動的テキストには不向き"

browser_support:
  baseline: widely-available
  baseline_year: 2020
  notes: "代表値は Tier 1（anime.js v4）。translateY のみ補間で GPU 内に収まる"

performance:
  gpu_accelerated: true
  layout_thrash: false
  cost: low
  notes: "translateY のみを補間し reflow を起こさない。1 つの animate 呼び出しで全 span をまとめて駆動するため軽量"

parameters:
  - { name: amplitude_px, type: number, default: 12, range: [4, 32], description: "文字が上下する振幅" }
  - { name: stagger_ms, type: number, default: 60, range: [20, 160], description: "隣接文字の位相差（波の速さ）" }
  - { name: duration_ms, type: number, default: 900, range: [400, 2000], description: "1 文字の往復にかける時間" }

a11y:
  respects_reduced_motion: true
  fallback: "波を停止し、文字は基準位置に静止表示。意味はテキスト本文で完結する"
  focus_safe: true
  notes: "装飾目的のため span 分割しても読み上げ順は保つ。aria-label に元テキストを与え、視覚的揺れに依存しない"

license: MIT
authors: ["@daichi"]
sources:
  - { title: "anime.js v4 ドキュメント（animate / stagger）", url: "https://animejs.com/documentation/" }
attribution_required: false

preview:
  url: https://animation-factory.app/preview/anime-text-wave
  loop: true
  duration_ms: 2000

related:
  alternatives: [typewriter, text-reveal-lines, gsap-split-text-stagger]
  composes_with:
    - { id: fade-up, note: "波打ち開始前に見出し全体を fade-up で登場させると自然" }
    - { id: marquee, note: "横流れの marquee と組み合わせると装飾密度が上がる" }
  requires: []

sections:
  skip: [variants]

ai:
  intent_examples:
    - "見出しの文字が波打つように上下するアニメーションにしたい"
    - "anime.js で 1 文字ずつ揺らす sine 波のテキスト"
    - "ローディング中のキャッチコピーを連続でうねらせたい"
  apply_targets: ["hero-heading", "tagline", "empty-state-message"]
  do_not_apply_to: ["body-text", "form-label", "data-table", "navigation-bar"]
---

## Overview

テキストを 1 文字ずつ `<span>` に分割し、各 span を `translateY` で sine 波状に上下させる。anime.js v4 の `stagger` で隣接文字に一定の遅延（位相差）を与えることで、波が左から右へ流れて見える。`loop: true` + `alternate: true` で連続ループする **装飾** 演出。

使う場面: ヒーローの見出し、ローディング中のキャッチコピー、空状態のメッセージなど、視線を引きたい短いテキスト。
避けたい場面: 本文・フォームラベル・データテーブル・ナビ（可読性を損なう）。

## Preview

公開プレビュー: https://animation-factory.app/preview/anime-text-wave

## Implementation

### anime.js v4（animate + stagger）

```tsx
"use client";
import { useEffect, useRef } from "react";
import { animate, stagger } from "animejs";

export function TextWave({ text }: { text: string }) {
  const rootRef = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    if (!rootRef.current) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const targets = rootRef.current.querySelectorAll(".wave-char");
    const anim = animate(targets, {
      translateY: [0, -12],
      duration: 900,
      loop: true,
      alternate: true,
      ease: "inOutSine",
      delay: stagger(60),
    });

    return () => {
      anim.pause();
      anim.revert();
    };
  }, []);

  return (
    <span ref={rootRef} aria-label={text} className="inline-flex">
      {Array.from(text).map((ch, i) => (
        <span
          key={i}
          aria-hidden="true"
          className="wave-char inline-block"
        >
          {ch === " " ? " " : ch}
        </span>
      ))}
    </span>
  );
}
```

`animate(targets, …)` の戻り値（インスタンス）を保持し、unmount 時に `pause()` → `revert()` でターゲットのインライン style を元に戻す。Reduce Motion 時はそもそも `animate` を呼ばない。

### Vanilla CSS @keyframes + animation-delay（縮退）

```css
/* anime.js を持ち込めない環境向け。stagger を nth-child の遅延で近似する。 */
@keyframes wave {
  0%, 100% { transform: translateY(0); }
  50%      { transform: translateY(-12px); }
}
.wave-char {
  display: inline-block;
  animation: wave 900ms ease-in-out infinite alternate;
}
.wave-char:nth-child(1) { animation-delay: 0ms; }
.wave-char:nth-child(2) { animation-delay: 60ms; }
.wave-char:nth-child(3) { animation-delay: 120ms; }
/* …文字数分だけ手書きで delay を増やす */
@media (prefers-reduced-motion: reduce) {
  .wave-char { animation: none; }
}
```

## Usage

```tsx
<TextWave text="Animation Factory" />
```

## AI Apply Prompt

### Context
`{{target_selector}}` の短い見出しテキストを、1 文字ずつ sine 波で上下する波打ち装飾にする。

### Steps
1. `animejs@^4.0.0` を `{{package_manager}}` で追加。
2. 対象テキストを 1 文字ずつ `<span class="wave-char">` に分割し、親に元テキストの `aria-label` を付与（各 char span は `aria-hidden`）。
3. 上記コンポーネントを `{{target_file}}` に追加。`animate(targets, { translateY, loop, alternate, ease: "inOutSine", delay: stagger(60) })` を呼ぶ。
4. `useEffect` 内でインスタンスを保持し、cleanup で `pause()` → `revert()`。
5. Reduce Motion 設定時は `animate` を呼ばない分岐を維持する。

### Examples

Before: 静的な `<h1>Animation Factory</h1>`
After: `<TextWave text="Animation Factory" />` で文字が波打つ

### Verify
- 文字が左から右へ位相差を持って上下し、波が流れて見える
- ループが滑らかに継続し、ガタつきがない
- Reduce Motion ON で波が止まり、テキストは基準位置に静止
- スクリーンリーダーで `aria-label` の元テキストが 1 回だけ読み上げられる
- unmount 時にインライン style が残らない（`revert()` が効いている）

## Accessibility

- 装飾目的。`translateY` のみで意味を持たないため、テキストの意味は本文で完結させる。
- char span は `aria-hidden="true"`、親 span に `aria-label` を与えて読み上げ順と内容を保つ。
- `prefers-reduced-motion: reduce` で `animate` を呼ばず静止表示にする。

## Performance Notes

- `translateY` のみを補間し reflow を起こさない（GPU 合成）。
- 1 回の `animate` 呼び出しで全 span をまとめて駆動するため、要素数が増えても監視コストは小さい。
- 長文には不向き（span 数が増えると初期 DOM が膨らむ）。短い見出し限定で使う。
- cleanup の `pause()` + `revert()` で、React unmount 後にインライン style と内部 tick が残らない構成にする。

## Changelog

- 2026-06-02 (created): 初版。v1.2（Tier B）、anime.js variant 拡充。文字 span 分割 + stagger の波打ちテキスト。
