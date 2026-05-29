# animation-factory CLI

[animation factory](https://animation-factory-five.vercel.app) のカタログから、シェルで `.animation.md` を取りに行く CLI。MCP に対応していない AI / シェルスクリプト / CI から使う。

```bash
# インストール不要
npx animation-factory@latest get fade-up
# → ./fade-up.animation.md を作成

# 検索
npx animation-factory@latest search "hover" --category hover-press --limit 5

# 束ね DL（zip）
npx animation-factory@latest kit fade-up hover-lift scroll-reveal --out ./animations

# カテゴリ一覧
npx animation-factory@latest list-categories

# タグ別一覧
npx animation-factory@latest list-by-tag gsap
```

## コマンド

| Command | Description |
|---|---|
| `get <id> [<id> ...]` | 個別 `.animation.md` を取得（複数 OK） |
| `kit <id> <id> ...` | 複数 .md を 1 zip で取得（最大 50 件） |
| `search [query]` | 自然言語検索 + ファセット絞り込み |
| `list-categories` | 全 7 カテゴリと count |
| `list-by-tag <tag>` | タグごとの一覧 |
| `help` | 使い方を表示 |

## フラグ

| Flag | Default | Description |
|---|---|---|
| `--out <dir>` | `.`（current dir） | 保存先ディレクトリ |
| `--base <url>` | `https://animation-factory-five.vercel.app` | 接続先（env `ANIMATION_FACTORY_URL` でも可） |
| `--category <id>` | — | `search` 専用：カテゴリで絞り込み |
| `--release alpha\|beta` | — | `search` 専用：Tier で絞り込み |
| `--tag <tag>` | — | `search` 専用：タグで絞り込み |
| `--limit <n>` | 12 | `search` の最大件数 |

## 仕組み

CLI は内部で本番 MCP サーバ（`/mcp`）の JSON-RPC エンドポイントを叩いている。本番が落ちている場合は `--base` で別 URL（例: ローカル dev サーバ）に切り替えられる:

```bash
ANIMATION_FACTORY_URL=http://localhost:3000 \
  animation-factory get fade-up
```

## AI に取得した .md を渡す

`.md` の末尾に `## AI Apply Prompt` セクションがあり、これをそのまま AI に貼ると対象ファイルへの適用指示になる。

```bash
animation-factory get hover-lift
# ファイルを開いて末尾の "## AI Apply Prompt" 以下を Claude / GPT に渡す
```

## ライセンス

MIT
