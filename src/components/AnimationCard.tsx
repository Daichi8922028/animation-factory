"use client";

import Link from "next/link";
import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import type { AnimationSummary } from "@/lib/catalog";
import hoverLift from "@/components/effects/hover-lift.module.css";
import { KitToggle } from "./KitToggle";

/**
 * アニメーション 1 件のカード表示。home / category 一覧で共通。
 * - カード自体は自カタログの hover-lift（ドッグフーディング）
 * - 初期表示: scripts/build-thumbs.ts で事前に撮影した静的サムネ（/thumbs/<id>.jpg）
 * - ホバー可能デバイスでは、ホバーで実プレビュー iframe を遅延マウントし上書き
 *   ([[preview-engine]] §4 の設計どおり)。iframe 退出 ~250ms 後にアンマウント
 * - `fromHref` が渡されると、詳細ページに ?from= で伝えて back link を直前画面に戻す
 */
export function AnimationCard({
  a,
  fromHref,
}: {
  a: AnimationSummary;
  fromHref?: string;
}) {
  const [mounted, setMounted] = useState(false);
  const [thumbFailed, setThumbFailed] = useState(false);
  const leaveTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(
    () => () => {
      if (leaveTimer.current) clearTimeout(leaveTimer.current);
    },
    [],
  );

  const handleEnter = () => {
    if (leaveTimer.current) {
      clearTimeout(leaveTimer.current);
      leaveTimer.current = null;
    }
    setMounted(true);
  };
  const handleLeave = () => {
    if (leaveTimer.current) clearTimeout(leaveTimer.current);
    leaveTimer.current = setTimeout(() => setMounted(false), 250);
  };

  const detailHref = fromHref
    ? `/a/${a.id}?from=${encodeURIComponent(fromHref)}`
    : `/a/${a.id}`;

  return (
    <Link
      href={detailHref}
      onMouseEnter={handleEnter}
      onMouseLeave={handleLeave}
      onFocus={handleEnter}
      onBlur={handleLeave}
      className={`${hoverLift.card} group block rounded-xl border border-edge bg-surface p-5 transition-colors hover:border-edge-strong`}
    >
      <div className="flex items-baseline justify-between gap-3">
        <h3 className="text-lg text-fg">{a.name}</h3>
        <span
          className={`text-[10px] uppercase tracking-wider rounded-full border px-2 py-0.5 ${
            a.release === "alpha"
              ? "border-emerald-500/40 text-emerald-700 bg-emerald-500/10 dark:text-emerald-300"
              : "border-amber-500/40 text-amber-700 bg-amber-500/10 dark:text-amber-300"
          }`}
        >
          {a.release}
        </span>
      </div>
      <p className="mt-1 text-xs text-subtle">
        {a.category} · {a.lifecycle} · {a.triggerPrimary}
      </p>
      <p className="mt-3 line-clamp-2 text-sm text-muted">{a.description}</p>

      <div className="mt-3">
        <KitToggle id={a.id} size="sm" />
      </div>

      {/* プレビュー枠: 常時サムネ表示、ホバー中だけ実 iframe を上に重ねる。
          iframe は退出 250ms 後にアンマウントするので、数十枚並んでも
          アクティブ iframe はホバー中の数枚に限定される。 */}
      <div className="mt-4 overflow-hidden rounded-lg border border-edge bg-preview-bg h-32 relative">
        {!thumbFailed ? (
          <Image
            src={`/thumbs/${a.id}.jpg`}
            alt={`${a.name} のプレビュー`}
            fill
            sizes="(min-width: 640px) 50vw, 100vw"
            loading="lazy"
            onError={() => setThumbFailed(true)}
            className="object-cover"
          />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center text-[11px] uppercase tracking-widest text-subtle">
            preview
          </div>
        )}
        {mounted && (
          <iframe
            src={`/preview/${a.id}`}
            title={`${a.name} のプレビュー`}
            className="absolute inset-0 w-full h-full pointer-events-none"
            loading="lazy"
            scrolling="no"
          />
        )}
      </div>
    </Link>
  );
}
