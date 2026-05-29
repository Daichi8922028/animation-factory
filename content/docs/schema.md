# `.animation.md` スキーマ v1.0

各アニメーションを 1 ファイルで完全に説明するためのフォーマット。**フロントマターで構造化メタ + 本文で人間と AI 両方が読める実装ドキュメント**。

このスキーマに従っていれば、サイト経由でも、CLI でも、AI に直接渡しても同じように「読んで実装できる」状態になります。

## ファイル名と置き場所

```
content/animations/<id>.animation.md
```

- `<id>` は `^[a-z][a-z0-9-]{2,63}$` に一致（小文字英数とハイフン、長さ 3–64）
- ファイル名 `<id>` と frontmatter `id` は **同一であること**

## フロントマター — 必須キー

| キー | 型 | 説明 |
|---|---|---|
| `id` | string | `^[a-z][a-z0-9-]{2,63}$`。URL とファイル名に使う |
| `name` | string | 表示用名前（自由） |
| `version` | string | アニメーション自体のバージョン（推奨 SemVer） |
| `release` | enum | `alpha` または `beta`。Tier A / B に対応 |
| `description` | string | 1〜3 行の要約 |
| `taxonomy` | object | 後述 |
| `behavior` | object | 後述 |
| `tags` | string[] | 自由語彙。最低 1 件 |
| `trigger` | object | 後述 |
| `runtime` | object | 後述 |
| `implementations[]` | object[] | Tier 別実装。最低 1 件 |
| `browser_support` | object | 代表値（普通は Tier 1 と一致） |
| `performance` | object | 代表値 |
| `license` | string | "MIT" など |

## `taxonomy` — 5 軸の MECE 分類

```yaml
taxonomy:
  layer: [css, js-runtime, library]      # 軸 1: レイヤー（複数可）
  ux_role:
    primary: state-transition            # 軸 2: 一次ナビ用
    secondary: [feedback]                # secondary は primary と重複不可
  trigger: [viewport]                    # 軸 3: トリガー（複数可、[0] が primary）
  media: [dom-css]                       # 軸 4: メディア（複数可）
  authoring: code                        # 軸 5: code / asset / hybrid
```

- `ux_role.primary` の値（例: `micro-interaction` / `state-transition` / `feedback` / `attention` / `storytelling` / `navigation`）はサイトの一次ナビに対応。
- `taxonomy.trigger[0]` は `trigger.primary`（後述）と **一致しないとバリデーション NG**。

## `behavior` — 動きの性質

```yaml
behavior:
  lifecycle: oneshot      # oneshot / continuous / toggle / scroll-linked
  reversible: true        # 任意。アンマウントで戻るか
  replay: every-entry     # 任意。once / every-entry
```

## `trigger` — 発火詳細

```yaml
trigger:
  primary: viewport       # taxonomy.trigger[0] と一致させる
  touch_fallback: always-on   # 任意。disabled / tap-toggle / always-on
  config:                 # 任意。トリガー個別の設定
    amount: 0.2
```

## `runtime` — 実行環境

```yaml
runtime:
  language: typescript    # css / typescript / javascript
  framework: react        # 任意。none / react / vue / svelte / ...
  framework_version: ">=18"   # 任意
  bundler: null           # 任意
```

## `implementations[]` — Tier 別実装

複数 Tier を並べて、ブラウザ対応・コスト・依存パッケージを Tier 単位で記録。

```yaml
implementations:
  - tier: 1
    name: "React + Motion"
    dependencies:
      - { name: motion, version: "^11.0.0" }
    browser_support:
      baseline: widely-available
      baseline_year: 2020
    performance:
      gpu_accelerated: true
      layout_thrash: false
      cost: low
    degrades_to: 2          # 下位 tier への縮退

  - tier: 2
    name: "Vanilla CSS"
    dependencies: []
    browser_support:
      baseline: widely-available
      baseline_year: 2017
    performance:
      gpu_accelerated: true
      layout_thrash: false
      cost: low
    degradation: "viewport トリガーは利かない。マウント時に keyframe を流す"
```

- `tier` は配列内で **一意**でなければならない
- `baseline` は `widely-available` / `newly-available` / `limited` の 3 値
- `cost` は `low` / `medium` / `high`

## 任意キー

| キー | 用途 |
|---|---|
| `variant` | "react-motion" / "vanilla-css" など、代表実装の識別 |
| `dependencies[]` | トップレベルの代表依存（普通は Tier 1 のもの） |
| `peer_dependencies[]` | React / Vue 等の peer |
| `parameters[]` | カスタム可能なパラメータ。`name` `type` `default` `range` `values` `description` |
| `a11y` | `respects_reduced_motion` / `fallback` / `focus_safe` / `notes` |
| `authors[]` | クレジット |
| `sources[]` | 参考リンク |
| `attribution_required` | boolean |
| `preview` | `url` / `thumbnail` / `loop` / `duration_ms` |
| `related` | `alternatives[]` / `composes_with[]` / `requires[]` |
| `sections` | `skip[]` で本文セクションのスキップ宣言 |
| `ai` | `intent_examples[]` / `apply_targets[]` / `do_not_apply_to[]` |

## 本文セクション

フロントマターの後ろに、次の見出しを **この順で**置く（不要なものは `sections.skip` に列挙）:

```markdown
## Overview        ← 動きの概要、使う場面と避けたい場面
## Preview         ← 公開プレビュー URL
## Implementation  ← Tier ごとの実装コード（Tier 1 / Tier 2 / ...）
## Usage           ← 1〜2 行の使用例
## AI Apply Prompt ← AI に渡すための適用指示。Context / Steps / Examples / Verify を含む
## Accessibility   ← a11y の注意点
## Performance Notes
## Examples in the Wild  ← 任意。著名サイトでの例
## Changelog
```

## cross-field バリデーション

- `trigger.primary === taxonomy.trigger[0]`
- `implementations[].tier` が一意
- `taxonomy.ux_role.secondary` が `primary` を含まない
- `id` が `^[a-z][a-z0-9-]{2,63}$`
- ファイル名 `<id>.animation.md` の `<id>` と frontmatter `id` が一致

これらは Zod スキーマ + cross-field チェックで `npm run check:content` 時に検証されます。

## 最小サンプル

```yaml
---
id: fade-in
name: Fade In
version: 1.0.0
release: alpha
description: |
  単一要素を opacity 0 → 1 で表示する最も基本的な登場アニメーション。

taxonomy:
  layer: [css, library]
  ux_role:
    primary: state-transition
  trigger: [viewport]
  media: [dom-css]
  authoring: code

behavior:
  lifecycle: oneshot

tags: [fade-in, entrance, simple, opacity]

trigger:
  primary: viewport
  touch_fallback: always-on

runtime:
  language: typescript
  framework: react

implementations:
  - tier: 1
    name: "React + Motion"
    browser_support: { baseline: widely-available }
    performance: { gpu_accelerated: true, layout_thrash: false, cost: low }

browser_support: { baseline: widely-available }
performance: { gpu_accelerated: true, layout_thrash: false, cost: low }
license: MIT
---

## Overview
...
```

## 進化方針

- v1.x は **後方互換の追加のみ**（フィールド追加 OK、削除 NG、enum 値の追加 OK）
- 破壊的変更は v2.0
- Phase 5（Tier C）でスキーマ v1.1 を見越して、`layer` に `canvas` / `webgl` / `webgpu` 追加・`requires_gpu` フラグ・FPS / メモリ目安フィールドを検討中（[Specs/react-implementability §6](/about) 参照）

仕様の真正本は Obsidian Vault の `Specs/animation-md-schema.md`。実装の Zod 型は `src/lib/schema.ts` を参照。
