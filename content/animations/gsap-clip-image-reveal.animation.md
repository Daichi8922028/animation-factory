---
id: gsap-clip-image-reveal
name: GSAP Clip Reveal on Scroll
version: 1.0.0
release: v1.2
variant: gsap-scrolltrigger
description: |
  GSAP ScrollTrigger でスクロール進行に同期して clip-path のマスクが開き、
  画像（ここではグラデーションブロックで代替）が徐々に reveal される演出。
  ヒーローやギャラリーの図版を印象的に登場させる state-transition パターン。

taxonomy:
  layer: [css, js-runtime, library]
  ux_role:
    primary: state-transition
    secondary: [scroll-progress, storytelling]
  trigger: [scroll-progress]
  media: [dom-css]
  authoring: code

behavior:
  lifecycle: scroll-linked
  reversible: true
  replay: every-entry

tags:
  - gsap
  - scrolltrigger
  - clip-path
  - reveal
  - mask
  - image-reveal
  - scroll-progress

trigger:
  primary: scroll-progress
  touch_fallback: always-on
  config:
    start: "top 80%"
    end: "top 30%"
    scrub: true

runtime:
  language: typescript
  framework: react
  framework_version: ">=18"
dependencies:
  - { name: gsap, version: "^3.13.0", purpose: "ScrollTrigger を含むコアタイムライン" }
peer_dependencies:
  - { name: react, version: ">=18" }

implementations:
  - tier: 1
    name: "GSAP + ScrollTrigger (clip-path scrub)"
    dependencies: [ { name: gsap, version: "^3.13.0" } ]
    browser_support: { baseline: widely-available, baseline_year: 2020 }
    performance: { gpu_accelerated: false, layout_thrash: false, cost: medium }
    degrades_to: 2
  - tier: 2
    name: "CSS scroll-driven animation (animation-timeline: view())"
    dependencies: []
    browser_support: { baseline: newly-available, baseline_year: 2024 }
    performance: { gpu_accelerated: false, layout_thrash: false, cost: low }
    degradation: "JS なしで clip-path を view() タイムラインで開く。スクロール量への完全追従や逆再生の細かな制御は劣り、未対応ブラウザでは即時表示に縮退"

browser_support:
  baseline: widely-available
  baseline_year: 2020
  notes: "代表値は Tier 1（GSAP）。clip-path のアニメーションは GPU 合成されず paint コストが乗るため reveal 中はやや重い"

performance:
  gpu_accelerated: false
  layout_thrash: false
  cost: medium
  notes: "clip-path は transform/opacity と異なり GPU で完結しない。reveal は短時間で終わるので影響は限定的だが、巨大な画像や同時多発は避ける"

parameters:
  - { name: clip_from, type: string, default: "inset(0 100% 0 0)", description: "開始時のマスク。左から開くなら inset の right を 100%" }
  - { name: clip_to,   type: string, default: "inset(0 0% 0 0)",   description: "終了時のマスク（全開）" }
  - { name: scrub,     type: enum,   default: "true",
      values: ["true", "false", "smoothed-number"],
      description: "スクロール量に reveal 進行を直結。true で完全追従、数値でイージング" }

a11y:
  respects_reduced_motion: true
  fallback: "ScrollTrigger を生成せず、clip-path を全開（inset(0)）にして画像を即時表示する"
  focus_safe: true
  notes: "clip でマスクされている間も DOM 上の内容は存在する。代替テキスト（alt）は常に提供し、reveal の有無に依存させない"

license: MIT
authors: ["@daichi"]
sources:
  - { title: "ScrollTrigger 公式ドキュメント", url: "https://gsap.com/docs/v3/Plugins/ScrollTrigger/" }
  - { title: "clip-path (MDN)", url: "https://developer.mozilla.org/en-US/docs/Web/CSS/clip-path" }
attribution_required: false

preview:
  url: https://animation-factory.app/preview/gsap-clip-image-reveal
  loop: true
  duration_ms: 2400

related:
  alternatives: [scroll-reveal, css-scroll-driven, gsap-scroll-pin]
  composes_with:
    - { id: fade-up, note: "reveal 後にキャプションを fade-up で続けると自然" }
    - { id: scale-in, note: "マスク内の画像を scale-in と組み合わせて奥行きを出せる" }
  requires: []

sections:
  skip: [variants]

ai:
  intent_examples:
    - "スクロールすると画像がマスクで左から開いて現れる演出にしたい"
    - "clip-path を ScrollTrigger でスクロールに合わせて開きたい"
    - "図版がスクロール進行で reveal されるヒーローセクション"
  apply_targets: ["hero-image", "gallery-figure", "feature-visual"]
  do_not_apply_to: ["body-text", "form", "data-table", "navigation-bar"]
---

## Overview

スクロール進行を `clip-path` のマスク開閉に変換し、画像（本デモではグラデーションブロックで代替）を **徐々に reveal** する。`inset()` の右辺を `100% → 0%` へ補間することで、左から画像がワイプして現れる。隠れている状態と現れた状態の間を補間する **state-transition** であり、ScrollTrigger の `scrub` でスクロール量に完全追従させる。

使う場面: ヒーローの主役画像 / ギャラリーの図版 / 機能紹介のビジュアル。
避けたい場面: 本文、フォーム、データテーブル、ナビバー（マスクで内容が一時的に欠ける）。

## Preview

公開プレビュー: https://animation-factory.app/preview/gsap-clip-image-reveal

## Implementation

### GSAP + ScrollTrigger（Tier 1）

```tsx
"use client";
import { useRef, useEffect } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

export function ClipImageReveal() {
  const figureRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!figureRef.current) return;
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduce) {
      // Reduce Motion: マスクを全開にして即時表示
      gsap.set(".clip-target", { clipPath: "inset(0 0% 0 0)" });
      return;
    }

    const ctx = gsap.context(() => {
      gsap.fromTo(
        ".clip-target",
        { clipPath: "inset(0 100% 0 0)" },
        {
          clipPath: "inset(0 0% 0 0)",
          ease: "none",
          scrollTrigger: {
            trigger: figureRef.current,
            start: "top 80%",
            end: "top 30%",
            scrub: true,
          },
        }
      );
    }, figureRef);

    return () => ctx.revert();
  }, []);

  return (
    <div ref={figureRef}>
      <img className="clip-target" src="/hero.jpg" alt="主役の画像" />
    </div>
  );
}
```

### CSS scroll-driven animation（Tier 2 / 縮退）

```css
/* JS なし。対応ブラウザでは view() タイムラインで clip を開く。
   未対応ブラウザは animation が無視され、即時に全開で表示される。 */
@keyframes clip-reveal {
  from { clip-path: inset(0 100% 0 0); }
  to   { clip-path: inset(0 0% 0 0); }
}
.clip-target {
  clip-path: inset(0 0% 0 0); /* フォールバックは全開 */
  animation: clip-reveal linear both;
  animation-timeline: view();
  animation-range: entry 0% cover 40%;
}
@media (prefers-reduced-motion: reduce) {
  .clip-target { animation: none; clip-path: inset(0 0% 0 0); }
}
```

## Usage

```tsx
<ClipImageReveal />
```

## AI Apply Prompt

### Context
`{{target_selector}}` の画像を、スクロール進行に合わせて `clip-path` のマスクで左から reveal する。

### Steps
1. `gsap@^3.13` を `{{package_manager}}` で追加。
2. 上記コンポーネントを `{{target_file}}` に追加。サーバコンポーネントから呼ぶ場合は `"use client"` を確認。
3. `start` / `end` で reveal が進行するスクロール範囲を決める。`scrub: true` で完全追従。
4. `gsap.context()` と `ctx.revert()` を必ず併用（unmount で確実にクリーンアップ）。
5. Reduce Motion 設定時は ScrollTrigger を作らず `clip-path: inset(0)` で即時表示にする分岐を維持。

### Examples

Before: 通常の `<img>`
After: `<ClipImageReveal />` でスクロール時にマスクが開く reveal

### Verify
- 画像が初期状態でマスクされ、スクロールすると左から徐々に現れる
- スクロールを戻すとマスクが閉じる（reversible）
- Reduce Motion ON で reveal せず、画像が最初から全表示される
- unmount 時にエラーや残留ハンドラがない（`ctx.revert()` が効いている）

## Accessibility

- ScrollTrigger は `prefers-reduced-motion` を自動尊重しないため、上記のように **手動チェック** が必要。Reduce Motion 時は `clip-path: inset(0)` で即時表示。
- マスク中も DOM 上の画像は存在するので、`alt` を必ず提供し、内容理解を reveal 演出に依存させない。
- clip による視覚的な隠蔽は装飾であり、フォーカス順や読み上げには影響しない構成にする。

## Performance Notes

- `clip-path` のアニメーションは `transform` / `opacity` と違い GPU 合成で完結せず paint コストが乗る。reveal は短時間で終わるため影響は限定的だが、巨大画像や多数同時の reveal は避ける。
- ScrollTrigger は rAF ベースでスクロールイベントを直接購読しないため軽い。`scrub: true` でスムーズ追従する。
- `gsap.context()` + `ctx.revert()` で React の unmount 時に ScrollTrigger インスタンスが必ず破棄される構成にする。

## Changelog

- 2026-06-02 (created): 初版。v1.2（Tier B）スクロール連動の clip-path reveal を追加。
