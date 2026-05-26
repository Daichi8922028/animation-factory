import Link from "next/link";
import { loadCatalogIndex } from "@/lib/catalog";

/**
 * / — ホーム（Phase 2 プロト）。
 * 現状はアニメ一覧のミニマル表示。カテゴリブラウズ・検索・ヒーローは Phase 2 後半で。
 */
export default function Home() {
  const index = loadCatalogIndex();
  const populated = index.categories.filter((c) => c.count > 0);

  return (
    <main className="flex-1 bg-zinc-950 text-zinc-100">
      <div className="max-w-5xl mx-auto px-6 py-16">
        <h1 className="text-4xl font-semibold tracking-tight">
          animation factory
        </h1>
        <p className="mt-3 max-w-xl text-zinc-400">
          React で書ける UI
          アニメーションを視覚的に試して、.md として取得し、AI に渡してそのまま実装させられるカタログ。
        </p>
        <p className="mt-2 text-xs text-zinc-500">
          {index.animations.length} 件 · {populated.length} カテゴリ ·{" "}
          schema v{index.schemaVersion}
        </p>

        <section className="mt-12">
          <h2 className="text-xs uppercase tracking-wider text-zinc-500">
            all animations
          </h2>
          <ul className="mt-4 grid gap-4 sm:grid-cols-2">
            {index.animations.map((a) => (
              <li key={a.id}>
                <Link
                  href={`/a/${a.id}`}
                  className="block rounded-xl border border-white/10 bg-white/5 p-5 transition-colors hover:bg-white/10"
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
              </li>
            ))}
          </ul>
        </section>
      </div>
    </main>
  );
}
