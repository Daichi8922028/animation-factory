---
id: image-zoom
name: Image Zoom
version: 1.0.0
release: v1.0
variant: vanilla-css
description: |
  サムネイル画像がコンテナ内で拡大する micro-interaction。
  カードグリッド、ギャラリー、ブログ一覧のサムネに。

taxonomy:
  layer: [css]
  ux_role:
    primary: micro-interaction
    secondary: [feedback]
  trigger: [pointer]
  media: [dom-css]
  authoring: code

behavior:
  lifecycle: continuous
  reversible: true
  replay: every-entry

tags:
  - hover
  - zoom
  - image
  - thumbnail
  - gallery
  - scale

trigger:
  primary: pointer
  touch_fallback: disabled
  config: {}

runtime:
  language: css
  framework: none
  framework_version: null
  bundler: null
dependencies: []
peer_dependencies: []

implementations:
  - tier: 1
    name: "Vanilla CSS"
    dependencies: []
    browser_support: { baseline: widely-available, baseline_year: 2015 }
    performance: { gpu_accelerated: true, layout_thrash: false, cost: low }

browser_support:
  baseline: widely-available
  baseline_year: 2015
  notes: "親 overflow:hidden + 画像 transform: scale。SEO・a11y そのまま"

performance:
  gpu_accelerated: true
  layout_thrash: false
  cost: low
  notes: "transform: scale のみ補間。GPU 内で完結"

parameters:
  - { name: zoom,        type: number, default: 1.08, range: [1.02, 1.3], description: "ホバー時の拡大率" }
  - { name: duration_ms, type: number, default: 400,  range: [120, 1000], description: "進入／離脱の長さ" }
  - { name: easing,      type: enum,   default: "ease-out",
      values: ["linear","ease-in","ease-out","ease-in-out","cubic-bezier"] }

a11y:
  respects_reduced_motion: true
  fallback: "transition を 0.01s。拡大はせず、影や枠で状態を伝える"
  focus_safe: true
  notes: "img には常に alt を付与。拡大しても代替テキストの意味は変わらないこと"

license: MIT
authors: ["@daichi"]
sources: []
attribution_required: false

preview:
  url: https://animation-factory.app/preview/image-zoom
  loop: true
  duration_ms: 1400

related:
  alternatives: [hover-lift, hover-glow]
  composes_with:
    - { id: hover-lift, note: "サムネ拡大 + カード持ち上げの組み合わせは記事カードで定番" }
  requires: []

sections:
  skip: [variants]

ai:
  intent_examples:
    - "カードサムネをホバーで拡大したい"
    - "ギャラリー画像のズーム"
    - "ブログ一覧のサムネが少し拡大する hover"
  apply_targets: ["card-thumbnail", "gallery-image", "article-image"]
  do_not_apply_to: ["icon", "avatar-small", "decorative-background"]
---

## Overview

親要素を `overflow: hidden` でクリップし、内部の `<img>` を `transform: scale(1 → 1.08)` で拡大する。コンテナサイズは変わらず、画像だけが動的に「寄る」。

使う場面: 記事カードのサムネ、ギャラリー、製品一覧。
避けたい場面: アイコン、アバター（情報量が変わらない）、装飾画像。

## Preview

公開プレビュー: https://animation-factory.app/preview/image-zoom

## Implementation

### Vanilla CSS

```html
<a href="/article/1" class="zoom-card">
  <div class="zoom-frame">
    <img src="/thumb.jpg" alt="記事のサムネイル" />
  </div>
  <h3>記事タイトル</h3>
</a>
```

```css
.zoom-frame {
  overflow: hidden;
  border-radius: 8px;
  aspect-ratio: 16 / 9;
}
.zoom-frame img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 400ms ease-out;
  will-change: transform;
}

@media (hover: hover) {
  .zoom-card:hover .zoom-frame img { transform: scale(1.08); }
}
.zoom-card:focus-visible .zoom-frame img { transform: scale(1.08); }

@media (prefers-reduced-motion: reduce) {
  .zoom-frame img { transition-duration: 0.01ms; }
  .zoom-card:hover .zoom-frame img { transform: none; }
}
```

## Usage

カードのサムネに `.zoom-frame > img` 構造を入れて、親 `.zoom-card` の hover に反応させる。

## AI Apply Prompt

### Context
`{{target_selector}}` の画像をホバーで拡大する。純 CSS、依存追加なし。

### Steps
1. 画像を `.zoom-frame` でラップ（`overflow: hidden` + `aspect-ratio`）。
2. 上記 CSS を追記。
3. リンクや親に `.zoom-card` クラスを付与。

### Examples

Before:
```html
<a href="/x"><img src="/t.jpg" alt="…" /><h3>…</h3></a>
```
After:
```html
<a href="/x" class="zoom-card">
  <div class="zoom-frame"><img src="/t.jpg" alt="…" /></div>
  <h3>…</h3>
</a>
```

### Verify
- カードホバーでサムネだけが拡大、コンテナサイズ不変
- 離れると元に戻る
- Reduce Motion で拡大しない
- タッチ端末でタップ後に拡大固着しない

## Accessibility

`alt` 属性は必須。装飾画像なら `alt=""` で hidden に。Reduce Motion で完全無効化。

## Performance Notes

`transform: scale` のみ補間。`width` / `height` を直接動かさないことで Layout を回避。

## Changelog

- 2026-05-26 (created): 初版。Phase 3 D1 第 3 弾、hover-press 拡充。
