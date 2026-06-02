"use client";

import { useEffect, useRef } from "react";
import { useReducedMotion } from "motion/react";

/**
 * wapi-stagger-menu の Tier 1（Web Animations API / element.animate）プレビュー。
 * メニュー項目を stagger でオープン／クローズし、setInterval で自動トグルループ。
 * ライブラリ不使用（element.animate はネイティブ）。Reduce Motion 時は移動を行わず即時切替。
 *
 * lint 回避:
 *  - setState を effect 本体で同期呼びしない（状態は ref + interval コールバック内で進める）。
 *  - ref.current への代入は effect 内のみ。
 *  - interval を unmount でクリーンアップ。
 */
const ITEMS = ["ホーム", "製品", "料金", "ドキュメント", "お問い合わせ"];

const STAGGER_MS = 70;
const ITEM_MS = 340;
const TRAVEL_PX = 14;

export function WapiStaggerMenuDemo() {
  const listRef = useRef<HTMLUListElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const openRef = useRef(false);
  const reduce = useReducedMotion();

  useEffect(() => {
    const list = listRef.current;
    if (!list) return;

    function applyState(open: boolean) {
      const lis = list?.querySelectorAll<HTMLLIElement>("li") ?? [];
      buttonRef.current?.setAttribute("aria-expanded", String(open));
      list?.setAttribute("aria-hidden", String(!open));

      lis.forEach((li, i) => {
        if (reduce) {
          li.style.opacity = open ? "1" : "0";
          li.style.transform = "none";
          return;
        }
        const from = open
          ? { opacity: 0, transform: `translateY(${TRAVEL_PX}px)` }
          : { opacity: 1, transform: "translateY(0)" };
        const to = open
          ? { opacity: 1, transform: "translateY(0)" }
          : { opacity: 0, transform: `translateY(${TRAVEL_PX}px)` };

        li.animate([from, to], {
          duration: ITEM_MS,
          delay: (open ? i : lis.length - 1 - i) * STAGGER_MS,
          easing: "cubic-bezier(0.22, 1, 0.36, 1)",
          fill: "forwards",
        });
      });
    }

    // 初期表示でいったん開く（effect 内なので set-state-in-effect には当たらない）
    openRef.current = true;
    applyState(true);

    const id = window.setInterval(() => {
      openRef.current = !openRef.current;
      applyState(openRef.current);
    }, 2600);

    return () => window.clearInterval(id);
  }, [reduce]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-zinc-950 text-zinc-100 px-6">
      <nav className="w-full max-w-xs">
        <button
          ref={buttonRef}
          type="button"
          aria-expanded
          className="flex w-full items-center justify-between rounded-xl border border-white/10 bg-zinc-900/80 px-5 py-3 text-left text-sm font-medium tracking-wide text-zinc-100 shadow-lg shadow-black/30"
        >
          <span>メニュー</span>
          <span className="text-lime-300">WAAPI</span>
        </button>

        <ul
          ref={listRef}
          className="mt-3 flex flex-col gap-2"
        >
          {ITEMS.map((label) => (
            <li
              key={label}
              style={{ opacity: 0, transform: `translateY(${TRAVEL_PX}px)` }}
              className="flex items-center gap-3 rounded-lg border border-white/5 bg-zinc-900/60 px-4 py-3 text-sm text-zinc-200"
            >
              <span
                aria-hidden
                className="h-1.5 w-1.5 rounded-full bg-lime-300"
                style={{ boxShadow: "0 0 8px #a3e635" }}
              />
              {label}
            </li>
          ))}
        </ul>

        <p className="mt-5 text-center text-xs text-zinc-500">
          element.animate で stagger オープン／クローズ
        </p>
      </nav>
    </div>
  );
}
