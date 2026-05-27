import Link from "next/link";
import { Header } from "@/components/Header";
import { loadCatalogIndex } from "@/lib/catalog";

/**
 * グローバル 404。
 * `(site)` レイアウト外でも当たる（ランダム URL や notFound() 経由）ため、
 * Header はこのページ自身で描画する。
 */
export default function NotFound() {
  const index = loadCatalogIndex();
  const liveCategories = index.categories.filter((c) => c.count > 0);
  const topTags = index.tags.slice(0, 12);

  return (
    <>
      <Header />
      <main className="flex-1 bg-base text-fg">
        <div className="max-w-3xl mx-auto px-6 py-20 sm:py-28">
          <p className="text-xs uppercase tracking-widest text-subtle">404</p>
          <h1 className="mt-2 text-4xl font-semibold text-fg">
            ページが見つかりません
          </h1>
          <p className="mt-4 text-sm text-muted leading-relaxed max-w-xl">
            URL が誤っているか、まだそのコンテンツが用意されていない可能性があります。
            下のいずれかから探し直してください。
          </p>

          <div className="mt-10 flex flex-wrap gap-3">
            <Link
              href="/"
              className="rounded-full border border-accent/40 bg-accent-soft text-accent px-4 py-2 text-sm font-medium hover:bg-accent/20 transition-colors"
            >
              ホームへ戻る
            </Link>
            <Link
              href="/?q="
              className="rounded-full border border-edge bg-surface text-fg px-4 py-2 text-sm hover:bg-surface-strong transition-colors"
            >
              検索する
            </Link>
          </div>

          <section className="mt-12">
            <h2 className="text-xs uppercase tracking-widest text-subtle mb-3">
              カテゴリから探す
            </h2>
            <ul className="grid gap-2 sm:grid-cols-2">
              {liveCategories.map((c) => (
                <li key={c.id}>
                  <Link
                    href={`/c/${c.id}`}
                    className="group flex items-baseline justify-between rounded-lg border border-edge bg-surface px-4 py-2.5 text-sm hover:border-accent/40 hover:bg-accent-soft transition-colors"
                  >
                    <span className="text-fg group-hover:text-accent transition-colors">
                      {c.label}
                    </span>
                    <span className="text-xs text-subtle tabular-nums">
                      {c.count}
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          </section>

          {topTags.length > 0 && (
            <section className="mt-10">
              <h2 className="text-xs uppercase tracking-widest text-subtle mb-3">
                人気タグから探す
              </h2>
              <ul className="flex flex-wrap gap-2">
                {topTags.map((t) => (
                  <li key={t.value}>
                    <Link
                      href={`/t/${encodeURIComponent(t.value)}`}
                      className="text-xs rounded-full border border-edge bg-surface text-muted px-3 py-1 hover:border-accent/40 hover:text-accent hover:bg-accent-soft transition-colors"
                    >
                      #{t.value}
                      <span className="ml-1.5 text-subtle">{t.count}</span>
                    </Link>
                  </li>
                ))}
              </ul>
            </section>
          )}
        </div>
      </main>
    </>
  );
}
