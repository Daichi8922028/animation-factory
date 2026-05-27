import fs from "node:fs";
import path from "node:path";
import JSZip from "jszip";
import { CONTENT_DIR } from "@/lib/animations";

/**
 * /api/kit?ids=a,b,c — 複数のアニメーションを束ねた zip を返す（ProjectKit）。
 * - 各 id を v1.0 id 規約で検証し、不正なものは無視する
 * - kit ルート直下に各 .animation.md を平置きし、README.md を生成して同梱する
 * - 最大 50 件まで（過剰な束ね DL の予防）
 */

const ID_RE = /^[a-z][a-z0-9-]{2,63}$/;
const MAX_IDS = 50;

export async function GET(req: Request) {
  const url = new URL(req.url);
  const raw = url.searchParams.get("ids") ?? "";
  const requested = raw
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);

  if (requested.length === 0) {
    return new Response("ids クエリが空です。例: /api/kit?ids=fade-in,hover-lift", {
      status: 400,
    });
  }
  if (requested.length > MAX_IDS) {
    return new Response(`ids は最大 ${MAX_IDS} 件までです。`, { status: 400 });
  }

  const valid: string[] = [];
  const skipped: string[] = [];
  for (const id of requested) {
    if (!ID_RE.test(id)) {
      skipped.push(`${id} (id 形式が不正)`);
      continue;
    }
    const file = path.join(CONTENT_DIR, `${id}.animation.md`);
    if (!fs.existsSync(file)) {
      skipped.push(`${id} (未登録)`);
      continue;
    }
    valid.push(id);
  }

  if (valid.length === 0) {
    return new Response(
      `有効な id がありません。\n${skipped.map((s) => `  - ${s}`).join("\n")}`,
      { status: 404 },
    );
  }

  const zip = new JSZip();
  for (const id of valid) {
    const file = path.join(CONTENT_DIR, `${id}.animation.md`);
    const body = fs.readFileSync(file, "utf8");
    zip.file(`${id}.animation.md`, body);
  }
  zip.file("README.md", buildReadme(valid, skipped));

  const buf = await zip.generateAsync({ type: "arraybuffer" });
  const filename = `animation-kit-${valid.length}.zip`;
  return new Response(buf, {
    headers: {
      "content-type": "application/zip",
      "content-disposition": `attachment; filename="${filename}"`,
      "cache-control": "no-store",
    },
  });
}

function buildReadme(included: string[], skipped: string[]): string {
  const lines: string[] = [];
  lines.push("# Animation Kit");
  lines.push("");
  lines.push("animation-factory から束ねダウンロードした .animation.md セット。");
  lines.push("");
  lines.push("## 同梱");
  lines.push("");
  for (const id of included) lines.push(`- \`${id}.animation.md\``);
  if (skipped.length > 0) {
    lines.push("");
    lines.push("## スキップ");
    lines.push("");
    for (const s of skipped) lines.push(`- ${s}`);
  }
  lines.push("");
  lines.push("## 使い方");
  lines.push("");
  lines.push("1. 取り込みたい `.animation.md` を AI コーディングエージェントに渡す。");
  lines.push("2. 末尾の `AI Apply Prompt` セクションに従って、対象ファイルへ適用させる。");
  lines.push("3. 依存パッケージ（フロントマター `dependencies` / `implementations[].dependencies`）を追加。");
  lines.push("");
  lines.push("各ファイルはスキーマ v1.0 に準拠。詳細: https://github.com/Daichi8922028/animation-factory");
  lines.push("");
  return lines.join("\n");
}
