"use client";

import { useEffect, useMemo, useRef, useState } from "react";

/**
 * 詳細ページの大プレビュー iframe + パラメータ操作 UI。
 * - postMessage で /preview/[id] にパラメータを送り、対応デモが即時反映
 * - 対応していない id は読み取り専用の「現在値」表示にフォールバック
 * - 子から `animation-factory/ready` が来たら現在の params を再送（初回ロード対応）
 */

type Parameter = {
  name: string;
  type: string;
  default?: unknown;
  range?: unknown[];
  values?: unknown[];
  description?: string;
};

export function PreviewWithControls({
  id,
  parameters,
  paramAware,
}: {
  id: string;
  parameters: Parameter[];
  paramAware: boolean;
}) {
  const iframeRef = useRef<HTMLIFrameElement>(null);

  // params 初期値は parameters[].default から組み立て
  const initial = useMemo<Record<string, unknown>>(() => {
    const v: Record<string, unknown> = {};
    for (const p of parameters) {
      if (p.default !== undefined) v[p.name] = p.default;
    }
    return v;
  }, [parameters]);

  const [values, setValues] = useState<Record<string, unknown>>(initial);

  // iframe に postMessage で送信
  const send = (next: Record<string, unknown>) => {
    const win = iframeRef.current?.contentWindow;
    if (!win) return;
    win.postMessage({ type: "animation-factory/params", params: next }, "*");
  };

  // 値変更時に送信
  useEffect(() => {
    if (!paramAware) return;
    send(values);
  }, [values, paramAware]);

  // 子からの ready 通知で初期値を再送（initial load 後のレース対応）
  useEffect(() => {
    if (!paramAware) return;
    function onMessage(e: MessageEvent) {
      const data = e.data as unknown;
      if (!data || typeof data !== "object") return;
      const d = data as Record<string, unknown>;
      if (d.type !== "animation-factory/ready") return;
      if (d.id !== id) return;
      send(values);
    }
    window.addEventListener("message", onMessage);
    return () => window.removeEventListener("message", onMessage);
    // values は最新を closure で参照したいので依存に入れる
  }, [id, paramAware, values]);

  const reset = () => setValues(initial);

  const setOne = (name: string, v: unknown) =>
    setValues((prev) => ({ ...prev, [name]: v }));

  return (
    <div className="grid gap-4 md:grid-cols-[1fr_280px]">
      <section className="rounded-xl overflow-hidden border border-edge bg-preview-bg">
        <iframe
          ref={iframeRef}
          src={`/preview/${id}`}
          className="block w-full h-[480px]"
          title="プレビュー"
        />
      </section>

      {parameters.length > 0 && (
        <aside className="rounded-xl border border-edge bg-surface p-4">
          <div className="flex items-baseline justify-between mb-3">
            <h3 className="text-xs uppercase tracking-widest text-fg font-semibold">
              パラメータ
            </h3>
            {paramAware ? (
              <button
                type="button"
                onClick={reset}
                className="text-[11px] text-muted hover:text-fg"
              >
                リセット
              </button>
            ) : (
              <span className="text-[10px] uppercase tracking-widest text-subtle">
                read-only
              </span>
            )}
          </div>
          {!paramAware && (
            <p className="mb-3 text-[11px] text-muted leading-relaxed">
              このアニメはまだリアルタイム操作に未対応です。値は .md の default のみ表示。
            </p>
          )}
          <ul className="space-y-3">
            {parameters.map((p) => (
              <li key={p.name}>
                <ParameterControl
                  param={p}
                  value={values[p.name]}
                  onChange={(v) => setOne(p.name, v)}
                  disabled={!paramAware}
                />
              </li>
            ))}
          </ul>
        </aside>
      )}
    </div>
  );
}

function ParameterControl({
  param,
  value,
  onChange,
  disabled,
}: {
  param: Parameter;
  value: unknown;
  onChange: (v: unknown) => void;
  disabled: boolean;
}) {
  const isNumber = param.type === "number";
  const isEnum = param.type === "enum";
  const isBoolean = param.type === "boolean";

  return (
    <div>
      <div className="flex items-baseline justify-between gap-2">
        <code className="text-[11px] text-fg font-mono">{param.name}</code>
        <span className="text-[10px] text-subtle tabular-nums">
          {formatValue(value)}
        </span>
      </div>

      {isNumber && Array.isArray(param.range) && param.range.length === 2 && (
        <input
          type="range"
          min={Number(param.range[0])}
          max={Number(param.range[1])}
          step={inferStep(param)}
          value={typeof value === "number" ? value : Number(param.default ?? 0)}
          onChange={(e) => onChange(Number(e.target.value))}
          disabled={disabled}
          className="mt-1.5 w-full accent-[var(--color-accent)] disabled:opacity-50"
        />
      )}

      {isEnum && Array.isArray(param.values) && (
        <div className="mt-1.5 flex flex-wrap gap-1">
          {param.values.map((v) => {
            const sv = String(v);
            const active = String(value) === sv;
            return (
              <button
                key={sv}
                type="button"
                onClick={() => onChange(sv)}
                disabled={disabled}
                className={`text-[11px] rounded-full border px-2 py-0.5 transition-colors disabled:opacity-50 ${
                  active
                    ? "bg-accent-soft text-accent border-accent/40"
                    : "border-edge text-fg bg-surface hover:bg-surface-strong"
                }`}
              >
                {sv}
              </button>
            );
          })}
        </div>
      )}

      {isBoolean && (
        <div className="mt-1.5">
          <button
            type="button"
            onClick={() => onChange(!value)}
            disabled={disabled}
            className="text-[11px] rounded-full border border-edge bg-surface px-2 py-0.5 hover:bg-surface-strong disabled:opacity-50"
          >
            {value ? "true" : "false"}
          </button>
        </div>
      )}

      {!isNumber && !isEnum && !isBoolean && (
        <p className="mt-1 text-[10px] text-subtle">
          ({param.type} は現状操作不可)
        </p>
      )}

      {param.description && (
        <p className="mt-1 text-[10px] text-muted leading-relaxed">
          {param.description}
        </p>
      )}
    </div>
  );
}

function formatValue(v: unknown): string {
  if (v === undefined || v === null) return "—";
  if (typeof v === "number") {
    return Number.isInteger(v) ? v.toString() : v.toFixed(2);
  }
  return String(v);
}

function inferStep(p: Parameter): number {
  if (!Array.isArray(p.range) || p.range.length !== 2) return 1;
  const span = Math.abs(Number(p.range[1]) - Number(p.range[0]));
  if (span <= 2) return 0.01;
  if (span <= 20) return 0.5;
  return 1;
}
