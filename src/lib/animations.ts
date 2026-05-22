import fs from "node:fs";
import path from "node:path";
import matter from "gray-matter";
import { z } from "zod";
import {
  animationFrontmatterSchema,
  type AnimationFrontmatter,
} from "./schema";

/** content/animations/ に置かれた *.animation.md を読み・検証するローダ。 */

export const CONTENT_DIR = path.join(process.cwd(), "content", "animations");

export type Animation = {
  /** ファイル名から .animation.md を除いた slug（= frontmatter.id と一致させる） */
  slug: string;
  file: string;
  frontmatter: AnimationFrontmatter;
  /** フロントマター以降の Markdown 本文 */
  body: string;
};

export type LoadOk = { ok: true; animation: Animation };
export type LoadError = { ok: false; file: string; errors: string[] };
export type LoadResult = LoadOk | LoadError;

/** content ディレクトリ内の .animation.md ファイル名一覧。 */
export function listAnimationFiles(dir: string = CONTENT_DIR): string[] {
  if (!fs.existsSync(dir)) return [];
  return fs
    .readdirSync(dir)
    .filter((f) => f.endsWith(".animation.md"))
    .sort();
}

/** 1 ファイルを読み・パース・検証する。 */
export function loadAnimation(
  file: string,
  dir: string = CONTENT_DIR,
): LoadResult {
  const full = path.join(dir, file);
  let raw: string;
  try {
    raw = fs.readFileSync(full, "utf8");
  } catch {
    return { ok: false, file, errors: [`ファイルを読めません: ${full}`] };
  }

  let parsed: matter.GrayMatterFile<string>;
  try {
    parsed = matter(raw);
  } catch (e) {
    return {
      ok: false,
      file,
      errors: [`フロントマターの YAML 解析に失敗: ${(e as Error).message}`],
    };
  }

  const result = animationFrontmatterSchema.safeParse(parsed.data);
  if (!result.success) {
    return { ok: false, file, errors: formatIssues(result.error) };
  }

  const slug = file.replace(/\.animation\.md$/, "");
  const errors: string[] = [];
  // ファイル名 slug と id の一致（1 ファイル = 1 アニメーション）
  if (slug !== result.data.id) {
    errors.push(
      `ファイル名 slug (${slug}) と frontmatter.id (${result.data.id}) が不一致`,
    );
  }
  if (errors.length > 0) return { ok: false, file, errors };

  return {
    ok: true,
    animation: { slug, file, frontmatter: result.data, body: parsed.content.trim() },
  };
}

/** content ディレクトリ全体を読み込む。成功分と失敗分を分けて返す。 */
export function loadAllAnimations(dir: string = CONTENT_DIR): {
  animations: Animation[];
  failures: LoadError[];
} {
  const animations: Animation[] = [];
  const failures: LoadError[] = [];
  for (const file of listAnimationFiles(dir)) {
    const res = loadAnimation(file, dir);
    if (res.ok) animations.push(res.animation);
    else failures.push(res);
  }
  return { animations, failures };
}

/** Zod のエラーを「path: message」の読みやすい配列に整形する。 */
function formatIssues(error: z.ZodError): string[] {
  return error.issues.map((issue) => {
    const where = issue.path.length > 0 ? issue.path.join(".") : "(root)";
    return `${where}: ${issue.message}`;
  });
}
