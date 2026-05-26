import fs from "node:fs";
import path from "node:path";
import { CONTENT_DIR, listAnimationFiles } from "@/lib/animations";

/**
 * /api/animation/[id] — 該当 .animation.md を直接配信する（DL 用）。
 * 詳細ページの「.md をダウンロード」ボタンから呼ばれる。
 */

export function generateStaticParams() {
  return listAnimationFiles().map((f) => ({
    id: f.replace(/\.animation\.md$/, ""),
  }));
}

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  if (!/^[a-z][a-z0-9-]{2,63}$/.test(id)) {
    return new Response("Invalid id", { status: 400 });
  }
  const file = path.join(CONTENT_DIR, `${id}.animation.md`);
  if (!fs.existsSync(file)) {
    return new Response("Not found", { status: 404 });
  }
  const body = fs.readFileSync(file, "utf8");
  return new Response(body, {
    headers: {
      "content-type": "text/markdown; charset=utf-8",
      "content-disposition": `attachment; filename="${id}.animation.md"`,
    },
  });
}
