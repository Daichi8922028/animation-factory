---
id: canvas-particle-field
name: Canvas Particle Field
version: 1.0.0
release: v1.2
variant: canvas-2d
description: |
  Canvas 2D 上をアンビエントな粒子がゆっくり漂い、近接した粒子間に
  ラインを描く constellation 演出。ヒーロー背景やセクション装飾向けの
  自動再生（autoplay）・常時継続（continuous）の decorative アニメーション。

taxonomy:
  layer: [js-runtime]
  ux_role:
    primary: decorative
    secondary: [ambiance]
  trigger: [autoplay]
  media: [canvas]
  authoring: code

behavior:
  lifecycle: continuous
  reversible: false
  replay: every-entry

tags:
  - canvas
  - particle
  - constellation
  - ambient
  - requestanimationframe
  - background
  - decorative

trigger:
  primary: autoplay
  touch_fallback: always-on
  config:
    particle_count: 64
    link_distance_px: 130

runtime:
  language: typescript
  framework: react
  framework_version: ">=18"
dependencies: []
peer_dependencies:
  - { name: react, version: ">=18" }

implementations:
  - tier: 1
    name: "Canvas 2D + requestAnimationFrame"
    dependencies: []
    browser_support: { baseline: widely-available, baseline_year: 2018 }
    performance: { gpu_accelerated: false, layout_thrash: false, cost: medium }
    degrades_to: 2
  - tier: 2
    name: "CSS グラデーション静止背景（縮退）"
    dependencies: []
    browser_support: { baseline: widely-available, baseline_year: 2015 }
    performance: { gpu_accelerated: true, layout_thrash: false, cost: low }
    degradation: "粒子の漂いと近接ラインは出せない。静止したグラデーション背景に置き換える簡易代替"

browser_support:
  baseline: widely-available
  baseline_year: 2018
  notes: "代表値は Tier 1（Canvas 2D）。CanvasRenderingContext2D は全モダンブラウザで安定"

performance:
  gpu_accelerated: false
  layout_thrash: false
  cost: medium
  notes: "近接判定が O(n^2)。粒子数を 64 程度に抑え、devicePixelRatio は 2 で上限。Canvas はメインスレッド描画なので CSS transform より重い"

parameters:
  - { name: particle_count, type: number, default: 64, range: [20, 160], description: "漂う粒子の数。多いほど密になるが O(n^2) で負荷が増える" }
  - { name: link_distance_px, type: number, default: 130, range: [60, 220], description: "ライン（constellation）を引く近接距離のしきい値" }
  - { name: speed, type: number, default: 0.35, range: [0.1, 1.2], description: "粒子の移動速度（px/frame の最大値）" }

a11y:
  respects_reduced_motion: true
  fallback: "粒子の動きを止め、静止した constellation を 1 枚だけ描画する（rAF ループを回さない）"
  focus_safe: true
  notes: "純粋な装飾背景。コンテンツの情報を担わせない。aria-hidden 相当の扱いとし、フォーカス可能要素を内部に置かない"

license: MIT
authors: ["@daichi"]
sources:
  - { title: "MDN: CanvasRenderingContext2D", url: "https://developer.mozilla.org/docs/Web/API/CanvasRenderingContext2D" }
attribution_required: false

preview:
  url: https://animation-factory.app/preview/canvas-particle-field
  loop: true
  duration_ms: 4000

related:
  alternatives: [cursor-spotlight, gsap-parallax-layers, css-scroll-driven]
  composes_with:
    - { id: fade-up, note: "粒子背景の前面に置くヒーローコピーを fade-up で登場させると馴染む" }
  requires: []

sections:
  skip: [variants]

ai:
  intent_examples:
    - "背景に漂う粒子を出して、近い粒子同士を線でつなぎたい"
    - "Canvas のアンビエントなパーティクル背景がほしい"
    - "ヒーローセクションに constellation 風の装飾を入れたい"
  apply_targets: ["hero-section", "landing-background", "section-backdrop"]
  do_not_apply_to: ["form", "data-table", "long-text", "navigation-bar"]
---

## Overview

`<canvas>` 上に多数の粒子を配置し、各フレームでわずかに移動させながら、近接した粒子間に半透明のラインを引く **constellation** パターン。自動再生で常時ゆっくり動き続ける装飾背景。

`requestAnimationFrame` で更新し、`devicePixelRatio` を考慮してコンテナサイズに同期描画する。粒子数を抑えれば軽量だが、近接判定が O(n^2) のため数を増やしすぎない。

使う場面: ランディングのヒーロー背景 / セクションの装飾レイヤー。
避けたい場面: 情報を担う領域、フォーム、データテーブル、本文の直下（可読性低下）。

## Preview

公開プレビュー: https://animation-factory.app/preview/canvas-particle-field

## Implementation

### Canvas 2D + requestAnimationFrame

```tsx
"use client";
import { useEffect, useRef } from "react";

export function ParticleField() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const COUNT = 64;
    const LINK = 130;
    const ACCENT = "163, 230, 53"; // lime-300

    type P = { x: number; y: number; vx: number; vy: number; r: number };
    let particles: P[] = [];
    let w = 0, h = 0, rafId = 0;
    const rand = (a: number, b: number) => a + Math.random() * (b - a);

    function resize() {
      const rect = canvas!.getBoundingClientRect();
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      w = rect.width; h = rect.height;
      canvas!.width = Math.round(w * dpr);
      canvas!.height = Math.round(h * dpr);
      ctx!.setTransform(dpr, 0, 0, dpr, 0, 0);
      if (particles.length === 0) {
        particles = Array.from({ length: COUNT }, () => ({
          x: rand(0, w), y: rand(0, h),
          vx: rand(-0.35, 0.35), vy: rand(-0.35, 0.35), r: rand(1, 2.4),
        }));
      }
    }

    function draw() {
      ctx!.clearRect(0, 0, w, h);
      for (let i = 0; i < particles.length; i++) {
        for (let j = i + 1; j < particles.length; j++) {
          const a = particles[i], b = particles[j];
          const d = Math.hypot(a.x - b.x, a.y - b.y);
          if (d < LINK) {
            ctx!.strokeStyle = `rgba(${ACCENT}, ${(1 - d / LINK) * 0.5})`;
            ctx!.beginPath();
            ctx!.moveTo(a.x, a.y); ctx!.lineTo(b.x, b.y); ctx!.stroke();
          }
        }
      }
      for (const p of particles) {
        ctx!.fillStyle = `rgba(${ACCENT}, 0.9)`;
        ctx!.beginPath(); ctx!.arc(p.x, p.y, p.r, 0, Math.PI * 2); ctx!.fill();
      }
    }

    function step() {
      for (const p of particles) {
        p.x += p.vx; p.y += p.vy;
        if (p.x < 0 || p.x > w) p.vx *= -1;
        if (p.y < 0 || p.y > h) p.vy *= -1;
      }
      draw();
      rafId = requestAnimationFrame(step);
    }

    resize();
    const ro = new ResizeObserver(resize);
    ro.observe(canvas);
    if (reduce) draw();              // 静止描画のみ
    else rafId = requestAnimationFrame(step);

    return () => { cancelAnimationFrame(rafId); ro.disconnect(); };
  }, []);

  return <canvas ref={canvasRef} className="absolute inset-0 h-full w-full" />;
}
```

### CSS グラデーション静止背景（縮退）

```css
/* Canvas を使えない/不要な場合の簡易代替。粒子の漂いとラインは出せない。 */
.particle-field-fallback {
  position: absolute;
  inset: 0;
  background: radial-gradient(circle at 30% 30%, rgba(163, 230, 53, 0.12), transparent 60%),
              radial-gradient(circle at 70% 70%, rgba(163, 230, 53, 0.08), transparent 60%);
}
```

## Usage

```tsx
<div className="relative h-screen">
  <ParticleField />
  <div className="relative z-10">{/* ヒーローコピー */}</div>
</div>
```

## AI Apply Prompt

### Context
`{{target_selector}}`（ヒーロー等）の背景に、漂う粒子と近接ラインの constellation を `<canvas>` で敷く。

### Steps
1. 上記 `ParticleField` を `{{target_file}}` に追加（外部依存なし、react のみ）。
2. 背景にする親要素を `position: relative` にし、`<ParticleField />` を絶対配置で最背面に置く。前面コンテンツは `z-10` 以上に。
3. `particle_count` / `link_distance_px` を負荷と密度に合わせて調整。多すぎると O(n^2) で重くなる。
4. `devicePixelRatio` 同期と `ResizeObserver` での再サイズ、`cancelAnimationFrame` での unmount クリーンアップを必ず維持。
5. Reduce Motion 設定時は rAF ループを回さず静止描画のみにする分岐（上記）を残す。

### Examples

Before: 単色のヒーロー背景
After: `<ParticleField />` を最背面に敷いた漂う constellation 背景

### Verify
- 粒子がゆっくり漂い、近い粒子間に半透明のラインが出る
- ウィンドウリサイズで歪まず、解像度（DPR）に追従して鮮明
- Reduce Motion ON で動きが止まり、静止した constellation のみ表示
- unmount で rAF が止まり、コンソールに残留ループ警告が出ない

## Accessibility

- 純粋な装飾。情報やインタラクションを担わせない（`aria-hidden` 相当の扱い）。
- `prefers-reduced-motion: reduce` を **手動チェック** し、rAF ループを止めて静止描画に切り替える（Canvas は OS 設定を自動尊重しない）。
- 前面テキストとのコントラストを確保するため、粒子のアルファは控えめにする。

## Performance Notes

- 近接判定は総当たりで O(n^2)。`particle_count` を 64 前後に抑えるのが安全。多数必要なら空間分割（グリッド）を導入する。
- Canvas はメインスレッド描画で GPU 合成されないため、CSS transform 系より相対的に重い。`gpu_accelerated: false`。
- `devicePixelRatio` は 2 で上限を切り、高 DPR 端末でのフィルレート増を防ぐ。
- `ResizeObserver` + `cancelAnimationFrame` で、unmount 時に確実にループとリスナを破棄する。

## Changelog

- 2026-06-02 (created): 初版。v1.2（Tier B）、canvas-2d バリアントの decorative パーティクル背景。
