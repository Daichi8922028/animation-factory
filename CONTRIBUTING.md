# Contributing

`animation-factory` への issue / PR は歓迎します。コア方針（[ProjectBrief](https://github.com/Daichi8922028/animation-factory) 参照）に沿った提案であればなお良いです。

## クイックスタート

```bash
git clone https://github.com/Daichi8922028/animation-factory.git
cd animation-factory
npm install
npm run dev
# → http://localhost:3000
```

## アニメーションを追加する

1. `content/animations/<id>.animation.md` を作成。スキーマは [docs/schema](https://animation-factory-five.vercel.app/docs/schema) を参照
2. プレビューコンポーネントを `src/components/previews/<Name>Demo.tsx` に追加
3. `src/components/previews/registry.tsx` の `PreviewById` switch と `src/components/previews/ids.ts` の `PREVIEW_IDS` に登録
4. `npm run check:content` で v1.0 スキーマ検証
5. `npm run dev` で `/a/<id>` と `/preview/<id>` を目視確認
6. `npm run build:thumbs` でサムネ生成（dev サーバ起動中に実行）
7. PR を出す。最低限 `npm run verify`（lint + content check + build + E2E）が通っていることが条件

## どんな動きが受け入れられるか

- **Tier A**（alpha）: React に declarative に乗る（Motion / CSS / spring）
- **Tier B**（beta）: GSAP / SVG path / View Transitions / Lottie / Rive 等
- **Tier C**（Phase 5、将来）: 3D / WebGL / Canvas クリエイティブコーディング / 物理 — 現状は受け入れない（[Specs/react-implementability](https://animation-factory-five.vercel.app/about) §6 参照）

「世の中の Web 制作で日常的に欲しい動き」を優先します。装飾過多 / 受賞作風 / 1 サイト専用の特殊演出は Phase 5 で別途。

## コーディング規約

- TypeScript strict、ESLint クリーン（`npm run lint`）
- `.animation.md` フロントマターは Zod v1.0 スキーマに準拠
- React コンポーネントは "use client" を必要時のみ
- a11y: `respects_reduced_motion: true` を満たす実装を強く推奨

## バグ報告

[GitHub Issues](https://github.com/Daichi8922028/animation-factory/issues) に。再現手順 + 期待値 + 実際の挙動 + 環境（ブラウザ / OS）を添えてもらえると早いです。

## 行動規範

シンプルに「人として失礼な振る舞いをしない」を期待。明文化された CoC は採用していません（人数が増えたら[Contributor Covenant](https://www.contributor-covenant.org/) を入れる予定）。

## ライセンス

MIT。コントリビューションは MIT ライセンス下で受け入れられ、`AUTHORS` 相当の Changelog に名前が残ります（オプトイン可）。
