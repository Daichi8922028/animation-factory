# animation factory について

**React で実装できる UI アニメーションを視覚的に試して、`.md` として取得し、AI に渡してそのまま実装させられる無料カタログ。**

「動きの辞書」を 1 つ持って、必要なときに引いてプロジェクトに組み込む — そういう使い方を想定して作っています。

## このサイトが解決すること

- 「**どんな動きが存在するのか**」を一覧で見たい
- 「**それぞれの名前と必要な依存**」を一発で知りたい（fade-up なら motion@^11 が必要、SVG line draw なら CSS だけ、など）
- 動きを **AI に実装させる時の仕様書** として `.md` を 1 つで渡したい

## 使い方の 3 経路

### 1. Web ブラウザで探す

[ホーム](/) からカテゴリ・タグ・検索で動きを探す → 詳細ページで動きを試す → 気に入ったら `.md をダウンロード` ボタンか `Kit に追加` で束ね DL。

### 2. AI クライアントから MCP で（Claude Code / Cursor / Cline）

**Model Context Protocol** を喋れる AI クライアントは、サイトを直接「カタログ」として扱えます。

```bash
# Claude Code に MCP サーバを登録（一度だけ）
claude mcp add animation-factory --transport http \
  https://animation-factory-five.vercel.app/mcp
```

登録後はチャットで「`Card.tsx` にホバーリフトを足して」と頼むだけで、AI が自動で:

1. `search_animations(query="hover lift")` を呼ぶ
2. `get_animation(id="hover-lift")` で `.md` 全文を取得
3. `.md` 末尾の `AI Apply Prompt` セクションに沿って `Card.tsx` を編集

…までやってくれます。

### 3. CLI / curl で（その他の AI / シェルから）

```bash
# CLI（インストール不要、Node 22+）
npx github:Daichi8922028/animation-factory get fade-up hover-lift
npx github:Daichi8922028/animation-factory search "ホバー" --category hover-press

# curl（ChatGPT 等の MCP 未対応 AI に渡す用）
curl -o fade-up.animation.md \
  https://animation-factory-five.vercel.app/api/animation/fade-up
curl -o kit.zip \
  "https://animation-factory-five.vercel.app/api/kit?ids=fade-up,hover-lift,scroll-reveal"
```

## カタログの構造（MECE 5 軸）

1 本のツリーでは無理が出るので、互いに直交する **5 つの軸** で動きを分類しています。あるアニメは「各軸の 1 点」として一意に定まる。

| 軸 | 切り口 | 例 |
|---|---|---|
| 1. **レイヤー** | 実装スタック | css / svg / canvas / webgl / library |
| 2. **UX 役割** | 体験上の目的（一次ナビ） | micro-interaction / state-transition / feedback / attention / storytelling / navigation |
| 3. **トリガー** | 何で発火するか | viewport / pointer / scroll-progress / state-change / autoplay |
| 4. **メディア** | 何を描画するか | dom-css / svg / lottie / rive |
| 5. **コード/非コード** | 作り方 | code / asset / hybrid |

サイトの一次ナビは **軸 2（UX 役割）** で、7 カテゴリに分けています:

- [登場・退場](/c/entrance-exit) — fade / slide / scale / blur 系
- [ホバー・プレス](/c/hover-press) — lift / glow / tilt / zoom
- [スクロール](/c/scroll) — reveal / parallax / pin / scrollytelling
- [フィードバック](/c/feedback) — spinner / skeleton / toast / progress
- [アテンション](/c/attention) — pulse / shake / highlight
- [状態遷移・レイアウト](/c/state-layout) — modal / drawer / tab / accordion
- [ナビゲーション](/c/navigation) — page transition / shared element

## Tier の考え方

React 実装容易性で 3 ティアに分けています。

- **Tier A（alpha）** — React に declarative に乗る動き（CSS / Motion / spring）。最小カタログの中核。
- **Tier B（beta）** — React で少し手間がかかる動き（GSAP + ScrollTrigger / SVG パス / View Transitions / Lottie / Rive など）。
- **Tier C（将来）** — 3D（Three.js / R3F）/ シェーダ / Canvas クリエイティブコーディング / 物理エンジン / 大規模パーティクル。React で「組み込みやすい」とは言い難いため、ベータ完成後の **Phase 5** に分離。

## このプロジェクトについて

- 個人発の公共財。**売上目的ではなく、自分が本当に欲しいアニメーションを誰でも使える形にする**ことが目的（[ProjectBrief §0](https://github.com/Daichi8922028/animation-factory) 参照）
- 技術前提: Next.js（App Router）+ TypeScript + Tailwind + Motion + Zod、Vercel 無料枠でホスト
- すべて MIT ライセンス、`.animation.md` も含めて自由に使えます
- ソースコード: [github.com/Daichi8922028/animation-factory](https://github.com/Daichi8922028/animation-factory)

[`.animation.md` のスキーマ仕様](/docs/schema) も合わせてどうぞ。
