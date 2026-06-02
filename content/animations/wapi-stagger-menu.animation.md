---
id: wapi-stagger-menu
name: WAAPI Stagger Menu
version: 1.0.0
release: v1.2
variant: wapi
description: |
  Web Animations API（element.animate）でメニュー項目を 1 つずつずらして（stagger）
  オープン／クローズするトグルメニュー。ライブラリ不使用。トグル状態に同期して
  開閉が反転し、各項目に遅延を加えることで連続した波のような展開を作る。

taxonomy:
  layer: [js-runtime]
  ux_role:
    primary: state-transition
    secondary: [navigation, reveal]
  trigger: [state-change]
  media: [dom-css]
  authoring: code

behavior:
  lifecycle: toggle
  reversible: true
  replay: every-entry

tags:
  - waapi
  - web-animations-api
  - stagger
  - menu
  - toggle
  - dropdown
  - element-animate

trigger:
  primary: state-change
  touch_fallback: tap-toggle
  config:
    stagger_ms: 50
    item_duration_ms: 320

runtime:
  language: typescript
  framework: react
  framework_version: ">=18"
dependencies: []
peer_dependencies:
  - { name: react, version: ">=18" }

implementations:
  - tier: 1
    name: "Web Animations API (element.animate)"
    dependencies: []
    browser_support: { baseline: widely-available, baseline_year: 2020 }
    performance: { gpu_accelerated: true, layout_thrash: false, cost: low }
    degrades_to: 2
  - tier: 2
    name: "CSS transition + transition-delay（縮退）"
    dependencies: []
    browser_support: { baseline: widely-available, baseline_year: 2015 }
    performance: { gpu_accelerated: true, layout_thrash: false, cost: low }
    degradation: "JS で keyframes を組まず、open クラス + transition-delay で簡易 stagger。動的な調整やイージング切替は出せない"

browser_support:
  baseline: widely-available
  baseline_year: 2020
  notes: "代表値は Tier 1（WAAPI）。element.animate は主要ブラウザで widely-available。composite/部分キーフレームは要確認"

performance:
  gpu_accelerated: true
  layout_thrash: false
  cost: low
  notes: "transform（translateY/scale）と opacity のみ補間。コンポジタ層で完結しレイアウトを起こさない"

parameters:
  - { name: stagger_ms, type: number, default: 50, range: [0, 150], description: "項目ごとの遅延差。大きいほど波が長くなる" }
  - { name: item_duration_ms, type: number, default: 320, range: [150, 600], description: "各項目 1 つあたりのアニメーション長" }
  - { name: travel_px, type: number, default: 12, range: [4, 32], description: "閉状態での項目の縦オフセット量" }

a11y:
  respects_reduced_motion: true
  fallback: "Reduce Motion 時は stagger と移動を無効化し、表示／非表示の即時切替（display + opacity 即値）にする"
  focus_safe: true
  notes: "開閉状態を aria-expanded で伝え、閉状態のメニューは aria-hidden + フォーカス不可にする。視覚的な順次表示に依存せず状態を伝える"

license: MIT
authors: ["@daichi"]
sources:
  - { title: "Web Animations API (MDN)", url: "https://developer.mozilla.org/en-US/docs/Web/API/Web_Animations_API" }
  - { title: "Element: animate() method (MDN)", url: "https://developer.mozilla.org/en-US/docs/Web/API/Element/animate" }
attribution_required: false

preview:
  url: https://animation-factory.app/preview/wapi-stagger-menu
  loop: true
  duration_ms: 2600

related:
  alternatives: [dropdown-menu, drawer-slide, entrance-stagger-fade]
  composes_with:
    - { id: fade-up, note: "各メニュー項目の登場に fade-up 風の y オフセットを足すと自然" }
    - { id: hover-underline, note: "開いた後の各項目に hover-underline を付けて操作感を補強" }
  requires: []

sections:
  skip: [variants]

ai:
  intent_examples:
    - "ライブラリを使わずに element.animate でメニューを順番に開きたい"
    - "Web Animations API で stagger するトグルメニュー"
    - "ハンバーガーメニューの項目を 1 つずつずらして表示する"
  apply_targets: ["nav-menu", "dropdown", "mobile-menu", "action-list"]
  do_not_apply_to: ["body-text", "data-table", "single-button"]
---

## Overview

メニュー項目を **Web Animations API**（`element.animate`）で 1 つずつ遅延（stagger）させながら開閉するトグルメニュー。ライブラリは使わず、各項目の DOM 要素に対して `el.animate(keyframes, { delay })` を呼ぶだけで、`transform` と `opacity` のみを補間する。トグル状態（open / closed）に同期して keyframes を反転させ、開く時は上から、閉じる時も同様に順次たたむ。

使う場面: ナビゲーション／ドロップダウン／モバイルメニューの開閉、アクションリストの展開。
避けたい場面: 本文や表など順序性のない静的コンテンツ、単一ボタン。

## Preview

公開プレビュー: https://animation-factory.app/preview/wapi-stagger-menu

## Implementation

### Web Animations API (element.animate)

```tsx
"use client";
import { useRef, useState } from "react";

const STAGGER_MS = 50;
const ITEM_MS = 320;
const TRAVEL_PX = 12;

export function WapiStaggerMenu({ items }: { items: string[] }) {
  const listRef = useRef<HTMLUListElement>(null);
  const [open, setOpen] = useState(false);

  function toggle() {
    const next = !open;
    setOpen(next);

    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const lis = listRef.current?.querySelectorAll<HTMLLIElement>("li") ?? [];

    lis.forEach((li, i) => {
      if (reduce) {
        // 縮退: 即時に最終状態へ
        li.style.opacity = next ? "1" : "0";
        li.style.transform = "none";
        return;
      }
      const from = next
        ? { opacity: 0, transform: `translateY(${TRAVEL_PX}px)` }
        : { opacity: 1, transform: "translateY(0)" };
      const to = next
        ? { opacity: 1, transform: "translateY(0)" }
        : { opacity: 0, transform: `translateY(${TRAVEL_PX}px)` };

      li.animate([from, to], {
        duration: ITEM_MS,
        // 開く時は上から、閉じる時は下から畳むと自然
        delay: (next ? i : lis.length - 1 - i) * STAGGER_MS,
        easing: "cubic-bezier(0.22, 1, 0.36, 1)",
        fill: "forwards",
      });
    });
  }

  return (
    <nav>
      <button aria-expanded={open} onClick={toggle}>
        メニュー
      </button>
      <ul ref={listRef} aria-hidden={!open}>
        {items.map((label) => (
          <li key={label} style={{ opacity: 0 }}>
            {label}
          </li>
        ))}
      </ul>
    </nav>
  );
}
```

ポイント: `fill: "forwards"` で最終状態を保持。`delay` を `i * STAGGER_MS` にすることで stagger になる。閉じる時は `lis.length - 1 - i` で順序を反転し、下からたたむ。

### CSS transition + transition-delay（縮退）

```css
/* JS で keyframes を組まない簡易版。open クラスのトグルだけで動かす。 */
.menu li {
  opacity: 0;
  transform: translateY(12px);
  transition: opacity 320ms cubic-bezier(0.22, 1, 0.36, 1),
              transform 320ms cubic-bezier(0.22, 1, 0.36, 1);
}
.menu.open li {
  opacity: 1;
  transform: translateY(0);
}
.menu.open li:nth-child(1) { transition-delay: 0ms; }
.menu.open li:nth-child(2) { transition-delay: 50ms; }
.menu.open li:nth-child(3) { transition-delay: 100ms; }
@media (prefers-reduced-motion: reduce) {
  .menu li { transition: none; }
}
```

## Usage

```tsx
<WapiStaggerMenu items={["ホーム", "製品", "料金", "お問い合わせ"]} />
```

## AI Apply Prompt

### Context
`{{target_selector}}` のメニューを、ライブラリ不使用で `element.animate` を使い、開閉時に項目を順次（stagger）アニメーションさせる。

### Steps
1. メニューのトグルボタンに `aria-expanded`、リストに `aria-hidden` を付与し、`open` 状態を React state で持つ。
2. トグルハンドラ内で `listRef` から各 `<li>` を取得し、`li.animate([from, to], { delay: i * stagger_ms, fill: "forwards", easing })` を呼ぶ。
3. 開く時は `delay = i * stagger`、閉じる時は `delay = (last - i) * stagger` で順序を反転。
4. `window.matchMedia("(prefers-reduced-motion: reduce)")` が真なら `style` を即値で設定して animate をスキップ。
5. ライブラリ追加は不要（`element.animate` はネイティブ API）。

### Examples

Before: クリックで `display: none/block` を切り替えるだけのメニュー
After: `element.animate` で各項目が 50ms ずつずれて開閉する stagger メニュー

### Verify
- トグルで項目が上から順に登場し、再度トグルで順次たたまれる
- `aria-expanded` が状態に追従し、閉状態では `aria-hidden` になる
- Reduce Motion ON で stagger と移動が消え、即時の表示／非表示になる
- ライブラリの追加読み込みがない（バンドルサイズ増えない）

## Accessibility

- 開閉状態は `aria-expanded`（ボタン）と `aria-hidden`（リスト）で **視覚以外にも** 伝える。
- 閉状態のメニュー項目はフォーカス不可にし、Tab がメニューに入り込まないようにする。
- `prefers-reduced-motion: reduce` 時は stagger と縦移動を行わず、即時に最終状態へ切り替える。
- 順次表示はあくまで装飾であり、状態判定を視覚的なタイミングに依存させない。

## Performance Notes

- 補間するのは `transform`（translateY）と `opacity` のみで、いずれもコンポジタ層で処理されレイアウトを起こさない。
- `element.animate` が返す `Animation` オブジェクトは GC 対象になるが、長時間ループさせる場合は `animation.cancel()` で明示的に破棄するとよい。
- ライブラリを読み込まないためバンドルコストはゼロ。WAAPI はネイティブ実装で rAF ベースより安定したタイミングを得られる。

## Changelog

- 2026-06-02 (created): 初版。v1.2（Tier B）、WAAPI（element.animate）による stagger トグルメニュー。
