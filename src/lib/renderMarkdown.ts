import { marked } from "marked";
import { codeToHtml } from "shiki";

/**
 * .md 本文を HTML にレンダーするサーバ専用ユーティリティ。
 * - コードブロックは Shiki でデュアルテーマ（github-light / github-dark）→ CSS 変数で切替
 * - `## AI Apply Prompt` セクションは別途抽出して、ホスト側で強調表示できるようにする
 * - sections.skip 等のメタ操作は行わない（.md 本文そのままを構文ハイライトつきで表示）
 */

const SHIKI_OPTS = {
  themes: { light: "github-light", dark: "github-dark" },
  defaultColor: false,
} as const;

/**
 * Shiki を使ってコードブロックをハイライト。
 * `defaultColor: false` で CSS 変数のみ出力 → globals.css 側で light/dark を選ぶ。
 */
async function highlight(code: string, lang: string | undefined): Promise<string> {
  const language = (lang || "text").toLowerCase();
  try {
    return await codeToHtml(code, { lang: language, ...SHIKI_OPTS });
  } catch {
    // 未対応言語は plain にフォールバック
    return await codeToHtml(code, { lang: "text", ...SHIKI_OPTS });
  }
}

/**
 * Markdown 本文を、AI Apply Prompt セクション (`## AI Apply Prompt`) と本体に分離。
 * セクションは次の `## ` か終端まで。両方とも raw markdown のまま返す。
 */
export function splitAiPrompt(body: string): {
  mainMd: string;
  aiPromptMd: string | null;
} {
  const startIdx = body.search(/^##\s+AI Apply Prompt\s*$/m);
  if (startIdx === -1) return { mainMd: body, aiPromptMd: null };

  const after = body.slice(startIdx);
  const nextH2 = after.slice(2).search(/^##\s+/m);
  const end = nextH2 === -1 ? body.length : startIdx + 2 + nextH2;

  const aiPromptMd = body.slice(startIdx, end).trim();
  const mainMd = (body.slice(0, startIdx) + body.slice(end)).trim();
  return { mainMd, aiPromptMd };
}

/** 1 ファイルだけ marked.use を呼ぶように制御する（HMR で多重登録になるのを防ぐ） */
let configured = false;
function configure() {
  if (configured) return;
  configured = true;
  marked.use({
    async: true,
    breaks: false,
    gfm: true,
    async walkTokens(token) {
      if (token.type !== "code") return;
      const c = token as { type: "code"; text: string; lang?: string; rendered?: string };
      c.rendered = await highlight(c.text, c.lang);
    },
    renderer: {
      // walkTokens でセットした rendered があればそれを使う
      code({ text, lang, rendered }: { text: string; lang?: string; rendered?: string }) {
        const langLabel = lang || "text";
        const safe = text.replace(/&/g, "&amp;").replace(/"/g, "&quot;");
        const html = rendered ?? `<pre><code>${escapeHtml(text)}</code></pre>`;
        // 後段でコピーボタンを差し込めるよう、生コードを data-code に保持
        return `<div class="code-block" data-code="${safe}" data-lang="${langLabel}">${html}</div>`;
      },
    },
  });
}

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

/** マークダウン文字列を HTML 文字列に変換（コードブロックは Shiki ハイライト済み）。 */
export async function renderMarkdown(md: string): Promise<string> {
  configure();
  const html = await marked.parse(md);
  return typeof html === "string" ? html : await html;
}

/**
 * `{{placeholder}}` 形式のテンプレ変数を本文から抽出（重複排除、出現順を保持）。
 * 末尾の改行などの余分な空白に強くなるよう `\s*` を許容。
 */
export function extractPlaceholders(md: string): string[] {
  const re = /\{\{\s*([a-zA-Z_][a-zA-Z0-9_]*)\s*\}\}/g;
  const seen = new Set<string>();
  const result: string[] = [];
  let m: RegExpExecArray | null;
  while ((m = re.exec(md)) !== null) {
    const name = m[1];
    if (seen.has(name)) continue;
    seen.add(name);
    result.push(name);
  }
  return result;
}

/** values で `{{name}}` を置換した markdown を返す（空値はそのまま残す）。 */
export function expandPlaceholders(
  md: string,
  values: Record<string, string>,
): string {
  return md.replace(
    /\{\{\s*([a-zA-Z_][a-zA-Z0-9_]*)\s*\}\}/g,
    (raw, name: string) => {
      const v = values[name];
      return v && v.length > 0 ? v : raw;
    },
  );
}
