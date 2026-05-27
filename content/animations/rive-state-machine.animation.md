---
id: rive-state-machine
name: Rive State Machine
version: 1.0.0
release: beta
variant: react-rive
description: |
  Rive Editor で作った `.riv` ファイルをブラウザで再生し、State Machine の input を
  React 状態から駆動する。インタラクティブな資産アニメの本命。

taxonomy:
  layer: [library]
  ux_role:
    primary: storytelling
    secondary: [feedback, micro-interaction]
  trigger: [state-change]
  media: [rive]
  authoring: hybrid

behavior:
  lifecycle: continuous
  reversible: true
  replay: every-entry

tags:
  - rive
  - state-machine
  - asset
  - vector
  - interactive
  - playback

trigger:
  primary: state-change
  touch_fallback: always-on
  config: {}

runtime:
  language: typescript
  framework: react
  framework_version: ">=18"
dependencies:
  - { name: "@rive-app/react-canvas", version: "^4.0.0", purpose: ".riv 再生 + State Machine 駆動" }
peer_dependencies:
  - { name: react, version: ">=18" }

implementations:
  - tier: 1
    name: "React + @rive-app/react-canvas"
    dependencies: [ { name: "@rive-app/react-canvas", version: "^4.0.0" } ]
    browser_support: { baseline: widely-available, baseline_year: 2020 }
    performance: { gpu_accelerated: true, layout_thrash: false, cost: low }

browser_support:
  baseline: widely-available
  baseline_year: 2020
  notes: "ランタイムは Canvas に描画、GPU 加速。`.riv` は Rive Editor で authoring が前提"

performance:
  gpu_accelerated: true
  layout_thrash: false
  cost: low
  notes: "Lottie より軽量で、State Machine 経由でインタラクションも作れる。Duolingo は Lottie より約 15× 軽量化を報告"

parameters:
  - { name: src,          type: string, default: "/path/to/asset.riv", description: ".riv ファイルのパス or URL" }
  - { name: artboard,     type: string, default: "Main", description: "Artboard 名（複数ある時）" }
  - { name: state_machine, type: string, default: "State Machine 1", description: "駆動する State Machine 名" }
  - { name: autoplay,     type: boolean, default: true, description: "自動再生" }

a11y:
  respects_reduced_motion: true
  fallback: "rive.pause() で停止、静止状態を見せる。意味は aria-label で補う"
  focus_safe: true
  notes: "Canvas 内のためスクリーンリーダーは中身を読まない。`role=\"img\"` + `aria-label` を付ける"

license: MIT
authors: ["@daichi"]
sources:
  - { title: "@rive-app/react-canvas", url: "https://rive.app/community/doc/react-canvas/docM2hQz5Bvx" }
  - { title: "Duolingo × Rive — LottieFiles", url: "https://lottiefiles.com/case-studies/duolingo" }
attribution_required: false

preview:
  url: https://animation-factory.app/preview/rive-state-machine
  loop: true
  duration_ms: 3000

related:
  alternatives: [lottie-playback]
  composes_with: []
  requires: []

sections:
  skip: [variants]

ai:
  intent_examples:
    - "Rive のキャラクタ State Machine を React から状態同期で動かす"
    - ".riv を埋め込みたい"
    - "Duolingo っぽい口形アニメ"
  apply_targets: ["mascot", "interactive-illustration", "input-feedback-character", "tutorial-guide"]
  do_not_apply_to: ["text-content", "data-table", "form-validation-message-only"]
---

## Overview

Rive Editor で作ったアセット（`.riv`）には、Artboard、Animation、そして **State Machine**（複数 input を持つステートマシン）が同梱できる。`@rive-app/react-canvas` の `useRive()` で読み込み、`useStateMachineInput()` で各 input を React 状態に同期させる。

使う場面: マスコット、入力に反応するキャラクタ、ガイドアニメ、チェックアウト成功演出。
避けたい場面: テキストコンテンツ、データテーブル、純粋なフォームバリデーション（アニメは過剰）。

## Preview

公開プレビュー: https://animation-factory.app/preview/rive-state-machine

## Implementation

### React + @rive-app/react-canvas

```tsx
"use client";
import { useRive, useStateMachineInput } from "@rive-app/react-canvas";

export function RiveMascot({ src }: { src: string }) {
  const { rive, RiveComponent } = useRive({
    src,
    stateMachines: "State Machine 1",
    autoplay: true,
  });

  // State Machine の "Hover" boolean input
  const hoverInput = useStateMachineInput(rive, "State Machine 1", "Hover");

  return (
    <div
      onPointerEnter={() => hoverInput?.fire?.() ?? (hoverInput && (hoverInput.value = true))}
      onPointerLeave={() => hoverInput && (hoverInput.value = false)}
      style={{ width: 240, height: 240 }}
      role="img"
      aria-label="Rive マスコット"
    >
      <RiveComponent />
    </div>
  );
}
```

### URL から読み込む

```tsx
const { RiveComponent } = useRive({
  src: "https://cdn.example.com/mascot.riv",
  autoplay: true,
});
```

### Reduce Motion 対応

```tsx
useEffect(() => {
  if (!rive) return;
  const r = window.matchMedia("(prefers-reduced-motion: reduce)");
  if (r.matches) rive.pause();
}, [rive]);
```

## Usage

```tsx
<RiveMascot src="/assets/mascot.riv" />
```

## AI Apply Prompt

### Context
`{{target_selector}}` に Rive アセットを埋め込み、State Machine input を React 状態と同期する。

### Steps
1. `@rive-app/react-canvas@^4` を `{{package_manager}}` で追加。
2. `.riv` を `public/assets/` に置く（または CDN URL）。
3. `useRive({ src, stateMachines, autoplay })` でロード、`useStateMachineInput` で input を取得。
4. Reduce Motion 設定で `rive.pause()` を呼ぶ分岐を追加。

### Examples

Before: 静的なヒーロー画像
After: `<RiveMascot src="/assets/mascot.riv" />`

### Verify
- アセットが Canvas 上で再生される
- ホバーや状態変化で State Machine input が変わり、アニメが反応する
- Reduce Motion 設定で停止
- スクリーンリーダーで `aria-label` が読まれる

## Accessibility

Canvas 描画なので中身は SR から読めない。`role="img"` + `aria-label` で意味を伝える。Reduce Motion で再生停止。

## Performance Notes

`.riv` は Lottie より軽量（Duolingo の事例で約 15×）。Canvas 描画で GPU 加速。多数同時表示でも比較的安定。

## Changelog

- 2026-05-27 (created): 初版。Phase 3 D1 第 4 弾、Tier B 資産系（Rive）。
