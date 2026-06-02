---
id: canvas-confetti-burst
name: Canvas Confetti Burst
version: 1.0.0
release: v1.2
variant: canvas-2d
description: |
  クリック（と一定間隔の自動発火）で紙吹雪パーティクルが Canvas 2D 上で弾け、重力で落下する
  attention 演出。成功・達成・お祝いの瞬間を強調する。自前 particle + requestAnimationFrame。

taxonomy:
  layer: [js-runtime]
  ux_role:
    primary: attention
    secondary: [feedback, delight]
  trigger: [click]
  media: [canvas]
  authoring: code

behavior:
  lifecycle: oneshot
  reversible: false
  replay: every-entry

tags:
  - confetti
  - canvas
  - particle
  - celebration
  - burst
  - requestanimationframe

trigger:
  primary: click
  touch_fallback: always-on
  config:
    particle_count: 120
    gravity: 0.18

runtime:
  language: typescript
  framework: react
  framework_version: ">=18"
dependencies: []
peer_dependencies:
  - { name: react, version: ">=18" }

implementations:
  - tier: 1
    name: "Canvas 2D + 自前パーティクル + rAF"
    dependencies: []
    browser_support: { baseline: widely-available, baseline_year: 2015 }
    performance: { gpu_accelerated: false, layout_thrash: false, cost: medium }
    degrades_to: 2
  - tier: 2
    name: "CSS transform で単発フラッシュ（縮退）"
    dependencies: []
    browser_support: { baseline: widely-available, baseline_year: 2015 }
    performance: { gpu_accelerated: true, layout_thrash: false, cost: low }
    degradation: "多数の粒子の物理は出せない。発火点で 1 回スケール/フェードするだけの簡易代替"

browser_support:
  baseline: widely-available
  baseline_year: 2015
  notes: "代表値は Tier 1（Canvas 2D + rAF）。CanvasRenderingContext2D はどのモダンブラウザでも利用可"

performance:
  gpu_accelerated: false
  layout_thrash: false
  cost: medium
  notes: "Canvas 2D は CPU 描画。粒子数 × フレームで負荷が決まる。devicePixelRatio でスケールし、寿命切れの粒子は配列から除去する"

parameters:
  - { name: particle_count, type: number, default: 120, range: [40, 300], description: "1 回の発火で生成する粒子数" }
  - { name: gravity, type: number, default: 0.18, range: [0.05, 0.5], description: "毎フレーム加算する落下加速度" }
  - { name: spread_deg, type: number, default: 360, range: [30, 360], description: "粒子が飛び散る角度範囲" }

a11y:
  respects_reduced_motion: true
  fallback: "Reduce Motion 時はパーティクルを生成せず、発火点に静的な ✓ など別フィードバックを出す"
  focus_safe: true
  notes: "canvas は装飾。aria-hidden=\"true\" を付け、達成内容はテキストや aria-live でも伝える"

license: MIT
authors: ["@daichi"]
sources:
  - { title: "CanvasRenderingContext2D - MDN", url: "https://developer.mozilla.org/docs/Web/API/CanvasRenderingContext2D" }
attribution_required: false

preview:
  url: https://animation-factory.app/preview/canvas-confetti-burst
  loop: true
  duration_ms: 2000

related:
  alternatives: [pulse-attention, scale-in, highlight-flash]
  composes_with:
    - { id: count-up, note: "カウンタが目標値に到達した瞬間に confetti を発火すると達成感が増す" }
    - { id: input-success-checkmark, note: "成功チェックの完了に合わせて発火" }
  requires: []

sections:
  skip: [variants]

ai:
  intent_examples:
    - "送信成功でクリックした場所から紙吹雪を散らしたい"
    - "達成・お祝いの演出に canvas の confetti を出す"
    - "ボタンを押したらパーティクルが弾けて落ちる"
  apply_targets: ["success-button", "celebration-modal", "achievement-toast"]
  do_not_apply_to: ["body-text", "data-table", "navigation-bar", "form-field"]
---

## Overview

クリック位置（または一定間隔の自動発火点）から多数の紙吹雪パーティクルを放射状に飛ばし、重力で落下・回転・フェードさせる **強い祝祭の合図**。描画は `<canvas>` の 2D コンテキストで自前に行い、粒子の位置・速度・寿命を `requestAnimationFrame` ループで更新する。

使う場面: 送信成功 / 目標達成 / 購入完了などの「やった」の瞬間。
避けたい場面: 本文・データテーブル・ナビ・通常のフォーム操作（頻発するとノイズになる）。

## Preview

公開プレビュー: https://animation-factory.app/preview/canvas-confetti-burst

## Implementation

### Canvas 2D + 自前パーティクル + rAF（Tier 1）

```tsx
"use client";
import { useEffect, useRef } from "react";

type P = { x: number; y: number; vx: number; vy: number; life: number; color: string; size: number; rot: number; vr: number };

export function ConfettiCanvas() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const particles = useRef<P[]>([]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const colors = ["#a3e635", "#f472b6", "#38bdf8", "#facc15", "#fff"];

    const resize = () => {
      const r = canvas.getBoundingClientRect();
      canvas.width = r.width * dpr;
      canvas.height = r.height * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };
    resize();
    window.addEventListener("resize", resize);

    const burst = (x: number, y: number) => {
      if (reduce) return;
      for (let i = 0; i < 120; i++) {
        const a = (Math.PI * 2 * i) / 120 + Math.random();
        const sp = 2 + Math.random() * 5;
        particles.current.push({
          x, y, vx: Math.cos(a) * sp, vy: Math.sin(a) * sp - 3,
          life: 1, color: colors[i % colors.length],
          size: 4 + Math.random() * 4, rot: Math.random() * Math.PI, vr: (Math.random() - 0.5) * 0.3,
        });
      }
    };

    const onClick = (e: MouseEvent) => {
      const r = canvas.getBoundingClientRect();
      burst(e.clientX - r.left, e.clientY - r.top);
    };
    canvas.addEventListener("click", onClick);

    let raf = 0;
    const loop = () => {
      const r = canvas.getBoundingClientRect();
      ctx.clearRect(0, 0, r.width, r.height);
      const next: P[] = [];
      for (const p of particles.current) {
        p.vy += 0.18; // gravity
        p.x += p.vx; p.y += p.vy; p.rot += p.vr; p.life -= 0.012;
        if (p.life <= 0 || p.y > r.height + 20) continue;
        ctx.save();
        ctx.globalAlpha = Math.max(0, p.life);
        ctx.translate(p.x, p.y); ctx.rotate(p.rot);
        ctx.fillStyle = p.color;
        ctx.fillRect(-p.size / 2, -p.size / 2, p.size, p.size * 0.6);
        ctx.restore();
        next.push(p);
      }
      particles.current = next;
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", resize);
      canvas.removeEventListener("click", onClick);
    };
  }, []);

  return <canvas ref={canvasRef} aria-hidden="true" className="h-full w-full" />;
}
```

### CSS transform で単発フラッシュ（Tier 2・縮退）

```css
/* 物理は諦め、発火点で 1 回スケール/フェードするだけ。Reduce Motion でも安全。 */
@keyframes confetti-flash {
  0%   { transform: scale(0.6); opacity: 0; }
  40%  { transform: scale(1.15); opacity: 1; }
  100% { transform: scale(1); opacity: 0; }
}
.confetti-flash { animation: confetti-flash 600ms ease-out both; }
@media (prefers-reduced-motion: reduce) {
  .confetti-flash { animation: none; opacity: 1; }
}
```

## Usage

```tsx
<div className="relative">
  <ConfettiCanvas /> {/* absolute で重ねるとオーバーレイ発火に */}
</div>
```

## AI Apply Prompt

### Context
`{{target_selector}}` の成功時に、クリック位置から紙吹雪を Canvas 2D で発火させる。

### Steps
1. 上記 `ConfettiCanvas` を `{{target_file}}` に追加（`"use client"` を確認）。新規依存は不要。
2. canvas を発火させたい領域に重ねる（親を `position: relative`、canvas を `absolute inset-0 pointer-events-none` など）。
3. 成功イベントで発火させたい場合は `burst(x, y)` を ref 経由で公開し、ハンドラから呼ぶ。
4. `cancelAnimationFrame` と各 `removeEventListener` を unmount で必ず実行（上記 cleanup を維持）。
5. Reduce Motion 時は `burst` を早期 return（上記）し、別フィードバックを併設する。

### Examples

Before: 送信成功でトーストのみ
After: 成功位置から confetti が弾けて落下 + トースト

### Verify
- クリックした場所から粒子が放射状に飛び、重力で落下する
- 寿命切れ・画面外の粒子が配列から除去され、メモリが増え続けない
- Reduce Motion ON で粒子が生成されず、別フィードバックで達成が伝わる
- unmount 後に rAF やイベントリスナが残らない

## Accessibility

canvas は純粋な装飾なので `aria-hidden="true"` を付け、達成内容はテキストや `aria-live` でも伝える。Reduce Motion 時はパーティクル生成を停止し、静的なフィードバックに切り替える。`pointer-events-none` で背後の操作を妨げない構成にできる。

## Performance Notes

- Canvas 2D は CPU 描画。負荷は「粒子数 × 生存フレーム数」に比例する。`particle_count` は 300 程度を上限に。
- `devicePixelRatio` でスケールしつつ上限 2 にクランプし、高 DPR 端末での過剰な塗りを抑える。
- 寿命（`life <= 0`）または画面外に出た粒子は毎フレーム配列から除去し、配列が無限に伸びないようにする。
- `clearRect` は毎フレーム 1 回。残像演出が欲しい場合は半透明の `fillRect` で代替できるが負荷は上がる。

## Changelog

- 2026-06-02 (created): 初版。v1.2（Tier B）、canvas-2d パーティクル系の追加。
