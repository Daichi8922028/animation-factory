import Link from "next/link";
import { loadCatalogIndex } from "@/lib/catalog";
import { AnimationCard } from "@/components/AnimationCard";

/**
 * / — ホーム（Phase 2 プロト）。
 * カテゴリ入口 + 全アニメ一覧のミニマル表示。ヒーロー / 検索 / UI 仕上げは step 7・8 で。
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
          {index.animations.length} 件 · {populated.length} カテゴリ · schema v
          {index.schemaVersion}
        </p>

        <section className="mt-12">
          <h2 className="text-xs uppercase tracking-wider text-zinc-500">
            categories
          </h2>
          <ul className="mt-4 grid gap-2 sm:grid-cols-3">
            {index.categories.map((c) => (
              <li key={c.id}>
                <Link
                  href={`/c/${c.id}`}
                  className={`flex items-baseline justify-between rounded-lg border border-white/10 px-4 py-3 text-sm transition-colors ${
                    c.count > 0
                      ? "bg-white/5 hover:bg-white/10 text-zinc-100"
                      : "bg-transparent text-zinc-500 hover:bg-white/5"
                  }`}
                >
                  <span>{c.label}</span>
                  <span className="text-xs text-zinc-500">{c.count}</span>
                </Link>
              </li>
            ))}
          </ul>
        </section>

        <section className="mt-12">
          <h2 className="text-xs uppercase tracking-wider text-zinc-500">
            all animations
          </h2>
          <ul className="mt-4 grid gap-4 sm:grid-cols-2">
            {index.animations.map((a) => (
              <li key={a.id}>
                <AnimationCard a={a} />
              </li>
            ))}
          </ul>
        </section>
      </div>
    </main>
  );
}
