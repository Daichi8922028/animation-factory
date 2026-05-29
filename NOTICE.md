# Third-Party Notices

`animation-factory` 本体は MIT ライセンス（[LICENSE](./LICENSE) 参照）。
ランタイムで使用しているサードパーティ依存と、それぞれの主要なライセンスを記載する。

## ランタイム依存（直接）

| パッケージ | バージョン | ライセンス |
|---|---|---|
| next | 16.x | MIT |
| react / react-dom | 19.x | MIT |
| motion | 12.x | MIT |
| gsap | 3.13+ | **GreenSock Standard "no charge" License**（後述） |
| zod | 4.x | MIT |
| marked | 18.x | MIT |
| shiki | 4.x | MIT |
| jszip | 3.x | MIT OR GPL-3.0-or-later |
| gray-matter | 4.x | MIT |
| lottie-react | 2.x | MIT |
| @rive-app/react-canvas | 4.x | MIT |

## GSAP について

GSAP 3.13 以降は **GreenSock Standard "no charge" License**（<https://gsap.com/standard-license/>）に基づき無償で配布されている。MIT 等の OSI 公認ライセンスではない点に注意:

- 商用・非商用問わず、製品に組み込んで使用するのは無償で許可される
- GSAP 自体の再配布（ライブラリ単体を別の配布物として配ること）は禁止
- 本リポジトリは GSAP を **依存パッケージとして npm install で取り込む** だけで、GSAP のソースは含めていない
- `.animation.md` 内の Tier B 実装サンプル（`gsap-scroll-pin` 等）も、利用方法のドキュメントであり GSAP 自体の再配布ではない

利用者は自身のプロジェクトで `npm install gsap` し、GSAP 社の利用規約に従って使う。

## アセット

- `public/assets/lottie-pulse.json` — このリポジトリで手書きした最小サンプル（MIT）
- `public/thumbs/*.jpg` — `npm run build:thumbs` で生成されるサムネ。ソースは `content/animations/` の MIT コンテンツのキャプチャ
- Rive デモは `https://cdn.rive.app/animations/vehicles.riv` を実行時に読み込む（Rive 社のサンプルアセット）。バンドルには含めない

## コンテンツ

`content/animations/*.animation.md` および `content/docs/*.md` は MIT ライセンスで提供される（[LICENSE](./LICENSE) 参照）。
コードスニペット内の React / CSS は再利用自由。
