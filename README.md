# animation factory

React 開発者向けの「アニメーションのカタログ」。あらゆる UI アニメーションを視覚的に試して、`.md` パッケージとして取得し、AI に渡してそのまま実装させられる無料サイト。

> 売上目的ではなく、自分が本当に欲しいアニメーションを誰でも使える形にするための個人発プロジェクト。

## 設計ドキュメント（真正本）

設計の真正本は Obsidian の Vault 側にある。実装で迷ったらそちらを読む。

- ProjectBrief — アイデア本体・スコープ
- Roadmap — Phase 0〜4 の作業フロー
- Web-Animation-Taxonomy — アニメーションの MECE 5 軸
- Specs/animation-md-schema — `.animation.md` スキーマ v1.0（確定）
- Specs/react-implementability — アルファ/ベータ振り分け
- Specs/site-ia — サイト IA / データモデル
- Specs/ui-design — UI・ビジュアル設計
- Specs/preview-engine — プレビュー基盤の技術選定
- Specs/implementation-plan — 本リポジトリの進め方

Vault: `10_Projects/アニメーション工場/`

## 技術スタック

- Next.js（App Router）+ TypeScript
- Tailwind CSS
- Motion（アニメーション）
- Zod（`.animation.md` フロントマターの検証）
- ホスティング: Vercel 無料枠

## 構成

```
src/                  Next.js アプリ（App Router）
content/animations/   本番の *.animation.md（アニメーション 1 件 = 1 ファイル）
scripts/              .animation.md → 索引・プレビューのビルド（予定）
previews/             生成されたプレビュー（git 管理外）
```

## 開発

```bash
npm run dev      # 開発サーバ
npm run build    # 本番ビルド
npm run lint     # ESLint
```

## ステータス

Phase 2（アルファ版）実装の初期。現在はリポジトリ scaffold と設計サンプル 3 本（`content/animations/`）まで。
