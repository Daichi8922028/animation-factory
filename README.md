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

- Next.js 16（App Router）+ TypeScript
- Tailwind CSS v4
- Motion（軽量アニメ）/ GSAP（Tier B のスクロール演出）
- Zod（`.animation.md` フロントマターの検証）
- JSZip（複数 .md の束ね DL）
- ホスティング: Vercel 無料枠

## 構成

```
src/                  Next.js アプリ（App Router）
content/animations/   本番の *.animation.md（アニメーション 1 件 = 1 ファイル）
scripts/              .animation.md → 索引・プレビューのビルド
src/generated/        animation-index.json（ビルド成果物、git 管理外）
```

## 使い方（end-user）

1. ブラウザでカタログを開き、カテゴリ / 検索 / タグから動きを探す。
2. カードをホバーで試し、気に入ったら詳細ページへ。
3. `.md をダウンロード` で 1 ファイル、`add to kit` で複数選択 → 画面下の `Kit を DL` で zip 取得。
4. 取得した `.animation.md` を AI コーディングエージェント（Claude Code / Cursor 等）に渡し、末尾の `AI Apply Prompt` セクションに従って適用させる。

ホストしている URL から curl で 1 件直取りも可能:

```bash
curl -o fade-up.animation.md <BASE_URL>/api/animation/fade-up
curl -o kit.zip "<BASE_URL>/api/kit?ids=fade-up,hover-lift,scroll-reveal"
```

## 開発

```bash
npm run dev            # 開発サーバ
npm run verify         # lint + content check + production build + E2E
npm run test:e2e       # production build 後に Playwright E2E
npm run check:content  # .animation.md の v1.0 スキーマ検証
npm run build:index    # content から索引を生成（dev/build 前に自動実行）
npm run build          # 本番ビルド
npm run lint           # ESLint
```

## CI / CD

- CI: `.github/workflows/ci.yml`
  - `main` への push と pull request で `npm run verify` を実行する。
  - 検証内容は ESLint、`.animation.md` 検証、Next.js production build、Playwright E2E。
- CD: `.github/workflows/vercel-production.yml`
  - 手動実行（workflow_dispatch）で Vercel production に prebuilt deploy する。
  - Vercel の GitHub author 権限チェックを避けるため、Git 連携 deploy ではなく Vercel CLI の `pull -> build -> deploy --prebuilt --prod --archive=tgz` を使う。
  - GitHub Secrets に `VERCEL_TOKEN` / `VERCEL_ORG_ID` / `VERCEL_PROJECT_ID` が必要。
  - この repo では `VERCEL_ORG_ID` / `VERCEL_PROJECT_ID` は設定済み。残りは `VERCEL_TOKEN`。

## ステータス

Phase 3（ベータ版）進行中。設計一式 + アルファ版実装 + Tier B 拡張 + ProjectKit DL が揃った段階。詳細は Vault の `Roadmap.md` 参照。
