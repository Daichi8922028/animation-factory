---
id: accordion-collapse
name: Accordion Collapse
version: 1.0.0
release: alpha
variant: react-motion
description: |
  クリック/タップで内容を展開・折りたたみする定番 UI。
  Motion の AnimatePresence + layout で高さを補間し、内容変化に自然に追従。

taxonomy:
  layer: [css, js-runtime, library]
  ux_role:
    primary: state-transition
    secondary: [feedback]
  trigger: [state-change]
  media: [dom-css]
  authoring: code

behavior:
  lifecycle: toggle
  reversible: true
  replay: every-entry

tags:
  - accordion
  - collapse
  - expand
  - toggle
  - disclosure

trigger:
  primary: state-change
  touch_fallback: always-on
  config: {}

runtime:
  language: typescript
  framework: react
  framework_version: ">=18"
dependencies:
  - { name: motion, version: "^11.0.0", purpose: "高さアニメ" }
peer_dependencies:
  - { name: react, version: ">=18" }

implementations:
  - tier: 1
    name: "React + Motion"
    dependencies: [ { name: motion, version: "^11.0.0" } ]
    browser_support: { baseline: widely-available, baseline_year: 2020 }
    performance: { gpu_accelerated: false, layout_thrash: true, cost: medium }
    degradation: "高さアニメは Layout を引き起こす。多数同時展開は避ける"

browser_support:
  baseline: widely-available
  baseline_year: 2020
  notes: "代表値は Tier 1"

performance:
  gpu_accelerated: false
  layout_thrash: true
  cost: medium
  notes: "height の補間で Layout が走る。1 ページ内に同時展開数を抑える"

parameters:
  - { name: duration_ms, type: number, default: 220, range: [100, 500], description: "展開/折りたたみの長さ" }
  - { name: easing,      type: enum,   default: "ease-out", values: ["ease-in","ease-out","ease-in-out","spring"], description: "イージング" }

a11y:
  respects_reduced_motion: true
  fallback: "高さアニメをスキップして瞬時に切り替え"
  focus_safe: true
  notes: "トリガーは `<button>` を使う。`aria-expanded` で状態を、`aria-controls` で対象 ID を結ぶ"

license: MIT
authors: ["@daichi"]
sources: []
attribution_required: false

preview:
  url: https://animation-factory.app/preview/accordion-collapse
  thumbnail: ./assets/accordion-collapse.webp
  loop: true
  duration_ms: 1200

related:
  alternatives: []
  composes_with:
    - { id: fade-in, note: "展開した中身の文字に fade-in を併用すると自然" }
  requires: []

sections:
  skip: [variants, examples_in_the_wild]

ai:
  intent_examples:
    - "アコーディオンで内容を展開/折りたたみしたい"
    - "FAQ の質問をクリックで開く UI"
  apply_targets: ["faq-item", "sidebar-section", "details-panel"]
  do_not_apply_to: ["primary-navigation"]
---

## Overview

ヘッダ部分をクリックすると下に隠れていた本文が現れ、再度クリックで閉じる。FAQ・設定セクション・サイドバー項目で定番。Motion の `AnimatePresence` と `layout` で高さを補間し、内容の出入りを自然に見せる。

避けたい場面: 主要ナビゲーション（隠すと発見性が落ちる）/ コンテンツが長すぎてスクロールを誘発する展開（ページ別離脱を検討）。

## Preview

公開プレビュー: https://animation-factory.app/preview/accordion-collapse

## Implementation

### React + Motion

```tsx
import { AnimatePresence, motion } from "motion/react";
import { useState } from "react";

export function Accordion({
  title,
  children,
  durationMs = 220,
}: {
  title: string;
  children: React.ReactNode;
  durationMs?: number;
}) {
  const [open, setOpen] = useState(false);
  return (
    <div>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        className="w-full text-left"
      >
        {title}
      </button>
      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            key="content"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: durationMs / 1000, ease: "easeOut" }}
            style={{ overflow: "hidden" }}
          >
            {children}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
```

## Usage

```tsx
<Accordion title="送料はいくらですか？">
  <p>全国一律 500 円です。5000 円以上で無料になります。</p>
</Accordion>
```

## AI Apply Prompt

### Context
`{{target_selector}}` に開閉する disclosure UI を導入する。Motion の AnimatePresence で高さ補間。

### Steps
1. `motion@^11` を `{{package_manager}}` で追加。
2. 上記 `Accordion` を `{{target_file}}` に追加。
3. トリガーは必ず `<button>` を使い、`aria-expanded` を渡す。
4. `aria-controls` で本文 ID を指定すると更に良い。
5. ネスト過多を避ける（深い階層はナビ全体の見直しを促す）。

### Examples

Before:
```tsx
<div>
  <h3>{title}</h3>
  <p>{body}</p>
</div>
```

After:
```tsx
<Accordion title={title}>
  <p>{body}</p>
</Accordion>
```

### Verify
- クリックで開閉。高さがスムーズに補間
- キーボード（Enter/Space）でも開閉
- `aria-expanded` が true/false に切り替わる
- Reduce Motion ON で瞬時に切り替え

## Accessibility

`<button>` を使い、`aria-expanded` で状態を、必要なら `aria-controls` で対象を伝える。`<details>/<summary>` ネイティブで足りるなら、まずそちらを検討。

## Performance Notes

`height` の補間は Layout を走らせる。1 画面に同時に展開するアコーディオンは数個までに抑えると体感が軽い。多数並べる場合は仮想スクロールを併用。

## Changelog

- 2026-05-23 (created): 初版。スキーマ v1.0、release alpha。
