"use client";

import { useMemo, useState } from "react";
import { CopyButton } from "./CopyButton";

/**
 * `## AI Apply Prompt` セクションを表示しつつ、テンプレ変数 (`{{name}}`) を
 * フォームで埋めて「完成形」をコピーできるパネル。
 *
 * 設計:
 * - サーバで render 済みの HTML（プレースホルダは {{name}} のまま）を上に表示
 * - 入力欄で `values[name]` を更新し、コピー時に raw md を置換して clipboard へ
 * - よく使う変数（package_manager 等）は候補チップを提供
 */

const SUGGESTIONS: Record<string, string[]> = {
  package_manager: ["npm", "pnpm", "yarn", "bun"],
};

const FRIENDLY: Record<string, string> = {
  target_file: "適用先ファイル（例: src/components/Card.tsx）",
  target_selector: "対象セレクタ / クラス（例: .card）",
  package_manager: "使うパッケージマネージャ",
};

export function AiPromptPanel({
  rawMd,
  html,
  placeholders,
}: {
  rawMd: string;
  html: string;
  placeholders: string[];
}) {
  const [values, setValues] = useState<Record<string, string>>(() => {
    const init: Record<string, string> = {};
    for (const p of placeholders) init[p] = "";
    return init;
  });

  const expanded = useMemo(() => {
    let out = rawMd;
    for (const [k, v] of Object.entries(values)) {
      if (!v) continue;
      out = out.replaceAll(`{{${k}}}`, v).replaceAll(`{{ ${k} }}`, v);
    }
    return out;
  }, [rawMd, values]);

  const filled = Object.values(values).some((v) => v.length > 0);

  return (
    <div className="rounded-xl border border-accent/30 bg-accent-soft p-5">
      <div className="flex items-baseline justify-between gap-3 flex-wrap">
        <h2 className="text-lg font-semibold text-fg">AI に渡すプロンプト</h2>
        <div className="flex items-center gap-2">
          <CopyButton
            text={expanded}
            label={filled ? "埋めた版をコピー" : "そのままコピー"}
            doneLabel="コピーしました"
            size="md"
            variant="primary"
          />
        </div>
      </div>
      <p className="mt-1.5 text-xs text-muted">
        Claude Code / Cursor などにそのまま貼って、対象ファイルに適用させてください。
      </p>

      {placeholders.length > 0 && (
        <fieldset className="mt-4 rounded-lg border border-edge bg-base/40 p-3">
          <legend className="px-2 text-[11px] uppercase tracking-widest text-muted">
            テンプレ変数を埋める（任意）
          </legend>
          <div className="grid gap-3 sm:grid-cols-2 mt-1.5">
            {placeholders.map((name) => (
              <label key={name} className="block">
                <div className="flex items-baseline justify-between gap-2">
                  <code className="text-[11px] font-mono text-fg">{`{{${name}}}`}</code>
                </div>
                {FRIENDLY[name] && (
                  <p className="mt-0.5 text-[10px] text-muted leading-relaxed">
                    {FRIENDLY[name]}
                  </p>
                )}
                <input
                  type="text"
                  value={values[name] ?? ""}
                  onChange={(e) =>
                    setValues((prev) => ({ ...prev, [name]: e.target.value }))
                  }
                  placeholder="（空のままで OK）"
                  className="mt-1 w-full rounded-md border border-edge bg-surface px-2.5 py-1.5 text-xs text-fg placeholder:text-subtle focus:border-accent focus:outline-none"
                />
                {SUGGESTIONS[name] && (
                  <div className="mt-1.5 flex flex-wrap gap-1">
                    {SUGGESTIONS[name].map((s) => (
                      <button
                        key={s}
                        type="button"
                        onClick={() =>
                          setValues((prev) => ({ ...prev, [name]: s }))
                        }
                        className={`text-[10px] rounded-full border px-2 py-0.5 transition-colors ${
                          values[name] === s
                            ? "border-accent/50 text-accent bg-accent-soft"
                            : "border-edge text-muted bg-surface hover:text-fg hover:bg-surface-strong"
                        }`}
                      >
                        {s}
                      </button>
                    ))}
                  </div>
                )}
              </label>
            ))}
          </div>
          <p className="mt-3 text-[11px] text-muted leading-relaxed">
            空欄のままなら `{`{{name}}`}` がそのまま残り、AI 側で文脈から埋めてもらう挙動になる。
          </p>
        </fieldset>
      )}

      <div
        className="prose mt-4"
        dangerouslySetInnerHTML={{ __html: html }}
      />
    </div>
  );
}
