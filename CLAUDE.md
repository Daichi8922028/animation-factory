<!-- AUTO-SYNCED FROM VAULT — DO NOT EDIT HERE -->
<!-- Source of truth: /Users/kakinumadaichi/Library/CloudStorage/GoogleDrive-dazhishizhao@gmail.com/マイドライブ/10_Projects/アニメーション工場/AI-Rules.md -->
<!-- Last sync: 2026-05-29 -->
<!-- 変更は vault 側で行うこと。code 側の編集は次回 sync で巻き戻る。 -->

@AGENTS.md

# アニメーション工場 プロジェクト用 AI ルール

## 🎯 適用範囲

- code repository: `~/dev/animation-factory/`
- vault project folder: `/Users/kakinumadaichi/Library/CloudStorage/GoogleDrive-dazhishizhao@gmail.com/マイドライブ/10_Projects/アニメーション工場/`
- 公開先: `https://animation-factory-five.vercel.app/`, `https://github.com/Daichi8922028/animation-factory`, `https://www.npmjs.com/package/animation-factory`

## 📁 vault と code repository の役割分担

| 領域 | 真正本 | 内容 |
|---|---|---|
| **設計・計画・履歴** | vault `10_Projects/アニメーション工場/` | log, Roadmap, Spec, 拡充計画 |
| **実装コード** | code `~/dev/animation-factory/` | Next.js, content/animations/, scripts |
| **配信用コンテンツ** | code `~/dev/animation-factory/content/` | `.animation.md` ファイル群（最終データ） |

参照は wikilink (vault 内) / GitHub URL (code → vault からの参照時) で行う。同じ情報を 2 箇所に書かない（書いてしまった場合は vault を真正本とする）。

## 🔁 セッション中の Obsidian 同期義務（最重要）

このプロジェクトでコード作業を行うとき、**重要な節目** が発生したら必ず vault の記録を **最新の状態に更新** すること。コードと並行して obsidian も書き換える。「やったあと」ではなく「その都度」。

### 何を「重要な節目」と見なすか

- 機能・コンテンツの実装完了（フェーズ完了、新カテゴリ追加等）
- 設計判断の変更（スキーマ変更、アーキテクチャ変更、技術選定変更）
- 本番デプロイ、リリース、外部公開（npm publish, GitHub public 化等）
- 新しい計画ドキュメントの策定（拡充計画、ロードマップ修正等）
- インシデント / 障害対応（原因と対策の記録）
- 外部依存の重大変更（dependency major upgrade、API 仕様変更）

### 更新するファイル

| ファイル | 更新タイミング | 何を書くか |
|---|---|---|
| `log.md` | 上記節目すべて | 日付セクション + 何を / なぜ / 結果 / 次の予定（**新エントリは上に追加**） |
| `Roadmap.md` | フェーズ進捗・スコープ変更時 | フェーズ状態、チェックリスト、Mermaid 図 |
| `Specs/*.md` | 設計変更時のみ | 該当 Spec を改訂、`updated:` 日付更新 |
| `ContentDeepeningPlan.md` | コンテンツ計画変更時 | 件数・候補リスト・KPI 更新 |
| 新規計画ドキュメント | 大きな新規構想時 | 拡充計画、戦略文書を新規作成 |

### 形式の規約

- 既存ファイル群の慣習に従う:
  - フロントマター `---` ブロック（`title` / `type` / `status` / `area` / `created` / `updated` / `owner` / `tags`）
  - Obsidian の `[[wikilinks]]` で他ドキュメント参照
  - `> [!info]` / `> [!warning]` / `> [!tip]` などの callout 使用
  - 日付は ISO 形式 (`2026-05-29`)
  - 末尾に `## 📜 Changelog` で版管理

### セッション終了時のチェック

会話が終わる前に、その日の作業が `log.md` に反映されているか必ず確認。未反映なら締めくくりとして追記してから終わる。

## 🚀 公開 / 配信 / 監視

- **本番 URL**: <https://animation-factory-five.vercel.app/>
- **GitHub repo (public)**: <https://github.com/Daichi8922028/animation-factory>
- **npm package**: <https://www.npmjs.com/package/animation-factory>
- **Vercel Dashboard**: <https://vercel.com/dazhishizhao-gmailcoms-projects/animation-factory>
- **Vercel Analytics / Speed Insights**: 有効化済み
- **MCP smoke test**: `bash scripts/smoke-mcp.sh`（6 チェック）
- **CD 経路**: `gh workflow run vercel-production.yml`（`.git` 削除済 archive deploy）

## ⚠️ プロジェクト固有の落とし穴

- **Vercel CLI deploy hang**: GitHub author email が noreply 形式の commit で deploy が block される問題あり。対策: workflow `vercel-production.yml` の `Strip git context for Vercel` step (`rm -rf .git`) で .git を消してから vercel build する。**この step を消すと再発する**。
- **Next.js 16 の breaking change**: AGENTS.md に「これは知ってる Next.js じゃない」警告あり。新規実装時は `node_modules/next/dist/docs/` を先に参照。
- **GSAP license**: 2024 末から完全無料化したが、`NOTICE.md` に既存記載を残してある。GSAP 関連の dependency を入れるときは確認。
