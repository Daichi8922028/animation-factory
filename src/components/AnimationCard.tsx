import Link from "next/link";
import type { AnimationSummary } from "@/lib/catalog";
import hoverLift from "@/components/effects/hover-lift.module.css";

/**
 * アニメーション 1 件のカード表示。home / category 一覧で共通。
 * カード自体に hover-lift（自前カタログの動き）を適用＝ドッグフーディング
 * （[[ui-design]] §0 / §5）。
 */
export function AnimationCard({ a }: { a: AnimationSummary }) {
  return (
    <Link
      href={`/a/${a.id}`}
      className={`${hoverLift.card} block rounded-xl border border-white/10 bg-white/5 p-5`}
    >
      <div className="flex items-baseline justify-between gap-3">
        <h3 className="text-lg text-zinc-100">{a.name}</h3>
        <span
          className={`text-[10px] uppercase tracking-wider rounded-full border px-2 py-0.5 ${
            a.release === "alpha"
              ? "border-emerald-500/30 text-emerald-300 bg-emerald-500/10"
              : "border-amber-500/30 text-amber-300 bg-amber-500/10"
          }`}
        >
          {a.release}
        </span>
      </div>
      <p className="mt-1 text-xs text-zinc-500">
        {a.category} · {a.lifecycle} · {a.triggerPrimary}
      </p>
      <p className="mt-3 line-clamp-2 text-sm text-zinc-400">
        {a.description}
      </p>
    </Link>
  );
}
