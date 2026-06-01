---
id: password-strength-bar
name: Password Strength Bar
version: 1.0.0
release: beta
variant: react-motion
description: |
  パスワード入力中、強度に応じてセグメント化したバーがリアルタイムに伸び、色が赤→橙→黄緑と変化する
  feedback。タイピングという state 変化に追従して、満たした条件を視覚化する。

taxonomy:
  layer: [css, js-runtime, library]
  ux_role:
    primary: feedback
    secondary: [attention]
  trigger: [state-change]
  media: [dom-css]
  authoring: code

behavior:
  lifecycle: continuous
  reversible: true
  replay: every-entry

tags:
  - password
  - form
  - strength
  - meter
  - bar
  - feedback
  - security

trigger:
  primary: state-change
  touch_fallback: always-on
  config: {}

runtime:
  language: typescript
  framework: react
  framework_version: ">=18"
dependencies:
  - { name: motion, version: "^11.0.0", purpose: "セグメント幅/色の spring 補間" }
peer_dependencies:
  - { name: react, version: ">=18" }

implementations:
  - tier: 1
    name: "React + Motion (segment width/color)"
    dependencies: [ { name: motion, version: "^11.0.0" } ]
    browser_support: { baseline: widely-available, baseline_year: 2020 }
    performance: { gpu_accelerated: true, layout_thrash: false, cost: low }
    degrades_to: 2
  - tier: 2
    name: "Vanilla CSS (transition: width/background)"
    dependencies: []
    browser_support: { baseline: widely-available, baseline_year: 2016 }
    degradation: "強度 0-4 を class にして width% と background を CSS transition で変える"
    performance: { gpu_accelerated: false, layout_thrash: true, cost: low }

browser_support:
  baseline: widely-available
  baseline_year: 2020
  notes: "代表値は Tier 1。強度判定ロジック（長さ/種類/辞書）は別途。バーは transform: scaleX 推奨で reflow 回避"

performance:
  gpu_accelerated: true
  layout_thrash: false
  cost: low
  notes: "Tier 1 は scaleX + color の補間で reflow 無し。Tier 2 の width% は reflow するが軽量"

parameters:
  - { name: segments,      type: number, default: 4,   range: [3, 6],     description: "強度の段数" }
  - { name: duration_ms,   type: number, default: 220, range: [120, 400], description: "バー変化の長さ" }
  - { name: track_height_px, type: number, default: 6, range: [3, 12],    description: "バーの高さ(px)" }

a11y:
  respects_reduced_motion: true
  fallback: "バーのアニメを無効化し即時反映。強度はテキスト（弱い/普通/強い）でも示す"
  focus_safe: true
  notes: "色だけで強度を伝えない。role=\"meter\"/aria-valuenow か、テキストラベルを aria-live=\"polite\" で更新"

license: MIT
authors: ["@daichi"]
sources:
  - { title: "MDN: <meter>", url: "https://developer.mozilla.org/en-US/docs/Web/HTML/Element/meter" }
attribution_required: false

preview:
  url: https://animation-factory.app/preview/password-strength-bar
  loop: true
  duration_ms: 3000

related:
  alternatives: [progress-bar, multistep-form-progress, input-focus-pop]
  composes_with:
    - { id: input-focus-pop, note: "パスワード欄の focus 演出と組み合わせる" }
  requires: []

sections:
  skip: [variants]

ai:
  intent_examples:
    - "パスワード入力でリアルタイムに強度バーが変わる"
    - "タイプするごとに赤→緑に変わる強度メーター"
    - "パスワードの強さを視覚化したい"
  apply_targets: ["password-field", "signup-form", "password-reset"]
  do_not_apply_to: ["text-input", "search-box", "navigation"]
---

## Overview

パスワード入力の変化に追従して、強度（長さ・文字種・辞書チェックなどで算出）をセグメントバーで表示する。満たした段数まで `scaleX` で伸び、色が赤→橙→黄緑と spring で変化する。色だけでなくラベル（弱い/普通/強い）も更新して多重に伝える。

使う場面: サインアップ、パスワード変更/リセット。
避けたい場面: 通常テキスト入力、検索。

## Preview

公開プレビュー: https://animation-factory.app/preview/password-strength-bar

## Implementation

### React + Motion

```tsx
"use client";
import { motion } from "motion/react";

const COLORS = ["#f87171", "#fb923c", "#facc15", "#a3e635"];

export function StrengthBar({ score }: { score: number }) { // 0..4
  return (
    <div className="flex gap-1" role="meter" aria-valuemin={0} aria-valuemax={4} aria-valuenow={score}>
      {Array.from({ length: 4 }).map((_, i) => (
        <div key={i} className="h-1.5 flex-1 rounded bg-white/10 overflow-hidden">
          <motion.div
            className="h-full origin-left"
            initial={false}
            animate={{ scaleX: i < score ? 1 : 0, backgroundColor: COLORS[Math.max(score - 1, 0)] }}
            transition={{ type: "spring", stiffness: 300, damping: 26 }}
          />
        </div>
      ))}
    </div>
  );
}
```

## Usage

```tsx
const score = scorePassword(pw); // 0..4
<input type="password" value={pw} onChange={(e) => setPw(e.target.value)} />
<StrengthBar score={score} />
<span aria-live="polite">{["とても弱い","弱い","普通","強い","とても強い"][score]}</span>
```

## AI Apply Prompt

### Context
`{{password_field}}` の下に強度バーを置き、入力に追従させる。

### Steps
1. `motion@^11` を追加。
2. 強度算出関数（長さ/文字種/辞書）を用意し score(0..4) を出す。
3. `StrengthBar` を配置し、`aria-live` のテキストラベルも更新。

### Verify
- タイプに応じてバーが伸び色が変わる
- 強度がテキストでも伝わる
- Reduce Motion で即時反映

## Accessibility

`role="meter"` + `aria-valuenow`、またはテキストラベルを `aria-live="polite"` で更新。色覚に依存させない。

## Performance Notes

Tier 1 は `scaleX` + `backgroundColor` の補間で reflow なし。`initial={false}` で初回ジャンプを抑制。

## Changelog

- 2026-06-01 (created): 初版。v1.1 Batch 2（Form interaction）第 4 弾。タイピング追従の強度メーター。
