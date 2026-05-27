---
id: page-loading-bar
name: Page Loading Bar
version: 1.0.0
release: alpha
variant: react-motion
description: |
  画面上部に薄いバーが現れ、ページ／ルート遷移の進行を示す（NProgress 風）。
  SPA のルート遷移、データ取得中の通知に。

taxonomy:
  layer: [library, js-runtime]
  ux_role:
    primary: feedback
    secondary: [navigation]
  trigger: [state-change]
  media: [dom-css]
  authoring: code

behavior:
  lifecycle: oneshot
  reversible: false
  replay: every-entry

tags:
  - loading
  - progress
  - top-bar
  - route-change
  - nprogress
  - navigation

trigger:
  primary: state-change
  touch_fallback: always-on
  config: {}

runtime:
  language: typescript
  framework: react
  framework_version: ">=18"
dependencies:
  - { name: motion, version: "^11.0.0", purpose: "animate + spring" }
peer_dependencies:
  - { name: react, version: ">=18" }

implementations:
  - tier: 1
    name: "React + Motion"
    dependencies: [ { name: motion, version: "^11.0.0" } ]
    browser_support: { baseline: widely-available, baseline_year: 2020 }
    performance: { gpu_accelerated: true, layout_thrash: false, cost: low }
    degrades_to: 2
  - tier: 2
    name: "NProgress"
    dependencies: [ { name: "nprogress", version: "^0.2.0" } ]
    browser_support: { baseline: widely-available, baseline_year: 2017 }
    performance: { gpu_accelerated: true, layout_thrash: false, cost: low }
    degradation: "古典の jQuery 系。React/SPA でルート遷移 API と繋ぐ必要"

browser_support:
  baseline: widely-available
  baseline_year: 2020
  notes: "代表値は Tier 1。fixed top + transform: scaleX で進行を表現"

performance:
  gpu_accelerated: true
  layout_thrash: false
  cost: low
  notes: "transform: scaleX のみ。最終 100% 到達後は fade-out で消す"

parameters:
  - { name: trickle_speed, type: number, default: 200, range: [80, 600], description: "実進捗が不明な時の擬似進行間隔（ms）" }
  - { name: height_px, type: number, default: 2, range: [1, 6], description: "バーの太さ" }

a11y:
  respects_reduced_motion: true
  fallback: "アニメ無効、最終状態のみ即時表示"
  focus_safe: true
  notes: "視覚補助。SR には `role=\"progressbar\"` + `aria-valuetext=\"読込中\"` で意味を伝える。常駐させず短時間で消す"

license: MIT
authors: ["@daichi"]
sources: []
attribution_required: false

preview:
  url: https://animation-factory.app/preview/page-loading-bar
  loop: true
  duration_ms: 2400

related:
  alternatives: [progress-bar, spinner-dots]
  composes_with: []
  requires: []

sections:
  skip: [variants]

ai:
  intent_examples:
    - "ページ遷移時に上部にロードバー"
    - "NProgress 風の上部バー"
    - "SPA のルート遷移を示すフィードバック"
  apply_targets: ["spa-route-change", "data-fetch-feedback"]
  do_not_apply_to: ["form-submit-loading", "modal-loading", "inline-action"]
---

## Overview

route 遷移が始まったら 0% → 30% へジャンプ、その後 `trickle_speed` で擬似進行し、完了時に 100% へ滑らかに到達して fade-out。Next.js なら `router.events`（旧）または `navigation` イベントと繋ぐ。

使う場面: SPA のルート遷移、ページ間遷移、長めのデータ取得。
避けたい場面: フォーム送信中のローディング（→ button にスピナー）、モーダル内ローディング、インライン操作。

## Preview

公開プレビュー: https://animation-factory.app/preview/page-loading-bar

## Implementation

### React + Motion

```tsx
"use client";
import { AnimatePresence, motion, useMotionValue, animate } from "motion/react";
import { useEffect } from "react";

export function PageLoadingBar({ loading }: { loading: boolean }) {
  const progress = useMotionValue(0);

  useEffect(() => {
    if (loading) {
      const start = animate(progress, 0.3, { duration: 0.2 });
      const trickle = setInterval(() => {
        const cur = progress.get();
        if (cur < 0.9) animate(progress, cur + (0.9 - cur) * 0.1, { duration: 0.3 });
      }, 200);
      return () => {
        start.stop();
        clearInterval(trickle);
      };
    } else {
      const finish = animate(progress, 1, { duration: 0.25, ease: "easeOut" });
      return () => finish.stop();
    }
  }, [loading, progress]);

  return (
    <AnimatePresence>
      {(loading || progress.get() > 0) && (
        <motion.div
          role="progressbar"
          aria-valuetext="読込中"
          aria-valuemin={0}
          aria-valuemax={100}
          initial={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed top-0 left-0 right-0 z-50 h-0.5 origin-left bg-lime-300"
          style={{ scaleX: progress }}
          onAnimationComplete={() => !loading && progress.set(0)}
        />
      )}
    </AnimatePresence>
  );
}
```

### Next.js ルート遷移と接続

```tsx
"use client";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";

export function RouteLoadingBar() {
  const path = usePathname();
  const [loading, setLoading] = useState(false);
  useEffect(() => {
    setLoading(true);
    const t = setTimeout(() => setLoading(false), 300);
    return () => clearTimeout(t);
  }, [path]);
  return <PageLoadingBar loading={loading} />;
}
```

## Usage

```tsx
<RouteLoadingBar />
```

## AI Apply Prompt

### Context
SPA のルート遷移時に上部のロードバーを表示する。

### Steps
1. `motion@^11` を `{{package_manager}}` で追加。
2. `PageLoadingBar` と `RouteLoadingBar` を root layout に追加。
3. ルート遷移以外（fetch, mutation）と繋ぎたい場合は loading state を直接 prop 渡し。

### Examples

Before: `app/layout.tsx` に挿入なし
After: `<RouteLoadingBar />` を `<body>` 直下に

### Verify
- ルート切替で上部バーが流れる
- 完了で 100% へ到達して fade-out
- Reduce Motion でアニメ無し
- スクリーンリーダーが読込中を認知

## Accessibility

`role="progressbar"` + `aria-valuetext`。短時間で消すこと（常駐させない）。

## Performance Notes

`scaleX` のみ補間で軽量。`opacity` の最終 fade-out のみ要する。

## Changelog

- 2026-05-27 (created): 初版。Phase 3 D1 第 5 弾、Tier A feedback 拡充。
