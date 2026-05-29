import fs from "node:fs";
import path from "node:path";

/**
 * content/docs/ 配下の Markdown を読むユーティリティ。
 * 詳細ページと同じ marked + Shiki のレンダリングパイプラインを通す前段。
 */

const DOCS_DIR = path.join(process.cwd(), "content", "docs");

export function readDoc(name: string): string {
  const file = path.join(DOCS_DIR, `${name}.md`);
  return fs.readFileSync(file, "utf8");
}
