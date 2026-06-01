---
id: lottie-playback
name: Lottie Playback
version: 1.0.0
release: v1.0
variant: react-lottie
description: |
  After Effects → Bodymovin で書き出した Lottie JSON を `lottie-react` で再生する。
  ベクター・小サイズ・忠実な再現で、デザイナー納品物をそのまま使う定番ルート。

taxonomy:
  layer: [library]
  ux_role:
    primary: storytelling
    secondary: [decorative, feedback]
  trigger: [autoplay]
  media: [lottie]
  authoring: asset

behavior:
  lifecycle: continuous
  reversible: true
  replay: every-entry

tags:
  - lottie
  - bodymovin
  - asset
  - vector
  - illustration
  - playback

trigger:
  primary: autoplay
  touch_fallback: always-on
  config:
    loop: true

runtime:
  language: typescript
  framework: react
  framework_version: ">=18"
dependencies:
  - { name: lottie-react, version: "^2.4.0", purpose: "Lottie JSON 再生" }
peer_dependencies:
  - { name: react, version: ">=18" }

implementations:
  - tier: 1
    name: "React + lottie-react"
    dependencies: [ { name: lottie-react, version: "^2.4.0" } ]
    browser_support: { baseline: widely-available, baseline_year: 2018 }
    performance: { gpu_accelerated: false, layout_thrash: false, cost: medium }
    degrades_to: 2
  - tier: 2
    name: "@lottiefiles/dotlottie-react"
    dependencies: [ { name: "@lottiefiles/dotlottie-react", version: "^0.10.0" } ]
    browser_support: { baseline: widely-available, baseline_year: 2020 }
    performance: { gpu_accelerated: false, layout_thrash: false, cost: medium }
    degradation: "dotLottie バイナリ（.lottie）を扱える後継。サイズが小さい"

browser_support:
  baseline: widely-available
  baseline_year: 2018
  notes: "Lottie はランタイムが Canvas / SVG / DOM の 3 経路で描画。デフォルトは SVG"

performance:
  gpu_accelerated: false
  layout_thrash: false
  cost: medium
  notes: "SVG 描画は CPU 負荷あり。多数同時表示は重くなる。`renderer: \"canvas\"` で GPU 側に寄せられる"

parameters:
  - { name: src,      type: string,  default: "/path/to/animation.json", description: "Lottie JSON のパス or URL" }
  - { name: loop,     type: boolean, default: true,  description: "ループ再生" }
  - { name: autoplay, type: boolean, default: true,  description: "自動再生" }
  - { name: speed,    type: number,  default: 1.0,   range: [0.1, 4.0], description: "再生速度" }

a11y:
  respects_reduced_motion: true
  fallback: "ループを止めて静止フレーム（poster）を表示。意味は alt 相当のテキストで補う"
  focus_safe: true
  notes: "装飾用途なら `aria-hidden=\"true\"`。意味を持つアニメは `role=\"img\"` + `aria-label` を付ける"

license: MIT
authors: ["@daichi"]
sources:
  - { title: "lottie-react", url: "https://github.com/Gamote/lottie-react" }
  - { title: "Introducing Lottie — Airbnb Engineering", url: "https://medium.com/airbnb-engineering/introducing-lottie-4ff4a0afac0e" }
attribution_required: false

preview:
  url: https://animation-factory.app/preview/lottie-playback
  loop: true
  duration_ms: 2000

related:
  alternatives: [rive-state-machine]
  composes_with:
    - { id: scroll-reveal, note: "スクロール進入で再生開始する組み合わせ（whileInView 等）が定番" }
  requires: []

sections:
  skip: [variants]

ai:
  intent_examples:
    - "Lottie アニメをページに埋め込みたい"
    - "After Effects で作ったアニメを Web で再生"
    - "デザイナーから貰った .json を再生する"
  apply_targets: ["empty-state-illustration", "onboarding-hero", "loader-mascot", "success-celebration"]
  do_not_apply_to: ["interactive-control", "text-input", "real-time-data-viz"]
---

## Overview

After Effects + Bodymovin プラグインで書き出した `.json`（Lottie 形式）を、ブラウザで忠実に再生する。デザイナーが用意したベクターアニメをそのまま使えるため、コードで再現が難しい複雑な動き（マスクの変形、トレース、複合シェイプ）が現実的なコストで載る。

使う場面: 空状態のイラスト、オンボーディング、エラー画面のキャラクタ、サクセスのお祝い演出。
避けたい場面: インタラクション主体のコントロール（→ Rive）、リアルタイムデータ可視化、テキスト入力。

## Preview

公開プレビュー: https://animation-factory.app/preview/lottie-playback

## Implementation

### React + lottie-react

```tsx
"use client";
import Lottie from "lottie-react";
import animationData from "@/assets/animation.json"; // Bodymovin 出力

export function LottieClip() {
  return (
    <Lottie
      animationData={animationData}
      loop
      autoplay
      style={{ width: 200, height: 200 }}
      aria-hidden="true"
    />
  );
}
```

### URL 経由でロード

```tsx
"use client";
import Lottie from "lottie-react";
import { useEffect, useState } from "react";

export function LottieRemote({ src }: { src: string }) {
  const [data, setData] = useState<unknown>(null);
  useEffect(() => {
    fetch(src).then((r) => r.json()).then(setData).catch(() => setData(null));
  }, [src]);
  if (!data) return <div className="w-[200px] h-[200px] grid place-items-center text-xs text-zinc-500">loading…</div>;
  return <Lottie animationData={data} loop autoplay aria-hidden="true" />;
}
```

### dotLottie 版（縮退）

`.lottie` バイナリを扱うなら `@lottiefiles/dotlottie-react` を使う。サイズが圧縮されるためネットワーク転送が軽い。

## Usage

```tsx
<LottieClip />
```

## AI Apply Prompt

### Context
`{{target_selector}}` に Lottie アニメを埋め込む。

### Steps
1. `lottie-react@^2.4.0` を `{{package_manager}}` で追加。
2. `.json` を `src/assets/` または `public/assets/` に置く。
3. 上記 `LottieClip` を `{{target_file}}` に追加し、import か URL でロード。
4. 装飾用途なら `aria-hidden="true"`、意味用途なら `role="img"` + `aria-label`。

### Examples

Before: 空のヒーロー領域
After: `<LottieClip />` をヒーロー中央に配置

### Verify
- アニメがループ再生される
- Reduce Motion 設定で停止または静止フレーム表示
- 多数同時表示時にフレーム落ちしない（必要なら `renderer: "canvas"`）

## Accessibility

装飾なら `aria-hidden="true"`。意味アニメは `role="img"` + `aria-label` で内容を伝える。Reduce Motion 設定では `lottieRef.current?.pause()` で停止し、静止フレームを見せる。

## Performance Notes

デフォルトは SVG 描画で CPU 負荷あり。多数同時表示時は `renderer: "canvas"` を試す。バンドルに `.json` を含めるかネットワーク経由でロードするかはサイズと初期表示速度のトレードオフ。

## Changelog

- 2026-05-27 (created): 初版。Phase 3 D1 第 4 弾、Tier B 資産系（Lottie）。
