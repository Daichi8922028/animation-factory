"use client";

import { useEffect, useId, useLayoutEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import type { FacetValue } from "@/lib/catalog";

/** 1 つのファセットセクション。複数選択 = OR、ファセット間 = AND。 */
type FacetSection = {
  key: FacetKey;
  label: string;
  values: FacetValue[];
};

export const FACET_KEYS = [
  "release",
  "trigger",
  "lifecycle",
  "perfCost",
  "baseline",
  "reducedMotion",
  "implementation",
  "layer",
  "media",
] as const;

export type FacetKey = (typeof FACET_KEYS)[number];

export type FacetSelection = Record<FacetKey, string[]>;

export const FACET_LABELS: Record<FacetKey, string> = {
  release: "追加バージョン",
  trigger: "トリガー",
  lifecycle: "ライフサイクル",
  perfCost: "パフォーマンス",
  baseline: "ブラウザ対応",
  reducedMotion: "Reduce Motion 対応",
  implementation: "実装手段",
  layer: "レイヤー",
  media: "描画メディア",
};

/** 軸の概要と、よく出てくる値の意味を初心者向けに短く解説。 */
type FacetHelp = { summary: string; values: { value: string; note: string }[] };

const FACET_HELP: Record<FacetKey, FacetHelp> = {
  release: {
    summary:
      "そのアニメがどのバージョンで追加されたか。数字が小さいほど初期から存在する。",
    values: [
      { value: "v1.0", note: "初期リリースの 45 件（OSS 公開時）" },
      { value: "v1.1", note: "navigation / form / トリガー多様化 / View Transitions の拡充 25 件" },
    ],
  },
  trigger: {
    summary: "動きが始まるきっかけ。",
    values: [
      { value: "viewport", note: "画面に入ったとき（IntersectionObserver 系）" },
      { value: "pointer", note: "マウス / タッチ操作。hover や drag" },
      { value: "scroll-progress", note: "スクロール量に進行が連動" },
      { value: "state-change", note: "アプリ状態の変化（開閉、選択切替など）" },
      { value: "autoplay", note: "マウント直後に自動再生" },
    ],
  },
  lifecycle: {
    summary: "動きの性質（1 回だけ or 継続）。",
    values: [
      { value: "oneshot", note: "1 回だけ再生して終わる（fade-in、登場系）" },
      { value: "continuous", note: "継続的に動き続ける（spinner、pulse、hover）" },
      { value: "toggle", note: "状態に応じて on/off（モーダル開閉、accordion）" },
      { value: "scroll-linked", note: "スクロール量に追従して進む" },
    ],
  },
  perfCost: {
    summary: "描画コストの目安。多用するなら low、ヒーロー級なら medium 以上に注意。",
    values: [
      { value: "low", note: "transform / opacity だけで完結する軽量実装" },
      { value: "medium", note: "filter:blur、複数 iframe、Canvas など中程度の負荷" },
      { value: "high", note: "WebGL / 多数同時演出など、上限を意識する必要" },
    ],
  },
  baseline: {
    summary: "Web Platform Baseline によるブラウザ対応の指標。",
    values: [
      { value: "widely-available", note: "主要ブラウザに 30 ヶ月以上前から対応済（安心）" },
      {
        value: "newly-available",
        note: "全主要ブラウザに対応したが新しめ。古い端末では未対応の可能性",
      },
      { value: "limited", note: "一部ブラウザのみ対応。@supports で必ずフォールバック" },
    ],
  },
  reducedMotion: {
    summary:
      "OS の「動きを減らす」設定（prefers-reduced-motion）への対応状況。「対応」は揺れに弱いユーザーへの配慮が組み込まれている。",
    values: [
      { value: "対応", note: "Reduce Motion 設定で適切に縮退する" },
      { value: "未対応", note: "縮退処理が無い。本番に乗せる前に追加が必要" },
    ],
  },
  implementation: {
    summary:
      "そのアニメを実装している具体的な手段。Tier 1（推奨）/ Tier 2（代替）の両方が並ぶ。複数選択でいずれかを満たすものを表示。",
    values: [],
  },
  layer: {
    summary:
      "どの技術スタックを使うか（[[Web-Animation-Taxonomy]] 軸 1）。CSS のみで動くか、JS が要るか。",
    values: [
      { value: "css", note: "CSS だけで動く。SSR / SEO に優しい" },
      { value: "js-runtime", note: "rAF / Web Animations API など JS が必要" },
      { value: "library", note: "Motion / GSAP / Lottie 等の外部ライブラリ" },
    ],
  },
  media: {
    summary: "ピクセルが何で描かれているか（軸 4）。a11y やパフォーマンス特性が変わる。",
    values: [
      { value: "dom-css", note: "HTML 要素 + CSS。テキスト選択・SEO・a11y そのまま" },
      { value: "svg", note: "ベクター 2D。stroke / path 操作が中心" },
      { value: "lottie", note: "AE → JSON のベクターアニメ資産" },
      { value: "rive", note: ".riv 形式の Canvas ベクター + State Machine" },
    ],
  },
};

export function emptyFacetSelection(): FacetSelection {
  const init = {} as FacetSelection;
  for (const k of FACET_KEYS) init[k] = [];
  return init;
}

export function FacetSidebar({
  sections,
  selection,
  onChange,
  totalCount,
  matchedCount,
}: {
  sections: FacetSection[];
  selection: FacetSelection;
  onChange: (key: FacetKey, value: string) => void;
  totalCount: number;
  matchedCount: number;
}) {
  const anySelected = Object.values(selection).some((v) => v.length > 0);

  return (
    <aside className="md:sticky md:top-20 md:self-start space-y-6">
      <div className="rounded-xl border border-edge bg-surface p-4">
        <div className="flex items-baseline justify-between">
          <h2 className="text-[11px] uppercase tracking-widest text-fg font-semibold">
            絞り込み
          </h2>
          <span className="text-xs text-muted tabular-nums">
            <span className="text-fg">{matchedCount}</span>
            <span className="text-subtle"> / {totalCount}</span>
          </span>
        </div>
        <p className="mt-1.5 text-[11px] text-muted leading-relaxed">
          同じ軸の複数選択は <span className="text-fg">OR</span>、軸どうしは <span className="text-fg">AND</span> で結合。
        </p>
      </div>

      {sections.map(
        (s) =>
          s.values.length > 0 && (
            <FacetSection
              key={s.key}
              facetKey={s.key}
              values={s.values}
              selectedValues={selection[s.key]}
              onChange={onChange}
            />
          ),
      )}

      {!anySelected && (
        <p className="text-[11px] text-muted leading-relaxed">
          各軸の <span aria-hidden>?</span> アイコンに触れると、初心者向けの意味解説が出ます。
        </p>
      )}
    </aside>
  );
}

function FacetSection({
  facetKey,
  values,
  selectedValues,
  onChange,
}: {
  facetKey: FacetKey;
  values: FacetValue[];
  selectedValues: string[];
  onChange: (key: FacetKey, value: string) => void;
}) {
  const help = FACET_HELP[facetKey];
  const valueNotes = new Map(help.values.map((v) => [v.value, v.note]));

  return (
    <section>
      <header className="flex items-center gap-1.5 mb-2">
        <h3 className="text-[11px] uppercase tracking-widest text-fg font-semibold">
          {FACET_LABELS[facetKey]}
        </h3>
        <HelpPopover
          title={FACET_LABELS[facetKey]}
          summary={help.summary}
          values={help.values}
        />
      </header>
      <ul className="space-y-1">
        {values.map((v) => {
          const active = selectedValues.includes(v.value);
          const note = valueNotes.get(v.value);
          return (
            <li key={v.value}>
              <button
                type="button"
                onClick={() => onChange(facetKey, v.value)}
                title={note ?? undefined}
                aria-pressed={active}
                className={`w-full flex items-baseline justify-between gap-2 text-left text-xs rounded-md px-2.5 py-1.5 transition-colors ${
                  active
                    ? "bg-accent-soft text-accent border border-accent/40"
                    : "border border-edge text-fg bg-surface hover:bg-surface-strong hover:border-edge-strong"
                }`}
              >
                <span className="truncate font-mono text-[11.5px]">
                  {v.value}
                </span>
                <span
                  className={`tabular-nums ${
                    active ? "text-accent/70" : "text-subtle"
                  }`}
                >
                  {v.count}
                </span>
              </button>
            </li>
          );
        })}
      </ul>
    </section>
  );
}

/**
 * ? アイコン → クリックで説明ポップオーバー。
 * - portal で `document.body` 直下に出すことで、sticky 親 (aside) の stacking context を抜け最前面に出す
 * - 位置はボタンの bounding rect から `position: fixed` で算出（viewport 端での折り返しも対応）
 * - 外側クリック / ESC / スクロール / リサイズで閉じる
 */
function HelpPopover({
  title,
  summary,
  values,
}: {
  title: string;
  summary: string;
  values: { value: string; note: string }[];
}) {
  const [open, setOpen] = useState(false);
  const [pos, setPos] = useState<{ top: number; left: number } | null>(null);
  const btnRef = useRef<HTMLButtonElement>(null);
  const popoverRef = useRef<HTMLDivElement>(null);
  const popoverId = useId();

  // open 時にボタン位置を測ってポップオーバー座標を算出
  const measure = () => {
    const btn = btnRef.current;
    if (!btn) return;
    const r = btn.getBoundingClientRect();
    const POPOVER_W = 288;
    const MARGIN = 8;
    let left = r.left;
    // 右端を超えそうなら左方向に寄せる
    if (left + POPOVER_W + MARGIN > window.innerWidth) {
      left = Math.max(MARGIN, window.innerWidth - POPOVER_W - MARGIN);
    }
    setPos({ top: r.bottom + 6, left });
  };

  useLayoutEffect(() => {
    if (open) measure();
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const onDoc = (e: MouseEvent) => {
      const t = e.target as Node;
      if (btnRef.current?.contains(t)) return;
      if (popoverRef.current?.contains(t)) return;
      setOpen(false);
    };
    const onEsc = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    const onScrollOrResize = () => setOpen(false);
    document.addEventListener("mousedown", onDoc);
    document.addEventListener("keydown", onEsc);
    window.addEventListener("scroll", onScrollOrResize, true);
    window.addEventListener("resize", onScrollOrResize);
    return () => {
      document.removeEventListener("mousedown", onDoc);
      document.removeEventListener("keydown", onEsc);
      window.removeEventListener("scroll", onScrollOrResize, true);
      window.removeEventListener("resize", onScrollOrResize);
    };
  }, [open]);

  return (
    <>
      <button
        ref={btnRef}
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-label={`${title} とは？`}
        aria-expanded={open}
        aria-controls={open ? popoverId : undefined}
        className={`w-4 h-4 grid place-items-center rounded-full text-[10px] font-bold transition-colors ${
          open
            ? "bg-accent text-base"
            : "bg-surface-strong text-muted hover:bg-surface-strong hover:text-fg"
        }`}
      >
        ?
      </button>
      {open && pos && typeof document !== "undefined" &&
        createPortal(
          <div
            ref={popoverRef}
            id={popoverId}
            role="dialog"
            aria-label={`${title} の説明`}
            style={{ position: "fixed", top: pos.top, left: pos.left, width: 288 }}
            className="z-[100] rounded-lg border border-edge-strong bg-overlay p-3 shadow-2xl shadow-black/30 dark:shadow-black/80 text-left"
          >
            <p className="text-[11px] uppercase tracking-widest text-subtle font-semibold">
              {title}
            </p>
            <p className="mt-1.5 text-xs text-fg leading-relaxed">
              {summary}
            </p>
            {values.length > 0 && (
              <dl className="mt-3 space-y-1.5 text-[11px] leading-relaxed">
                {values.map((v) => (
                  <div key={v.value} className="flex gap-2">
                    <dt className="font-mono text-accent shrink-0 whitespace-nowrap">
                      {v.value}
                    </dt>
                    <dd className="text-muted">{v.note}</dd>
                  </div>
                ))}
              </dl>
            )}
          </div>,
          document.body,
        )}
    </>
  );
}
